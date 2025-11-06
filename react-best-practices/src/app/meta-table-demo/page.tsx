'use client';

import React, { useState } from 'react';
import { MetaTable } from '@/components/ui/MetaTable';
import { TableConfig } from '@/types/meta-table.types';

/**
 * MetaTable 데모 페이지
 *
 * Key 기반 config로 데이터 변환 없이 테이블 렌더링 예제들
 */
const MetaTableDemoPage = () => {
  // ============================================================================
  // 예제 1: 기본 사용 (그룹핑 없음)
  // ============================================================================

  const basicData = [
    { name: 'John', age: 30, city: 'Seoul', email: 'john@example.com' },
    { name: 'Jane', age: 25, city: 'Busan', email: 'jane@example.com' },
    { name: 'Bob', age: 35, city: 'Incheon', email: 'bob@example.com' },
  ];

  const basicConfig: TableConfig = {
    columns: [
      { key: 'name', label: 'Name', width: 150 },
      { key: 'age', label: 'Age', width: 100, align: 'center' },
      { key: 'city', label: 'City', width: 150 },
      {
        key: 'email',
        label: 'Email',
        render: (value) => <a href={`mailto:${value}`}>{value}</a>,
      },
    ],
  };

  // ============================================================================
  // 예제 2: 행 그룹핑 (rowSpan)
  // ============================================================================

  const groupedData = [
    { category: 'A', subcategory: 'A-1', product: 'Product 1', price: 1000 },
    { category: 'A', subcategory: 'A-1', product: 'Product 2', price: 2000 },
    { category: 'A', subcategory: 'A-2', product: 'Product 3', price: 1500 },
    { category: 'B', subcategory: 'B-1', product: 'Product 4', price: 3000 },
    { category: 'B', subcategory: 'B-1', product: 'Product 5', price: 2500 },
  ];

  const groupedConfig: TableConfig = {
    columns: [
      { key: 'category', label: 'Category', groupBy: true, width: 120 },
      { key: 'subcategory', label: 'Subcategory', groupBy: true, width: 150 },
      { key: 'product', label: 'Product', width: 200 },
      {
        key: 'price',
        label: 'Price',
        align: 'right',
        render: (value) => `$${value.toLocaleString()}`,
      },
    ],
  };

  // ============================================================================
  // 예제 3: 계층적 헤더 (colSpan + rowSpan)
  // ============================================================================

  const hierarchicalData = [
    {
      name: 'John',
      mobile: '010-1111-1111',
      home: '02-1111-1111',
      email: 'john@example.com',
    },
    {
      name: 'Jane',
      mobile: '010-2222-2222',
      home: '02-2222-2222',
      email: 'jane@example.com',
    },
    {
      name: 'Bob',
      mobile: '010-3333-3333',
      home: '02-3333-3333',
      email: 'bob@example.com',
    },
  ];

  const hierarchicalConfig: TableConfig = {
    columns: [
      { key: 'name', label: 'Name', width: 150 },
      {
        key: 'mobile',
        label: 'Mobile',
        headerGroup: 'Contact.Phone',
        render: (value) => <a href={`tel:${value}`}>{value}</a>,
      },
      {
        key: 'home',
        label: 'Home',
        headerGroup: 'Contact.Phone',
        render: (value) => <a href={`tel:${value}`}>{value}</a>,
      },
      {
        key: 'email',
        label: 'Email',
        headerGroup: 'Contact',
        render: (value) => <a href={`mailto:${value}`}>{value}</a>,
      },
    ],
  };

  // ============================================================================
  // 예제 4: 체크박스 + Summary
  // ============================================================================

  const summaryData = [
    { name: 'Item 1', quantity: 10, price: 1000, status: 'active' },
    { name: 'Item 2', quantity: 5, price: 2000, status: 'inactive' },
    { name: 'Item 3', quantity: 8, price: 1500, status: 'active' },
    { name: 'Item 4', quantity: 3, price: 3000, status: 'active' },
  ];

  const [selectedSummary, setSelectedSummary] = useState<Set<number>>(new Set());

  const summaryConfig: TableConfig = {
    columns: [
      { key: 'name', label: 'Item Name', width: 200 },
      { key: 'quantity', label: 'Quantity', align: 'center' },
      {
        key: 'price',
        label: 'Price',
        align: 'right',
        render: (value) => `$${value.toLocaleString()}`,
      },
      {
        key: 'status',
        label: 'Status',
        align: 'center',
        render: (value) => (
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: value === 'active' ? '#d4edda' : '#f8d7da',
            color: value === 'active' ? '#155724' : '#721c24',
          }}>
            {value}
          </span>
        )
      },
    ],
    features: {
      checkbox: {
        position: 'left',
        showHeaderCheckbox: true,
        onSelectionChange: (indices, rows) => {
          setSelectedSummary(indices);
          console.log('Selected:', rows);
        },
      },
      summary: {
        position: 'bottom',
        columns: {
          name: { type: 'count', label: 'Total:' },
          quantity: { type: 'sum' },
          price: {
            type: 'sum',
            render: (value) => `$${value.toLocaleString()}`,
          },
          status: {
            type: 'custom',
            calculate: (data, key) => {
              // custom 계산: active 상태 개수 / 전체 개수
              const activeCount = data.filter(row => row.status === 'active').length;
              return `${activeCount}/${data.length} active`;
            },
            label: 'Status:',
          },
        },
      },
      highlightOnHover: true,
      striped: true,
    },
  };

  // ============================================================================
  // 예제 5: 중첩 객체 접근
  // ============================================================================

  const nestedData = [
    {
      id: 1,
      user: { name: 'John', address: { city: 'Seoul', country: 'Korea' } },
      stats: { views: 100, likes: 50 },
    },
    {
      id: 2,
      user: { name: 'Jane', address: { city: 'Busan', country: 'Korea' } },
      stats: { views: 200, likes: 80 },
    },
    {
      id: 3,
      user: { name: 'Bob', address: { city: 'Tokyo', country: 'Japan' } },
      stats: { views: 150, likes: 60 },
    },
  ];

  const nestedConfig: TableConfig = {
    columns: [
      { key: 'id', label: 'ID', width: 80, align: 'center' },
      { key: 'user.name', label: 'Name', width: 150 },
      { key: 'user.address.city', label: 'City', width: 120 },
      { key: 'user.address.country', label: 'Country', width: 120 },
      { key: 'stats.views', label: 'Views', align: 'right' },
      { key: 'stats.likes', label: 'Likes', align: 'right' },
    ],
  };

  // ============================================================================
  // 예제 6: 함수형 accessor + 조건부 스타일
  // ============================================================================

  const advancedData = [
    { firstName: 'John', lastName: 'Doe', score: 85, status: 'pass' },
    { firstName: 'Jane', lastName: 'Smith', score: 92, status: 'pass' },
    { firstName: 'Bob', lastName: 'Johnson', score: 58, status: 'fail' },
    { firstName: 'Alice', lastName: 'Williams', score: 78, status: 'pass' },
  ];

  const advancedConfig: TableConfig = {
    columns: [
      {
        key: (row) => `${row.firstName} ${row.lastName}`, // 함수형 accessor
        label: 'Full Name',
        width: 200,
      },
      {
        key: 'score',
        label: 'Score',
        align: 'center',
        render: (value) => (
          <span
            style={{
              color: value >= 80 ? 'green' : value >= 60 ? 'orange' : 'red',
              fontWeight: 'bold',
            }}
          >
            {value}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        align: 'center',
        render: (value) => (
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: value === 'pass' ? '#d4edda' : '#f8d7da',
              color: value === 'pass' ? '#155724' : '#721c24',
            }}
          >
            {value.toUpperCase()}
          </span>
        ),
      },
    ],
    features: {
      styling: {
        row: (row) => (row.status === 'fail' ? 'fail-row' : ''),
      },
      onRowClick: (row) => alert(`Clicked: ${row.firstName} ${row.lastName}`),
    },
  };

  // ============================================================================
  // 예제 7: 통합 예제 (그룹핑 + 계층적 헤더 + 체크박스 + Summary)
  // ============================================================================

  const fullFeatureData = [
    {
      region: 'Asia',
      country: 'Korea',
      product: 'Product A',
      q1: 100,
      q2: 120,
      q3: 110,
      q4: 130,
    },
    {
      region: 'Asia',
      country: 'Korea',
      product: 'Product B',
      q1: 80,
      q2: 90,
      q3: 85,
      q4: 95,
    },
    {
      region: 'Asia',
      country: 'Japan',
      product: 'Product A',
      q1: 150,
      q2: 160,
      q3: 155,
      q4: 170,
    },
    {
      region: 'Europe',
      country: 'France',
      product: 'Product A',
      q1: 200,
      q2: 210,
      q3: 205,
      q4: 220,
    },
  ];

  const fullFeatureConfig: TableConfig = {
    columns: [
      { key: 'region', label: 'Region', groupBy: true, width: 120 },
      { key: 'country', label: 'Country', groupBy: true, width: 120 },
      { key: 'product', label: 'Product', width: 150 },
      {
        key: 'q1',
        label: 'Q1',
        headerGroup: 'Sales.2024',
        align: 'right',
        render: (v) => v.toLocaleString(),
      },
      {
        key: 'q2',
        label: 'Q2',
        headerGroup: 'Sales.2024',
        align: 'right',
        render: (v) => v.toLocaleString(),
      },
      {
        key: 'q3',
        label: 'Q3',
        headerGroup: 'Sales.2024',
        align: 'right',
        render: (v) => v.toLocaleString(),
      },
      {
        key: 'q4',
        label: 'Q4',
        headerGroup: 'Sales.2024',
        align: 'right',
        render: (v) => v.toLocaleString(),
      },
    ],
    features: {
      checkbox: {
        position: 'right',
        showHeaderCheckbox: true,
      },
      summary: {
        position: 'bottom',
        columns: {
          product: { type: 'count', label: 'Total Items:' },
          q1: { type: 'sum', render: (v) => v.toLocaleString() },
          q2: { type: 'sum', render: (v) => v.toLocaleString() },
          q3: { type: 'sum', render: (v) => v.toLocaleString() },
          q4: { type: 'sum', render: (v) => v.toLocaleString() },
        },
        style: { backgroundColor: '#e7f3ff', fontWeight: 'bold' },
      },
      highlightOnHover: true,
      striped: true,
    },
  };

  // ============================================================================
  // 렌더링
  // ============================================================================

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '40px' }}>MetaTable 데모</h1>

      <style>
        {`
          .fail-row {
            background-color: #fff5f5 !important;
          }
          .fail-row:hover {
            background-color: #ffe5e5 !important;
          }
        `}
      </style>

      {/* 예제 1 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>1. 기본 사용</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          가장 간단한 형태. key로 데이터 접근, label이 헤더가 됨
        </p>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={basicData} config={basicConfig} />
        </div>
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            코드 보기
          </summary>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {`const config: TableConfig = {
  columns: [
    { key: 'name', label: 'Name', width: 150 },
    { key: 'age', label: 'Age', width: 100, align: 'center' },
    { key: 'city', label: 'City', width: 150 },
    {
      key: 'email',
      label: 'Email',
      render: (value) => <a href={\`mailto:\${value}\`}>{value}</a>
    },
  ],
};

<MetaTable data={data} config={config} />`}
          </pre>
        </details>
      </section>

      {/* 예제 2 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>2. 행 그룹핑 (rowSpan)</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          groupBy: true로 연속된 동일 값 자동 병합
        </p>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={groupedData} config={groupedConfig} />
        </div>
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            코드 보기
          </summary>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {`const config: TableConfig = {
  columns: [
    { key: 'category', label: 'Category', groupBy: true, width: 120 },
    { key: 'subcategory', label: 'Subcategory', groupBy: true, width: 150 },
    { key: 'product', label: 'Product', width: 200 },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (value) => \`$\${value.toLocaleString()}\`
    },
  ],
};`}
          </pre>
        </details>
      </section>

      {/* 예제 3 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>3. 계층적 헤더 (colSpan + rowSpan)</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          headerGroup으로 자동 colSpan/rowSpan 계산 (예: "Contact.Phone")
        </p>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={hierarchicalData} config={hierarchicalConfig} />
        </div>
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            코드 보기
          </summary>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {`const config: TableConfig = {
  columns: [
    { key: 'name', label: 'Name', width: 150 },
    { key: 'mobile', label: 'Mobile', headerGroup: 'Contact.Phone' },
    { key: 'home', label: 'Home', headerGroup: 'Contact.Phone' },
    { key: 'email', label: 'Email', headerGroup: 'Contact' },
  ],
};`}
          </pre>
        </details>
      </section>

      {/* 예제 4 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>4. 체크박스 + Summary (Custom Calculate 포함)</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          선택된 행: {selectedSummary.size}개 | Summary에서 count, sum, custom 계산 사용
        </p>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={summaryData} config={summaryConfig} />
        </div>
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            코드 보기
          </summary>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {`const config: TableConfig = {
  columns: [...],
  features: {
    checkbox: {
      position: 'left',
      showHeaderCheckbox: true,
      onSelectionChange: (indices, rows) => console.log(rows),
    },
    summary: {
      position: 'bottom',
      columns: {
        name: { type: 'count', label: 'Total:' },
        quantity: { type: 'sum' },
        price: {
          type: 'sum',
          render: (v) => \`$\${v.toLocaleString()}\`
        },
        status: {
          type: 'custom',
          calculate: (data, key) => {
            // ✨ custom 계산 함수
            // data: 전체 행 배열
            // key: 현재 컬럼 key ('status')
            const activeCount = data.filter(
              row => row.status === 'active'
            ).length;
            return \`\${activeCount}/\${data.length} active\`;
          },
          label: 'Status:',
        },
      },
    },
    highlightOnHover: true,
    striped: true,
  },
};`}
          </pre>
        </details>

        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            Custom Calculate 사용법
          </summary>
          <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '4px', marginTop: '10px' }}>
            <h4>📌 calculate 함수 파라미터</h4>
            <ul style={{ lineHeight: 1.8 }}>
              <li><code>data</code>: 전체 행 데이터 배열</li>
              <li><code>key</code>: 현재 컬럼의 key 값 (string)</li>
            </ul>

            <h4 style={{ marginTop: '20px' }}>💡 활용 예시</h4>
            <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
{`// 조건부 카운트
calculate: (data, key) => {
  return data.filter(row => row.status === 'active').length;
}

// 다른 컬럼 참조
calculate: (data, key) => {
  const total = data.reduce(
    (sum, row) => sum + row.price * row.quantity,
    0
  );
  return total;
}

// 백분율 계산
calculate: (data, key) => {
  const activeCount = data.filter(r => r.status === 'active').length;
  const percentage = (activeCount / data.length * 100).toFixed(1);
  return \`\${percentage}%\`;
}`}
            </pre>
          </div>
        </details>
      </section>

      {/* 예제 5 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>5. 중첩 객체 접근</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          점 표기법으로 중첩 객체 접근 (예: "user.address.city")
        </p>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={nestedData} config={nestedConfig} />
        </div>
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            코드 보기
          </summary>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {`const config: TableConfig = {
  columns: [
    { key: 'id', label: 'ID', width: 80, align: 'center' },
    { key: 'user.name', label: 'Name', width: 150 },
    { key: 'user.address.city', label: 'City', width: 120 },
    { key: 'user.address.country', label: 'Country', width: 120 },
    { key: 'stats.views', label: 'Views', align: 'right' },
    { key: 'stats.likes', label: 'Likes', align: 'right' },
  ],
};`}
          </pre>
        </details>
      </section>

      {/* 예제 6 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>6. 함수형 Accessor + 조건부 스타일</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          key에 함수 사용, 행 클릭 이벤트, 조건부 스타일
        </p>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={advancedData} config={advancedConfig} />
        </div>
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            코드 보기
          </summary>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {`const config: TableConfig = {
  columns: [
    {
      key: (row) => \`\${row.firstName} \${row.lastName}\`, // 함수형!
      label: 'Full Name'
    },
    {
      key: 'score',
      render: (value) => (
        <span style={{
          color: value >= 80 ? 'green' : value >= 60 ? 'orange' : 'red'
        }}>
          {value}
        </span>
      )
    },
  ],
  features: {
    styling: {
      row: (row) => row.status === 'fail' ? 'fail-row' : '',
    },
    onRowClick: (row) => alert(\`Clicked: \${row.firstName}\`),
  },
};`}
          </pre>
        </details>
      </section>

      {/* 예제 7 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>7. 통합 예제</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          그룹핑 + 계층적 헤더 + 체크박스 + Summary 모두 사용
        </p>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={fullFeatureData} config={fullFeatureConfig} />
        </div>
        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            코드 보기
          </summary>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {`const config: TableConfig = {
  columns: [
    { key: 'region', label: 'Region', groupBy: true },
    { key: 'country', label: 'Country', groupBy: true },
    { key: 'product', label: 'Product' },
    { key: 'q1', label: 'Q1', headerGroup: 'Sales.2024', align: 'right' },
    { key: 'q2', label: 'Q2', headerGroup: 'Sales.2024', align: 'right' },
    { key: 'q3', label: 'Q3', headerGroup: 'Sales.2024', align: 'right' },
    { key: 'q4', label: 'Q4', headerGroup: 'Sales.2024', align: 'right' },
  ],
  features: {
    checkbox: { position: 'right', showHeaderCheckbox: true },
    summary: {
      position: 'bottom',
      columns: {
        product: { type: 'count', label: 'Total:' },
        q1: { type: 'sum' }, q2: { type: 'sum' },
        q3: { type: 'sum' }, q4: { type: 'sum' },
      },
    },
    highlightOnHover: true,
    striped: true,
  },
};`}
          </pre>
        </details>
      </section>

      {/* 핵심 특징 */}
      <section
        style={{
          backgroundColor: '#f0f8ff',
          padding: '30px',
          borderRadius: '8px',
          marginTop: '60px',
        }}
      >
        <h2>✨ 핵심 특징</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li>
            <strong>Zero Transform:</strong> 데이터 변환 없이 원본 그대로 사용
          </li>
          <li>
            <strong>Key 기반 접근:</strong> 중첩 객체, 배열 인덱스, 함수 모두 지원
          </li>
          <li>
            <strong>자동 rowSpan:</strong> groupBy: true로 연속된 값 자동 병합
          </li>
          <li>
            <strong>계층적 헤더:</strong> headerGroup으로 colSpan/rowSpan 자동 계산
          </li>
          <li>
            <strong>풍부한 기능:</strong> 체크박스, Summary, 정렬, 커스텀 렌더링
          </li>
          <li>
            <strong>타입 안전:</strong> 완벽한 TypeScript 지원
          </li>
        </ul>
      </section>
    </div>
  );
};

export default MetaTableDemoPage;
