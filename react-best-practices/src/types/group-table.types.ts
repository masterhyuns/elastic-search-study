/**
 * 계층적 그룹 데이터 구조
 *
 * 트리 구조의 그룹 데이터를 표현하며, 각 노드는 자식 노드를 가질 수 있음
 *
 * @example
 * {
 *   group: 'A GROUP',
 *   children: [
 *     { group: 'A-1 GROUP', children: [...] },
 *     { group: 'A-2 GROUP' }
 *   ]
 * }
 */
export interface GroupNode {
  /** 그룹 이름 */
  group: string;
  /** 하위 그룹 목록 (선택적) */
  children?: GroupNode[];
}

/**
 * 테이블 렌더링을 위한 평탄화된 행 데이터
 *
 * 중첩된 그룹 구조를 테이블 행으로 변환할 때 사용
 * 각 행은 여러 깊이의 셀 정보를 포함하며, rowSpan 값으로 셀 병합 처리
 */
export interface TableRow {
  /**
   * 각 깊이별 그룹 정보 맵
   *
   * key: 깊이 레벨 (0부터 시작)
   * value: 해당 깊이의 셀 정보
   *
   * @example
   * Map {
   *   0 => { name: 'A GROUP', rowSpan: 3 },
   *   1 => { name: 'A-1 GROUP', rowSpan: 2 }
   * }
   */
  cells: Map<number, CellInfo>;

  /** 현재 행의 최대 깊이 (컬럼 수 결정에 사용) */
  depth: number;
}

/**
 * 테이블 셀 정보
 *
 * rowSpan을 통해 여러 행에 걸쳐 병합되는 셀 표현
 */
export interface CellInfo {
  /** 셀에 표시될 그룹 이름 */
  name: string;

  /**
   * 셀이 차지할 행 수
   *
   * 계산 방식: 해당 그룹의 모든 리프 노드 개수
   * - 리프 노드(자식 없음): 1
   * - 부모 노드: 모든 자식의 rowSpan 합계
   */
  rowSpan: number;
}
