import { useState, useCallback } from 'react';
import {
  SearchBoxConfig,
  SearchValues,
  FieldValue,
  UseSearchBoxReturn,
} from '@/types/search-box.types';

/**
 * SearchBox 상태 관리 Hook
 *
 * ✅ 기본적인 상태 관리와 핸들러 제공
 * ✅ 비즈니스 로직(의존성 처리)은 외부에서 구현
 * ✅ Controlled Component 패턴 지원
 *
 * @param config - SearchBox 설정
 * @param onSearch - 검색 실행 시 콜백
 * @returns 상태와 핸들러
 *
 * @example
 * ```tsx
 * // 기본 사용
 * const searchBox = useSearchBox(config, (values) => {
 *   console.log('검색:', values);
 * });
 *
 * return <SearchBox config={config} {...searchBox} />;
 * ```
 *
 * @example
 * ```tsx
 * // 의존성 처리 (필드 간 영향)
 * const searchBox = useSearchBox(config, handleSearch);
 *
 * // 카테고리가 변경되면 하위 카테고리 초기화
 * useEffect(() => {
 *   if (searchBox.values.category) {
 *     searchBox.setFieldValue('subCategory', '');
 *   }
 * }, [searchBox.values.category]);
 *
 * return <SearchBox config={config} {...searchBox} />;
 * ```
 */
export const useSearchBox = (
  config: SearchBoxConfig,
  onSearch?: (values: SearchValues) => void
): UseSearchBoxReturn => {
  // ============================================================================
  // 초기값 생성
  // ============================================================================

  const getInitialValues = useCallback((): SearchValues => {
    const initial: SearchValues = {};
    config.fields.forEach((field) => {
      initial[field.key] = field.defaultValue ?? '';
    });
    return initial;
  }, [config.fields]);

  // ============================================================================
  // 상태
  // ============================================================================

  const [values, setValuesState] = useState<SearchValues>(getInitialValues);

  // ============================================================================
  // 핸들러
  // ============================================================================

  /**
   * 단일 필드 값 변경
   */
  const handleChange = useCallback((key: string, value: FieldValue) => {
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
    setValuesState(getInitialValues());
  }, [getInitialValues]);

  /**
   * 특정 필드 값 직접 설정
   * (의존성 처리에서 사용)
   */
  const setFieldValue = useCallback((key: string, value: FieldValue) => {
    setValuesState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * 여러 필드 값 한 번에 설정
   */
  const setValues = useCallback((newValues: Partial<SearchValues>) => {
    setValuesState((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  // ============================================================================
  // 반환
  // ============================================================================

  return {
    values,
    onChange: handleChange,
    onSearch: handleSearch,
    onReset: handleReset,
    setFieldValue,
    setValues,
  };
};
