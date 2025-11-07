/**
 * SearchBox 컴포넌트 타입 정의
 *
 * 순수한 설정(config)과 비즈니스 로직을 분리한 구조:
 * - Config: 순수 데이터 (재사용 가능, .ts 파일로 관리)
 * - Hook: 상태 관리 및 기본 로직
 * - Component: Controlled 방식으로 값 수신
 * - 의존성 로직: 각 페이지/컴포넌트에서 구현
 */

/**
 * 필드 타입 정의
 */
export type FieldType = 'text' | 'number' | 'select' | 'date' | 'dateRange' | 'checkbox';

/**
 * Select 옵션
 */
export interface SelectOption {
  /**
   * 옵션 값 (실제 데이터)
   */
  value: string | number;

  /**
   * 화면에 표시될 레이블
   */
  label: string;

  /**
   * 비활성화 여부
   */
  disabled?: boolean;
}

/**
 * 필드 값 타입
 */
export type FieldValue = string | number | boolean | [string, string] | undefined;

/**
 * 검색 필드 값들 (key-value)
 */
export type SearchValues = Record<string, FieldValue>;

/**
 * 검색 필드 설정 (순수 데이터만 - 재사용 가능)
 *
 * ✅ Config는 순수한 설정만 담습니다.
 * ✅ 비즈니스 로직(콜백, 의존성)은 포함하지 않습니다.
 * ✅ .ts 파일로 export하여 여러 곳에서 재사용 가능합니다.
 */
export interface SearchFieldConfig {
  /**
   * 필드 고유 key
   */
  key: string;

  /**
   * 필드 레이블
   */
  label: string;

  /**
   * 필드 타입
   */
  type: FieldType;

  /**
   * 기본값
   */
  defaultValue?: FieldValue;

  /**
   * placeholder
   */
  placeholder?: string;

  /**
   * 필수 입력 여부
   */
  required?: boolean;

  /**
   * Select 옵션 (정적 - 변하지 않는 옵션)
   *
   * type이 'select'일 때 사용
   * 동적으로 변경되는 옵션은 외부에서 처리 후 주입
   */
  options?: SelectOption[];

  /**
   * 필드 비활성화 여부 (정적)
   *
   * 동적으로 변경되는 disabled는 외부에서 처리
   */
  disabled?: boolean;

  /**
   * 필드 숨김 여부 (정적)
   *
   * 동적으로 변경되는 visible은 외부에서 처리
   */
  hidden?: boolean;

  /**
   * 필드 너비 (flex basis)
   *
   * CSS flex-basis 값
   * @default '200px'
   *
   * @example '150px', '25%', 'auto'
   */
  width?: string;

  /**
   * 최소값 (number/date 타입에서 사용)
   */
  min?: number | string;

  /**
   * 최대값 (number/date 타입에서 사용)
   */
  max?: number | string;
}

/**
 * SearchBox 설정 (순수 데이터)
 */
export interface SearchBoxConfig {
  /**
   * 검색 필드 배열
   */
  fields: SearchFieldConfig[];

  /**
   * 검색 버튼 텍스트
   * @default '검색'
   */
  searchButtonText?: string;

  /**
   * 초기화 버튼 표시 여부
   * @default true
   */
  showResetButton?: boolean;

  /**
   * 초기화 버튼 텍스트
   * @default '초기화'
   */
  resetButtonText?: string;

  /**
   * 레이아웃 방향
   * @default 'horizontal'
   */
  layout?: 'horizontal' | 'vertical';

  /**
   * 필드 간격 (gap)
   * @default '12px'
   */
  gap?: string;
}

/**
 * SearchBox Props (Controlled Component)
 *
 * 외부에서 값과 핸들러를 주입받아 제어됩니다.
 */
export interface SearchBoxProps {
  /**
   * SearchBox 설정 (순수 데이터)
   */
  config: SearchBoxConfig;

  /**
   * 현재 필드 값들 (Controlled)
   *
   * 외부에서 상태 관리
   */
  values: SearchValues;

  /**
   * 필드 값 변경 핸들러
   *
   * @param key - 변경된 필드 key
   * @param value - 새로운 값
   */
  onChange: (key: string, value: FieldValue) => void;

  /**
   * 검색 버튼 클릭 핸들러
   */
  onSearch: () => void;

  /**
   * 초기화 버튼 클릭 핸들러
   */
  onReset: () => void;

  /**
   * 동적 옵션 오버라이드 (선택적)
   *
   * 특정 필드의 options를 동적으로 변경하고 싶을 때 사용
   * key: 필드 key, value: 동적 옵션 배열
   *
   * @example
   * ```tsx
   * dynamicOptions={{
   *   subCategory: subcategoryOptions,  // 카테고리에 따라 변경됨
   *   city: cityOptions,                // 국가에 따라 변경됨
   * }}
   * ```
   */
  dynamicOptions?: Record<string, SelectOption[]>;

  /**
   * 동적 disabled 오버라이드 (선택적)
   *
   * 특정 필드를 동적으로 비활성화하고 싶을 때 사용
   */
  dynamicDisabled?: Record<string, boolean>;

  /**
   * 동적 hidden 오버라이드 (선택적)
   *
   * 특정 필드를 동적으로 숨기고 싶을 때 사용
   */
  dynamicHidden?: Record<string, boolean>;
}

/**
 * useSearchBox Hook 반환값
 *
 * SearchBoxProps와 호환되도록 onChange, onSearch, onReset을 반환합니다.
 */
export interface UseSearchBoxReturn {
  /**
   * 현재 필드 값들
   */
  values: SearchValues;

  /**
   * 필드 값 변경 함수
   */
  onChange: (key: string, value: FieldValue) => void;

  /**
   * 검색 실행 함수
   */
  onSearch: () => void;

  /**
   * 초기화 함수
   */
  onReset: () => void;

  /**
   * 특정 필드 값 직접 설정 (의존성 처리용)
   */
  setFieldValue: (key: string, value: FieldValue) => void;

  /**
   * 여러 필드 값 한 번에 설정
   */
  setValues: (values: Partial<SearchValues>) => void;
}
