import React from 'react';
import {
  GroupNode,
  TableRow,
  CellInfo,
  ColumnNode,
  HeaderCell,
  HeaderRow,
} from '@/types/group-table.types';

/**
 * GroupTable 컴포넌트의 Props
 */
interface GroupTableProps {
  /** 렌더링할 계층적 그룹 데이터 배열 (Body 행) */
  data: GroupNode[];
  /** 렌더링할 계층적 헤더 데이터 배열 (선택적) */
  headerData?: ColumnNode[];
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
export const GroupTable: React.FC<GroupTableProps> = ({ data, headerData }) => {
  // ============================================================================
  // 헤더 관련 함수들 (colSpan + rowSpan 조합)
  // ============================================================================

  /**
   * 각 컬럼 노드의 리프 컬럼 개수를 재귀적으로 계산 (= colSpan 값)
   *
   * 계산 방식:
   * - 리프 컬럼 (자식 없음): 1 반환
   * - 부모 컬럼 (자식 있음): 모든 자식의 colSpan 합계 반환
   *
   * 예시:
   * ```
   * calculateColSpan(Address) =
   *   calculateColSpan(City) + calculateColSpan(Country)
   *   = 1 + 1
   *   = 2
   * ```
   *
   * @param node - colSpan을 계산할 컬럼 노드
   * @returns 해당 컬럼이 차지할 컬럼 수
   */
  const calculateColSpan = (node: ColumnNode): number => {
    // 리프 컬럼은 1개의 컬럼을 차지
    if (!node.children || node.children.length === 0) {
      return 1;
    }

    // 모든 자식의 colSpan을 재귀적으로 합산
    return node.children.reduce(
      (sum, child) => sum + calculateColSpan(child),
      0
    );
  };

  /**
   * 헤더 트리의 최대 깊이를 재귀적으로 계산
   *
   * 헤더 행 수 결정에 사용됨 (maxDepth + 1 = 헤더 행 수)
   *
   * @param nodes - 깊이를 계산할 컬럼 노드 배열
   * @param currentDepth - 현재 깊이 레벨
   * @returns 헤더 트리의 최대 깊이
   */
  const getHeaderMaxDepth = (
    nodes: ColumnNode[],
    currentDepth: number = 0
  ): number => {
    let maxDepth = currentDepth;

    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        maxDepth = Math.max(
          maxDepth,
          getHeaderMaxDepth(node.children, currentDepth + 1)
        );
      }
    });

    return maxDepth;
  };

  /**
   * 헤더 트리 구조를 깊이별 행 배열로 평탄화 (너비 우선 탐색 방식)
   *
   * 알고리즘:
   * 1. 각 깊이별로 헤더 행을 생성
   * 2. 각 노드에 대해:
   *    - colSpan = 리프 컬럼 개수
   *    - rowSpan = 리프 노드인 경우 (최대 깊이 - 현재 깊이 + 1), 아니면 1
   * 3. 깊이별로 헤더 셀을 수집하여 행 배열 반환
   *
   * 헤더 병합 원리:
   * - 부모 컬럼: colSpan으로 자식 컬럼들을 가로로 병합
   * - 리프 컬럼: rowSpan으로 남은 헤더 행을 세로로 병합
   *
   * 예시:
   * ```
   * Input: [
   *   { column: 'A' },
   *   { column: 'B', children: [{ column: 'B-1' }, { column: 'B-2' }] }
   * ]
   *
   * Output (maxDepth = 1):
   * Row 0: [{ name: 'A', colSpan: 1, rowSpan: 2 }, { name: 'B', colSpan: 2, rowSpan: 1 }]
   * Row 1: [{ name: 'B-1', colSpan: 1, rowSpan: 1 }, { name: 'B-2', colSpan: 1, rowSpan: 1 }]
   * ```
   *
   * @param nodes - 변환할 컬럼 노드 배열
   * @param maxDepth - 헤더의 최대 깊이
   * @returns 깊이별 헤더 행 배열
   */
  const flattenHeaderToRows = (
    nodes: ColumnNode[],
    maxDepth: number
  ): HeaderRow[] => {
    // 깊이별로 헤더 셀을 저장할 배열 초기화
    const headerRows: HeaderRow[] = Array.from({ length: maxDepth + 1 }, (_, depth) => ({
      cells: [],
      depth,
    }));

    /**
     * 재귀적으로 헤더 노드를 순회하며 각 깊이에 헤더 셀 추가
     */
    const traverse = (node: ColumnNode, depth: number) => {
      const colSpan = calculateColSpan(node);
      const isLeaf = !node.children || node.children.length === 0;

      // rowSpan 계산: 리프 컬럼은 남은 모든 행을 차지, 부모 컬럼은 1행만 차지
      const rowSpan = isLeaf ? maxDepth - depth + 1 : 1;

      // 현재 깊이의 행에 헤더 셀 추가
      headerRows[depth].cells.push({
        name: node.column,
        colSpan,
        rowSpan,
      });

      // 자식이 있으면 재귀적으로 처리
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => traverse(child, depth + 1));
      }
    };

    // 모든 최상위 노드 순회
    nodes.forEach((node) => traverse(node, 0));

    return headerRows;
  };

  // ============================================================================
  // Body 관련 함수들 (rowSpan)
  // ============================================================================

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

  // ============================================================================
  // 데이터 처리 및 렌더링 준비
  // ============================================================================

  // Body: 트리 구조를 평탄화된 행 배열로 변환
  const rows = flattenToRows(data);

  // Body: 최대 깊이 계산 (컬럼 수 결정)
  const maxDepth = getMaxDepth(data);

  // Body: 컬럼 인덱스 배열 생성 (0부터 maxDepth까지)
  const columns = Array.from({ length: maxDepth + 1 }, (_, i) => i);

  // Header: 헤더 데이터가 있으면 평탄화, 없으면 기본 헤더 사용
  const headerRows = headerData
    ? flattenHeaderToRows(headerData, getHeaderMaxDepth(headerData))
    : null;

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        {headerRows ? (
          // 계층적 헤더가 있는 경우: colSpan + rowSpan 적용
          headerRows.map((headerRow, rowIndex) => (
            <tr key={rowIndex}>
              {headerRow.cells.map((cell, cellIndex) => (
                <th
                  key={cellIndex}
                  colSpan={cell.colSpan}
                  rowSpan={cell.rowSpan}
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                  }}
                >
                  {cell.name}
                </th>
              ))}
            </tr>
          ))
        ) : (
          // 기본 헤더: 단순 Level 표시
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
        )}
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
 * 사용 예제 데이터 - Body (계층적 그룹)
 *
 * 3단계 계층 구조:
 * - Level 1: A GROUP (rowSpan=3)
 * - Level 2: A-1 GROUP (rowSpan=2), A-2 GROUP (rowSpan=1)
 * - Level 3: A-1-1 GROUP, A-1-2 GROUP, A-2-1 GROUP
 */
export const sampleBodyData: GroupNode[] = [
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

/**
 * 사용 예제 데이터 - Header (계층적 컬럼)
 *
 * 혼합 구조:
 * - A: 단일 컬럼 (colSpan=1, rowSpan=2)
 * - B: 단일 컬럼 (colSpan=1, rowSpan=2)
 * - C: 그룹 컬럼 (colSpan=2, rowSpan=1)
 *   - C-1: 하위 컬럼 (colSpan=1, rowSpan=1)
 *   - C-2: 하위 컬럼 (colSpan=1, rowSpan=1)
 *
 * 결과 헤더 구조:
 * ```
 * ┌───┬───┬───────────┐
 * │ A │ B │     C     │  <- Row 0
 * │   │   ├─────┬─────┤
 * │   │   │ C-1 │ C-2 │  <- Row 1
 * └───┴───┴─────┴─────┘
 * ```
 */
export const sampleHeaderData: ColumnNode[] = [
  { column: 'A' },
  { column: 'B' },
  {
    column: 'C',
    children: [{ column: 'C-1' }, { column: 'C-2' }],
  },
];

/**
 * 복잡한 헤더 예제 - 3단계 계층
 *
 * 구조:
 * - Name: 단일 컬럼 (colSpan=1, rowSpan=3)
 * - Contact: 그룹 컬럼 (colSpan=3, rowSpan=1)
 *   - Phone: 하위 그룹 (colSpan=2, rowSpan=1)
 *     - Mobile: 리프 컬럼 (colSpan=1, rowSpan=1)
 *     - Home: 리프 컬럼 (colSpan=1, rowSpan=1)
 *   - Email: 리프 컬럼 (colSpan=1, rowSpan=2)
 *
 * 결과 헤더 구조:
 * ```
 * ┌──────┬─────────────────────┐
 * │      │      Contact        │  <- Row 0
 * │ Name ├───────────┬─────────┤
 * │      │   Phone   │  Email  │  <- Row 1
 * │      ├──────┬────┤         │
 * │      │Mobile│Home│         │  <- Row 2
 * └──────┴──────┴────┴─────────┘
 * ```
 */
export const complexHeaderData: ColumnNode[] = [
  { column: 'Name' },
  {
    column: 'Contact',
    children: [
      {
        column: 'Phone',
        children: [{ column: 'Mobile' }, { column: 'Home' }],
      },
      { column: 'Email' },
    ],
  },
];
