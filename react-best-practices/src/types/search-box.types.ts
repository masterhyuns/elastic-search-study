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
 * 검색 필드 설정 (순수 데이터만 - 재사용 가능)
 *
 * ✅ key에 따라 value 타입이 자동으로 결정됩니다.
 * ✅ Config 작성 단계부터 타입 안정성이 보장됩니다.
 * ✅ .ts 파일로 export하여 여러 곳에서 재사용 가능합니다.
 *
 * @template T - 검색 필드 값 타입
 *
 * @example
 * ```tsx
 * interface LocationValues {
 *   country: string;
 *   city: string;
 *   age: number;
 * }
 *
 * // ✅ key와 value가 타입 안전하게 연결됨
 * const field: SearchFieldConfig<LocationValues> = {
 *   key: 'country',      // ✅ 자동완성 + 타입 체크
 *   value: 'kr',         // ✅ string만 가능 (LocationValues['country'])
 *   // value: 123,       // ❌ TS 에러! number는 안됨
 *   // key: 'invalid',   // ❌ TS 에러!
 * };
 * ```
 */
export type SearchFieldConfig<T extends Record<string, any>> = {
  [K in keyof T]: {
    /**
     * 필드 고유 key (타입 안전)
     */
    key: K;

    /**
     * 필드 초기값 (필수)
     *
     * key에 해당하는 타입과 일치해야 합니다.
     */
    value: T[K];

    /**
     * 필드 레이블
     */
    label: string;

    /**
     * 필드 타입
     */
    type: FieldType;

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
  };
}[keyof T];

/**
 * SearchBox 설정 (순수 데이터)
 *
 * ✅ Config에 제네릭을 지정하면 모든 타입이 자동으로 추론됩니다.
 * ✅ hook에서 제네릭을 명시할 필요 없이 config에서 타입 추론!
 *
 * @template T - 검색 필드 값 타입 (필수)
 *
 * @example
 * ```tsx
 * interface LocationValues {
 *   country: string;
 *   city: string;
 *   age: number;
 * }
 *
 * // ✅ Config 작성 단계부터 타입 안전!
 * const config: SearchBoxConfig<LocationValues> = {
 *   fields: [
 *     {
 *       key: 'country',  // ✅ 자동완성!
 *       value: 'kr',     // ✅ string만 가능
 *       label: '국가',
 *       type: 'select',
 *     },
 *     {
 *       key: 'age',
 *       value: 0,        // ✅ number만 가능
 *       label: '나이',
 *       type: 'number',
 *     }
 *   ]
 * };
 *
 * // ✅ hook에서 자동 타입 추론!
 * const searchBox = useSearchBox(config, (values) => {
 *   values.country  // ✅ 자동완성!
 *   values.age      // ✅ 자동완성!
 * });
 * ```
 */
export interface SearchBoxConfig<T extends Record<string, any>> {
  /**
   * 검색 필드 배열 (타입 안전)
   */
  fields: SearchFieldConfig<T>[];

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
 * config는 useSearchBox에서 관리되므로 동적 속성 변경은 setFieldConfig를 사용합니다.
 *
 * @template T - 검색 필드 값 타입 (필수)
 *
 * @example
 * ```tsx
 * interface ProductSearchValues {
 *   category: string;
 *   subCategory: string;
 *   price: number;
 * }
 *
 * const config: SearchBoxConfig<ProductSearchValues> = { ... };
 * const searchBox = useSearchBox(config, handleSearch);
 *
 * // ✅ 동적 속성 변경은 setFieldConfig 사용
 * useEffect(() => {
 *   searchBox.setFieldConfig('subCategory', 'options', newOptions);
 * }, [searchBox.values.category]);
 *
 * // ✅ SearchBox에 spread로 전달
 * <SearchBox {...searchBox} />
 * ```
 */
export interface SearchBoxProps<T extends Record<string, any>> {
  /**
   * SearchBox 설정 (순수 데이터, 타입 안전)
   */
  config: SearchBoxConfig<T>;

  /**
   * 현재 필드 값들 (Controlled)
   *
   * 외부에서 상태 관리
   */
  values: T;

  /**
   * 필드 값 변경 핸들러
   *
   * @param key - 변경된 필드 key (타입 안전)
   * @param value - 새로운 값 (key에 해당하는 타입)
   */
  onChange: <K extends keyof T>(key: K, value: T[K]) => void;

  /**
   * 검색 버튼 클릭 핸들러
   */
  onSearch: () => void;

  /**
   * 초기화 버튼 클릭 핸들러
   */
  onReset: () => void;
}

/**
 * useSearchBox Hook 반환값
 *
 * SearchBoxProps와 완전히 호환되도록 config를 포함하여 반환합니다.
 * 사용자는 <SearchBox {...searchBox} />만 작성하면 됩니다.
 *
 * @template T - 검색 필드 값 타입 (필수)
 *
 * @example
 * ```tsx
 * interface ProductSearchValues {
 *   category: string;
 *   subCategory: string;
 *   price: number;
 * }
 *
 * const config: SearchBoxConfig<ProductSearchValues> = { ... };
 * const searchBox = useSearchBox(config, handleSearch);
 *
 * // ✅ config를 다시 전달할 필요 없음!
 * <SearchBox {...searchBox} />
 *
 * // ✅ 타입 안전한 필드 값 변경
 * searchBox.setFieldValue('category', 'electronics'); // ✅ 타입 체크
 * searchBox.setFieldValue('invalid', 'value'); // ❌ TS 에러!
 *
 * // ✅ 동적으로 필드 config 변경 (NEW!)
 * searchBox.setFieldConfig('category', 'options', newOptions);
 * searchBox.setFieldConfig('category', 'disabled', true);
 * searchBox.setFieldConfig('category', 'placeholder', '새 플레이스홀더');
 * ```
 */
export interface UseSearchBoxReturn<T extends Record<string, any>> {
  /**
   * SearchBox 설정 (hook에서 관리)
   */
  config: SearchBoxConfig<T>;

  /**
   * 현재 필드 값들
   */
  values: T;

  /**
   * 필드 값 변경 함수 (타입 안전)
   */
  onChange: <K extends keyof T>(key: K, value: T[K]) => void;

  /**
   * 검색 실행 함수
   */
  onSearch: () => void;

  /**
   * 초기화 함수
   */
  onReset: () => void;

  /**
   * 특정 필드 값 직접 설정 (의존성 처리용, 타입 안전)
   *
   * @param key - 필드 key (자동완성 지원)
   * @param value - 새로운 값 (key에 해당하는 타입)
   */
  setFieldValue: <K extends keyof T>(key: K, value: T[K]) => void;

  /**
   * 여러 필드 값 한 번에 설정
   */
  setValues: (values: Partial<T>) => void;

  /**
   * 특정 필드의 config 속성을 동적으로 변경 (NEW!)
   *
   * 이 함수를 사용하면 동적으로 필드의 options, disabled, hidden, placeholder 등을 변경할 수 있습니다.
   * 기존 dynamicOptions, dynamicDisabled, dynamicHidden prop을 대체합니다.
   *
   * @param key - 필드 key (자동완성 지원)
   * @param property - 변경할 속성 이름
   *   - 'options': SelectOption[] - select 필드의 옵션 변경
   *   - 'disabled': boolean - 필드 비활성화 상태 변경
   *   - 'hidden': boolean - 필드 숨김 상태 변경
   *   - 'placeholder': string - placeholder 텍스트 변경
   *   - 'width': string - 필드 너비 변경
   *   - 'label': string - 필드 레이블 변경
   * @param value - 새로운 속성 값 (property 타입에 맞는 값)
   *
   * @example
   * ```tsx
   * // 카테고리에 따라 하위 카테고리 옵션 변경
   * useEffect(() => {
   *   if (searchBox.values.category === 'electronics') {
   *     searchBox.setFieldConfig('subCategory', 'options', [
   *       { value: 'laptop', label: '노트북' },
   *       { value: 'phone', label: '휴대폰' },
   *     ]);
   *   }
   * }, [searchBox.values.category]);
   *
   * // 조건에 따라 필드 비활성화
   * searchBox.setFieldConfig('city', 'disabled', !searchBox.values.country);
   *
   * // 필드 숨김
   * searchBox.setFieldConfig('advancedOption', 'hidden', !showAdvanced);
   * ```
   */
  setFieldConfig: <K extends keyof T>(
    key: K,
    property: 'options' | 'disabled' | 'hidden' | 'placeholder' | 'width' | 'label' | 'required' | 'min' | 'max',
    value: any
  ) => void;
}
