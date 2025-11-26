/**
 * MetaTable 제어/비제어 체크박스 예제
 *
 * 문제: defaultChecked 변경 감지 시 무한 루프 발생
 * 해결: 제어 모드 (selected prop)로 외부에서 완전히 제어
 */

import React, { useState } from 'react';
import { MetaTable } from '../MetaTable';
import type { TableConfig } from '@/types/meta-table.types';

interface User {
  id: number;
  name: string;
  age: number;
}

const sampleData: User[] = [
  { id: 1, name: '김길동', age: 30 },
  { id: 2, name: '김영희', age: 25 },
  { id: 3, name: '이철수', age: 35 },
  { id: 4, name: '박민수', age: 28 },
];

/**
 * ========================================================================
 * 예제 1: 비제어 모드 (Uncontrolled)
 * ========================================================================
 *
 * defaultSelected만 사용
 * - 초기값만 설정, 이후는 MetaTable 내부에서 상태 관리
 * - onSelectionChange로 변경 알림만 받음
 * - 간단한 경우 추천
 */
export const UncontrolledExample: React.FC = () => {
  console.log('[UncontrolledExample] 렌더링');

  const config: TableConfig = {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: '이름' },
      { key: 'age', label: '나이' },
    ],
    features: {
      checkbox: {
        defaultSelected: new Set([0, 1]), // 초기값만 설정
        onSelectionChange: (indices, rows) => {
          console.log('[비제어 모드] 선택 변경:', indices, rows);
        },
      },
    },
  };

  return (
    <div>
      <h3>예제 1: 비제어 모드</h3>
      <p>초기값만 설정, 이후는 테이블 내부에서 관리</p>
      <MetaTable data={sampleData} config={config} />
    </div>
  );
};

/**
 * ========================================================================
 * 예제 2: 제어 모드 (Controlled) - 기본
 * ========================================================================
 *
 * selected + onSelectionChange 사용
 * - 외부에서 상태 완전히 제어
 * - 언제든 외부에서 선택 변경 가능
 * - 복잡한 로직 구현 시 추천
 */
export const ControlledExample: React.FC = () => {
  const [selected, setSelected] = useState<Set<number>>(new Set([0]));

  console.log('[ControlledExample] 렌더링, selected:', selected);

  const config: TableConfig = {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: '이름' },
      { key: 'age', label: '나이' },
    ],
    features: {
      checkbox: {
        selected: selected, // 외부 상태
        onSelectionChange: (newSelected) => {
          console.log('[제어 모드] 선택 변경 요청:', newSelected);
          setSelected(newSelected); // 외부에서 상태 업데이트
        },
      },
    },
  };

  return (
    <div>
      <h3>예제 2: 제어 모드 (기본)</h3>
      <p>외부에서 상태 완전히 제어</p>
      <div style={{ marginBottom: 10 }}>
        <strong>현재 선택:</strong> {Array.from(selected).join(', ')}
      </div>
      <MetaTable data={sampleData} config={config} />
    </div>
  );
};

/**
 * ========================================================================
 * 예제 3: 제어 모드 - 외부에서 선택 변경
 * ========================================================================
 *
 * 버튼 클릭 등으로 외부에서 선택 상태 변경
 * - 제어 모드의 핵심 장점
 * - 무한 루프 없이 언제든 선택 변경 가능
 */
export const ControlledWithExternalControl: React.FC = () => {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const config: TableConfig = {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: '이름' },
      { key: 'age', label: '나이' },
    ],
    features: {
      checkbox: {
        selected: selected,
        onSelectionChange: setSelected,
      },
    },
  };

  // 외부에서 선택 제어하는 함수들
  const selectAll = () => {
    console.log('[외부 제어] 전체 선택');
    setSelected(new Set(sampleData.map((_, i) => i)));
  };

  const selectNone = () => {
    console.log('[외부 제어] 전체 해제');
    setSelected(new Set());
  };

  const selectEven = () => {
    console.log('[외부 제어] 짝수 인덱스만 선택');
    setSelected(new Set(sampleData.map((_, i) => i).filter((i) => i % 2 === 0)));
  };

  const selectOdd = () => {
    console.log('[외부 제어] 홀수 인덱스만 선택');
    setSelected(new Set(sampleData.map((_, i) => i).filter((i) => i % 2 === 1)));
  };

  return (
    <div>
      <h3>예제 3: 외부에서 선택 제어</h3>
      <p>버튼 클릭으로 외부에서 선택 변경 (무한 루프 없음!)</p>

      <div style={{ marginBottom: 10, display: 'flex', gap: 10 }}>
        <button onClick={selectAll}>전체 선택</button>
        <button onClick={selectNone}>전체 해제</button>
        <button onClick={selectEven}>짝수만</button>
        <button onClick={selectOdd}>홀수만</button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong>현재 선택:</strong> {Array.from(selected).join(', ') || '없음'}
      </div>

      <MetaTable data={sampleData} config={config} />
    </div>
  );
};

/**
 * ========================================================================
 * 예제 4: 제어 모드 - 조건부 선택 허용
 * ========================================================================
 *
 * onSelectionChange에서 조건 체크 후 선택 허용/거부
 * - 나이 30 미만만 선택 가능
 * - 제어 모드에서만 가능!
 */
export const ControlledWithValidation: React.FC = () => {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string>('');

  const config: TableConfig = {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: '이름' },
      { key: 'age', label: '나이' },
    ],
    features: {
      checkbox: {
        selected: selected,
        onSelectionChange: (newSelected, rows) => {
          // 조건 체크: 나이 30 미만만 선택 가능
          const invalidRows = rows.filter((row) => row.age >= 30);

          if (invalidRows.length > 0) {
            setError(`나이 30 미만만 선택 가능합니다. (불가: ${invalidRows.map((r) => r.name).join(', ')})`);
            console.log('[검증 실패] 선택 거부:', invalidRows);
            // 선택 거부 (상태 업데이트 안 함)
            return;
          }

          // 검증 통과
          setError('');
          setSelected(newSelected);
          console.log('[검증 성공] 선택 허용:', rows);
        },
      },
    },
  };

  return (
    <div>
      <h3>예제 4: 조건부 선택 허용</h3>
      <p>나이 30 미만만 선택 가능 (제어 모드의 강력한 기능!)</p>

      {error && (
        <div style={{ marginBottom: 10, padding: 10, backgroundColor: '#ffebee', color: '#c62828' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <strong>현재 선택:</strong>{' '}
        {selected.size > 0
          ? Array.from(selected)
              .map((i) => sampleData[i].name)
              .join(', ')
          : '없음'}
      </div>

      <MetaTable data={sampleData} config={config} />
    </div>
  );
};

/**
 * ========================================================================
 * 예제 5: 제어 모드 - API 호출 후 선택
 * ========================================================================
 *
 * 외부 이벤트(API 응답 등)에 따라 선택 변경
 * - 무한 루프 걱정 없이 언제든 선택 변경 가능
 */
export const ControlledWithApiCall: React.FC = () => {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const config: TableConfig = {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: '이름' },
      { key: 'age', label: '나이' },
    ],
    features: {
      checkbox: {
        selected: selected,
        onSelectionChange: setSelected,
      },
    },
  };

  // API 호출 시뮬레이션
  const fetchAndSelectRecommended = async () => {
    setLoading(true);
    console.log('[API] 추천 항목 조회 시작...');

    // 2초 지연 (API 호출 시뮬레이션)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 추천 항목: 나이 25-30 사이
    const recommended = sampleData
      .map((user, index) => ({ user, index }))
      .filter(({ user }) => user.age >= 25 && user.age <= 30)
      .map(({ index }) => index);

    console.log('[API] 추천 항목:', recommended);
    setSelected(new Set(recommended));
    setLoading(false);
  };

  return (
    <div>
      <h3>예제 5: API 응답 후 선택</h3>
      <p>비동기 작업 후 선택 변경 (무한 루프 없음!)</p>

      <div style={{ marginBottom: 10 }}>
        <button onClick={fetchAndSelectRecommended} disabled={loading}>
          {loading ? '추천 항목 조회 중...' : '추천 항목 선택 (25-30세)'}
        </button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong>현재 선택:</strong>{' '}
        {selected.size > 0
          ? Array.from(selected)
              .map((i) => `${sampleData[i].name} (${sampleData[i].age}세)`)
              .join(', ')
          : '없음'}
      </div>

      <MetaTable data={sampleData} config={config} />
    </div>
  );
};

/**
 * ========================================================================
 * 전체 데모
 * ========================================================================
 */
export const MetaTableControlledCheckboxDemo: React.FC = () => {
  return (
    <div style={{ padding: 20, maxWidth: 1200 }}>
      <h1>MetaTable 제어/비제어 체크박스 예제</h1>

      <div style={{ marginBottom: 40 }}>
        <h2>📌 핵심 개념</h2>
        <ul>
          <li>
            <strong>비제어 모드:</strong> defaultSelected만 사용, 내부 상태 관리
          </li>
          <li>
            <strong>제어 모드:</strong> selected + onSelectionChange, 외부에서 완전 제어
          </li>
          <li>
            <strong>무한 루프 방지:</strong> selected prop으로 외부 제어 시 무한 루프 없음
          </li>
        </ul>
      </div>

      <hr style={{ margin: '40px 0' }} />
      <UncontrolledExample />

      <hr style={{ margin: '40px 0' }} />
      <ControlledExample />

      <hr style={{ margin: '40px 0' }} />
      <ControlledWithExternalControl />

      <hr style={{ margin: '40px 0' }} />
      <ControlledWithValidation />

      <hr style={{ margin: '40px 0' }} />
      <ControlledWithApiCall />
    </div>
  );
};

export default MetaTableControlledCheckboxDemo;
