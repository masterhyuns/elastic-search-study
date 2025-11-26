/**
 * distinct 유틸리티 함수의 타입 정의
 *
 * 배열 중복 제거 관련 타입들을 정의합니다.
 * 정확도를 최우선으로 하며, 깊은 비교를 통한 중복 검출을 지원합니다.
 */

/**
 * 객체 타입 제약
 *
 * distinct 함수에서 사용할 수 있는 객체는 문자열 키를 가진 객체여야 합니다.
 * 이는 TypeScript의 keyof 연산자와 함께 사용되어 타입 안전성을 보장합니다.
 *
 * @example
 * ```typescript
 * // ✅ 올바른 사용
 * interface User extends DistinctObject {
 *   id: number;
 *   name: string;
 * }
 *
 * // ❌ 잘못된 사용 (symbol 키는 지원하지 않음)
 * const obj = {
 *   [Symbol('key')]: 'value'
 * };
 * ```
 */
export type DistinctObject = Record<string, any>;

/**
 * distinct 함수의 키 파라미터 타입
 *
 * 제네릭 타입 T의 키들 중 하나 이상을 배열로 받습니다.
 * TypeScript의 타입 체크를 통해 존재하지 않는 키는 컴파일 에러가 발생합니다.
 *
 * @template T - 중복 제거할 객체의 타입
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * // ✅ 올바른 키 배열
 * const keys1: DistinctKeys<User> = ['id'];
 * const keys2: DistinctKeys<User> = ['id', 'email'];
 *
 * // ❌ 컴파일 에러 (존재하지 않는 키)
 * const keys3: DistinctKeys<User> = ['id', 'invalid'];
 * ```
 */
export type DistinctKeys<T extends DistinctObject> = (keyof T)[];

/**
 * distinct 함수의 반환 타입
 *
 * 입력 배열과 동일한 타입의 배열을 반환합니다.
 * 중복이 제거되었지만 타입은 동일하게 유지됩니다.
 *
 * @template T - 중복 제거할 객체의 타입
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * const users: User[] = [...];
 * const uniqueUsers: DistinctResult<User> = distinct(users, ['id']);
 * // uniqueUsers는 User[] 타입입니다
 * ```
 */
export type DistinctResult<T extends DistinctObject> = T[];

/**
 * distinctBy 함수의 키 파라미터 타입
 *
 * 단일 키로 중복을 제거할 때 사용합니다.
 * distinct 함수와 달리 배열이 아닌 단일 키를 받습니다.
 *
 * @template T - 중복 제거할 객체의 타입
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * // ✅ 올바른 사용
 * const key1: DistinctByKey<User> = 'id';
 * const key2: DistinctByKey<User> = 'name';
 *
 * // ❌ 컴파일 에러 (존재하지 않는 키)
 * const key3: DistinctByKey<User> = 'invalid';
 * ```
 */
export type DistinctByKey<T extends DistinctObject> = keyof T;

/**
 * distinctValues 함수의 입력/출력 타입
 *
 * primitive 값들의 배열에서 중복을 제거합니다.
 * Set을 사용하므로 참조 동등성(===)으로 비교됩니다.
 *
 * @template T - 배열 요소의 타입 (number, string, boolean, null, undefined 등)
 *
 * @example
 * ```typescript
 * // ✅ primitive 타입 배열
 * const numbers: number[] = [1, 2, 2, 3];
 * const strings: string[] = ['a', 'b', 'a'];
 * const mixed: (number | null)[] = [1, null, 2, null];
 *
 * distinctValues(numbers); // [1, 2, 3]
 * distinctValues(strings); // ['a', 'b']
 * distinctValues(mixed);   // [1, null, 2]
 * ```
 */
export type DistinctValuesInput<T> = T[];
export type DistinctValuesResult<T> = T[];

/**
 * 깊은 비교 함수의 타입
 *
 * 두 값이 깊은 비교로 동일한지 확인하는 함수입니다.
 * 내부적으로 사용되며, 외부에 노출되지 않습니다.
 *
 * @internal
 *
 * 특징:
 * - 재귀적으로 객체/배열을 비교합니다
 * - null과 undefined를 구분합니다
 * - 객체 키 순서와 무관하게 비교합니다
 * - 배열 순서는 중요하게 취급합니다
 *
 * @param a - 비교할 첫 번째 값
 * @param b - 비교할 두 번째 값
 * @returns 두 값이 깊은 비교로 동일하면 true, 아니면 false
 *
 * @example
 * ```typescript
 * // primitive 값
 * deepEqual(1, 1);           // true
 * deepEqual(1, 2);           // false
 * deepEqual(null, undefined); // false
 *
 * // 객체 (키 순서 무관)
 * deepEqual(
 *   { a: 1, b: 2 },
 *   { b: 2, a: 1 }
 * ); // true
 *
 * // 배열 (순서 중요)
 * deepEqual([1, 2], [2, 1]); // false
 * deepEqual([1, 2], [1, 2]); // true
 *
 * // 중첩 구조
 * deepEqual(
 *   { user: { name: 'Alice', tags: ['a', 'b'] } },
 *   { user: { name: 'Alice', tags: ['a', 'b'] } }
 * ); // true
 * ```
 */
export type DeepEqualFn = (a: any, b: any) => boolean;

/**
 * 성능 vs 정확도 트레이드오프
 *
 * distinct 함수의 구현 방식:
 *
 * 1. **정확도 우선 (현재 구현)**
 *    - deepEqual을 사용한 깊은 비교
 *    - 시간 복잡도: O(n² · m) (n: 배열 길이, m: 객체 깊이)
 *    - 공간 복잡도: O(n · k) (k: 키 개수)
 *    - 장점: 100% 정확한 중복 검출
 *    - 단점: 큰 배열에서 성능 저하 가능
 *    - 적합한 경우: 정확도가 중요하고 배열 크기가 적당한 경우
 *
 * 2. **성능 우선 (대안 구현)**
 *    - JSON.stringify를 사용한 문자열 비교
 *    - 시간 복잡도: O(n · m · log(m)) (m: 객체 크기)
 *    - 공간 복잡도: O(n · m)
 *    - 장점: 빠른 성능
 *    - 단점: 객체 키 순서에 영향받음, undefined 처리 부정확
 *    - 적합한 경우: 대용량 데이터에서 대략적인 중복 제거
 *
 * 3. **Map 기반 (단순 키 전용)**
 *    - Map을 사용한 참조 비교
 *    - 시간 복잡도: O(n)
 *    - 공간 복잡도: O(n)
 *    - 장점: 매우 빠름
 *    - 단점: primitive 값만 정확, 객체/배열 값은 부정확
 *    - 적합한 경우: 키 값이 primitive인 경우
 *
 * 현재 구현은 **정확도를 최우선**으로 합니다.
 * 사용자 피드백: "빠른데 정확하지 않으면 의미 없어 정확도 > 성능이야"
 */

/**
 * 타입 안전성 보장
 *
 * distinct 함수 계열은 다음과 같은 타입 안전성을 보장합니다:
 *
 * 1. **키 존재성 검증**
 *    - keyof 연산자로 존재하는 키만 허용
 *    - 컴파일 타임에 오류 검출
 *
 * 2. **타입 보존**
 *    - 입력 타입과 출력 타입이 동일
 *    - 제네릭을 통한 타입 추론
 *
 * 3. **null 안전성**
 *    - null과 undefined를 명확히 구분
 *    - 옵셔널 키 처리
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   age?: number; // 옵셔널 키
 * }
 *
 * const users: User[] = [
 *   { id: 1, name: 'Alice', age: 30 },
 *   { id: 2, name: 'Bob' }, // age 없음
 *   { id: 1, name: 'Alice', age: 30 }, // 중복
 * ];
 *
 * // ✅ 타입 안전: 모든 키가 User의 키임
 * const result1 = distinct(users, ['id', 'name']);
 * // result1의 타입: User[]
 *
 * // ✅ 옵셔널 키도 안전하게 처리
 * const result2 = distinct(users, ['id', 'age']);
 * // result2의 타입: User[]
 *
 * // ❌ 컴파일 에러: 'invalid'는 User의 키가 아님
 * const result3 = distinct(users, ['id', 'invalid']);
 * ```
 */

/**
 * ============================================================================
 * 정렬 (Sort) 유틸리티 타입 정의
 * ============================================================================
 */

/**
 * 정렬 방향
 *
 * @example
 * ```typescript
 * const direction1: SortDirection = 'asc';  // 오름차순
 * const direction2: SortDirection = 'desc'; // 내림차순
 * ```
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 정렬 설정 (세밀한 제어용)
 *
 * 객체 배열을 정렬할 때 각 키의 정렬 방향과 null 처리 방식을 지정합니다.
 *
 * @template T - 정렬할 객체의 타입
 *
 * @property key - 정렬 기준 키
 * @property direction - 정렬 방향 ('asc' | 'desc'), 기본값: 'asc'
 * @property nullsFirst - null/undefined를 맨 앞에 둘지 여부, 기본값: false
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   age?: number;
 * }
 *
 * // 기본 설정 (asc, nullsFirst: false)
 * const config1: SortConfig<User> = { key: 'name' };
 *
 * // 내림차순
 * const config2: SortConfig<User> = { key: 'age', direction: 'desc' };
 *
 * // null을 맨 앞에
 * const config3: SortConfig<User> = {
 *   key: 'age',
 *   direction: 'asc',
 *   nullsFirst: true
 * };
 * ```
 */
export interface SortConfig<T extends Record<string, any>> {
  key: keyof T;
  direction?: SortDirection;
  nullsFirst?: boolean;
}

/**
 * 정렬 정보 타입
 *
 * 두 가지 방식으로 정렬 정보를 전달할 수 있습니다:
 * 1. **간편한 방식**: `(keyof T)[]` - 모든 키를 asc로 정렬 (nullsFirst: false)
 * 2. **세밀한 방식**: `SortConfig<T>[]` - 각 키마다 direction과 nullsFirst 지정
 *
 * @template T - 정렬할 객체의 타입
 *
 * @example
 * ```typescript
 * interface Product {
 *   category: string;
 *   name: string;
 *   price: number;
 * }
 *
 * // ✅ 방식 1: 간편한 방식 (모두 asc, nullsFirst: false)
 * const sort1: SortInfo<Product> = ['category', 'price'];
 *
 * // ✅ 방식 2: 세밀한 제어
 * const sort2: SortInfo<Product> = [
 *   { key: 'category', direction: 'asc' },
 *   { key: 'price', direction: 'desc' }
 * ];
 *
 * // ❌ 혼합 불가 (타입 에러)
 * const sort3: SortInfo<Product> = [
 *   'category',
 *   { key: 'price', direction: 'desc' }
 * ];
 * ```
 */
export type SortInfo<T extends Record<string, any>> = (keyof T)[] | SortConfig<T>[];

/**
 * sort 함수의 반환 타입
 *
 * 입력 배열과 동일한 타입의 배열을 반환합니다.
 * 정렬되었지만 타입은 동일하게 유지됩니다.
 *
 * @template T - 정렬할 객체의 타입
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * const users: User[] = [...];
 * const sorted: SortResult<User> = sort(users, ['name']);
 * // sorted는 User[] 타입입니다
 * ```
 */
export type SortResult<T extends Record<string, any>> = T[];

/**
 * sortBy 함수의 키 파라미터 타입
 *
 * 단일 키로 정렬할 때 사용합니다.
 * sort 함수와 달리 배열이 아닌 단일 키를 받습니다.
 *
 * @template T - 정렬할 객체의 타입
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * // ✅ 올바른 사용
 * const key1: SortByKey<User> = 'id';
 * const key2: SortByKey<User> = 'name';
 *
 * // ❌ 컴파일 에러 (존재하지 않는 키)
 * const key3: SortByKey<User> = 'invalid';
 * ```
 */
export type SortByKey<T extends Record<string, any>> = keyof T;

/**
 * 정렬 알고리즘 및 복잡도
 *
 * sort 함수는 JavaScript의 Array.prototype.sort()를 사용합니다.
 *
 * **시간 복잡도:**
 * - 평균: O(n log n)
 * - 최악: O(n²) (V8 엔진의 TimSort 알고리즘)
 *
 * **공간 복잡도:**
 * - O(n) - 원본 배열을 복사하여 immutable 보장
 *
 * **안정 정렬 (Stable Sort):**
 * - ECMAScript 2019부터 Array.sort()는 안정 정렬을 보장
 * - 동일한 값의 상대적 순서가 유지됨
 *
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, name: 'Alice', score: 100 },
 *   { id: 2, name: 'Bob', score: 100 },
 *   { id: 3, name: 'Charlie', score: 90 }
 * ];
 *
 * // score로 정렬 시 Alice와 Bob의 순서 유지 (안정 정렬)
 * sort(users, ['score']);
 * // [
 * //   { id: 3, name: 'Charlie', score: 90 },
 * //   { id: 1, name: 'Alice', score: 100 },  // 원본 순서 유지
 * //   { id: 2, name: 'Bob', score: 100 }
 * // ]
 * ```
 */

/**
 * 타입별 정렬 규칙
 *
 * sort 함수는 각 타입에 따라 다음과 같이 정렬합니다:
 *
 * **1. 숫자 (number)**
 *   - 수치 비교
 *   - -Infinity < ... < -1 < 0 < 1 < ... < Infinity
 *   - NaN은 항상 맨 뒤 (nullsFirst와 무관)
 *
 * **2. 문자열 (string)**
 *   - 사전순 비교 (localeCompare)
 *   - 대소문자 구분
 *   - 유니코드 순서
 *
 * **3. 날짜 (Date)**
 *   - 시간순 비교
 *   - Invalid Date는 맨 뒤
 *
 * **4. 불리언 (boolean)**
 *   - false < true
 *
 * **5. null / undefined**
 *   - nullsFirst: true → 맨 앞
 *   - nullsFirst: false (기본값) → 맨 뒤
 *   - null과 undefined는 동등하게 취급
 *
 * **6. 배열 / 객체**
 *   - 정렬 불가 (원본 순서 유지)
 *   - 콘솔에 경고 메시지 출력
 *
 * @example
 * ```typescript
 * // 숫자 정렬
 * sort([{ n: 3 }, { n: 1 }, { n: 2 }], ['n']);
 * // [{ n: 1 }, { n: 2 }, { n: 3 }]
 *
 * // 문자열 정렬 (사전순)
 * sort([{ s: 'c' }, { s: 'a' }, { s: 'b' }], ['s']);
 * // [{ s: 'a' }, { s: 'b' }, { s: 'c' }]
 *
 * // null 처리 (기본값: nullsFirst = false)
 * sort([{ v: null }, { v: 1 }, { v: 2 }], ['v']);
 * // [{ v: 1 }, { v: 2 }, { v: null }]
 *
 * // null 처리 (nullsFirst = true)
 * sort([{ v: null }, { v: 1 }, { v: 2 }], [{ key: 'v', nullsFirst: true }]);
 * // [{ v: null }, { v: 1 }, { v: 2 }]
 * ```
 */

/**
 * 복수 키 정렬 우선순위
 *
 * sort 함수에 여러 키를 전달하면 우선순위에 따라 정렬됩니다.
 *
 * **정렬 순서:**
 * 1. 첫 번째 키로 정렬
 * 2. 첫 번째 키 값이 같으면 두 번째 키로 정렬
 * 3. 두 번째 키 값도 같으면 세 번째 키로 정렬
 * 4. ... (반복)
 *
 * @example
 * ```typescript
 * const employees = [
 *   { dept: 'Sales', level: 3, name: 'Alice' },
 *   { dept: 'IT', level: 2, name: 'Bob' },
 *   { dept: 'Sales', level: 2, name: 'Charlie' },
 *   { dept: 'IT', level: 2, name: 'David' }
 * ];
 *
 * // 1순위: dept (asc), 2순위: level (desc), 3순위: name (asc)
 * sort(employees, [
 *   { key: 'dept', direction: 'asc' },
 *   { key: 'level', direction: 'desc' },
 *   { key: 'name', direction: 'asc' }
 * ]);
 *
 * // 결과:
 * // [
 * //   { dept: 'IT', level: 2, name: 'Bob' },     // IT가 먼저
 * //   { dept: 'IT', level: 2, name: 'David' },   // IT 내에서 이름순
 * //   { dept: 'Sales', level: 3, name: 'Alice' }, // Sales - level 3
 * //   { dept: 'Sales', level: 2, name: 'Charlie' } // Sales - level 2
 * // ]
 * ```
 */

/**
 * 타입 안전성 보장
 *
 * sort 함수 계열은 다음과 같은 타입 안전성을 보장합니다:
 *
 * 1. **키 존재성 검증**
 *    - keyof 연산자로 존재하는 키만 허용
 *    - 컴파일 타임에 오류 검출
 *
 * 2. **타입 보존**
 *    - 입력 타입과 출력 타입이 동일
 *    - 제네릭을 통한 타입 추론
 *
 * 3. **정렬 방향 제한**
 *    - 'asc' | 'desc'만 허용
 *    - 잘못된 값 컴파일 에러
 *
 * 4. **Immutability**
 *    - 원본 배열 변경하지 않음
 *    - 새 배열 반환
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   age?: number; // 옵셔널 키
 * }
 *
 * const users: User[] = [...];
 *
 * // ✅ 타입 안전: 모든 키가 User의 키임
 * const result1 = sort(users, ['name', 'age']);
 * // result1의 타입: User[]
 *
 * // ✅ 옵셔널 키도 안전하게 처리
 * const result2 = sort(users, [{ key: 'age', nullsFirst: true }]);
 * // result2의 타입: User[]
 *
 * // ❌ 컴파일 에러: 'invalid'는 User의 키가 아님
 * const result3 = sort(users, ['invalid']);
 *
 * // ❌ 컴파일 에러: 'up'은 유효한 SortDirection이 아님
 * const result4 = sort(users, [{ key: 'name', direction: 'up' }]);
 * ```
 */
