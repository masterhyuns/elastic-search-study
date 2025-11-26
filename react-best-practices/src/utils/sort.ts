/**
 * 배열 정렬 유틸리티
 *
 * 객체 배열을 특정 키(들)를 기준으로 정렬합니다.
 * 타입 안전성과 사용 편의성을 모두 제공합니다.
 */

import type { SortConfig, SortDirection } from './types';

/**
 * 두 값을 비교하여 정렬 순서를 결정
 *
 * @param a - 첫 번째 값
 * @param b - 두 번째 값
 * @param direction - 정렬 방향 ('asc' | 'desc')
 * @param nullsFirst - null/undefined를 맨 앞에 둘지 여부
 * @returns 비교 결과 (-1: a < b, 0: a == b, 1: a > b)
 */
const compareValues = (
  a: any,
  b: any,
  direction: SortDirection = 'asc',
  nullsFirst: boolean = false
): number => {
  // 1. null/undefined 처리
  const aIsNullish = a === null || a === undefined;
  const bIsNullish = b === null || b === undefined;

  if (aIsNullish && bIsNullish) return 0;
  if (aIsNullish) return nullsFirst ? -1 : 1;
  if (bIsNullish) return nullsFirst ? 1 : -1;

  // 2. 타입별 비교
  const aType = typeof a;
  const bType = typeof b;

  // 2-1. 숫자
  if (aType === 'number' && bType === 'number') {
    // NaN 처리 (항상 맨 뒤)
    if (Number.isNaN(a) && Number.isNaN(b)) return 0;
    if (Number.isNaN(a)) return 1;
    if (Number.isNaN(b)) return -1;

    const result = a - b;
    return direction === 'asc' ? result : -result;
  }

  // 2-2. 문자열
  if (aType === 'string' && bType === 'string') {
    const result = a.localeCompare(b);
    return direction === 'asc' ? result : -result;
  }

  // 2-3. 불리언
  if (aType === 'boolean' && bType === 'boolean') {
    // false < true
    const result = a === b ? 0 : a ? 1 : -1;
    return direction === 'asc' ? result : -result;
  }

  // 2-4. Date
  if (a instanceof Date && b instanceof Date) {
    // Invalid Date 처리 (맨 뒤)
    const aInvalid = isNaN(a.getTime());
    const bInvalid = isNaN(b.getTime());

    if (aInvalid && bInvalid) return 0;
    if (aInvalid) return 1;
    if (bInvalid) return -1;

    const result = a.getTime() - b.getTime();
    return direction === 'asc' ? result : -result;
  }

  // 2-5. 배열/객체 - 정렬 불가 (원본 순서 유지)
  if (aType === 'object' || bType === 'object') {
    console.warn(
      '[sort] 배열이나 객체 값은 정렬할 수 없습니다. 원본 순서를 유지합니다.',
      { a, b }
    );
    return 0;
  }

  // 기본: 0 반환 (동등)
  return 0;
};

/**
 * (keyof T | SortConfig<T>)[] 을 SortConfig[] 로 정규화
 *
 * 혼합 방식을 지원합니다:
 * - string: { key, direction: 'asc', nullsFirst: false } 로 변환
 * - SortConfig: 기본값 적용 (direction, nullsFirst)
 *
 * @param info - (keyof T | SortConfig<T>)[]
 * @returns SortConfig<T>[] (기본값 적용)
 */
const normalizeConfigs = <T extends Record<string, any>>(
  info: (keyof T | SortConfig<T>)[]
): SortConfig<T>[] => {
  return info.map((item) => {
    // string/number/symbol이면 기본 SortConfig로 변환
    if (typeof item === 'string' || typeof item === 'number' || typeof item === 'symbol') {
      return {
        key: item as keyof T,
        direction: 'asc' as const,
        nullsFirst: false,
      };
    }

    // 이미 SortConfig이면 기본값 적용
    // TypeScript는 여기서 item이 SortConfig<T>임을 알 수 있음
    const config = item as SortConfig<T>;
    return {
      key: config.key,
      direction: config.direction ?? 'asc',
      nullsFirst: config.nullsFirst ?? false,
    };
  });
};

/**
 * 객체 배열을 여러 키를 기준으로 정렬
 *
 * @param array - 정렬할 객체 배열
 * @param info - 정렬 정보 (혼합 가능: keyof T | SortConfig<T>)
 * @returns 정렬된 새 배열 (원본 배열 변경하지 않음)
 *
 * @example
 * ```typescript
 * // 1. 간편한 방식 (string 배열, 모두 asc, nullsFirst: false)
 * const users = [
 *   { name: 'Charlie', age: 30 },
 *   { name: 'Alice', age: 25 },
 *   { name: 'Bob', age: 25 }
 * ];
 *
 * sort(users, ['age', 'name']);
 * // [
 * //   { name: 'Alice', age: 25 },
 * //   { name: 'Bob', age: 25 },
 * //   { name: 'Charlie', age: 30 }
 * // ]
 * // age 오름차순 → 같으면 name 오름차순
 *
 * // 2. 세밀한 제어 (SortConfig 배열)
 * const products = [
 *   { category: 'B', price: 100 },
 *   { category: 'A', price: 200 },
 *   { category: 'A', price: 150 }
 * ];
 *
 * sort(products, [
 *   { key: 'category', direction: 'asc' },
 *   { key: 'price', direction: 'desc' }
 * ]);
 * // [
 * //   { category: 'A', price: 200 },
 * //   { category: 'A', price: 150 },
 * //   { category: 'B', price: 100 }
 * // ]
 * // category 오름차순 → 같으면 price 내림차순
 *
 * // 3. ✨ 혼합 방식 (실용적!)
 * sort(products, [
 *   'category',                           // asc (기본값)
 *   { key: 'price', direction: 'desc' },  // desc (커스터마이징)
 *   'name'                                // asc (기본값)
 * ]);
 * // 대부분의 키는 기본값으로, 필요한 키만 세밀하게 제어!
 *
 * // 4. null 처리
 * const items = [
 *   { id: 1, priority: null },
 *   { id: 2, priority: 5 },
 *   { id: 3, priority: 3 }
 * ];
 *
 * // null을 맨 뒤로 (기본값)
 * sort(items, ['priority']);
 * // [
 * //   { id: 3, priority: 3 },
 * //   { id: 2, priority: 5 },
 * //   { id: 1, priority: null }
 * // ]
 *
 * // null을 맨 앞으로
 * sort(items, [{ key: 'priority', nullsFirst: true }]);
 * // [
 * //   { id: 1, priority: null },
 * //   { id: 3, priority: 3 },
 * //   { id: 2, priority: 5 }
 * // ]
 *
 * // 5. 빈 배열
 * sort([], ['name']); // []
 *
 * // 6. 타입 안전성
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * const users: User[] = [...];
 * sort(users, ['name']); // ✅ OK
 * sort(users, ['name', { key: 'age', direction: 'desc' }]); // ✅ OK (혼합)
 * sort(users, ['invalid']); // ❌ 컴파일 에러
 * ```
 */
export const sort = <T extends Record<string, any>>(
  array: T[],
  info: (keyof T | SortConfig<T>)[]
): T[] => {
  // 빈 배열이면 그대로 반환
  if (array.length === 0) {
    return [];
  }

  // 빈 정렬 정보면 원본 배열 복사 반환
  if (info.length === 0) {
    return [...array];
  }

  // 정규화: string[] → SortConfig[]
  const configs = normalizeConfigs(info);

  // 원본 배열 복사 후 정렬 (immutable)
  return [...array].sort((a, b) => {
    // 각 config를 순서대로 적용
    for (const config of configs) {
      const aValue = a[config.key];
      const bValue = b[config.key];

      const comparison = compareValues(
        aValue,
        bValue,
        config.direction,
        config.nullsFirst
      );

      // 0이 아니면 (다르면) 즉시 반환
      if (comparison !== 0) {
        return comparison;
      }

      // 0이면 (같으면) 다음 config로 계속
    }

    // 모든 config가 동등하면 0 반환 (원본 순서 유지)
    return 0;
  });
};

/**
 * 단일 키로 정렬 (간편 버전)
 *
 * @param array - 정렬할 객체 배열
 * @param key - 정렬 기준 키
 * @param direction - 정렬 방향 (기본값: 'asc')
 * @returns 정렬된 새 배열 (원본 배열 변경하지 않음)
 *
 * @example
 * ```typescript
 * const users = [
 *   { name: 'Charlie', age: 30 },
 *   { name: 'Alice', age: 25 },
 *   { name: 'Bob', age: 25 }
 * ];
 *
 * // 오름차순 (기본값)
 * sortBy(users, 'age');
 * // [
 * //   { name: 'Alice', age: 25 },
 * //   { name: 'Bob', age: 25 },
 * //   { name: 'Charlie', age: 30 }
 * // ]
 *
 * // 내림차순
 * sortBy(users, 'age', 'desc');
 * // [
 * //   { name: 'Charlie', age: 30 },
 * //   { name: 'Alice', age: 25 },
 * //   { name: 'Bob', age: 25 }
 * // ]
 *
 * // 문자열 정렬
 * sortBy(users, 'name');
 * // [
 * //   { name: 'Alice', age: 25 },
 * //   { name: 'Bob', age: 25 },
 * //   { name: 'Charlie', age: 30 }
 * // ]
 * ```
 */
export const sortBy = <T extends Record<string, any>>(
  array: T[],
  key: keyof T,
  direction: SortDirection = 'asc'
): T[] => {
  return sort(array, [{ key, direction }]);
};
