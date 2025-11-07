import React from 'react';
import {
  SearchBoxProps,
  SearchFieldConfig,
  FieldValue,
  SelectOption,
} from '@/types/search-box.types';

/**
 * SearchBox 컴포넌트
 *
 * ✅ Controlled Component: 외부에서 값과 핸들러를 주입받아 동작
 * ✅ 순수 UI 컴포넌트: 비즈니스 로직은 포함하지 않음
 * ✅ 동적 옵션/disabled/hidden 지원
 *
 * @example
 * ```tsx
 * // 기본 사용
 * const searchBox = useSearchBox(config, handleSearch);
 * <SearchBox config={config} {...searchBox} />
 *
 * // 동적 옵션 사용
 * <SearchBox
 *   config={config}
 *   {...searchBox}
 *   dynamicOptions={{
 *     subCategory: subcategoryOptions,  // 카테고리에 따라 변경됨
 *   }}
 * />
 * ```
 */
export const SearchBox: React.FC<SearchBoxProps> = ({
  config,
  values,
  onChange,
  onSearch,
  onReset,
  dynamicOptions,
  dynamicDisabled,
  dynamicHidden,
}) => {
  // ============================================================================
  // 필드 렌더링
  // ============================================================================

  const renderField = (field: SearchFieldConfig) => {
    const value = values[field.key];

    // 동적 hidden 체크
    if (dynamicHidden?.[field.key] || field.hidden) {
      return null;
    }

    // 동적 disabled 체크
    const isDisabled = dynamicDisabled?.[field.key] ?? field.disabled ?? false;

    // 동적 옵션 사용 (있으면 우선, 없으면 정적 옵션)
    const options = dynamicOptions?.[field.key] ?? field.options ?? [];

    const handleFieldChange = (newValue: FieldValue) => {
      onChange(field.key, newValue);
    };

    const commonInputStyle: React.CSSProperties = {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      width: '100%',
      boxSizing: 'border-box',
    };

    const fieldWrapperStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      flexBasis: field.width ?? '200px',
      minWidth: '150px',
    };

    // ============================================================================
    // 필드 타입별 렌더링
    // ============================================================================

    let inputElement: React.ReactNode;

    switch (field.type) {
      case 'text':
        inputElement = (
          <input
            type="text"
            value={(value as string) ?? ''}
            onChange={(e) => handleFieldChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={isDisabled}
            style={commonInputStyle}
          />
        );
        break;

      case 'number':
        inputElement = (
          <input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => handleFieldChange(Number(e.target.value))}
            placeholder={field.placeholder}
            disabled={isDisabled}
            min={field.min as number}
            max={field.max as number}
            style={commonInputStyle}
          />
        );
        break;

      case 'select':
        inputElement = (
          <select
            value={(value as string | number) ?? ''}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled={isDisabled}
            style={commonInputStyle}
          >
            <option value="">{field.placeholder ?? '선택하세요'}</option>
            {options.map((option: SelectOption) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );
        break;

      case 'date':
        inputElement = (
          <input
            type="date"
            value={(value as string) ?? ''}
            onChange={(e) => handleFieldChange(e.target.value)}
            disabled={isDisabled}
            min={field.min as string}
            max={field.max as string}
            style={commonInputStyle}
          />
        );
        break;

      case 'dateRange':
        const [startDate, endDate] = (value as [string, string]) ?? ['', ''];
        inputElement = (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleFieldChange([e.target.value, endDate])}
              disabled={isDisabled}
              style={{ ...commonInputStyle, width: 'auto', flex: 1 }}
            />
            <span>~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleFieldChange([startDate, e.target.value])}
              disabled={isDisabled}
              style={{ ...commonInputStyle, width: 'auto', flex: 1 }}
            />
          </div>
        );
        break;

      case 'checkbox':
        inputElement = (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={(value as boolean) ?? false}
              onChange={(e) => handleFieldChange(e.target.checked)}
              disabled={isDisabled}
            />
            <span>{field.placeholder}</span>
          </label>
        );
        break;

      default:
        inputElement = null;
    }

    return (
      <div key={field.key} style={fieldWrapperStyle}>
        <label style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
          {field.label}
          {field.required && <span style={{ color: '#e74c3c', marginLeft: '4px' }}>*</span>}
        </label>
        {inputElement}
      </div>
    );
  };

  // ============================================================================
  // 버튼 핸들러
  // ============================================================================

  const handleSearchClick = () => {
    onSearch();
  };

  const handleResetClick = () => {
    onReset();
  };

  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  // ============================================================================
  // 렌더링
  // ============================================================================

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: config.layout === 'vertical' ? 'column' : 'row',
    gap: config.gap ?? '12px',
    flexWrap: 'wrap',
    alignItems: config.layout === 'vertical' ? 'stretch' : 'flex-end',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const searchButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#3498db',
    color: 'white',
  };

  const resetButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#95a5a6',
    color: 'white',
  };

  return (
    <div style={containerStyle} onKeyDown={handleKeyDown}>
      {/* 필드들 */}
      {config.fields.map((field) => renderField(field))}

      {/* 버튼 그룹 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end',
          marginTop: config.layout === 'vertical' ? '12px' : '0',
        }}
      >
        <button style={searchButtonStyle} onClick={handleSearchClick}>
          {config.searchButtonText ?? '검색'}
        </button>

        {(config.showResetButton ?? true) && (
          <button style={resetButtonStyle} onClick={handleResetClick}>
            {config.resetButtonText ?? '초기화'}
          </button>
        )}
      </div>
    </div>
  );
};
