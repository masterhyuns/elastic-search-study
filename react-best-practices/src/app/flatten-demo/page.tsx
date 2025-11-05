'use client';

import React from 'react';
import { MetaTable } from '@/components/ui/MetaTable';
import { TableConfig } from '@/types/meta-table.types';
import { flattenData, flattenTree, flattenCartesian } from '@/utils/flatten-data';

/**
 * flattenData 유틸리티 데모 페이지
 *
 * 다양한 중첩 배열 구조를 평탄화하여 MetaTable에서 사용하는 예제
 */
const FlattenDemoPage = () => {
  // ============================================================================
  // 예제 1: 기본 배열 평탄화 (자동 감지)
  // ============================================================================

  const nestedData1 = [
    {
      category: 'Electronics',
      region: 'Asia',
      products: [
        { name: 'Laptop', price: 1000, stock: 50 },
        { name: 'Mouse', price: 20, stock: 200 },
      ],
    },
    {
      category: 'Books',
      region: 'Europe',
      products: [
        { name: 'React Guide', price: 30, stock: 100 },
      ],
    },
  ];

  const flatData1 = flattenData(nestedData1);

  const config1: TableConfig = {
    columns: [
      { key: 'category', label: 'Category', groupBy: true, width: 150 },
      { key: 'region', label: 'Region', width: 120 },
      { key: 'name', label: 'Product', width: 200 },
      { key: 'price', label: 'Price', align: 'right', render: (v) => `$${v}` },
      { key: 'stock', label: 'Stock', align: 'right' },
    ],
  };

  // ============================================================================
  // 예제 2: 다단계 중첩 배열
  // ============================================================================

  const nestedData2 = [
    {
      company: 'Tech Corp',
      departments: [
        {
          name: 'Engineering',
          teams: [
            { teamName: 'Frontend', members: 5 },
            { teamName: 'Backend', members: 8 },
          ],
        },
        {
          name: 'Marketing',
          teams: [
            { teamName: 'Digital', members: 3 },
          ],
        },
      ],
    },
    {
      company: 'Design Inc',
      departments: [
        {
          name: 'UX',
          teams: [
            { teamName: 'Research', members: 4 },
            { teamName: 'Visual', members: 6 },
          ],
        },
      ],
    },
  ];

  const flatData2 = flattenData(nestedData2);

  const config2: TableConfig = {
    columns: [
      { key: 'company', label: 'Company', groupBy: true, width: 150 },
      { key: 'name', label: 'Department', groupBy: true, width: 150 },
      { key: 'teamName', label: 'Team', width: 150 },
      { key: 'members', label: 'Members', align: 'center' },
    ],
  };

  // ============================================================================
  // 예제 3: 트리 구조 (children)
  // ============================================================================

  const treeData = [
    {
      id: 1,
      name: 'Root',
      type: 'folder',
      children: [
        {
          id: 2,
          name: 'Documents',
          type: 'folder',
          children: [
            { id: 4, name: 'Resume.pdf', type: 'file', size: '2MB' },
            { id: 5, name: 'Cover Letter.docx', type: 'file', size: '1MB' },
          ],
        },
        {
          id: 3,
          name: 'Photos',
          type: 'folder',
          children: [
            { id: 6, name: 'Vacation.jpg', type: 'file', size: '5MB' },
          ],
        },
      ],
    },
  ];

  const flatData3 = flattenTree(treeData);

  const config3: TableConfig = {
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: 300,
        render: (value, row: any) => {
          const indent = '　'.repeat(row.depth || 0);
          const icon = row.type === 'folder' ? '📁' : '📄';
          return `${indent}${icon} ${value}`;
        }
      },
      { key: 'type', label: 'Type', width: 100 },
      { key: 'size', label: 'Size', width: 100 },
      { key: 'depth', label: 'Depth', width: 80, align: 'center' },
    ],
  };

  // ============================================================================
  // 예제 4: Cartesian Product (다중 배열 조합)
  // ============================================================================

  const cartesianData = [
    {
      region: 'Asia',
      countries: ['Korea', 'Japan', 'China'],
      products: ['Laptop', 'Phone'],
    },
    {
      region: 'Europe',
      countries: ['France', 'Germany'],
      products: ['Tablet'],
    },
  ];

  const flatData4 = flattenCartesian(cartesianData, ['countries', 'products']);

  const config4: TableConfig = {
    columns: [
      { key: 'region', label: 'Region', groupBy: true, width: 120 },
      { key: 'country', label: 'Country', groupBy: true, width: 120 },
      { key: 'product', label: 'Product', width: 150 },
    ],
  };

  // ============================================================================
  // 예제 5: 메타데이터 포함
  // ============================================================================

  const metadataExample = [
    {
      project: 'Website Redesign',
      tasks: [
        { title: 'Design mockups', status: 'done' },
        { title: 'Implement frontend', status: 'in-progress' },
      ],
    },
  ];

  const flatData5 = flattenData(metadataExample, { addMetadata: true });

  const config5: TableConfig = {
    columns: [
      { key: 'project', label: 'Project', width: 200 },
      { key: 'title', label: 'Task', width: 200 },
      {
        key: 'status',
        label: 'Status',
        width: 120,
        render: (v) => (
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: v === 'done' ? '#d4edda' : '#fff3cd',
            color: v === 'done' ? '#155724' : '#856404',
          }}>
            {v}
          </span>
        )
      },
      { key: '_depth', label: 'Depth', width: 80, align: 'center' },
      { key: '_path', label: 'Path', width: 200 },
    ],
  };

  // ============================================================================
  // 예제 6: 깊은 중첩 배열 (a → b → c → d)
  // ============================================================================

  const deepNestedData = [
    {
      level: 'Level 0',
      a: [
        {
          level: 'Level A',
          b: [
            {
              level: 'Level B',
              c: [
                {
                  level: 'Level C',
                  d: [
                    { level: 'Level D', value: 'FINAL VALUE!' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  const flatData6 = flattenData(deepNestedData, { addMetadata: true });

  const config6: TableConfig = {
    columns: [
      { key: 'value', label: 'Final Value', width: 200 },
      { key: '_depth', label: 'Depth', width: 100, align: 'center' },
      { key: '_path', label: 'Path', width: 300 },
    ],
  };

  // ============================================================================
  // 렌더링
  // ============================================================================

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '40px' }}>flattenData 유틸리티 데모</h1>

      {/* 예제 1 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>1. 기본 배열 평탄화 (자동 감지)</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          products 배열을 자동으로 감지해서 평탄화
        </p>

        <div style={{ marginBottom: '20px' }}>
          <details>
            <summary style={{ cursor: 'pointer', color: '#0066cc', marginBottom: '10px' }}>
              원본 데이터 보기
            </summary>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(nestedData1, null, 2)}
            </pre>
          </details>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={flatData1} config={config1} />
        </div>

        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            코드 보기
          </summary>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`const flatData = flattenData(nestedData);
// products 배열이 자동으로 평탄화됨

<MetaTable data={flatData} config={config} />`}
          </pre>
        </details>
      </section>

      {/* 예제 2 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>2. 다단계 중첩 배열</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          departments → teams 2단계 중첩 배열 자동 평탄화
        </p>

        <div style={{ marginBottom: '20px' }}>
          <details>
            <summary style={{ cursor: 'pointer', color: '#0066cc', marginBottom: '10px' }}>
              원본 데이터 보기
            </summary>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(nestedData2, null, 2)}
            </pre>
          </details>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={flatData2} config={config2} />
        </div>
      </section>

      {/* 예제 3 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>3. 트리 구조 평탄화 (children)</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          flattenTree로 재귀적 children 구조를 depth 정보와 함께 평탄화
        </p>

        <div style={{ marginBottom: '20px' }}>
          <details>
            <summary style={{ cursor: 'pointer', color: '#0066cc', marginBottom: '10px' }}>
              원본 데이터 보기
            </summary>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(treeData, null, 2)}
            </pre>
          </details>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={flatData3} config={config3} />
        </div>

        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            코드 보기
          </summary>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`const flatData = flattenTree(treeData);
// children 필드를 재귀적으로 평탄화
// depth 정보 자동 추가

<MetaTable
  data={flatData}
  config={{
    columns: [
      {
        key: 'name',
        render: (value, row) => {
          const indent = '　'.repeat(row.depth || 0);
          return \`\${indent}📁 \${value}\`;
        }
      }
    ]
  }}
/>`}
          </pre>
        </details>
      </section>

      {/* 예제 4 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>4. Cartesian Product (다중 배열 조합)</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          여러 배열 필드의 모든 조합을 생성 (countries × products)
        </p>

        <div style={{ marginBottom: '20px' }}>
          <details>
            <summary style={{ cursor: 'pointer', color: '#0066cc', marginBottom: '10px' }}>
              원본 데이터 보기
            </summary>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(cartesianData, null, 2)}
            </pre>
          </details>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={flatData4} config={config4} />
        </div>

        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            코드 보기
          </summary>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`const flatData = flattenCartesian(data, ['countries', 'products']);
// countries: ['Korea', 'Japan'] × products: ['Laptop', 'Phone']
// → 4개 조합 생성

// 결과: [
//   { region: 'Asia', country: 'Korea', product: 'Laptop' },
//   { region: 'Asia', country: 'Korea', product: 'Phone' },
//   { region: 'Asia', country: 'Japan', product: 'Laptop' },
//   { region: 'Asia', country: 'Japan', product: 'Phone' }
// ]`}
          </pre>
        </details>
      </section>

      {/* 예제 5 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>5. 메타데이터 포함</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          평탄화 과정의 depth, path 정보를 함께 저장
        </p>

        <div style={{ marginBottom: '20px' }}>
          <details>
            <summary style={{ cursor: 'pointer', color: '#0066cc', marginBottom: '10px' }}>
              원본 데이터 보기
            </summary>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(metadataExample, null, 2)}
            </pre>
          </details>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={flatData5} config={config5} />
        </div>

        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            코드 보기
          </summary>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`const flatData = flattenData(data, { addMetadata: true });
// _depth, _path 필드가 자동으로 추가됨

// 디버깅이나 추적에 유용`}
          </pre>
        </details>
      </section>

      {/* 예제 6 */}
      <section style={{ marginBottom: '60px' }}>
        <h2>6. 깊은 중첩 배열 (a → b → c → d) 🔥</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          <strong style={{ color: '#d32f2f' }}>Bug Fix:</strong> 4단계 깊이 중첩 배열 완벽 평탄화 (모든 배열 필드 제거 로직 수정)
        </p>

        <div style={{ marginBottom: '20px' }}>
          <details>
            <summary style={{ cursor: 'pointer', color: '#0066cc', marginBottom: '10px' }}>
              원본 데이터 보기
            </summary>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(deepNestedData, null, 2)}
            </pre>
          </details>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <MetaTable data={flatData6} config={config6} />
        </div>

        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            문제 & 해결
          </summary>
          <pre style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '4px', overflow: 'auto', border: '1px solid #ffc107' }}>
{`❌ 이전 버그:
- 첫 번째 배열 필드만 제거 (delete parentData[firstArrayField])
- 나머지 배열들이 parentData에 남아서 재귀 시 문제 발생
- 결과: d 배열이 평탄화 안 됨

✅ 수정 후:
- 모든 배열 필드를 제거
  arrayFieldsInItem.forEach(field => delete parentData[field])
- 재귀 호출 시 깨끗한 부모 데이터 전달
- 결과: 4단계 이상 중첩도 완벽 평탄화!`}
          </pre>
        </details>

        <details style={{ marginTop: '10px' }}>
          <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
            평탄화된 결과 데이터 보기
          </summary>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(flatData6, null, 2)}
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
        <h2>✨ flattenData 핵심 특징</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li>
            <strong>자동 배열 감지:</strong> 키 이름에 관계없이 모든 배열 필드 자동 평탄화
          </li>
          <li>
            <strong>재귀 지원:</strong> 다단계 중첩 배열도 완벽 처리
          </li>
          <li>
            <strong>부모 데이터 병합:</strong> 평탄화 시 상위 레벨 데이터 자동 포함
          </li>
          <li>
            <strong>트리 구조 특화:</strong> flattenTree로 children 재귀 처리
          </li>
          <li>
            <strong>Cartesian Product:</strong> 여러 배열의 모든 조합 생성
          </li>
          <li>
            <strong>메타데이터 옵션:</strong> depth, path 추적 가능
          </li>
          <li>
            <strong>유연한 설정:</strong> arrayFields, mergeStrategy 등 커스터마이징
          </li>
        </ul>

        <h3 style={{ marginTop: '30px' }}>📦 주요 함수</h3>
        <ul style={{ lineHeight: 1.8 }}>
          <li><code>flattenData(data, config?)</code> - 범용 배열 평탄화</li>
          <li><code>flattenTree(data, childrenKey?, config?)</code> - 트리 구조 평탄화</li>
          <li><code>flattenCartesian(data, arrayFields)</code> - Cartesian Product</li>
        </ul>
      </section>
    </div>
  );
};

export default FlattenDemoPage;
