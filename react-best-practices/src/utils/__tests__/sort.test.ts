/**
 * sort 함수 테스트
 *
 * 다양한 시나리오에서 정렬 함수의 동작을 검증합니다.
 */

import { sort, sortBy } from '../sort';

describe('sort 함수', () => {
  // ========================================
  // 기본 동작 테스트
  // ========================================

  describe('기본 동작', () => {
    it('빈 배열을 정렬하면 빈 배열을 반환해야 함', () => {
      const result = sort([], ['key']);
      expect(result).toEqual([]);
    });

    it('단일 키로 오름차순 정렬 (숫자)', () => {
      const data = [{ age: 30 }, { age: 20 }, { age: 25 }];
      const result = sort(data, ['age']);

      expect(result).toEqual([{ age: 20 }, { age: 25 }, { age: 30 }]);
    });

    it('단일 키로 오름차순 정렬 (문자열)', () => {
      const data = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
      const result = sort(data, ['name']);

      expect(result).toEqual([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]);
    });

    it('원본 배열을 변경하지 않아야 함 (immutable)', () => {
      const data = [{ age: 30 }, { age: 20 }];
      const original = [...data];
      const result = sort(data, ['age']);

      expect(data).toEqual(original); // 원본 유지
      expect(result).not.toBe(data); // 새 배열 반환
    });
  });

  // ========================================
  // string[] 방식 테스트
  // ========================================

  describe('string[] 방식 (간편)', () => {
    it('string 배열로 복수 키 정렬 (모두 asc)', () => {
      const data = [
        { dept: 'Sales', name: 'Charlie' },
        { dept: 'IT', name: 'Alice' },
        { dept: 'Sales', name: 'Bob' },
      ];

      const result = sort(data, ['dept', 'name']);

      expect(result).toEqual([
        { dept: 'IT', name: 'Alice' },
        { dept: 'Sales', name: 'Bob' },
        { dept: 'Sales', name: 'Charlie' },
      ]);
    });

    it('string 배열로 3개 키 정렬', () => {
      const data = [
        { a: 1, b: 2, c: 'z' },
        { a: 1, b: 2, c: 'x' },
        { a: 1, b: 1, c: 'y' },
      ];

      const result = sort(data, ['a', 'b', 'c']);

      expect(result).toEqual([
        { a: 1, b: 1, c: 'y' },
        { a: 1, b: 2, c: 'x' },
        { a: 1, b: 2, c: 'z' },
      ]);
    });
  });

  // ========================================
  // SortConfig[] 방식 테스트
  // ========================================

  describe('SortConfig[] 방식 (세밀한 제어)', () => {
    it('단일 키로 내림차순 정렬', () => {
      const data = [{ age: 20 }, { age: 30 }, { age: 25 }];
      const result = sort(data, [{ key: 'age', direction: 'desc' }]);

      expect(result).toEqual([{ age: 30 }, { age: 25 }, { age: 20 }]);
    });

    it('복수 키 정렬 (다른 방향)', () => {
      const data = [
        { category: 'A', price: 100 },
        { category: 'B', price: 200 },
        { category: 'A', price: 150 },
      ];

      const result = sort(data, [
        { key: 'category', direction: 'asc' },
        { key: 'price', direction: 'desc' },
      ]);

      expect(result).toEqual([
        { category: 'A', price: 150 },
        { category: 'A', price: 100 },
        { category: 'B', price: 200 },
      ]);
    });

    it('direction 생략 시 기본값 asc 적용', () => {
      const data = [{ age: 30 }, { age: 20 }];
      const result = sort(data, [{ key: 'age' }]);

      expect(result).toEqual([{ age: 20 }, { age: 30 }]);
    });
  });

  // ========================================
  // 혼합 방식 테스트 (keyof T | SortConfig<T>)
  // ========================================

  describe('혼합 방식 (실용적!)', () => {
    it('string과 SortConfig 혼합', () => {
      const data = [
        { category: 'B', price: 100, name: 'Product1' },
        { category: 'A', price: 200, name: 'Product2' },
        { category: 'A', price: 150, name: 'Product3' },
        { category: 'B', price: 100, name: 'Product0' },
      ];

      const result = sort(data, [
        'category',                           // asc (기본값)
        { key: 'price', direction: 'desc' },  // desc (커스터마이징)
        'name',                               // asc (기본값)
      ]);

      expect(result).toEqual([
        { category: 'A', price: 200, name: 'Product2' },
        { category: 'A', price: 150, name: 'Product3' },
        { category: 'B', price: 100, name: 'Product0' },
        { category: 'B', price: 100, name: 'Product1' },
      ]);
    });

    it('혼합 방식으로 nullsFirst 적용', () => {
      const data = [
        { priority: 3, name: 'Task1' },
        { priority: null, name: 'Task2' },
        { priority: 1, name: 'Task3' },
        { priority: null, name: 'Task0' },
      ];

      const result = sort(data, [
        { key: 'priority', nullsFirst: true }, // null을 맨 앞에
        'name',                                // asc (기본값)
      ]);

      expect(result).toEqual([
        { priority: null, name: 'Task0' },
        { priority: null, name: 'Task2' },
        { priority: 1, name: 'Task3' },
        { priority: 3, name: 'Task1' },
      ]);
    });

    it('대부분 string, 일부만 SortConfig', () => {
      const data = [
        { a: 1, b: 3, c: 2, d: 'z' },
        { a: 1, b: 2, c: 2, d: 'y' },
        { a: 1, b: 2, c: 1, d: 'x' },
      ];

      const result = sort(data, [
        'a',                                  // asc
        { key: 'b', direction: 'desc' },      // desc만 커스터마이징
        'c',                                  // asc
        'd',                                  // asc
      ]);

      expect(result).toEqual([
        { a: 1, b: 3, c: 2, d: 'z' },
        { a: 1, b: 2, c: 1, d: 'x' },
        { a: 1, b: 2, c: 2, d: 'y' },
      ]);
    });
  });

  // ========================================
  // 타입별 정렬 테스트
  // ========================================

  describe('타입별 정렬', () => {
    it('숫자 정렬 (음수, 0, 양수)', () => {
      const data = [{ n: 5 }, { n: -3 }, { n: 0 }, { n: 2 }];
      const result = sort(data, ['n']);

      expect(result).toEqual([{ n: -3 }, { n: 0 }, { n: 2 }, { n: 5 }]);
    });

    it('문자열 정렬 (사전순)', () => {
      const data = [{ s: 'banana' }, { s: 'apple' }, { s: 'cherry' }];
      const result = sort(data, ['s']);

      expect(result).toEqual([{ s: 'apple' }, { s: 'banana' }, { s: 'cherry' }]);
    });

    it('불리언 정렬 (false < true)', () => {
      const data = [{ b: true }, { b: false }, { b: true }, { b: false }];
      const result = sort(data, ['b']);

      expect(result).toEqual([{ b: false }, { b: false }, { b: true }, { b: true }]);
    });

    it('날짜 정렬', () => {
      const data = [
        { date: new Date('2023-03-01') },
        { date: new Date('2023-01-01') },
        { date: new Date('2023-02-01') },
      ];

      const result = sort(data, ['date']);

      expect(result).toEqual([
        { date: new Date('2023-01-01') },
        { date: new Date('2023-02-01') },
        { date: new Date('2023-03-01') },
      ]);
    });
  });

  // ========================================
  // null/undefined 처리 테스트
  // ========================================

  describe('null/undefined 처리', () => {
    it('nullsFirst: false (기본값) - null을 맨 뒤로', () => {
      const data = [{ v: null }, { v: 1 }, { v: 3 }, { v: 2 }];
      const result = sort(data, ['v']);

      expect(result).toEqual([{ v: 1 }, { v: 2 }, { v: 3 }, { v: null }]);
    });

    it('nullsFirst: true - null을 맨 앞으로', () => {
      const data = [{ v: 2 }, { v: null }, { v: 1 }];
      const result = sort(data, [{ key: 'v', nullsFirst: true }]);

      expect(result).toEqual([{ v: null }, { v: 1 }, { v: 2 }]);
    });

    it('undefined도 null과 동일하게 처리 (기본값: 맨 뒤)', () => {
      const data = [{ v: undefined }, { v: 1 }, { v: 2 }];
      const result = sort(data, ['v']);

      expect(result).toEqual([{ v: 1 }, { v: 2 }, { v: undefined }]);
    });

    it('null과 undefined 섞여있을 때', () => {
      const data = [{ v: null }, { v: 1 }, { v: undefined }, { v: 2 }];
      const result = sort(data, ['v']);

      // null과 undefined는 동등하게 취급 → 맨 뒤로
      expect(result).toEqual([{ v: 1 }, { v: 2 }, { v: null }, { v: undefined }]);
    });
  });

  // ========================================
  // 특수 값 처리 테스트
  // ========================================

  describe('특수 값 처리', () => {
    it('NaN은 항상 맨 뒤', () => {
      const data = [{ n: NaN }, { n: 1 }, { n: 2 }];
      const result = sort(data, ['n']);

      expect(result).toEqual([{ n: 1 }, { n: 2 }, { n: NaN }]);
    });

    it('Invalid Date는 맨 뒤', () => {
      const data = [
        { date: new Date('invalid') },
        { date: new Date('2023-01-01') },
        { date: new Date('2023-02-01') },
      ];

      const result = sort(data, ['date']);

      expect(result[0]).toEqual({ date: new Date('2023-01-01') });
      expect(result[1]).toEqual({ date: new Date('2023-02-01') });
      expect(isNaN(result[2].date.getTime())).toBe(true); // Invalid Date
    });

    it('0과 false를 구분해야 함', () => {
      const data1 = [{ n: 1 }, { n: 0 }, { n: 2 }];
      const result1 = sort(data1, ['n']);
      expect(result1).toEqual([{ n: 0 }, { n: 1 }, { n: 2 }]);

      const data2 = [{ b: true }, { b: false }];
      const result2 = sort(data2, ['b']);
      expect(result2).toEqual([{ b: false }, { b: true }]);
    });

    it('빈 문자열과 null을 구분해야 함', () => {
      const data = [{ s: null }, { s: '' }, { s: 'a' }];
      const result = sort(data, ['s']);

      expect(result).toEqual([{ s: '' }, { s: 'a' }, { s: null }]);
    });
  });

  // ========================================
  // 복수 키 정렬 우선순위 테스트
  // ========================================

  describe('복수 키 정렬 우선순위', () => {
    it('첫 번째 키가 우선, 같으면 두 번째 키', () => {
      const data = [
        { a: 2, b: 1 },
        { a: 1, b: 2 },
        { a: 1, b: 1 },
      ];

      const result = sort(data, ['a', 'b']);

      expect(result).toEqual([
        { a: 1, b: 1 },
        { a: 1, b: 2 },
        { a: 2, b: 1 },
      ]);
    });

    it('3개 키 우선순위', () => {
      const data = [
        { dept: 'Sales', level: 2, name: 'Bob' },
        { dept: 'IT', level: 3, name: 'Alice' },
        { dept: 'Sales', level: 2, name: 'Charlie' },
        { dept: 'Sales', level: 3, name: 'David' },
      ];

      const result = sort(data, [
        { key: 'dept', direction: 'asc' },
        { key: 'level', direction: 'desc' },
        { key: 'name', direction: 'asc' },
      ]);

      expect(result).toEqual([
        { dept: 'IT', level: 3, name: 'Alice' },
        { dept: 'Sales', level: 3, name: 'David' },
        { dept: 'Sales', level: 2, name: 'Bob' },
        { dept: 'Sales', level: 2, name: 'Charlie' },
      ]);
    });
  });

  // ========================================
  // 안정 정렬 (Stable Sort) 테스트
  // ========================================

  describe('안정 정렬 (Stable Sort)', () => {
    it('동일한 값의 상대적 순서가 유지되어야 함', () => {
      const data = [
        { id: 1, score: 100 },
        { id: 2, score: 100 },
        { id: 3, score: 90 },
        { id: 4, score: 100 },
      ];

      const result = sort(data, ['score']);

      // score가 100인 항목들의 id 순서는 1, 2, 4로 유지
      expect(result).toEqual([
        { id: 3, score: 90 },
        { id: 1, score: 100 },
        { id: 2, score: 100 },
        { id: 4, score: 100 },
      ]);
    });
  });

  // ========================================
  // 배열/객체 값 처리 테스트
  // ========================================

  describe('배열/객체 값 처리', () => {
    it('배열 값은 정렬하지 않고 원본 순서 유지', () => {
      const data = [
        { id: 1, tags: ['b', 'c'] },
        { id: 2, tags: ['a'] },
        { id: 3, tags: ['d', 'e'] },
      ];

      // tags는 정렬하지 않으므로 원본 순서 유지
      const result = sort(data, ['tags']);

      expect(result).toEqual(data);
    });

    it('객체 값은 정렬하지 않고 원본 순서 유지', () => {
      const data = [
        { id: 1, meta: { x: 2 } },
        { id: 2, meta: { x: 1 } },
      ];

      const result = sort(data, ['meta']);

      expect(result).toEqual(data);
    });
  });
});

// ========================================
// sortBy 함수 테스트
// ========================================

describe('sortBy 함수', () => {
  it('단일 키 오름차순 정렬 (기본값)', () => {
    const data = [{ age: 30 }, { age: 20 }, { age: 25 }];
    const result = sortBy(data, 'age');

    expect(result).toEqual([{ age: 20 }, { age: 25 }, { age: 30 }]);
  });

  it('단일 키 내림차순 정렬', () => {
    const data = [{ age: 20 }, { age: 30 }, { age: 25 }];
    const result = sortBy(data, 'age', 'desc');

    expect(result).toEqual([{ age: 30 }, { age: 25 }, { age: 20 }]);
  });

  it('문자열 키 정렬', () => {
    const data = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
    const result = sortBy(data, 'name');

    expect(result).toEqual([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]);
  });

  it('원본 배열을 변경하지 않아야 함', () => {
    const data = [{ age: 30 }, { age: 20 }];
    const original = [...data];
    const result = sortBy(data, 'age');

    expect(data).toEqual(original);
    expect(result).not.toBe(data);
  });
});

// ========================================
// 타입 안전성 테스트 (컴파일 타임)
// ========================================

describe('타입 안전성 (컴파일 타임)', () => {
  it('존재하는 키만 허용 (런타임 검증 불가, 타입스크립트에서 검증)', () => {
    interface User {
      id: number;
      name: string;
    }

    const users: User[] = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];

    // ✅ 올바른 사용
    const result1 = sort(users, ['id']);
    const result2 = sort(users, ['name', 'id']);
    const result3 = sortBy(users, 'name');

    // 런타임 검증은 불가능하지만, TypeScript 컴파일 타임에 아래는 에러
    // const result4 = sort(users, ['invalid']); // ❌ 컴파일 에러
    // const result5 = sortBy(users, 'invalid'); // ❌ 컴파일 에러

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result3).toBeDefined();
  });
});
