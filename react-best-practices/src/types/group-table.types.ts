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

/**
 * 계층적 컬럼 헤더 구조
 *
 * 트리 구조의 컬럼 데이터를 표현하며, 각 노드는 자식 컬럼을 가질 수 있음
 *
 * @example
 * // 단일 컬럼
 * { column: 'Name' }
 *
 * // 그룹 컬럼 (colSpan 적용)
 * {
 *   column: 'Address',
 *   children: [
 *     { column: 'City' },
 *     { column: 'Country' }
 *   ]
 * }
 */
export interface ColumnNode {
  /** 컬럼 이름 */
  column: string;
  /** 하위 컬럼 목록 (선택적) */
  children?: ColumnNode[];
}

/**
 * 테이블 헤더 셀 정보
 *
 * colSpan과 rowSpan을 통해 복잡한 헤더 구조 표현
 *
 * 계산 방식:
 * - colSpan: 해당 컬럼의 모든 리프 컬럼 개수
 *   - 리프 컬럼(자식 없음): 1
 *   - 부모 컬럼: 모든 자식의 colSpan 합계
 *
 * - rowSpan: 리프 컬럼만 아래로 확장
 *   - 리프 컬럼: (최대 깊이 - 현재 깊이 + 1)
 *   - 부모 컬럼: 1
 */
export interface HeaderCell {
  /** 헤더에 표시될 컬럼 이름 */
  name: string;

  /**
   * 헤더가 차지할 컬럼 수 (가로 병합)
   *
   * 자식 컬럼들을 포함하는 경우 해당 컬럼들의 총 개수
   */
  colSpan: number;

  /**
   * 헤더가 차지할 행 수 (세로 병합)
   *
   * 리프 컬럼의 경우 남은 헤더 행을 모두 채움
   */
  rowSpan: number;
}

/**
 * 테이블 헤더 행 데이터
 *
 * 각 행은 해당 깊이에 있는 헤더 셀들의 배열
 * 깊이별로 헤더 행을 나누어 관리
 */
export interface HeaderRow {
  /** 해당 깊이의 헤더 셀 목록 */
  cells: HeaderCell[];
  /** 현재 행의 깊이 레벨 (0부터 시작) */
  depth: number;
}
