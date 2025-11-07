'use client';

import React, { useState, useEffect } from 'react';
import { SearchBox } from '@/components/ui/SearchBox';
import { useSearchBox } from '@/hooks/useSearchBox';
import { SearchBoxConfig, SelectOption } from '@/types/search-box.types';

/**
 * SearchBox 데모 페이지
 *
 * 3가지 주요 패턴을 보여줍니다:
 * 1. 기본 사용 - config 재사용
 * 2. 필드 간 의존성 - useEffect로 다른 필드에 영향
 * 3. 동적 옵션 로딩 - API 호출 시뮬레이션
 */
export default function SearchBoxDemo() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '40px' }}>SearchBox 데모</h1>

      {/* 예제 1: 기본 사용 */}
      <Example1BasicUsage />

      {/* 예제 2: 필드 간 의존성 */}
      <Example2FieldDependency />

      {/* 예제 3: 동적 옵션 로딩 */}
      <Example3DynamicOptions />
    </div>
  );
}

// ==============================================================================
// 예제 1: 기본 사용 (Config 재사용)
// ==============================================================================

/**
 * ✅ Config는 순수 데이터로 정의 (재사용 가능)
 * ✅ .ts 파일로 export하여 여러 곳에서 사용 가능
 */
const basicConfig: SearchBoxConfig = {
  fields: [
    {
      key: 'keyword',
      label: '검색어',
      type: 'text',
      placeholder: '검색어를 입력하세요',
      width: '300px',
    },
    {
      key: 'status',
      label: '상태',
      type: 'select',
      options: [
        { value: 'all', label: '전체' },
        { value: 'active', label: '활성' },
        { value: 'inactive', label: '비활성' },
      ],
      defaultValue: 'all',
      width: '150px',
    },
    {
      key: 'startDate',
      label: '시작일',
      type: 'date',
      width: '180px',
    },
  ],
  searchButtonText: '검색',
  showResetButton: true,
};

const Example1BasicUsage = () => {
  const [result, setResult] = useState<string>('');

  const searchBox = useSearchBox(basicConfig, (values) => {
    setResult(JSON.stringify(values, null, 2));
  });

  return (
    <section style={{ marginBottom: '60px' }}>
      <h2>1. 기본 사용 (Config 재사용)</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Config는 순수 데이터로 정의하여 재사용 가능합니다.
      </p>

      <SearchBox config={basicConfig} {...searchBox} />

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>검색 결과:</h3>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            {result}
          </pre>
        </div>
      )}

      <details style={{ marginTop: '20px' }}>
        <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
          코드 보기
        </summary>
        <pre
          style={{
            backgroundColor: '#f9f9f9',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '13px',
          }}
        >
          {`// ✅ Config는 별도 파일로 관리 가능 (예: configs/search.config.ts)
const basicConfig: SearchBoxConfig = {
  fields: [
    {
      key: 'keyword',
      label: '검색어',
      type: 'text',
      placeholder: '검색어를 입력하세요',
      width: '300px',
    },
    {
      key: 'status',
      label: '상태',
      type: 'select',
      options: [
        { value: 'all', label: '전체' },
        { value: 'active', label: '활성' },
      ],
    },
  ],
};

// ✅ 사용하는 곳에서 hook + 비즈니스 로직 구현
const searchBox = useSearchBox(basicConfig, (values) => {
  console.log('검색:', values);
  // API 호출 등 비즈니스 로직
});

return <SearchBox config={basicConfig} {...searchBox} />;`}
        </pre>
      </details>
    </section>
  );
};

// ==============================================================================
// 예제 2: 필드 간 의존성 (카테고리 -> 하위 카테고리)
// ==============================================================================

/**
 * ✅ Config는 여전히 순수 데이터
 * ✅ 의존성 로직은 컴포넌트에서 useEffect로 처리
 */
const categoryConfig: SearchBoxConfig = {
  fields: [
    {
      key: 'category',
      label: '카테고리',
      type: 'select',
      options: [
        { value: 'electronics', label: '전자제품' },
        { value: 'food', label: '식품' },
        { value: 'clothing', label: '의류' },
      ],
      width: '200px',
    },
    {
      key: 'subCategory',
      label: '하위 카테고리',
      type: 'select',
      placeholder: '카테고리를 먼저 선택하세요',
      width: '200px',
    },
    {
      key: 'price',
      label: '가격',
      type: 'number',
      placeholder: '최소 가격',
      width: '150px',
    },
  ],
};

const Example2FieldDependency = () => {
  const [result, setResult] = useState<string>('');
  const [subCategoryOptions, setSubCategoryOptions] = useState<SelectOption[]>([]);

  const searchBox = useSearchBox(categoryConfig, (values) => {
    setResult(JSON.stringify(values, null, 2));
  });

  // ============================================================================
  // 의존성 처리: 카테고리가 변경되면 하위 카테고리 옵션 변경
  // ============================================================================

  useEffect(() => {
    const category = searchBox.values.category;

    if (!category) {
      setSubCategoryOptions([]);
      searchBox.setFieldValue('subCategory', '');
      return;
    }

    // ✅ 비즈니스 로직: 카테고리에 따라 하위 카테고리 옵션 설정
    const optionsMap: Record<string, SelectOption[]> = {
      electronics: [
        { value: 'phone', label: '휴대폰' },
        { value: 'laptop', label: '노트북' },
        { value: 'tablet', label: '태블릿' },
      ],
      food: [
        { value: 'fruit', label: '과일' },
        { value: 'vegetable', label: '채소' },
        { value: 'meat', label: '육류' },
      ],
      clothing: [
        { value: 'top', label: '상의' },
        { value: 'bottom', label: '하의' },
        { value: 'shoes', label: '신발' },
      ],
    };

    setSubCategoryOptions(optionsMap[category as string] ?? []);

    // 카테고리 변경 시 하위 카테고리 초기화
    searchBox.setFieldValue('subCategory', '');
  }, [searchBox.values.category]);

  return (
    <section style={{ marginBottom: '60px' }}>
      <h2>2. 필드 간 의존성 (카테고리 → 하위 카테고리)</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        카테고리를 선택하면 하위 카테고리 옵션이 동적으로 변경됩니다.
      </p>

      <SearchBox
        config={categoryConfig}
        {...searchBox}
        dynamicOptions={{
          subCategory: subCategoryOptions,
        }}
      />

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>검색 결과:</h3>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            {result}
          </pre>
        </div>
      )}

      <details style={{ marginTop: '20px' }}>
        <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
          코드 보기
        </summary>
        <pre
          style={{
            backgroundColor: '#f9f9f9',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '13px',
          }}
        >
          {`// ✅ Config는 순수 데이터 (재사용 가능)
const categoryConfig: SearchBoxConfig = {
  fields: [
    {
      key: 'category',
      type: 'select',
      options: [
        { value: 'electronics', label: '전자제품' },
        { value: 'food', label: '식품' },
      ],
    },
    {
      key: 'subCategory',
      type: 'select',
      // ✅ 초기 옵션 없음 (동적으로 주입됨)
    },
  ],
};

// ✅ 비즈니스 로직: useEffect로 의존성 처리
const [subCategoryOptions, setSubCategoryOptions] = useState([]);
const searchBox = useSearchBox(categoryConfig, handleSearch);

useEffect(() => {
  const category = searchBox.values.category;

  if (category === 'electronics') {
    setSubCategoryOptions([
      { value: 'phone', label: '휴대폰' },
      { value: 'laptop', label: '노트북' },
    ]);
  } else if (category === 'food') {
    setSubCategoryOptions([
      { value: 'fruit', label: '과일' },
      { value: 'vegetable', label: '채소' },
    ]);
  }

  // 카테고리 변경 시 하위 카테고리 초기화
  searchBox.setFieldValue('subCategory', '');
}, [searchBox.values.category]);

// ✅ dynamicOptions로 동적 옵션 주입
return (
  <SearchBox
    config={categoryConfig}
    {...searchBox}
    dynamicOptions={{
      subCategory: subCategoryOptions,
    }}
  />
);`}
        </pre>
      </details>
    </section>
  );
};

// ==============================================================================
// 예제 3: 동적 옵션 로딩 (API 호출 시뮬레이션)
// ==============================================================================

/**
 * ✅ Config는 순수 데이터
 * ✅ API 호출 등 비동기 로직은 컴포넌트에서 처리
 */
const locationConfig: SearchBoxConfig = {
  fields: [
    {
      key: 'country',
      label: '국가',
      type: 'select',
      options: [
        { value: 'kr', label: '한국' },
        { value: 'us', label: '미국' },
        { value: 'jp', label: '일본' },
      ],
      width: '150px',
    },
    {
      key: 'city',
      label: '도시',
      type: 'select',
      placeholder: '국가를 먼저 선택하세요',
      width: '200px',
    },
    {
      key: 'includeSuburbs',
      label: '교외 지역 포함',
      type: 'checkbox',
      placeholder: '교외 지역도 포함하여 검색',
      defaultValue: false,
    },
  ],
};

const Example3DynamicOptions = () => {
  const [result, setResult] = useState<string>('');
  const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [cityDisabled, setCityDisabled] = useState(true);

  const searchBox = useSearchBox(locationConfig, (values) => {
    setResult(JSON.stringify(values, null, 2));
  });

  // ============================================================================
  // 비동기 API 호출 시뮬레이션
  // ============================================================================

  useEffect(() => {
    const country = searchBox.values.country;

    if (!country) {
      setCityOptions([]);
      setCityDisabled(true);
      searchBox.setFieldValue('city', '');
      return;
    }

    // ✅ 비동기 API 호출 시뮬레이션
    setLoading(true);
    setCityDisabled(true);

    // 1초 후 데이터 로드 (실제로는 fetch 호출)
    setTimeout(() => {
      const cityMap: Record<string, SelectOption[]> = {
        kr: [
          { value: 'seoul', label: '서울' },
          { value: 'busan', label: '부산' },
          { value: 'incheon', label: '인천' },
        ],
        us: [
          { value: 'newyork', label: '뉴욕' },
          { value: 'la', label: '로스앤젤레스' },
          { value: 'chicago', label: '시카고' },
        ],
        jp: [
          { value: 'tokyo', label: '도쿄' },
          { value: 'osaka', label: '오사카' },
          { value: 'kyoto', label: '교토' },
        ],
      };

      setCityOptions(cityMap[country as string] ?? []);
      setCityDisabled(false);
      setLoading(false);
      searchBox.setFieldValue('city', '');
    }, 1000);
  }, [searchBox.values.country]);

  return (
    <section style={{ marginBottom: '60px' }}>
      <h2>3. 동적 옵션 로딩 (API 호출 시뮬레이션)</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        국가를 선택하면 비동기로 도시 목록을 로드합니다. {loading && '(로딩 중...)'}
      </p>

      <SearchBox
        config={locationConfig}
        {...searchBox}
        dynamicOptions={{
          city: cityOptions,
        }}
        dynamicDisabled={{
          city: cityDisabled,
        }}
      />

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>검색 결과:</h3>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            {result}
          </pre>
        </div>
      )}

      <details style={{ marginTop: '20px' }}>
        <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
          코드 보기
        </summary>
        <pre
          style={{
            backgroundColor: '#f9f9f9',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '13px',
          }}
        >
          {`// ✅ Config는 순수 데이터
const locationConfig: SearchBoxConfig = {
  fields: [
    {
      key: 'country',
      type: 'select',
      options: [
        { value: 'kr', label: '한국' },
        { value: 'us', label: '미국' },
      ],
    },
    {
      key: 'city',
      type: 'select',
      // 초기 옵션 없음 (API에서 로드)
    },
  ],
};

// ✅ 비즈니스 로직: 비동기 API 호출
const [cityOptions, setCityOptions] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const country = searchBox.values.country;
  if (!country) return;

  setLoading(true);

  // API 호출
  fetchCities(country).then((cities) => {
    setCityOptions(cities);
    setLoading(false);
  });
}, [searchBox.values.country]);

// ✅ 동적 옵션 + disabled 제어
return (
  <SearchBox
    config={locationConfig}
    {...searchBox}
    dynamicOptions={{
      city: cityOptions,
    }}
    dynamicDisabled={{
      city: loading,  // 로딩 중에는 비활성화
    }}
  />
);`}
        </pre>
      </details>
    </section>
  );
};
