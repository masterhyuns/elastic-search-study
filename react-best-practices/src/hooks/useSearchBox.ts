import { useState, useCallback } from 'react';
import {
  SearchBoxConfig,
  UseSearchBoxReturn,
} from '@/types/search-box.types';

/**
 * SearchBox 상태 관리 Hook
 *
 * ✅ 기본적인 상태 관리와 핸들러 제공
 * ✅ 비즈니스 로직(의존성 처리)은 외부에서 구현
 * ✅ Controlled Component 패턴 지원
 * ✅ Config로부터 타입 자동 추론
 *
 * @template T - 검색 필드 값 타입 (config에서 자동 추론)
 * @param config - SearchBox 설정
 * @param onSearch - 검색 실행 시 콜백
 * @returns 상태와 핸들러
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
 *
 * // ✅ config에서 타입 자동 추론!
 * const searchBox = useSearchBox(config, (values) => {
 *   console.log(values.category); // ✅ 자동완성!
 * });
 *
 * // 의존성 처리 (필드 간 영향)
 * useEffect(() => {
 *   if (searchBox.values.category) {
 *     searchBox.setFieldValue('subCategory', ''); // ✅ 타입 체크!
 *   }
 * }, [searchBox.values.category]);
 *
 * return <SearchBox config={config} {...searchBox} />;
 * ```
 */
export const useSearchBox = <T extends Record<string, any>>(
  initialConfig: SearchBoxConfig<T>,
  onSearch?: (values: T) => void
): UseSearchBoxReturn<T> => {
  // ============================================================================
  // 초기값 생성 (config의 value에서 가져옴)
  // ============================================================================

  const getInitialValues = useCallback((config: SearchBoxConfig<T>): T => {
    const initial: any = {};
    config.fields.forEach((field) => {
      initial[field.key] = field.value;
    });
    return initial as T;
  }, []);

  // ============================================================================
  // 상태 (config와 values 모두 state로 관리)
  // ============================================================================

  const [config, setConfigState] = useState<SearchBoxConfig<T>>(initialConfig);
  const [values, setValuesState] = useState<T>(getInitialValues(initialConfig));

  // ============================================================================
  // 핸들러
  // ============================================================================

  /**
   * 단일 필드 값 변경 (제네릭으로 타입 안전)
   */
  const handleChange = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValuesState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * 검색 실행
   */
  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch(values);
    }
  }, [values, onSearch]);

  /**
   * 초기화
   */
  const handleReset = useCallback(() => {
    setValuesState(getInitialValues(config));
  }, [config, getInitialValues]);

  /**
   * 특정 필드 값 직접 설정 (제네릭으로 타입 안전)
   * (의존성 처리에서 사용)
   */
  const setFieldValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValuesState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * 여러 필드 값 한 번에 설정
   */
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  /**
   * 특정 필드의 config 속성 동적 변경
   *
   * 이 함수를 사용하면 동적으로 필드의 options, disabled, hidden 등을 변경할 수 있습니다.
   * 기존 dynamicOptions, dynamicDisabled, dynamicHidden prop을 대체합니다.
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
   * ```
   */
  const setFieldConfig = useCallback(
    <K extends keyof T>(
      key: K,
      property: 'options' | 'disabled' | 'hidden' | 'placeholder' | 'width' | 'label' | 'required' | 'min' | 'max',
      value: any
    ) => {
      setConfigState((prev) => ({
        ...prev,
        fields: prev.fields.map((field) =>
          field.key === key ? { ...field, [property]: value } : field
        ),
      }));
    },
    []
  );

  // ============================================================================
  // 반환
  // ============================================================================

  return {
    config, // ✅ config 포함하여 반환 (SearchBox에 다시 전달할 필요 없음)
    values,
    onChange: handleChange,
    onSearch: handleSearch,
    onReset: handleReset,
    setFieldValue,
    setValues,
    setFieldConfig, // ✅ 필드 config 동적 변경 함수
  };
};
