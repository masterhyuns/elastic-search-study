/**
 * distinct 함수 실행 예제
 *
 * 테스트 프레임워크 없이 직접 실행해서 검증
 */

import { distinct, distinctBy, distinctValues } from '../distinct';

console.log('='.repeat(60));
console.log('distinct 함수 실행 예제');
console.log('='.repeat(60));

// 1. 기본 사용
console.log('\n[1] 기본 사용 - 단일 키');
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice (Duplicate)' },
];
console.log('입력:', JSON.stringify(users, null, 2));
console.log('결과:', JSON.stringify(distinct(users, ['id']), null, 2));

// 2. 복수 키
console.log('\n[2] 복수 키로 중복 제거');
const products = [
  { category: 'A', name: 'P1', price: 100 },
  { category: 'A', name: 'P2', price: 200 },
  { category: 'A', name: 'P1', price: 150 }, // 중복
];
console.log('입력:', JSON.stringify(products, null, 2));
console.log('결과:', JSON.stringify(distinct(products, ['category', 'name']), null, 2));

// 3. 배열 값 깊은 비교
console.log('\n[3] 배열 값 깊은 비교');
const data1 = [
  { id: 1, tags: ['a', 'b'] },
  { id: 2, tags: ['c'] },
  { id: 1, tags: ['a', 'b'] }, // 중복 (배열 내용 동일)
  { id: 1, tags: ['a', 'c'] }, // 중복 아님 (배열 내용 다름)
];
console.log('입력:', JSON.stringify(data1, null, 2));
console.log('결과:', JSON.stringify(distinct(data1, ['id', 'tags']), null, 2));

// 4. 객체 값 깊은 비교
console.log('\n[4] 객체 값 깊은 비교');
const data2 = [
  { id: 1, meta: { type: 'A', count: 10 } },
  { id: 1, meta: { type: 'A', count: 10 } }, // 중복
  { id: 1, meta: { type: 'A', count: 15 } }, // 중복 아님
];
console.log('입력:', JSON.stringify(data2, null, 2));
console.log('결과:', JSON.stringify(distinct(data2, ['id', 'meta']), null, 2));

// 5. null vs undefined
console.log('\n[5] null과 undefined 구분');
const data3 = [
  { id: 1, value: null },
  { id: 1, value: undefined }, // 중복 아님
  { id: 1, value: null }, // 중복
];
console.log('입력:', JSON.stringify(data3, null, 2));
console.log('결과:', JSON.stringify(distinct(data3, ['id', 'value']), null, 2));

// 6. 객체 키 순서 무관
console.log('\n[6] 객체 키 순서 무관');
const data4 = [
  { id: 1, meta: { a: 1, b: 2 } },
  { id: 1, meta: { b: 2, a: 1 } }, // 중복 (키 순서 무관)
];
console.log('입력:', JSON.stringify(data4, null, 2));
console.log('결과:', JSON.stringify(distinct(data4, ['id', 'meta']), null, 2));

// 7. distinctBy (간편 버전)
console.log('\n[7] distinctBy - 단일 키 간편 버전');
const data5 = [
  { id: 1, value: 'A' },
  { id: 2, value: 'B' },
  { id: 1, value: 'C' },
];
console.log('입력:', JSON.stringify(data5, null, 2));
console.log('결과:', JSON.stringify(distinctBy(data5, 'id'), null, 2));

// 8. distinctValues (primitive 배열)
console.log('\n[8] distinctValues - primitive 배열');
const data6 = [1, 2, 2, 3, 1, null, undefined, null];
console.log('입력:', JSON.stringify(data6));
console.log('결과:', JSON.stringify(distinctValues(data6)));

console.log('\n' + '='.repeat(60));
console.log('✅ 모든 예제 실행 완료');
console.log('='.repeat(60));
