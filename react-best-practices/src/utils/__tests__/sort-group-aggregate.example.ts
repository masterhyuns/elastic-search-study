/**
 * 그룹 집계 기반 정렬 예제
 *
 * 문제: name 그룹별로 최신 date를 기준으로 정렬하고 싶음
 *
 * 현재 결과:
 *   김길동 2024-10-24
 *   김길동 2024-10-23
 *   김영희 2024-11-02  ← 최신인데 뒤에 있음
 *   김영희 2024-10-01
 *
 * 원하는 결과:
 *   김영희 2024-11-02  ← 최신 그룹이 먼저
 *   김영희 2024-10-01
 *   김길동 2024-10-24
 *   김길동 2024-10-23
 *
 * 실행: npx tsx src/utils/__tests__/sort-group-aggregate.example.ts
 */

import { sort } from '../sort';

console.log('========================================');
console.log('그룹 집계 기반 정렬 예제');
console.log('========================================\n');

// ========================================
// 샘플 데이터
// ========================================

interface DataRow {
  name: string;
  date: Date;
  value: number;
}

const rawData: DataRow[] = [
  { name: '김길동', date: new Date('2024-10-24'), value: 100 },
  { name: '김길동', date: new Date('2024-10-23'), value: 90 },
  { name: '김영희', date: new Date('2024-11-02'), value: 150 },
  { name: '김영희', date: new Date('2024-10-01'), value: 80 },
];

console.log('📊 원본 데이터:');
console.table(rawData.map((r) => ({ ...r, date: r.date.toISOString().split('T')[0] })));

// ========================================
// 현재 방식: 단순 정렬 (문제 있음)
// ========================================

console.log('\n❌ 현재 방식: sort(["name", { key: "date", direction: "desc" }])');
console.log('----------------------------------------');

const currentSort = sort(rawData, ['name', { key: 'date', direction: 'desc' }]);

console.log('결과: name 알파벳순, 그 다음 date 내림차순');
console.table(currentSort.map((r) => ({ ...r, date: r.date.toISOString().split('T')[0] })));
console.log('→ 문제: 김길동이 김영희보다 앞에 옴 (알파벳순)');
console.log('→ 원하는 것: 각 name 그룹의 최신 date 기준으로 그룹 정렬');

// ========================================
// 방법 A: 데이터 전처리 (추천!)
// ========================================

console.log('\n\n✅ 방법 A: 데이터 전처리 (추천!)');
console.log('========================================');
console.log('각 row에 그룹의 최신 날짜를 추가한 후 정렬');
console.log('----------------------------------------');

interface EnrichedRow extends DataRow {
  groupMaxDate: Date; // 그룹의 최신 날짜
}

// 1단계: 각 name의 최신 날짜 찾기
const groupMaxDates = rawData.reduce((acc, row) => {
  const current = acc.get(row.name);
  if (!current || row.date > current) {
    acc.set(row.name, row.date);
  }
  return acc;
}, new Map<string, Date>());

console.log('\n1️⃣ 각 그룹의 최신 날짜:');
groupMaxDates.forEach((date, name) => {
  console.log(`   ${name}: ${date.toISOString().split('T')[0]}`);
});

// 2단계: 원본 데이터에 그룹 최신 날짜 추가
const enrichedData: EnrichedRow[] = rawData.map((row) => ({
  ...row,
  groupMaxDate: groupMaxDates.get(row.name)!,
}));

console.log('\n2️⃣ 보강된 데이터 (groupMaxDate 추가):');
console.table(
  enrichedData.map((r) => ({
    name: r.name,
    date: r.date.toISOString().split('T')[0],
    value: r.value,
    groupMaxDate: r.groupMaxDate.toISOString().split('T')[0],
  }))
);

// 3단계: groupMaxDate(desc) → date(desc)로 정렬
const methodA = sort(enrichedData, [
  { key: 'groupMaxDate', direction: 'desc' },
  { key: 'date', direction: 'desc' },
]);

console.log('\n3️⃣ 최종 정렬 결과:');
console.table(
  methodA.map((r) => ({
    name: r.name,
    date: r.date.toISOString().split('T')[0],
    value: r.value,
    groupMaxDate: r.groupMaxDate.toISOString().split('T')[0],
  }))
);

console.log('\n✅ 장점:');
console.log('   - sort 함수 재사용 가능');
console.log('   - 명확하고 이해하기 쉬움');
console.log('   - 그룹 최신 날짜를 UI에 표시 가능');
console.log('   - 디버깅 용이');

// ========================================
// 방법 B: 커스텀 정렬 함수
// ========================================

console.log('\n\n✅ 방법 B: 커스텀 정렬 함수');
console.log('========================================');
console.log('Array.sort()에 직접 비교 함수 작성');
console.log('----------------------------------------');

const methodB = [...rawData].sort((a, b) => {
  // 각 name의 최신 날짜 가져오기
  const aMaxDate = groupMaxDates.get(a.name)!;
  const bMaxDate = groupMaxDates.get(b.name)!;

  // 1순위: 그룹 최신 날짜 내림차순
  if (aMaxDate > bMaxDate) return -1;
  if (aMaxDate < bMaxDate) return 1;

  // 2순위: 개별 날짜 내림차순
  if (a.date > b.date) return -1;
  if (a.date < b.date) return 1;

  return 0;
});

console.log('결과:');
console.table(methodB.map((r) => ({ ...r, date: r.date.toISOString().split('T')[0] })));

console.log('\n✅ 장점:');
console.log('   - 추가 데이터 필드 불필요');
console.log('   - 메모리 효율적');
console.log('❌ 단점:');
console.log('   - groupMaxDates를 미리 계산해야 함');
console.log('   - 비교 로직이 복잡해지면 유지보수 어려움');

// ========================================
// 방법 C: 유틸리티 함수 작성
// ========================================

console.log('\n\n✅ 방법 C: 유틸리티 함수 작성');
console.log('========================================');
console.log('재사용 가능한 sortByGroupAggregate 함수');
console.log('----------------------------------------');

/**
 * 그룹별 집계값을 기준으로 정렬
 *
 * @param array - 정렬할 배열
 * @param groupKey - 그룹핑할 키
 * @param aggregateKey - 집계할 키
 * @param aggregateFn - 집계 함수 (max, min, sum 등)
 * @param direction - 집계값 정렬 방향
 * @param secondarySorts - 그룹 내 정렬 기준
 */
const sortByGroupAggregate = <T extends Record<string, any>>(
  array: T[],
  groupKey: keyof T,
  aggregateKey: keyof T,
  aggregateFn: (values: any[]) => any,
  direction: 'asc' | 'desc' = 'desc',
  secondarySorts: { key: keyof T; direction?: 'asc' | 'desc' }[] = []
): T[] => {
  // 1. 그룹별 집계값 계산
  const groupAggregates = new Map<any, any>();

  array.forEach((row) => {
    const group = row[groupKey];
    const value = row[aggregateKey];

    if (!groupAggregates.has(group)) {
      groupAggregates.set(group, []);
    }
    groupAggregates.get(group).push(value);
  });

  groupAggregates.forEach((values, group) => {
    groupAggregates.set(group, aggregateFn(values));
  });

  // 2. 정렬
  return [...array].sort((a, b) => {
    const aAggregate = groupAggregates.get(a[groupKey]);
    const bAggregate = groupAggregates.get(b[groupKey]);

    // 1순위: 집계값
    let comparison = 0;
    if (aAggregate > bAggregate) comparison = 1;
    if (aAggregate < bAggregate) comparison = -1;

    if (direction === 'desc') comparison *= -1;

    if (comparison !== 0) return comparison;

    // 2순위: 보조 정렬
    for (const sortConfig of secondarySorts) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue > bValue) comparison = 1;
      else if (aValue < bValue) comparison = -1;
      else comparison = 0;

      if (sortConfig.direction === 'desc') comparison *= -1;

      if (comparison !== 0) return comparison;
    }

    return 0;
  });
};

const methodC = sortByGroupAggregate(
  rawData,
  'name', // 그룹핑 키
  'date', // 집계 키
  (dates: Date[]) => Math.max(...dates.map((d) => d.getTime())), // max 함수
  'desc', // 집계값 내림차순
  [{ key: 'date', direction: 'desc' }] // 그룹 내 정렬
);

console.log('결과:');
console.table(methodC.map((r) => ({ ...r, date: r.date.toISOString().split('T')[0] })));

console.log('\n✅ 장점:');
console.log('   - 재사용 가능');
console.log('   - 다양한 집계 함수 지원 (max, min, sum, avg)');
console.log('   - 깔끔한 API');
console.log('❌ 단점:');
console.log('   - 새로운 함수 학습 필요');
console.log('   - 간단한 케이스에는 과도할 수 있음');

// ========================================
// 결과 비교
// ========================================

console.log('\n\n========================================');
console.log('📊 세 가지 방법 모두 동일한 결과 생성:');
console.log('========================================');
console.log('김영희 2024-11-02  ← 최신 그룹 먼저');
console.log('김영희 2024-10-01');
console.log('김길동 2024-10-24');
console.log('김길동 2024-10-23');

// ========================================
// 추천 방법
// ========================================

console.log('\n\n💡 추천: 방법 A (데이터 전처리)');
console.log('========================================');
console.log('이유:');
console.log('1. 기존 sort 함수 재사용');
console.log('2. 명확하고 이해하기 쉬움');
console.log('3. UI에서 그룹 최신 날짜 표시 가능');
console.log('4. React에서 useMemo로 최적화 가능');
console.log('');
console.log('사용 예시:');
console.log('```typescript');
console.log('const enriched = useMemo(() => {');
console.log('  const maxDates = new Map();');
console.log('  data.forEach(row => {');
console.log('    const curr = maxDates.get(row.name);');
console.log('    if (!curr || row.date > curr) maxDates.set(row.name, row.date);');
console.log('  });');
console.log('  return data.map(row => ({ ...row, groupMaxDate: maxDates.get(row.name) }));');
console.log('}, [data]);');
console.log('');
console.log('const sorted = sort(enriched, [');
console.log('  { key: "groupMaxDate", direction: "desc" },');
console.log('  { key: "date", direction: "desc" }');
console.log(']);');
console.log('```');

console.log('\n========================================');
console.log('완료!');
console.log('========================================');
