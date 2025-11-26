/**
 * sort 함수 실행 예제
 *
 * 실제로 실행 가능한 예제 코드입니다.
 * 터미널에서 다음 명령어로 실행:
 *   npx tsx src/utils/__tests__/sort.example.ts
 */

import { sort, sortBy } from '../sort';

console.log('========================================');
console.log('sort 함수 예제');
console.log('========================================\n');

// ========================================
// 예제 1: 간편한 방식 (string 배열)
// ========================================

console.log('📌 예제 1: string 배열로 정렬 (모두 asc, nullsFirst: false)');
console.log('----------------------------------------');

const users = [
  { name: 'Charlie', age: 30, dept: 'Sales' },
  { name: 'Alice', age: 25, dept: 'IT' },
  { name: 'Bob', age: 25, dept: 'IT' },
  { name: 'David', age: 30, dept: 'Sales' },
];

console.log('원본 데이터:');
console.table(users);

const sorted1 = sort(users, ['age', 'name']);
console.log('\nsort(users, ["age", "name"]) 결과:');
console.log('→ age 오름차순, 같으면 name 오름차순');
console.table(sorted1);

// ========================================
// 예제 2: SortConfig 배열 (세밀한 제어)
// ========================================

console.log('\n📌 예제 2: SortConfig 배열로 세밀한 제어');
console.log('----------------------------------------');

const products = [
  { category: 'Electronics', name: 'Laptop', price: 1200 },
  { category: 'Books', name: 'JavaScript Guide', price: 30 },
  { category: 'Electronics', name: 'Mouse', price: 25 },
  { category: 'Books', name: 'TypeScript Handbook', price: 40 },
  { category: 'Electronics', name: 'Keyboard', price: 80 },
];

console.log('원본 데이터:');
console.table(products);

const sorted2 = sort(products, [
  { key: 'category', direction: 'asc' },
  { key: 'price', direction: 'desc' },
]);

console.log('\nsort(products, [');
console.log('  { key: "category", direction: "asc" },');
console.log('  { key: "price", direction: "desc" }');
console.log(']) 결과:');
console.log('→ category 오름차순, 같은 category 내에서 price 내림차순');
console.table(sorted2);

// ========================================
// 예제 3: ✨ 혼합 방식 (실용적!)
// ========================================

console.log('\n📌 예제 3: ✨ 혼합 방식 (string + SortConfig)');
console.log('----------------------------------------');

const mixedData = [
  { category: 'B', price: 100, name: 'Product1', stock: 5 },
  { category: 'A', price: 200, name: 'Product2', stock: 0 },
  { category: 'A', price: 150, name: 'Product3', stock: 10 },
  { category: 'B', price: 100, name: 'Product0', stock: 3 },
  { category: 'A', price: 200, name: 'Product4', stock: 2 },
];

console.log('원본 데이터:');
console.table(mixedData);

const sorted3 = sort(mixedData, [
  'category',                           // asc (기본값)
  { key: 'price', direction: 'desc' },  // desc (커스터마이징)
  'name',                               // asc (기본값)
]);

console.log('\nsort(mixedData, [');
console.log('  "category",                          // asc (기본값)');
console.log('  { key: "price", direction: "desc" }, // desc (커스터마이징)');
console.log('  "name"                               // asc (기본값)');
console.log(']) 결과:');
console.log('→ 대부분의 키는 기본값(asc)으로, price만 desc로 커스터마이징!');
console.table(sorted3);

// ========================================
// 예제 4: null/undefined 처리
// ========================================

console.log('\n📌 예제 4: null/undefined 처리');
console.log('----------------------------------------');

const tasks = [
  { id: 1, title: 'Fix bug', priority: 5 },
  { id: 2, title: 'Write docs', priority: null },
  { id: 3, title: 'Code review', priority: 3 },
  { id: 4, title: 'Meeting', priority: undefined },
  { id: 5, title: 'Deploy', priority: 8 },
];

console.log('원본 데이터:');
console.table(tasks);

// 기본값: null을 맨 뒤로
const sorted3a = sort(tasks, ['priority']);
console.log('\nsort(tasks, ["priority"]) 결과:');
console.log('→ nullsFirst: false (기본값) - null/undefined를 맨 뒤로');
console.table(sorted3a);

// nullsFirst: true - null을 맨 앞으로
const sorted3b = sort(tasks, [{ key: 'priority', nullsFirst: true }]);
console.log('\nsort(tasks, [{ key: "priority", nullsFirst: true }]) 결과:');
console.log('→ null/undefined를 맨 앞으로');
console.table(sorted3b);

// ========================================
// 예제 5: sortBy 간편 함수
// ========================================

console.log('\n📌 예제 5: sortBy 간편 함수 (단일 키)');
console.log('----------------------------------------');

const scores = [
  { player: 'Alice', score: 95 },
  { player: 'Bob', score: 87 },
  { player: 'Charlie', score: 92 },
  { player: 'David', score: 98 },
];

console.log('원본 데이터:');
console.table(scores);

const sorted4a = sortBy(scores, 'score');
console.log('\nsortBy(scores, "score") 결과:');
console.log('→ score 오름차순 (기본값)');
console.table(sorted4a);

const sorted4b = sortBy(scores, 'score', 'desc');
console.log('\nsortBy(scores, "score", "desc") 결과:');
console.log('→ score 내림차순');
console.table(sorted4b);

// ========================================
// 예제 6: 복잡한 실무 예제
// ========================================

console.log('\n📌 예제 6: 복잡한 실무 예제 (직원 데이터)');
console.log('----------------------------------------');

const employees = [
  { dept: 'Sales', level: 3, name: 'Alice', salary: 80000 },
  { dept: 'IT', level: 2, name: 'Bob', salary: 70000 },
  { dept: 'Sales', level: 2, name: 'Charlie', salary: 65000 },
  { dept: 'IT', level: 3, name: 'David', salary: 85000 },
  { dept: 'Sales', level: 3, name: 'Eve', salary: 82000 },
  { dept: 'IT', level: 2, name: 'Frank', salary: 68000 },
];

console.log('원본 데이터:');
console.table(employees);

const sorted5 = sort(employees, [
  { key: 'dept', direction: 'asc' },
  { key: 'level', direction: 'desc' },
  { key: 'salary', direction: 'desc' },
]);

console.log('\nsort(employees, [');
console.log('  { key: "dept", direction: "asc" },');
console.log('  { key: "level", direction: "desc" },');
console.log('  { key: "salary", direction: "desc" }');
console.log(']) 결과:');
console.log('→ 1순위: dept 오름차순');
console.log('→ 2순위: level 내림차순 (같은 dept 내)');
console.log('→ 3순위: salary 내림차순 (같은 dept, level 내)');
console.table(sorted5);

// ========================================
// 예제 7: 타입별 정렬
// ========================================

console.log('\n📌 예제 7: 타입별 정렬');
console.log('----------------------------------------');

// 숫자
const numbers = [{ n: 5 }, { n: -3 }, { n: 0 }, { n: 2 }];
console.log('숫자 정렬:');
console.log('원본:', numbers);
console.log('정렬:', sort(numbers, ['n']));

// 문자열
const strings = [{ s: 'banana' }, { s: 'apple' }, { s: 'cherry' }];
console.log('\n문자열 정렬 (사전순):');
console.log('원본:', strings);
console.log('정렬:', sort(strings, ['s']));

// 불리언
const booleans = [{ b: true }, { b: false }, { b: true }, { b: false }];
console.log('\n불리언 정렬 (false < true):');
console.log('원본:', booleans);
console.log('정렬:', sort(booleans, ['b']));

// 날짜
const dates = [
  { date: new Date('2023-03-01') },
  { date: new Date('2023-01-01') },
  { date: new Date('2023-02-01') },
];
console.log('\n날짜 정렬:');
console.log('원본:', dates.map((d) => ({ date: d.date.toISOString().split('T')[0] })));
console.log(
  '정렬:',
  sort(dates, ['date']).map((d) => ({ date: d.date.toISOString().split('T')[0] }))
);

// ========================================
// 예제 8: Immutability 검증
// ========================================

console.log('\n📌 예제 8: Immutability (원본 배열 보존)');
console.log('----------------------------------------');

const original = [{ age: 30 }, { age: 20 }, { age: 25 }];
console.log('원본 배열:', original);

const sorted7 = sort(original, ['age']);
console.log('정렬 결과:', sorted7);

console.log('원본 배열 (정렬 후):', original);
console.log('→ 원본 배열이 변경되지 않았음을 확인!');
console.log('→ sort는 새 배열을 반환 (immutable)');

// ========================================
// 예제 9: 안정 정렬 (Stable Sort)
// ========================================

console.log('\n📌 예제 9: 안정 정렬 (Stable Sort)');
console.log('----------------------------------------');

const stableData = [
  { id: 1, score: 100 },
  { id: 2, score: 100 },
  { id: 3, score: 90 },
  { id: 4, score: 100 },
];

console.log('원본 데이터:');
console.table(stableData);

const sorted8 = sort(stableData, ['score']);
console.log('\nsort(stableData, ["score"]) 결과:');
console.log('→ score가 100인 항목들의 id 순서가 1, 2, 4로 유지됨 (안정 정렬)');
console.table(sorted8);

console.log('\n========================================');
console.log('모든 예제 완료!');
console.log('========================================');
