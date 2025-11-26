import { distinct, distinctBy, distinctValues } from '../distinct';

describe('distinct', () => {
  describe('기본 동작', () => {
    it('빈 배열은 빈 배열을 반환한다', () => {
      const result = distinct([], ['id']);
      expect(result).toEqual([]);
    });

    it('단일 키로 중복을 제거한다', () => {
      const data = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice (Duplicate)' },
      ];

      const result = distinct(data, ['id']);

      expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });

    it('복수 키로 중복을 제거한다', () => {
      const data = [
        { category: 'A', name: 'P1', price: 100 },
        { category: 'A', name: 'P2', price: 200 },
        { category: 'A', name: 'P1', price: 150 }, // category + name 중복
        { category: 'B', name: 'P1', price: 300 }, // category 다름, 중복 아님
      ];

      const result = distinct(data, ['category', 'name']);

      expect(result).toEqual([
        { category: 'A', name: 'P1', price: 100 },
        { category: 'A', name: 'P2', price: 200 },
        { category: 'B', name: 'P1', price: 300 },
      ]);
    });

    it('첫 번째로 등장한 항목만 유지한다', () => {
      const data = [
        { id: 1, value: 'first' },
        { id: 1, value: 'second' },
        { id: 1, value: 'third' },
      ];

      const result = distinct(data, ['id']);

      expect(result).toEqual([{ id: 1, value: 'first' }]);
    });
  });

  describe('깊은 비교 (객체/배열 값)', () => {
    it('배열 값을 정확히 비교한다', () => {
      const data = [
        { id: 1, tags: ['a', 'b'] },
        { id: 2, tags: ['c'] },
        { id: 1, tags: ['a', 'b'] }, // 중복 (배열 내용 동일)
        { id: 1, tags: ['a', 'c'] }, // 중복 아님 (배열 내용 다름)
      ];

      const result = distinct(data, ['id', 'tags']);

      expect(result).toEqual([
        { id: 1, tags: ['a', 'b'] },
        { id: 2, tags: ['c'] },
        { id: 1, tags: ['a', 'c'] },
      ]);
    });

    it('객체 값을 정확히 비교한다', () => {
      const data = [
        { id: 1, meta: { type: 'A', count: 10 } },
        { id: 2, meta: { type: 'B', count: 20 } },
        { id: 1, meta: { type: 'A', count: 10 } }, // 중복 (객체 내용 동일)
        { id: 1, meta: { type: 'A', count: 15 } }, // 중복 아님 (객체 내용 다름)
      ];

      const result = distinct(data, ['id', 'meta']);

      expect(result).toEqual([
        { id: 1, meta: { type: 'A', count: 10 } },
        { id: 2, meta: { type: 'B', count: 20 } },
        { id: 1, meta: { type: 'A', count: 15 } },
      ]);
    });

    it('중첩 배열을 정확히 비교한다', () => {
      const data = [
        { id: 1, matrix: [[1, 2], [3, 4]] },
        { id: 1, matrix: [[1, 2], [3, 4]] }, // 중복
        { id: 1, matrix: [[1, 2], [3, 5]] }, // 중복 아님
      ];

      const result = distinct(data, ['id', 'matrix']);

      expect(result).toEqual([
        { id: 1, matrix: [[1, 2], [3, 4]] },
        { id: 1, matrix: [[1, 2], [3, 5]] },
      ]);
    });

    it('중첩 객체를 정확히 비교한다', () => {
      const data = [
        { id: 1, user: { profile: { name: 'Alice', age: 30 } } },
        { id: 1, user: { profile: { name: 'Alice', age: 30 } } }, // 중복
        { id: 1, user: { profile: { name: 'Alice', age: 31 } } }, // 중복 아님
      ];

      const result = distinct(data, ['id', 'user']);

      expect(result).toEqual([
        { id: 1, user: { profile: { name: 'Alice', age: 30 } } },
        { id: 1, user: { profile: { name: 'Alice', age: 31 } } },
      ]);
    });
  });

  describe('특수 값 처리', () => {
    it('null 값을 정확히 비교한다', () => {
      const data = [
        { id: 1, value: null },
        { id: 2, value: 'test' },
        { id: 1, value: null }, // 중복
      ];

      const result = distinct(data, ['id', 'value']);

      expect(result).toEqual([
        { id: 1, value: null },
        { id: 2, value: 'test' },
      ]);
    });

    it('undefined 값을 정확히 비교한다', () => {
      const data = [
        { id: 1, value: undefined },
        { id: 2, value: 'test' },
        { id: 1, value: undefined }, // 중복
      ];

      const result = distinct(data, ['id', 'value']);

      expect(result).toEqual([
        { id: 1, value: undefined },
        { id: 2, value: 'test' },
      ]);
    });

    it('null과 undefined를 구분한다', () => {
      const data = [
        { id: 1, value: null },
        { id: 1, value: undefined }, // 중복 아님 (null ≠ undefined)
      ];

      const result = distinct(data, ['id', 'value']);

      expect(result).toEqual([
        { id: 1, value: null },
        { id: 1, value: undefined },
      ]);
    });

    it('0과 false를 구분한다', () => {
      const data = [
        { id: 1, value: 0 },
        { id: 1, value: false }, // 중복 아님 (0 ≠ false)
      ];

      const result = distinct(data, ['id', 'value']);

      expect(result).toEqual([
        { id: 1, value: 0 },
        { id: 1, value: false },
      ]);
    });

    it('빈 문자열과 null을 구분한다', () => {
      const data = [
        { id: 1, value: '' },
        { id: 1, value: null }, // 중복 아님 ('' ≠ null)
      ];

      const result = distinct(data, ['id', 'value']);

      expect(result).toEqual([
        { id: 1, value: '' },
        { id: 1, value: null },
      ]);
    });
  });

  describe('빈 배열/객체 처리', () => {
    it('빈 배열을 정확히 비교한다', () => {
      const data = [
        { id: 1, tags: [] },
        { id: 1, tags: [] }, // 중복 (빈 배열 동일)
        { id: 1, tags: ['a'] }, // 중복 아님
      ];

      const result = distinct(data, ['id', 'tags']);

      expect(result).toEqual([
        { id: 1, tags: [] },
        { id: 1, tags: ['a'] },
      ]);
    });

    it('빈 객체를 정확히 비교한다', () => {
      const data = [
        { id: 1, meta: {} },
        { id: 1, meta: {} }, // 중복 (빈 객체 동일)
        { id: 1, meta: { type: 'A' } }, // 중복 아님
      ];

      const result = distinct(data, ['id', 'meta']);

      expect(result).toEqual([
        { id: 1, meta: {} },
        { id: 1, meta: { type: 'A' } },
      ]);
    });
  });

  describe('배열 순서', () => {
    it('배열 순서가 다르면 다른 값으로 판단한다', () => {
      const data = [
        { id: 1, tags: ['a', 'b'] },
        { id: 1, tags: ['b', 'a'] }, // 중복 아님 (순서 다름)
      ];

      const result = distinct(data, ['id', 'tags']);

      expect(result).toEqual([
        { id: 1, tags: ['a', 'b'] },
        { id: 1, tags: ['b', 'a'] },
      ]);
    });
  });

  describe('객체 키 순서', () => {
    it('객체 키 순서와 무관하게 비교한다', () => {
      const data = [
        { id: 1, meta: { a: 1, b: 2 } },
        { id: 1, meta: { b: 2, a: 1 } }, // 중복 (키 순서 무관)
      ];

      const result = distinct(data, ['id', 'meta']);

      expect(result).toEqual([{ id: 1, meta: { a: 1, b: 2 } }]);
    });
  });
});

describe('distinctBy', () => {
  it('단일 키로 중복을 제거한다', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Charlie' },
    ];

    const result = distinctBy(data, 'id');

    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
  });

  it('객체 값도 정확히 비교한다', () => {
    const data = [
      { id: 1, meta: { type: 'A' } },
      { id: 2, meta: { type: 'B' } },
      { id: 1, meta: { type: 'A' } },
    ];

    const result = distinctBy(data, 'id');

    expect(result).toEqual([
      { id: 1, meta: { type: 'A' } },
      { id: 2, meta: { type: 'B' } },
    ]);
  });
});

describe('distinctValues', () => {
  it('숫자 배열의 중복을 제거한다', () => {
    const data = [1, 2, 2, 3, 1];
    const result = distinctValues(data);
    expect(result).toEqual([1, 2, 3]);
  });

  it('문자열 배열의 중복을 제거한다', () => {
    const data = ['a', 'b', 'a', 'c'];
    const result = distinctValues(data);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('null과 undefined를 포함한 배열을 처리한다', () => {
    const data = [1, null, 2, null, undefined, 1, undefined];
    const result = distinctValues(data);
    expect(result).toEqual([1, null, 2, undefined]);
  });

  it('빈 배열은 빈 배열을 반환한다', () => {
    const result = distinctValues([]);
    expect(result).toEqual([]);
  });
});
