import React from 'react';
import { GroupNode, TableRow, CellInfo } from '@/types/group-table.types';

/**
 * GroupTable 컴포넌트의 Props
 */
interface GroupTableProps {
  /** 렌더링할 계층적 그룹 데이터 배열 */
  data: GroupNode[];
}

/**
 * 중첩된 그룹 데이터를 rowSpan이 적용된 테이블로 렌더링하는 컴포넌트
 *
 * 특징:
 * - 재귀적 rowSpan 계산: 각 노드의 리프 노드 개수를 자동 계산
 * - DFS 평탄화: 트리 구조를 테이블 행 배열로 변환
 * - 중복 렌더링 방지: 동일한 셀이 rowSpan으로 확장되는 경우 렌더링 스킵
 *
 * 성능 고려사항:
 * - calculateRowSpan은 O(n) 복잡도로 모든 노드 순회
 * - 대규모 트리(1000+ 노드)는 useMemo로 메모이제이션 권장
 * - 동적 데이터 변경 시 전체 재계산 필요
 *
 * @example
 * ```tsx
 * const data = [{
 *   group: 'A GROUP',
 *   children: [
 *     { group: 'A-1 GROUP', children: [
 *       { group: 'A-1-1 GROUP' },
 *       { group: 'A-1-2 GROUP' }
 *     ]},
 *     { group: 'A-2 GROUP', children: [{ group: 'A-2-1 GROUP' }]}
 *   ]
 * }];
 *
 * <GroupTable data={data} />
 * ```
 *
 * 결과 테이블:
 * ```
 * ┌──────────┬────────────┬──────────────┐
 * │ A GROUP  │ A-1 GROUP  │ A-1-1 GROUP  │
 * │ (rowSpan │ (rowSpan   ├──────────────┤
 * │  = 3)    │  = 2)      │ A-1-2 GROUP  │
 * │          ├────────────┼──────────────┤
 * │          │ A-2 GROUP  │ A-2-1 GROUP  │
 * └──────────┴────────────┴──────────────┘
 * ```
 */
export const GroupTable: React.FC<GroupTableProps> = ({ data }) => {
  /**
   * 각 노드의 리프 노드 개수를 재귀적으로 계산 (= rowSpan 값)
   *
   * 계산 방식:
   * - 리프 노드 (자식 없음): 1 반환
   * - 부모 노드 (자식 있음): 모든 자식의 rowSpan 합계 반환
   *
   * 예시:
   * ```
   * calculateRowSpan(A GROUP) =
   *   calculateRowSpan(A-1 GROUP) + calculateRowSpan(A-2 GROUP)
   *   = (1 + 1) + 1
   *   = 3
   * ```
   *
   * 최적화 필요 시:
   * - useMemo로 결과 캐싱
   * - Map<GroupNode, number>로 중복 계산 방지
   *
   * @param node - rowSpan을 계산할 그룹 노드
   * @returns 해당 노드가 차지할 행 수
   */
  const calculateRowSpan = (node: GroupNode): number => {
    // 리프 노드는 1행을 차지
    if (!node.children || node.children.length === 0) {
      return 1;
    }

    // 모든 자식의 rowSpan을 재귀적으로 합산
    return node.children.reduce(
      (sum, child) => sum + calculateRowSpan(child),
      0
    );
  };

  /**
   * 트리 구조를 테이블 행 배열로 평탄화 (Depth-First Search)
   *
   * 알고리즘:
   * 1. 각 노드 순회하며 rowSpan 계산
   * 2. 부모로부터 상속받은 셀 정보에 현재 노드 정보 추가
   * 3. 자식이 있으면 재귀 호출, 없으면 행으로 추가
   *
   * 셀 병합 원리:
   * - 부모 노드의 셀은 자식 노드들이 있는 모든 행에 걸쳐 표시됨
   * - 각 깊이별로 첫 등장 시에만 실제 <td> 렌더링
   * - 이후 행들은 rowSpan으로 자동 확장
   *
   * @param nodes - 변환할 노드 배열
   * @param depth - 현재 깊이 레벨 (0부터 시작, 컬럼 인덱스로 사용)
   * @param parentCells - 부모로부터 상속받은 셀 정보 맵
   * @returns 평탄화된 행 배열
   */
  const flattenToRows = (
    nodes: GroupNode[],
    depth: number = 0,
    parentCells: Map<number, CellInfo> = new Map()
  ): TableRow[] => {
    const rows: TableRow[] = [];

    nodes.forEach((node) => {
      // 현재 노드의 rowSpan 계산
      const rowSpan = calculateRowSpan(node);

      // 부모 셀 정보를 복사하고 현재 노드 정보 추가
      const currentCells = new Map(parentCells);
      currentCells.set(depth, { name: node.group, rowSpan });

      if (node.children && node.children.length > 0) {
        // 자식이 있으면 재귀적으로 처리
        // 자식들이 반환한 모든 행에 현재 노드의 셀 정보가 포함됨
        const childRows = flattenToRows(node.children, depth + 1, currentCells);
        rows.push(...childRows);
      } else {
        // 리프 노드: 실제 테이블 행으로 추가
        rows.push({
          cells: currentCells,
          depth,
        });
      }
    });

    return rows;
  };

  /**
   * 트리의 최대 깊이를 재귀적으로 계산
   *
   * 테이블 컬럼 수 결정에 사용됨 (maxDepth + 1 = 컬럼 수)
   *
   * @param nodes - 깊이를 계산할 노드 배열
   * @param currentDepth - 현재 깊이 레벨
   * @returns 트리의 최대 깊이
   */
  const getMaxDepth = (nodes: GroupNode[], currentDepth: number = 0): number => {
    let maxDepth = currentDepth;

    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        // 자식의 최대 깊이와 현재 최대 깊이 중 큰 값 선택
        maxDepth = Math.max(
          maxDepth,
          getMaxDepth(node.children, currentDepth + 1)
        );
      }
    });

    return maxDepth;
  };

  /**
   * 이전 행에서 동일한 셀이 이미 렌더링되었는지 확인
   *
   * rowSpan 중복 렌더링 방지 로직:
   * - 동일한 셀이 여러 행에 걸쳐 표시되는 경우, 첫 등장 시에만 렌더링
   * - 이후 행에서는 null 반환하여 렌더링 스킵
   *
   * 판단 기준:
   * - 첫 행: 항상 렌더링
   * - 이후 행: 이전 행의 동일 깊이 셀과 이름 비교
   *   - 다르면: 새로운 셀이므로 렌더링
   *   - 같으면: rowSpan으로 확장 중이므로 스킵
   *
   * @param rowIndex - 현재 행 인덱스
   * @param depth - 확인할 셀의 깊이
   * @returns 렌더링 여부 (true: 렌더링, false: 스킵)
   */
  const shouldRenderCell = (rowIndex: number, depth: number): boolean => {
    // 첫 행은 항상 렌더링
    if (rowIndex === 0) return true;

    const currentCell = rows[rowIndex].cells.get(depth);
    const prevCell = rows[rowIndex - 1].cells.get(depth);

    // 이전 행과 셀 이름이 다르면 새로운 셀 렌더링
    return currentCell?.name !== prevCell?.name;
  };

  // 트리 구조를 평탄화된 행 배열로 변환
  const rows = flattenToRows(data);

  // 최대 깊이 계산 (컬럼 수 결정)
  const maxDepth = getMaxDepth(data);

  // 컬럼 인덱스 배열 생성 (0부터 maxDepth까지)
  const columns = Array.from({ length: maxDepth + 1 }, (_, i) => i);

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          {columns.map((depth) => (
            <th
              key={depth}
              style={{
                border: '1px solid #ddd',
                padding: '8px',
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              }}
            >
              Level {depth + 1}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((depth) => {
              const cellData = row.cells.get(depth);

              // rowSpan으로 확장 중인 셀은 렌더링 스킵
              if (!shouldRenderCell(rowIndex, depth)) {
                return null;
              }

              return (
                <td
                  key={depth}
                  rowSpan={cellData?.rowSpan || 1}
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    // 최상위 레벨(depth 0)은 배경색 강조
                    backgroundColor: depth === 0 ? '#f0f0f0' : 'white',
                    verticalAlign: 'middle',
                  }}
                >
                  {cellData?.name || '-'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 * 사용 예제 데이터
 *
 * 3단계 계층 구조:
 * - Level 1: A GROUP (rowSpan=3)
 * - Level 2: A-1 GROUP (rowSpan=2), A-2 GROUP (rowSpan=1)
 * - Level 3: A-1-1 GROUP, A-1-2 GROUP, A-2-1 GROUP
 */
export const sampleData: GroupNode[] = [
  {
    group: 'A GROUP',
    children: [
      {
        group: 'A-1 GROUP',
        children: [
          { group: 'A-1-1 GROUP' },
          { group: 'A-1-2 GROUP' },
        ],
      },
      {
        group: 'A-2 GROUP',
        children: [{ group: 'A-2-1 GROUP' }],
      },
    ],
  },
];
