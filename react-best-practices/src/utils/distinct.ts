/**
 * 배열 중복 제거 유틸리티
 *
 * 객체 배열에서 특정 키(들)를 기준으로 중복을 제거합니다.
 * 정확도를 최우선으로 하며, 깊은 비교를 수행합니다.
 */

/**
 * 두 값이 깊은 비교로 동일한지 확인
 *
 * @param a - 첫 번째 값
 * @param b - 두 번째 값
 * @returns 동일하면 true, 아니면 false
 */
const deepEqual = (a: any, b: any): boolean => {
  // 1. 참조가 같으면 true (빠른 경로)
  if (a === b) return true;

  // 2. 둘 중 하나가 null/undefined면 false
  if (a == null || b == null) return false;

  // 3. 타입이 다르면 false
  if (typeof a !== typeof b) return false;

  // 4. primitive 값은 === 비교로 이미 처리됨
  if (typeof a !== 'object') return false;

  // 5. 배열 비교
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  // 6. 배열 vs 객체는 false
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // 7. 객체 비교
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => {
    return Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]);
  });
};

/**
 * 객체 배열에서 특정 키를 기준으로 중복 제거
 *
 * @param array - 중복 제거할 객체 배열
 * @param keys - 중복 체크 기준이 되는 키 배열
 * @returns 중복이 제거된 새 배열 (첫 번째 등장한 항목만 유지)
 *
 * @example
 * ```typescript
 * // 1. 단일 키로 중복 제거
 * const users = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 *   { id: 1, name: 'Alice (Duplicate)' }
 * ];
 *
 * const uniqueUsers = distinct(users, ['id']);
 * // [
 * //   { id: 1, name: 'Alice' },
 * //   { id: 2, name: 'Bob' }
 * // ]
 *
 * // 2. 복수 키로 중복 제거
 * const products = [
 *   { category: 'A', name: 'P1', price: 100 },
 *   { category: 'A', name: 'P2', price: 200 },
 *   { category: 'A', name: 'P1', price: 150 } // category + name 중복
 * ];
 *
 * const uniqueProducts = distinct(products, ['category', 'name']);
 * // [
 * //   { category: 'A', name: 'P1', price: 100 },
 * //   { category: 'A', name: 'P2', price: 200 }
 * // ]
 *
 * // 3. 객체/배열 값도 정확히 비교
 * const data = [
 *   { id: 1, tags: ['a', 'b'] },
 *   { id: 2, tags: ['c'] },
 *   { id: 1, tags: ['a', 'b'] } // tags 배열도 깊은 비교로 중복 감지
 * ];
 *
 * distinct(data, ['id', 'tags']);
 * // [
 * //   { id: 1, tags: ['a', 'b'] },
 * //   { id: 2, tags: ['c'] }
 * // ]
 *
 * // 4. null, undefined 정확히 처리
 * const items = [
 *   { id: 1, value: null },
 *   { id: 2, value: undefined },
 *   { id: 1, value: null } // 중복
 * ];
 *
 * distinct(items, ['id', 'value']);
 * // [
 * //   { id: 1, value: null },
 * //   { id: 2, value: undefined }
 * // ]
 *
 * // 5. 타입 안전성
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * const users: User[] = [...];
 * const unique = distinct(users, ['id']); // User[] 타입 유지
 * // distinct(users, ['invalid']); // ✅ 컴파일 에러!
 * ```
 */
export const distinct = <T extends Record<string, any>>(
  array: T[],
  keys: (keyof T)[]
): T[] => {
  // 빈 배열이면 그대로 반환
  if (array.length === 0) {
    return [];
  }

  // 이미 본 키 조합들을 저장
  // Map 대신 배열 사용 (deepEqual로 비교하기 위해)
  const seen: Array<Record<string, any>> = [];

  return array.filter((item) => {
    // 현재 아이템의 키 값들만 추출
    const keyValues: Record<string, any> = {};
    keys.forEach((key) => {
      keyValues[key as string] = item[key];
    });

    // 이미 본 조합인지 확인 (깊은 비교)
    const isDuplicate = seen.some((seenKeyValues) => {
      return deepEqual(keyValues, seenKeyValues);
    });

    if (isDuplicate) {
      return false; // 중복이면 제외
    }

    // 처음 보는 조합이면 seen에 추가하고 포함
    seen.push(keyValues);
    return true;
  });
};

/**
 * 단일 키로 중복 제거 (간편 버전)
 *
 * @param array - 중복 제거할 객체 배열
 * @param key - 중복 체크 기준 키
 * @returns 중복이 제거된 새 배열
 *
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 *   { id: 1, name: 'Alice (Duplicate)' }
 * ];
 *
 * const uniqueUsers = distinctBy(users, 'id');
 * // [
 * //   { id: 1, name: 'Alice' },
 * //   { id: 2, name: 'Bob' }
 * // ]
 * ```
 */
export const distinctBy = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): T[] => {
  return distinct(array, [key]);
};

/**
 * primitive 값 배열의 중복 제거
 *
 * @param array - 중복 제거할 배열
 * @returns 중복이 제거된 새 배열
 *
 * @example
 * ```typescript
 * // 숫자 배열
 * distinctValues([1, 2, 2, 3, 1]); // [1, 2, 3]
 *
 * // 문자열 배열
 * distinctValues(['a', 'b', 'a', 'c']); // ['a', 'b', 'c']
 *
 * // null, undefined 처리
 * distinctValues([1, null, 2, null, undefined, 1]); // [1, null, 2, undefined]
 * ```
 */
export const distinctValues = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};
