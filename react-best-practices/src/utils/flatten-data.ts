/**
 * 중첩 배열 데이터 평탄화 유틸리티
 *
 * MetaTable에서 사용하기 위해 중첩된 배열 구조를 플랫하게 변환합니다.
 * 배열 필드 이름에 관계없이 자동으로 감지하고 평탄화합니다.
 */

/**
 * 평탄화 설정
 */
export interface FlattenConfig {
  /**
   * 평탄화할 배열 필드 이름 (명시적 지정)
   *
   * @example ['items', 'products', 'children']
   * @default undefined (모든 배열 자동 감지)
   */
  arrayFields?: string[];

  /**
   * 배열 필드 자동 감지 여부
   *
   * true: 모든 배열 타입 필드를 자동으로 평탄화
   * false: arrayFields에 명시된 필드만 평탄화
   *
   * @default true
   */
  autoDetect?: boolean;

  /**
   * 원본 배열 필드 유지 여부
   *
   * true: 평탄화 후에도 원본 배열 필드를 그대로 유지
   * false: 원본 배열 필드 제거
   *
   * @default false
   */
  keepOriginal?: boolean;

  /**
   * 재귀 평탄화 최대 깊이
   *
   * 중첩된 배열을 몇 단계까지 평탄화할지 제한
   * 순환 참조 방지 및 성능 최적화
   *
   * @default 10
   */
  maxDepth?: number;

  /**
   * 부모 데이터 병합 방식
   *
   * 'spread': 부모 객체의 모든 필드를 자식에 복사 (기본값)
   * 'parent': 부모 객체를 _parent 필드에 저장
   * 'none': 부모 데이터 병합하지 않음
   *
   * @default 'spread'
   */
  mergeStrategy?: 'spread' | 'parent' | 'none';

  /**
   * 평탄화된 데이터에 메타 정보 추가 여부
   *
   * true: _depth, _path 등 메타 정보 추가
   * false: 메타 정보 추가하지 않음
   *
   * @default false
   */
  addMetadata?: boolean;
}

/**
 * 평탄화 결과 메타데이터
 */
export interface FlattenMetadata {
  /** 현재 깊이 (0부터 시작) */
  _depth: number;

  /** 원본 데이터 경로 (예: "0.products.1") */
  _path: string;

  /** 부모 객체 참조 (mergeStrategy: 'parent'일 때) */
  _parent?: any;
}

/**
 * 값이 배열인지 확인
 */
const isArray = (value: any): value is any[] => {
  return Array.isArray(value);
};

/**
 * 값이 객체인지 확인 (배열, null 제외)
 */
const isObject = (value: any): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * 중첩 배열 데이터 평탄화
 *
 * @param data - 원본 데이터 배열
 * @param config - 평탄화 설정
 * @returns 평탄화된 데이터 배열
 *
 * @example
 * ```typescript
 * // 1. 기본 사용 (모든 배열 자동 감지)
 * const data = [
 *   {
 *     category: 'A',
 *     products: [
 *       { name: 'P1', price: 100 },
 *       { name: 'P2', price: 200 }
 *     ]
 *   }
 * ];
 *
 * const flattened = flattenData(data);
 * // [
 * //   { category: 'A', name: 'P1', price: 100 },
 * //   { category: 'A', name: 'P2', price: 200 }
 * // ]
 *
 * // 2. 특정 배열 필드만 평탄화
 * flattenData(data, { arrayFields: ['products'], autoDetect: false });
 *
 * // 3. 메타데이터 포함
 * flattenData(data, { addMetadata: true });
 * // [
 * //   { category: 'A', name: 'P1', price: 100, _depth: 1, _path: '0.products.0' }
 * // ]
 *
 * // 4. 부모 데이터를 _parent에 저장
 * flattenData(data, { mergeStrategy: 'parent' });
 * // [
 * //   { name: 'P1', price: 100, _parent: { category: 'A' } }
 * // ]
 * ```
 */
export const flattenData = <T = any>(
  data: any[],
  config: FlattenConfig = {}
): T[] => {
  const {
    arrayFields,
    autoDetect = true,
    keepOriginal = false,
    maxDepth = 10,
    mergeStrategy = 'spread',
    addMetadata = false,
  } = config;

  const result: T[] = [];

  /**
   * 재귀적으로 객체를 평탄화
   */
  const flattenItem = (
    item: any,
    depth: number = 0,
    path: string = '',
    parent: any = null
  ): void => {
    // 최대 깊이 초과 방지
    if (depth > maxDepth) {
      console.warn(`[flattenData] Max depth ${maxDepth} exceeded at path: ${path}`);
      return;
    }

    // 배열이 아닌 경우 결과에 추가
    if (!isObject(item)) {
      return;
    }

    // 배열 필드 찾기
    const arrayFieldsInItem: string[] = [];

    Object.keys(item).forEach((key) => {
      if (!isArray(item[key])) return;

      // 자동 감지 모드이거나 명시적으로 지정된 필드만
      if (autoDetect || arrayFields?.includes(key)) {
        arrayFieldsInItem.push(key);
      }
    });

    // 배열 필드가 없으면 현재 아이템을 결과에 추가
    if (arrayFieldsInItem.length === 0) {
      const finalItem: any = mergeStrategy === 'none' ? { ...item } : item;

      // 부모 데이터 병합
      if (parent) {
        if (mergeStrategy === 'spread') {
          Object.assign(finalItem, parent, item);
        } else if (mergeStrategy === 'parent') {
          finalItem._parent = parent;
        }
      }

      // 메타데이터 추가
      if (addMetadata) {
        finalItem._depth = depth;
        finalItem._path = path;
      }

      result.push(finalItem);
      return;
    }

    // 배열 필드가 있으면 첫 번째 배열을 평탄화
    const firstArrayField = arrayFieldsInItem[0];
    const arrayValue = item[firstArrayField];

    // 부모 데이터 준비 (배열 필드 제외)
    const parentData: any = { ...item };
    if (!keepOriginal) {
      delete parentData[firstArrayField];
    }

    // 배열이 비어있으면 부모만 추가
    if (arrayValue.length === 0) {
      const finalItem: any = { ...parentData };

      if (parent && mergeStrategy === 'spread') {
        Object.assign(finalItem, parent, parentData);
      } else if (parent && mergeStrategy === 'parent') {
        finalItem._parent = parent;
      }

      if (addMetadata) {
        finalItem._depth = depth;
        finalItem._path = path;
      }

      result.push(finalItem);
      return;
    }

    // 배열의 각 요소를 재귀적으로 평탄화
    arrayValue.forEach((childItem: any, index: number) => {
      const childPath = path ? `${path}.${firstArrayField}.${index}` : `${index}`;

      if (isObject(childItem)) {
        // 자식이 객체면 부모 데이터와 병합 후 재귀
        const mergedChild = mergeStrategy === 'spread'
          ? { ...parentData, ...childItem }
          : childItem;

        const mergedParent = mergeStrategy === 'spread'
          ? (parent ? { ...parent, ...parentData } : parentData)
          : parentData;

        flattenItem(mergedChild, depth + 1, childPath, mergedParent);
      } else {
        // 자식이 primitive 값이면 부모에 추가
        const finalItem: any = { ...parentData };
        finalItem[firstArrayField] = childItem;

        if (parent && mergeStrategy === 'spread') {
          Object.assign(finalItem, parent, finalItem);
        } else if (parent && mergeStrategy === 'parent') {
          finalItem._parent = parent;
        }

        if (addMetadata) {
          finalItem._depth = depth;
          finalItem._path = childPath;
        }

        result.push(finalItem);
      }
    });
  };

  // 모든 데이터 아이템 평탄화
  data.forEach((item, index) => {
    flattenItem(item, 0, `${index}`);
  });

  return result;
};

/**
 * 트리 구조 데이터를 평탄화 (children 필드 특화)
 *
 * children 필드를 재귀적으로 평탄화하고, 부모-자식 관계를 유지합니다.
 *
 * @param data - 트리 구조 데이터
 * @param childrenKey - 자식 노드 필드 이름 (기본: 'children')
 * @param config - 평탄화 설정
 * @returns 평탄화된 데이터 배열
 *
 * @example
 * ```typescript
 * const tree = [
 *   {
 *     id: 1,
 *     name: 'Root',
 *     children: [
 *       { id: 2, name: 'Child 1' },
 *       { id: 3, name: 'Child 2', children: [
 *         { id: 4, name: 'Grandchild 1' }
 *       ]}
 *     ]
 *   }
 * ];
 *
 * const flattened = flattenTree(tree);
 * // [
 * //   { id: 1, name: 'Root', depth: 0, parentId: null },
 * //   { id: 2, name: 'Child 1', depth: 1, parentId: 1 },
 * //   { id: 3, name: 'Child 2', depth: 1, parentId: 1 },
 * //   { id: 4, name: 'Grandchild 1', depth: 2, parentId: 3 }
 * // ]
 * ```
 */
export const flattenTree = <T extends Record<string, any> = any>(
  data: T[],
  childrenKey: string = 'children',
  config: Omit<FlattenConfig, 'arrayFields'> = {}
): (T & { depth: number; parentId: any })[] => {
  return flattenData(data, {
    ...config,
    arrayFields: [childrenKey],
    autoDetect: false,
    addMetadata: true,
  }) as any;
};

/**
 * 다중 배열 필드를 Cartesian Product로 평탄화
 *
 * 여러 배열 필드가 있을 때 모든 조합을 생성합니다.
 *
 * @param data - 원본 데이터
 * @param arrayFields - 조합할 배열 필드 이름들
 * @returns 평탄화된 데이터 배열
 *
 * @example
 * ```typescript
 * const data = [
 *   {
 *     region: 'Asia',
 *     countries: ['Korea', 'Japan'],
 *     products: ['A', 'B']
 *   }
 * ];
 *
 * const result = flattenCartesian(data, ['countries', 'products']);
 * // [
 * //   { region: 'Asia', country: 'Korea', product: 'A' },
 * //   { region: 'Asia', country: 'Korea', product: 'B' },
 * //   { region: 'Asia', country: 'Japan', product: 'A' },
 * //   { region: 'Asia', country: 'Japan', product: 'B' }
 * // ]
 * ```
 */
export const flattenCartesian = <T = any>(
  data: any[],
  arrayFields: string[]
): T[] => {
  const result: T[] = [];

  const cartesianProduct = (
    item: any,
    fields: string[],
    current: any = {},
    index: number = 0
  ): void => {
    // 모든 필드를 처리했으면 결과에 추가
    if (index >= fields.length) {
      result.push({ ...item, ...current } as T);
      return;
    }

    const field = fields[index];
    const arrayValue = item[field];

    // 배열이 아니면 스킵
    if (!isArray(arrayValue)) {
      cartesianProduct(item, fields, current, index + 1);
      return;
    }

    // 배열의 각 요소에 대해 재귀
    arrayValue.forEach((value: any) => {
      // 배열 필드명에서 복수형 제거 (heuristic)
      const singularKey = field.endsWith('s') ? field.slice(0, -1) : field;

      cartesianProduct(
        item,
        fields,
        { ...current, [singularKey]: value },
        index + 1
      );
    });
  };

  data.forEach((item) => {
    // 배열 필드 제외한 베이스 객체
    const base: any = { ...item };
    arrayFields.forEach((field) => {
      delete base[field];
    });

    cartesianProduct(base, arrayFields);
  });

  return result;
};
