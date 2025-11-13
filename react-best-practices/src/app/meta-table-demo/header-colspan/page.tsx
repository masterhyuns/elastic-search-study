'use client';

import { MetaTable } from '@/components/ui/MetaTable';
import { TableConfig } from '@/types/meta-table.types';

/**
 * 단일 행 헤더에서 colspan 사용 예제
 *
 * headerColspan 옵션으로 헤더만 병합하고 body는 각각 렌더링
 *
 * 구조:
 * ┌─────┬─────┬─────────────────────────┐
 * │  A  │  B  │           C             │ ← 헤더 (C만 colspan=4)
 * ├─────┼─────┼─────┼─────┼─────┼─────┤
 * │ a1  │ a2  │  1  │  2  │  3  │  4  │ ← 데이터
 * └─────┴─────┴─────┴─────┴─────┴─────┘
 */
const MetaTableHeaderColspanExample = () => {
  // ============================================================================
  // Config 정의
  // ============================================================================

  const config: TableConfig = {
    columns: [
      // 단독 컬럼들
      {
        key: 'a',
        label: 'A',
        width: 100,
      },
      {
        key: 'b',
        label: 'B',
        width: 100,
      },

      /**
       * C 그룹 (colspan=4)
       * - headerColspan: 4로 설정하여 헤더에서 4개 컬럼을 차지
       * - headerLabel: 'C'로 설정하여 헤더에는 'C' 표시
       * - label: '1'은 body에서만 표시됨
       * - 다음 3개 컬럼(c2, c3, c4)은 headerColspan에 의해 헤더에서 병합됨
       */
      {
        key: 'c1',
        label: '1',           // body에 표시될 라벨
        headerColspan: 4,     // 헤더에서 4개 컬럼 차지
        headerLabel: 'C',     // 헤더에 표시될 라벨
        align: 'center',
      },
      {
        key: 'c2',
        label: '2',
        align: 'center',
      },
      {
        key: 'c3',
        label: '3',
        align: 'center',
      },
      {
        key: 'c4',
        label: '4',
        align: 'center',
      },
    ],
    features: {
      striped: true,
      highlightOnHover: true,
    },
  };

  // ============================================================================
  // 데이터 정의
  // ============================================================================

  const data = [
    { a: 'a1', b: 'a2', c1: 1, c2: 2, c3: 3, c4: 4 },
    { a: 'b1', b: 'b2', c1: 5, c2: 6, c3: 7, c4: 8 },
    { a: 'c1', b: 'c2', c1: 9, c2: 10, c3: 11, c4: 12 },
  ];

  // ============================================================================
  // 복잡한 예제: 여러 개의 colspan
  // ============================================================================

  const complexConfig: TableConfig = {
    columns: [
      { key: 'id', label: 'ID', width: 50 },
      { key: 'name', label: 'Name', width: 100 },

      // Contact 그룹 (colspan=4)
      {
        key: 'mobile',
        label: 'Mobile',
        headerColspan: 4,
        headerLabel: 'Contact',
        width: 120,
      },
      { key: 'home', label: 'Home', width: 120 },
      { key: 'email', label: 'Email', width: 150 },
      { key: 'address', label: 'Address', width: 200 },

      // Score 그룹 (colspan=3)
      {
        key: 'score1',
        label: 'Test 1',
        headerColspan: 3,
        headerLabel: 'Score',
        align: 'center',
        render: (value) => `${value}점`,
      },
      {
        key: 'score2',
        label: 'Test 2',
        align: 'center',
        render: (value) => `${value}점`,
      },
      {
        key: 'score3',
        label: 'Test 3',
        align: 'center',
        render: (value) => `${value}점`,
      },
    ],
    features: {
      striped: true,
      highlightOnHover: true,
    },
  };

  const complexData = [
    {
      id: 1,
      name: 'John Doe',
      mobile: '010-1111-1111',
      home: '02-111-1111',
      email: 'john@example.com',
      address: 'Seoul, Korea',
      score1: 90,
      score2: 85,
      score3: 92,
    },
    {
      id: 2,
      name: 'Jane Smith',
      mobile: '010-2222-2222',
      home: '02-222-2222',
      email: 'jane@example.com',
      address: 'Busan, Korea',
      score1: 88,
      score2: 91,
      score3: 87,
    },
    {
      id: 3,
      name: 'Bob Johnson',
      mobile: '010-3333-3333',
      home: '02-333-3333',
      email: 'bob@example.com',
      address: 'Incheon, Korea',
      score1: 92,
      score2: 89,
      score3: 94,
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>MetaTable - Header Colspan 예제</h1>

      {/* 기본 예제 */}
      <section style={{ marginBottom: '40px' }}>
        <h2>1. 기본 예제 (A, B, C)</h2>
        <p>
          <strong>구조:</strong> A, B는 단독 컬럼, C는 4개 컬럼(1, 2, 3, 4)을 묶은 그룹
        </p>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
{`┌─────┬─────┬─────────────────────────┐
│  A  │  B  │           C             │ ← 헤더 (C: colspan=4)
├─────┼─────┼─────┼─────┼─────┼─────┤
│ a1  │ a2  │  1  │  2  │  3  │  4  │ ← 데이터
└─────┴─────┴─────┴─────┴─────┴─────┘`}
        </pre>
        <MetaTable data={data} config={config} />
      </section>

      {/* 복잡한 예제 */}
      <section>
        <h2>2. 복잡한 예제 (여러 개의 colspan)</h2>
        <p>
          <strong>구조:</strong> ID, Name 단독 / Contact 그룹(4개) / Score 그룹(3개)
        </p>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
{`┌────┬──────┬─────────────────────────────┬───────────────────┐
│ ID │ Name │         Contact             │      Score        │
├────┼──────┼────────┬────────┬───────┬────┼──────┬──────┬──────┤
│    │      │ Mobile │  Home  │ Email │Addr│Test 1│Test 2│Test 3│
└────┴──────┴────────┴────────┴───────┴────┴──────┴──────┴──────┘`}
        </pre>
        <MetaTable data={complexData} config={complexConfig} />
      </section>

      {/* 설명 */}
      <section style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h2>📘 headerColspan 사용법</h2>
        <div style={{ marginTop: '10px' }}>
          <h3>1. 기본 개념</h3>
          <ul>
            <li><code>headerColspan</code>: 헤더에서 차지할 컬럼 개수</li>
            <li><code>headerLabel</code>: 헤더에 표시할 라벨 (생략 시 label 사용)</li>
            <li><code>label</code>: body에 표시할 라벨</li>
          </ul>

          <h3>2. 설정 예시</h3>
          <pre style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
          }}>
{`const config: TableConfig = {
  columns: [
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B' },

    // C 그룹: 헤더에서는 "C"로 표시, 4개 컬럼 병합
    {
      key: 'c1',
      label: '1',           // body에 표시
      headerColspan: 4,     // 헤더에서 4개 컬럼 차지
      headerLabel: 'C',     // 헤더에 표시
    },
    { key: 'c2', label: '2' },  // C 그룹에 포함
    { key: 'c3', label: '3' },  // C 그룹에 포함
    { key: 'c4', label: '4' },  // C 그룹에 포함
  ],
};`}
          </pre>

          <h3>3. 주의사항</h3>
          <ul>
            <li>
              <strong>headerColspan을 설정한 컬럼의 다음 (n-1)개 컬럼</strong>이 자동으로 병합됨
            </li>
            <li>
              <code>headerGroup</code>과 <code>headerColspan</code>을 함께 사용하지 마세요
              <ul>
                <li><code>headerGroup</code>: 다층 헤더 (2행 이상)</li>
                <li><code>headerColspan</code>: 단일 행 헤더 병합</li>
              </ul>
            </li>
            <li>
              body에서는 모든 컬럼이 독립적으로 렌더링됨
            </li>
          </ul>

          <h3>4. headerGroup vs headerColspan</h3>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '10px',
          }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f5f5f5' }}>
                  기능
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f5f5f5' }}>
                  headerGroup
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f5f5f5' }}>
                  headerColspan
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>헤더 행 수</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>2행 이상 (계층 구조)</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>1행 (단일 행)</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>사용 케이스</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  부모-자식 관계<br/>
                  (예: Contact → Phone/Email)
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  단순 그룹핑<br/>
                  (예: Score 1,2,3,4)
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>설정 방법</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <code>headerGroup: "부모.자식"</code>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <code>headerColspan: 4</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MetaTableHeaderColspanExample;
