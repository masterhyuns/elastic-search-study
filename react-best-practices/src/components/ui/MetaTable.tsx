import React, { useState, useMemo } from 'react';
import {
  TableConfig,
  ColumnConfig,
  HeaderTreeNode,
  FlatHeaderRow,
  HeaderCell,
  FlatBodyRow,
  SummaryColumnConfig,
} from '@/types/meta-table.types';

/**
 * ============================================================================
 * 헬퍼 함수들
 * ============================================================================
 */

/**
 * Key로 객체/배열 값 추출 (중첩 지원)
 *
 * 지원 형식:
 * - 단순 키: "name" → obj.name
 * - 중첩 객체: "user.address.city" → obj.user.address.city
 * - 배열 인덱스: "items.0.name" → obj.items[0].name
 * - 함수: (row) => row.firstName + ' ' + row.lastName
 *
 * @param row - 원본 데이터 행
 * @param key - 접근할 키 (문자열 또는 함수)
 * @returns 추출된 값
 */
const getValueByKey = (row: any, key: string | ((row: any) => any)): any => {
  // 함수형 accessor
  if (typeof key === 'function') {
    return key(row);
  }

  // 점 표기법 파싱 (예: "user.address.city")
  const keys = key.split('.');
  let value = row;

  for (const k of keys) {
    if (value == null) return undefined;
    value = value[k];
  }

  return value;
};

/**
 * headerGroup을 파싱해서 계층적 트리 구조 생성
 *
 * 알고리즘:
 * 1. 각 컬럼의 headerGroup을 점으로 분리 (예: "Contact.Phone")
 * 2. 동일한 경로를 가진 노드들을 병합 (예: "Contact.Phone.Mobile", "Contact.Phone.Home")
 * 3. 리프 노드에 원본 컬럼 설정 저장
 *
 * @param columns - 컬럼 설정 배열
 * @returns 계층적 헤더 트리 (루트 노드 배열)
 */
const buildHeaderTree = (columns: ColumnConfig[]): HeaderTreeNode[] => {
  const rootNodes: HeaderTreeNode[] = [];
  const nodeMap = new Map<string, HeaderTreeNode>(); // path → node

  columns.forEach((column) => {
    if (column.headerGroup) {
      // 계층적 헤더: "Contact.Phone" → ["Contact", "Phone", column.label]
      const levels = [...column.headerGroup.split('.'), column.label];
      let currentPath = '';
      let parentNode: HeaderTreeNode | null = null;

      levels.forEach((levelName, index) => {
        currentPath += (currentPath ? '.' : '') + levelName;

        // 노드가 없으면 생성
        if (!nodeMap.has(currentPath)) {
          const newNode: HeaderTreeNode = {
            name: levelName,
            children: [],
            colSpan: 0, // 나중에 계산
            depth: index,
            column: index === levels.length - 1 ? column : undefined, // 리프 노드만 컬럼 저장
          };

          nodeMap.set(currentPath, newNode);

          // 부모-자식 관계 설정
          if (parentNode) {
            parentNode.children.push(newNode);
          } else {
            rootNodes.push(newNode); // 루트 노드
          }
        }

        parentNode = nodeMap.get(currentPath)!;
      });
    } else {
      // 단순 헤더: 직접 루트에 추가
      const node: HeaderTreeNode = {
        name: column.label,
        children: [],
        colSpan: 1,
        depth: 0,
        column,
      };
      rootNodes.push(node);
    }
  });

  // colSpan 계산 (재귀)
  const calculateColSpan = (node: HeaderTreeNode): number => {
    if (node.children.length === 0) {
      node.colSpan = 1; // 리프 노드
      return 1;
    }

    node.colSpan = node.children.reduce(
      (sum, child) => sum + calculateColSpan(child),
      0
    );
    return node.colSpan;
  };

  rootNodes.forEach(calculateColSpan);

  return rootNodes;
};

/**
 * 헤더 트리의 최대 깊이 계산
 *
 * @param nodes - 헤더 트리 노드 배열
 * @returns 최대 깊이
 */
const getHeaderMaxDepth = (nodes: HeaderTreeNode[]): number => {
  let maxDepth = 0;

  const traverse = (node: HeaderTreeNode, currentDepth: number) => {
    maxDepth = Math.max(maxDepth, currentDepth);
    node.children.forEach((child) => traverse(child, currentDepth + 1));
  };

  nodes.forEach((node) => traverse(node, 0));
  return maxDepth;
};

/**
 * 헤더 트리를 평탄화된 행 배열로 변환 (colSpan/rowSpan 계산)
 *
 * 알고리즘:
 * - 부모 노드: colSpan = 자식들의 colSpan 합, rowSpan = 1
 * - 리프 노드: colSpan = 1, rowSpan = (최대 깊이 - 현재 깊이 + 1)
 *
 * @param nodes - 헤더 트리 노드 배열
 * @param maxDepth - 최대 깊이
 * @returns 평탄화된 헤더 행 배열
 */
const flattenHeaderTree = (
  nodes: HeaderTreeNode[],
  maxDepth: number
): FlatHeaderRow[] => {
  const rows: FlatHeaderRow[] = Array.from({ length: maxDepth + 1 }, (_, depth) => ({
    cells: [],
    depth,
  }));

  const traverse = (node: HeaderTreeNode, depth: number) => {
    const isLeaf = node.children.length === 0;
    const rowSpan = isLeaf ? maxDepth - depth + 1 : 1;

    rows[depth].cells.push({
      label: node.name,
      colSpan: node.colSpan,
      rowSpan,
      column: node.column,
    });

    // 자식 노드 순회
    node.children.forEach((child) => traverse(child, depth + 1));
  };

  nodes.forEach((node) => traverse(node, 0));

  return rows;
};

/**
 * groupBy 설정에 따라 각 행의 rowSpan 계산
 *
 * 알고리즘:
 * 1. groupBy: true인 컬럼들을 순서대로 처리
 * 2. 연속된 동일 값을 찾아 병합 범위 결정
 * 3. 왼쪽 컬럼들도 모두 병합 중이어야 현재 컬럼 병합 가능
 *
 * @param data - 원본 데이터 배열
 * @param columns - 컬럼 설정 배열
 * @returns 각 행의 rowSpan 정보 맵 배열
 */
const calculateRowSpans = (
  data: any[],
  columns: ColumnConfig[]
): Map<string, number>[] => {
  const rowSpans: Map<string, number>[] = data.map(() => new Map());

  // groupBy 컬럼만 추출 (순서 유지)
  const groupByColumns = columns.filter((col) => col.groupBy);

  groupByColumns.forEach((column, colIndex) => {
    const key = typeof column.key === 'string' ? column.key : `col_${colIndex}`;
    let spanStart = 0;

    for (let i = 1; i <= data.length; i++) {
      // 병합 조건 체크
      const shouldMerge =
        i < data.length &&
        // 현재 컬럼 값이 같고
        getValueByKey(data[i], column.key) ===
          getValueByKey(data[spanStart], column.key) &&
        // 왼쪽 모든 groupBy 컬럼도 병합 중이어야 함
        groupByColumns.slice(0, colIndex).every((prevCol, prevColIndex) => {
          const prevKey =
            typeof prevCol.key === 'string' ? prevCol.key : `col_${prevColIndex}`;
          return (
            getValueByKey(data[i], prevCol.key) ===
            getValueByKey(data[spanStart], prevCol.key)
          );
        });

      if (!shouldMerge) {
        // 병합 종료: spanStart부터 i-1까지 병합
        const spanLength = i - spanStart;
        rowSpans[spanStart].set(key, spanLength);

        // 중간 행들은 rowSpan=0 (렌더링 스킵)
        for (let j = spanStart + 1; j < i; j++) {
          rowSpans[j].set(key, 0);
        }

        spanStart = i;
      }
    }
  });

  return rowSpans;
};

/**
 * Summary 값 계산
 *
 * @param data - 원본 데이터 배열
 * @param config - Summary 컬럼 설정
 * @param columnKey - 컬럼 key
 * @returns 계산된 값
 */
const calculateSummary = (
  data: any[],
  config: SummaryColumnConfig,
  columnKey: string | ((row: any) => any)
): any => {
  const values = data.map((row) => getValueByKey(row, columnKey));

  switch (config.type) {
    case 'sum':
      return values.reduce((sum, val) => sum + (Number(val) || 0), 0);
    case 'avg': {
      const sum = values.reduce((sum, val) => sum + (Number(val) || 0), 0);
      return sum / values.length;
    }
    case 'count':
      return values.length;
    case 'min':
      return Math.min(...values.map((v) => Number(v) || 0));
    case 'max':
      return Math.max(...values.map((v) => Number(v) || 0));
    case 'custom':
      if (!config.calculate) {
        throw new Error('custom type requires calculate function');
      }
      return config.calculate(
        data,
        typeof columnKey === 'string' ? columnKey : 'custom'
      );
    default:
      return null;
  }
};

/**
 * ============================================================================
 * MetaTable 컴포넌트
 * ============================================================================
 */

export interface MetaTableProps {
  /** 원본 데이터 배열 (있는 그대로) */
  data: any[];

  /** 테이블 설정 */
  config: TableConfig;

  /** 추가 className */
  className?: string;

  /** 추가 스타일 */
  style?: React.CSSProperties;
}

/**
 * Key 기반 config로 모든 데이터를 자동으로 테이블 렌더링
 *
 * 주요 특징:
 * - 데이터 변환 불필요: 원본 데이터 그대로 사용
 * - Key로 자동 접근: 중첩 객체, 배열 인덱스 지원
 * - 자동 rowSpan: groupBy 옵션으로 연속된 동일 값 병합
 * - 계층적 헤더: headerGroup으로 colSpan/rowSpan 자동 계산
 * - 체크박스, Summary, 정렬 등 다양한 기능
 *
 * @example
 * ```tsx
 * const data = [
 *   { category: 'A', name: 'John', age: 30 },
 *   { category: 'A', name: 'Jane', age: 25 }
 * ];
 *
 * const config = {
 *   columns: [
 *     { key: 'category', label: 'Category', groupBy: true },
 *     { key: 'name', label: 'Name' },
 *     { key: 'age', label: 'Age', render: (v) => `${v}세` }
 *   ]
 * };
 *
 * <MetaTable data={data} config={config} />
 * ```
 */
export const MetaTable: React.FC<MetaTableProps> = ({
  data,
  config,
  className,
  style,
}) => {
  // ============================================================================
  // State 관리
  // ============================================================================

  // 체크박스 선택 상태
  const [selectedRows, setSelectedRows] = useState<Set<number>>(
    config.features?.checkbox?.defaultSelected || new Set()
  );

  // ============================================================================
  // 헤더 생성 (계층적 구조 → 평탄화)
  // ============================================================================

  const headerRows = useMemo(() => {
    const tree = buildHeaderTree(config.columns);
    const maxDepth = getHeaderMaxDepth(tree);
    return flattenHeaderTree(tree, maxDepth);
  }, [config.columns]);

  // ============================================================================
  // Body 생성 (rowSpan 계산)
  // ============================================================================

  const bodyRows = useMemo((): FlatBodyRow[] => {
    const rowSpans = calculateRowSpans(data, config.columns);

    return data.map((row, index) => ({
      data: row,
      index,
      rowSpans: rowSpans[index],
      selected: selectedRows.has(index),
    }));
  }, [data, config.columns, selectedRows]);

  // ============================================================================
  // Summary 생성
  // ============================================================================

  const summaryData = useMemo(() => {
    if (!config.features?.summary) return null;

    const summaries = new Map<string, any>();

    config.columns.forEach((column, colIndex) => {
      // 함수형 key는 colIndex로 구분
      const key = typeof column.key === 'string' ? column.key : `col_${colIndex}`;
      const summaryConfig = config.features!.summary!.columns[key];

      if (summaryConfig) {
        const value = calculateSummary(data, summaryConfig, column.key);
        summaries.set(key, { value, config: summaryConfig });
      }
    });

    return summaries;
  }, [data, config]);

  // ============================================================================
  // 이벤트 핸들러
  // ============================================================================

  const handleCheckboxChange = (rowIndex: number) => {
    const newSelected = new Set(selectedRows);

    if (config.features?.checkbox?.singleSelect) {
      // 단일 선택 모드
      newSelected.clear();
      newSelected.add(rowIndex);
    } else {
      // 다중 선택 모드
      if (newSelected.has(rowIndex)) {
        newSelected.delete(rowIndex);
      } else {
        newSelected.add(rowIndex);
      }
    }

    setSelectedRows(newSelected);

    // 콜백 호출
    if (config.features?.checkbox?.onSelectionChange) {
      const selectedData = Array.from(newSelected).map((idx) => data[idx]);
      config.features.checkbox.onSelectionChange(newSelected, selectedData);
    }
  };

  const handleHeaderCheckboxChange = () => {
    const allSelected = selectedRows.size === data.length;
    const newSelected = allSelected ? new Set<number>() : new Set(data.map((_, i) => i));

    setSelectedRows(newSelected);

    if (config.features?.checkbox?.onSelectionChange) {
      const selectedData = Array.from(newSelected).map((idx) => data[idx]);
      config.features.checkbox.onSelectionChange(newSelected, selectedData);
    }
  };

  const handleRowClick = (row: any, rowIndex: number) => {
    if (config.features?.onRowClick) {
      config.features.onRowClick(row, rowIndex);
    }
  };

  // ============================================================================
  // 렌더링 헬퍼
  // ============================================================================

  const renderCheckboxCell = (rowIndex?: number, headerRowSpan?: number) => {
    const isHeader = rowIndex === undefined;

    if (isHeader && !config.features?.checkbox?.showHeaderCheckbox) {
      return <th style={{ width: 50, border: '1px solid #ddd' }} rowSpan={headerRowSpan} />;
    }

    return isHeader ? (
      <th
        style={{ width: 50, border: '1px solid #ddd', textAlign: 'center' }}
        rowSpan={headerRowSpan}
      >
        <input
          type="checkbox"
          checked={selectedRows.size === data.length && data.length > 0}
          onChange={handleHeaderCheckboxChange}
        />
      </th>
    ) : (
      <td style={{ width: 50, border: '1px solid #ddd', textAlign: 'center' }}>
        <input
          type={config.features?.checkbox?.singleSelect ? 'radio' : 'checkbox'}
          checked={selectedRows.has(rowIndex!)}
          onChange={() => handleCheckboxChange(rowIndex!)}
        />
      </td>
    );
  };

  // ============================================================================
  // 렌더링
  // ============================================================================

  const hasCheckbox = config.features?.checkbox;
  const checkboxPosition = config.features?.checkbox?.position || 'left';
  const hasSummary = config.features?.summary;
  const summaryPosition = config.features?.summary?.position || 'bottom';

  return (
    <table
      className={className}
      style={{
        borderCollapse: 'collapse',
        width: '100%',
        ...config.features?.styling?.customStyles?.table,
        ...style,
      }}
    >
      {/* 헤더 */}
      <thead className={config.features?.styling?.header}>
        {headerRows.map((headerRow, rowIndex) => (
          <tr key={rowIndex}>
            {/* 체크박스 (좌측) - 첫 행에만 렌더링, rowSpan으로 모든 헤더 행 커버 */}
            {hasCheckbox && checkboxPosition === 'left' && rowIndex === 0 &&
              renderCheckboxCell(undefined, headerRows.length)}

            {/* 헤더 셀들 */}
            {headerRow.cells.map((cell, cellIndex) => (
              <th
                key={cellIndex}
                colSpan={cell.colSpan}
                rowSpan={cell.rowSpan}
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                  textAlign: cell.column?.align || 'center',
                  verticalAlign: 'middle',
                  width: cell.column?.width,
                  minWidth: cell.column?.minWidth,
                  maxWidth: cell.column?.maxWidth,
                  ...config.features?.styling?.customStyles?.header,
                }}
              >
                {cell.column?.headerRender
                  ? cell.column.headerRender()
                  : cell.label}
              </th>
            ))}

            {/* 체크박스 (우측) - 첫 행에만 렌더링, rowSpan으로 모든 헤더 행 커버 */}
            {hasCheckbox && checkboxPosition === 'right' && rowIndex === 0 &&
              renderCheckboxCell(undefined, headerRows.length)}
          </tr>
        ))}
      </thead>

      {/* Body */}
      <tbody className={config.features?.styling?.body}>
        {/* Summary (상단) */}
        {hasSummary && summaryPosition === 'top' && (
          <tr
            className={config.features?.summary?.className}
            style={{
              fontWeight: 'bold',
              backgroundColor: '#fffacd',
              ...config.features?.summary?.style,
            }}
          >
            {hasCheckbox && checkboxPosition === 'left' && <td />}

            {config.columns.map((column, colIndex) => {
              const key =
                typeof column.key === 'string' ? column.key : `col_${colIndex}`;
              const summary = summaryData?.get(key);

              return (
                <td
                  key={colIndex}
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: summary?.config.align || column.align || 'left',
                  }}
                >
                  {summary ? (
                    <>
                      {summary.config.label && (
                        <span>{summary.config.label} </span>
                      )}
                      {summary.config.render
                        ? summary.config.render(summary.value)
                        : summary.value}
                    </>
                  ) : null}
                </td>
              );
            })}

            {hasCheckbox && checkboxPosition === 'right' && <td />}
          </tr>
        )}

        {/* 데이터 행들 */}
        {bodyRows.map((bodyRow, rowIndex) => {
          const rowClassName =
            typeof config.features?.styling?.row === 'function'
              ? config.features.styling.row(bodyRow.data, rowIndex)
              : config.features?.styling?.row;

          const shouldStripe =
            config.features?.striped && rowIndex % 2 === 1;

          return (
            <tr
              key={rowIndex}
              className={rowClassName}
              onClick={() => handleRowClick(bodyRow.data, rowIndex)}
              style={{
                backgroundColor: shouldStripe ? '#f9f9f9' : undefined,
                cursor: config.features?.onRowClick ? 'pointer' : undefined,
                ...config.features?.styling?.customStyles?.row,
              }}
            >
              {/* 체크박스 (좌측) */}
              {hasCheckbox &&
                checkboxPosition === 'left' &&
                renderCheckboxCell(rowIndex)}

              {/* 데이터 셀들 */}
              {config.columns.map((column, colIndex) => {
                const value = getValueByKey(bodyRow.data, column.key);
                const key =
                  typeof column.key === 'string' ? column.key : `col_${colIndex}`;
                const rowSpan = bodyRow.rowSpans.get(key) ?? 1;

                // rowSpan=0이면 렌더링 스킵 (병합된 셀)
                if (rowSpan === 0) return null;

                const cellClassName =
                  typeof config.features?.styling?.cell === 'function'
                    ? config.features.styling.cell(
                        value,
                        bodyRow.data,
                        rowIndex,
                        colIndex
                      )
                    : config.features?.styling?.cell;

                return (
                  <td
                    key={colIndex}
                    rowSpan={rowSpan}
                    className={cellClassName}
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      textAlign: column.align || 'left',
                      verticalAlign: 'middle',
                      backgroundColor:
                        column.groupBy && colIndex === 0 ? '#f0f0f0' : undefined,
                      ...config.features?.styling?.customStyles?.cell,
                    }}
                  >
                    {column.render
                      ? column.render(value, bodyRow.data, rowIndex, colIndex)
                      : value ?? '-'}
                  </td>
                );
              })}

              {/* 체크박스 (우측) */}
              {hasCheckbox &&
                checkboxPosition === 'right' &&
                renderCheckboxCell(rowIndex)}
            </tr>
          );
        })}

        {/* Summary (하단) */}
        {hasSummary && summaryPosition === 'bottom' && (
          <tr
            className={config.features?.summary?.className}
            style={{
              fontWeight: 'bold',
              backgroundColor: '#fffacd',
              ...config.features?.summary?.style,
            }}
          >
            {hasCheckbox && checkboxPosition === 'left' && <td />}

            {config.columns.map((column, colIndex) => {
              const key =
                typeof column.key === 'string' ? column.key : `col_${colIndex}`;
              const summary = summaryData?.get(key);

              return (
                <td
                  key={colIndex}
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: summary?.config.align || column.align || 'left',
                  }}
                >
                  {summary ? (
                    <>
                      {summary.config.label && (
                        <span>{summary.config.label} </span>
                      )}
                      {summary.config.render
                        ? summary.config.render(summary.value)
                        : summary.value}
                    </>
                  ) : null}
                </td>
              );
            })}

            {hasCheckbox && checkboxPosition === 'right' && <td />}
          </tr>
        )}
      </tbody>
    </table>
  );
};
