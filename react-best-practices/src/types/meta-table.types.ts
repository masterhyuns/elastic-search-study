/**
 * ============================================================================
 * Meta Table 타입 정의
 * ============================================================================
 *
 * Key 기반 config로 어떤 데이터든 자동으로 테이블로 렌더링
 * 데이터 변환 없이 config만으로 그룹핑, 헤더, 스타일 제어
 */

import React from 'react';

/**
 * 테이블 설정의 최상위 인터페이스
 *
 * @example
 * ```tsx
 * const config: TableConfig = {
 *   columns: [
 *     { key: 'category', label: 'Category', groupBy: true },
 *     { key: 'name', label: 'Name' }
 *   ]
 * };
 *
 * <MetaTable data={rawData} config={config} />
 * ```
 */
export interface TableConfig {
  /** 컬럼 설정 배열 (순서대로 렌더링) */
  columns: ColumnConfig[];

  /** 추가 기능 설정 (체크박스, summary 등) */
  features?: TableFeatures;
}

/**
 * 컬럼 설정
 *
 * key로 데이터 접근, label이 헤더가 됨
 * groupBy 옵션으로 자동 rowSpan 생성
 *
 * @example
 * ```tsx
 * // 기본 컬럼
 * { key: 'name', label: 'Name' }
 *
 * // 그룹핑 컬럼 (자동 rowSpan)
 * { key: 'category', label: 'Category', groupBy: true }
 *
 * // 커스텀 렌더링
 * { key: 'age', label: 'Age', render: (v) => `${v}세` }
 *
 * // 계층적 헤더
 * { key: 'mobile', label: 'Mobile', headerGroup: 'Contact.Phone' }
 * ```
 */
export interface ColumnConfig {
  /**
   * 데이터 접근 키
   *
   * 지원 형식:
   * - 단순 키: "name", "age"
   * - 중첩 객체: "user.address.city" (점 표기법)
   * - 배열 인덱스: "items.0.name"
   * - 함수: (row) => row.firstName + ' ' + row.lastName
   */
  key: string | ((row: any) => any);

  /**
   * 컬럼 헤더 라벨
   *
   * 계층적 헤더는 headerGroup과 함께 사용
   */
  label: string;

  /**
   * 이 컬럼을 기준으로 행 그룹핑 (rowSpan 생성)
   *
   * true로 설정하면:
   * - 연속된 동일 값을 자동으로 병합
   * - 왼쪽 컬럼들도 모두 같아야 병합
   *
   * @default false
   */
  groupBy?: boolean;

  /**
   * 계층적 헤더 그룹 경로
   *
   * 점으로 구분된 경로 (예: "Contact.Phone")
   * 자동으로 colSpan/rowSpan 계산
   *
   * @example
   * "Contact.Phone" → Contact (colSpan=2)
   *                      └─ Phone (colSpan=2)
   *                            ├─ Mobile
   *                            └─ Home
   */
  headerGroup?: string;

  /**
   * 컬럼 너비 (px)
   *
   * @default 자동 (균등 분할)
   */
  width?: number;

  /**
   * 최소 너비 (px)
   *
   * 리사이징 시 하한선
   */
  minWidth?: number;

  /**
   * 최대 너비 (px)
   *
   * 리사이징 시 상한선
   */
  maxWidth?: number;

  /**
   * 컬럼 리사이징 가능 여부
   *
   * @default false
   */
  resizable?: boolean;

  /**
   * 셀 정렬 방향
   *
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';

  /**
   * 셀 커스텀 렌더러
   *
   * @param value - 셀 값 (key로 추출된 값)
   * @param row - 원본 행 데이터
   * @param rowIndex - 행 인덱스
   * @param columnIndex - 컬럼 인덱스
   * @returns 렌더링할 React 노드
   *
   * @example
   * ```tsx
   * render: (value, row) => (
   *   <span className={value > 100 ? 'high' : 'low'}>
   *     ${value.toLocaleString()}
   *   </span>
   * )
   * ```
   */
  render?: (
    value: any,
    row: any,
    rowIndex: number,
    columnIndex: number
  ) => React.ReactNode;

  /**
   * 헤더 셀 커스텀 렌더러
   *
   * label 대신 커스텀 React 노드 렌더링
   */
  headerRender?: () => React.ReactNode;

  /**
   * 정렬 활성화 여부
   *
   * @default false
   */
  sortable?: boolean;

  /**
   * 커스텀 정렬 함수
   *
   * 제공하지 않으면 기본 비교 연산자 사용
   */
  sortFn?: (a: any, b: any) => number;
}

/**
 * 추가 기능 설정
 */
export interface TableFeatures {
  /** 체크박스 기능 */
  checkbox?: CheckboxConfig;

  /** Summary 행 기능 */
  summary?: SummaryConfig;

  /** 정렬 기능 */
  sorting?: SortingConfig;

  /** 페이지네이션 기능 */
  pagination?: PaginationConfig;

  /** 스타일 커스터마이징 */
  styling?: StylingConfig;

  /** 행 클릭 이벤트 */
  onRowClick?: (row: any, rowIndex: number) => void;

  /** 행 hover 시 강조 */
  highlightOnHover?: boolean;

  /** 스트라이프 (짝수 행 배경색) */
  striped?: boolean;
}

/**
 * 체크박스 기능 설정
 */
export interface CheckboxConfig {
  /**
   * 체크박스 위치
   *
   * @default 'left'
   */
  position?: 'left' | 'right';

  /**
   * 선택 변경 콜백
   *
   * @param selectedIndices - 선택된 행 인덱스 Set
   * @param selectedRows - 선택된 행 데이터 배열
   */
  onSelectionChange?: (
    selectedIndices: Set<number>,
    selectedRows: any[]
  ) => void;

  /**
   * 초기 선택 상태 (행 인덱스)
   */
  defaultSelected?: Set<number>;

  /**
   * 헤더 체크박스 표시 (전체 선택)
   *
   * @default true
   */
  showHeaderCheckbox?: boolean;

  /**
   * 단일 선택 모드
   *
   * true: 라디오 버튼처럼 하나만 선택 가능
   * false: 다중 선택 가능
   *
   * @default false
   */
  singleSelect?: boolean;

  /**
   * 행 클릭 시 checkbox 자동 토글
   *
   * true: 행을 클릭하면 checkbox가 자동으로 토글됨
   * false: checkbox를 직접 클릭해야만 토글됨
   *
   * @default false
   *
   * @example
   * ```tsx
   * checkbox: {
   *   selectOnRowClick: true,  // 행 클릭 시 선택 토글
   *   onSelectionChange: (indices) => console.log(indices),
   * }
   * ```
   */
  selectOnRowClick?: boolean;
}

/**
 * Summary 행 설정
 */
export interface SummaryConfig {
  /**
   * Summary 행 위치
   *
   * @default 'bottom'
   */
  position?: 'top' | 'bottom';

  /**
   * 컬럼별 summary 설정
   *
   * key: 컬럼 key (ColumnConfig.key와 일치)
   * value: summary 설정
   *
   * @example
   * ```tsx
   * {
   *   name: { type: 'count', label: 'Total:' },
   *   price: { type: 'sum', render: (v) => `$${v.toLocaleString()}` },
   *   status: { type: 'custom', calculate: (data) => `${data.filter(r => r.status === 'active').length} active` }
   * }
   * ```
   */
  columns: Record<string, SummaryColumnConfig>;

  /**
   * Summary 행 스타일
   */
  style?: React.CSSProperties;

  /**
   * Summary 행 className
   */
  className?: string;
}

/**
 * 컬럼별 Summary 설정
 */
export interface SummaryColumnConfig {
  /**
   * Summary 계산 타입
   *
   * - sum: 합계
   * - avg: 평균
   * - count: 개수
   * - min: 최소값
   * - max: 최대값
   * - custom: 커스텀 계산
   */
  type: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';

  /**
   * 커스텀 계산 함수 (type: 'custom'일 때 필수)
   *
   * @param data - 전체 행 데이터 배열
   * @param key - 현재 컬럼 key
   * @returns 계산된 값
   */
  calculate?: (data: any[], key: string) => any;

  /**
   * 렌더러 (계산된 값 → React 노드)
   *
   * 제공하지 않으면 값을 그대로 표시
   */
  render?: (value: any) => React.ReactNode;

  /**
   * 라벨 (값 앞에 표시)
   *
   * @example "Total:", "Average:"
   */
  label?: string;

  /**
   * 정렬 (label과 값의 위치)
   *
   * @default 컬럼의 align 값 따름
   */
  align?: 'left' | 'center' | 'right';

  /**
   * 컬럼 병합 (colspan)
   *
   * 현재 셀이 차지할 컬럼 개수
   * 다음 (colSpan - 1)개 컬럼은 렌더링되지 않음
   *
   * @example
   * ```tsx
   * columns: {
   *   name: {
   *     type: 'custom',
   *     calculate: () => 'Total',
   *     colSpan: 2,  // name과 quantity 컬럼을 병합
   *   },
   *   quantity: undefined,  // 생략 가능 (병합되어 렌더링 안 됨)
   *   price: { type: 'sum' },
   * }
   * ```
   *
   * @default 1
   */
  colSpan?: number;
}

/**
 * 정렬 기능 설정
 */
export interface SortingConfig {
  /**
   * 정렬 가능한 컬럼 key 목록
   *
   * 빈 배열이면 sortable: true인 컬럼만 정렬 가능
   * undefined면 모든 컬럼 정렬 가능
   */
  enabledColumns?: string[];

  /**
   * 정렬 변경 콜백
   *
   * @param state - 현재 정렬 상태
   */
  onSortChange?: (state: SortingState | null) => void;

  /**
   * 초기 정렬 상태
   */
  defaultSorting?: SortingState;

  /**
   * 다중 컬럼 정렬 지원
   *
   * @default false
   */
  multiColumn?: boolean;
}

/**
 * 정렬 상태
 */
export interface SortingState {
  /** 정렬 중인 컬럼 key */
  columnKey: string;

  /** 정렬 방향 */
  direction: 'asc' | 'desc';
}

/**
 * 페이지네이션 설정
 */
export interface PaginationConfig {
  /**
   * 페이지당 행 수
   *
   * @default 10
   */
  pageSize?: number;

  /**
   * 페이지 변경 콜백
   */
  onPageChange?: (page: number, pageSize: number) => void;

  /**
   * 초기 페이지 (0부터 시작)
   *
   * @default 0
   */
  defaultPage?: number;

  /**
   * 페이지 사이즈 선택 옵션
   *
   * @example [10, 20, 50, 100]
   */
  pageSizeOptions?: number[];

  /**
   * 총 행 수 표시
   *
   * @default true
   */
  showTotal?: boolean;
}

/**
 * 스타일 커스터마이징
 */
export interface StylingConfig {
  /**
   * 테이블 전체 className
   */
  table?: string;

  /**
   * 헤더 className
   */
  header?: string;

  /**
   * Body className
   */
  body?: string;

  /**
   * 행 className (함수로 조건부 스타일링 가능)
   */
  row?: string | ((row: any, rowIndex: number) => string);

  /**
   * 셀 className (함수로 조건부 스타일링 가능)
   */
  cell?: string | ((value: any, row: any, rowIndex: number, columnIndex: number) => string);

  /**
   * 커스텀 CSS 속성
   */
  customStyles?: {
    table?: React.CSSProperties;
    header?: React.CSSProperties;
    body?: React.CSSProperties;
    row?: React.CSSProperties;
    cell?: React.CSSProperties;
  };
}

/**
 * ============================================================================
 * 내부 타입 (컴포넌트 구현용)
 * ============================================================================
 */

/**
 * 계층적 헤더 트리 노드 (내부 사용)
 *
 * headerGroup을 파싱해서 생성하는 트리 구조
 */
export interface HeaderTreeNode {
  /** 헤더 이름 */
  name: string;

  /** 자식 노드 */
  children: HeaderTreeNode[];

  /** 리프 컬럼 개수 (= colSpan) */
  colSpan: number;

  /** 깊이 (0부터 시작) */
  depth: number;

  /** 원본 컬럼 설정 (리프 노드만 가짐) */
  column?: ColumnConfig;
}

/**
 * 평탄화된 헤더 행 (내부 사용)
 *
 * 계층적 헤더를 행 배열로 변환한 결과
 */
export interface FlatHeaderRow {
  /** 셀 배열 */
  cells: HeaderCell[];

  /** 깊이 (0부터 시작) */
  depth: number;
}

/**
 * 헤더 셀 정보 (내부 사용)
 */
export interface HeaderCell {
  /** 헤더 라벨 */
  label: string;

  /** colSpan */
  colSpan: number;

  /** rowSpan */
  rowSpan: number;

  /** 원본 컬럼 설정 (리프 셀만 가짐) */
  column?: ColumnConfig;
}

/**
 * 평탄화된 Body 행 (내부 사용)
 *
 * 원본 데이터 + 계산된 rowSpan 정보
 */
export interface FlatBodyRow {
  /** 원본 행 데이터 */
  data: any;

  /** 행 인덱스 (원본 데이터 기준) */
  index: number;

  /** 각 컬럼의 rowSpan 정보 (key: 컬럼 key, value: rowSpan) */
  rowSpans: Map<string, number>;

  /** 선택 여부 (체크박스 기능 사용 시) */
  selected?: boolean;
}

/**
 * 셀 값 추출 결과 (내부 사용)
 */
export interface CellValue {
  /** 추출된 값 */
  value: any;

  /** rowSpan (그룹핑된 경우) */
  rowSpan: number;

  /** 렌더링 여부 (rowSpan으로 병합된 경우 false) */
  shouldRender: boolean;
}
