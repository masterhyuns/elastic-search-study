/**
 * ECharts Scatter Chart 타입 정의
 *
 * 이 파일은 scatter 차트에서 사용되는 모든 타입을 정의합니다.
 * ECharts의 복잡한 옵션 구조를 TypeScript로 안전하게 사용하기 위한 타입들입니다.
 */

/**
 * 2차원 좌표 데이터 포인트
 * [x좌표, y좌표] 형태의 튜플
 *
 * @example
 * const point: ScatterDataPoint = [100, 200]; // x=100, y=200
 */
export type ScatterDataPoint = [number, number];

/**
 * 3차원 데이터 포인트 (크기 정보 포함)
 * [x좌표, y좌표, 크기] 형태의 튜플
 * 버블 차트에서 사용되며, 세 번째 값은 원의 크기를 결정합니다.
 *
 * @example
 * const bubblePoint: BubbleDataPoint = [100, 200, 50]; // x=100, y=200, size=50
 */
export type BubbleDataPoint = [number, number, number];

/**
 * 확장된 데이터 포인트 (메타데이터 포함)
 * 좌표값 외에 추가 정보를 담을 수 있는 객체 형태
 *
 * @property value - 좌표값 또는 확장 데이터
 * @property itemStyle - 개별 포인트의 스타일 (색상, 테두리 등)
 * @property label - 개별 포인트의 레이블 설정
 *
 * @example
 * const extendedPoint: ExtendedDataPoint = {
 *   value: [100, 200],
 *   itemStyle: { color: 'red' },
 *   label: { show: true, formatter: '중요 데이터' }
 * };
 */
export interface ExtendedDataPoint {
  value: ScatterDataPoint | BubbleDataPoint;
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
  };
  label?: {
    show?: boolean;
    formatter?: string | ((params: any) => string);
    position?: 'top' | 'bottom' | 'left' | 'right' | 'inside';
  };
}

/**
 * Scatter 시리즈 데이터
 * 하나의 scatter 시리즈를 구성하는 데이터 배열
 *
 * 간단한 좌표값 배열 또는 확장된 데이터 포인트 배열을 사용할 수 있습니다.
 */
export type ScatterSeriesData = (ScatterDataPoint | BubbleDataPoint | ExtendedDataPoint)[];

/**
 * Scatter 시리즈 설정
 * ECharts의 scatter 시리즈 옵션을 정의합니다.
 *
 * @property name - 시리즈 이름 (범례에 표시됨)
 * @property type - 차트 타입 ('scatter' 고정)
 * @property data - 시리즈 데이터 배열
 * @property symbolSize - 심볼(점) 크기 (숫자 또는 동적 계산 함수)
 * @property itemStyle - 시리즈 전체의 스타일
 * @property emphasis - 마우스 오버 시 강조 스타일
 *
 * @example
 * const series: ScatterSeries = {
 *   name: '남성',
 *   type: 'scatter',
 *   data: [[170, 65], [180, 75]],
 *   symbolSize: 10,
 *   itemStyle: { color: '#5470c6' }
 * };
 */
export interface ScatterSeries {
  name: string;
  type: 'scatter';
  data: ScatterSeriesData;
  symbolSize?: number | ((value: any) => number);
  itemStyle?: {
    color?: string;
    opacity?: number;
  };
  emphasis?: {
    focus?: 'series' | 'self';
    itemStyle?: {
      borderColor?: string;
      borderWidth?: number;
    };
  };
  label?: {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'inside';
    formatter?: string | ((params: any) => string);
  };
}

/**
 * ECharts 축 설정
 * X축 또는 Y축의 공통 옵션
 *
 * @property type - 축 타입 ('value': 수치형, 'category': 카테고리형)
 * @property name - 축 이름 (축 레이블)
 * @property nameLocation - 축 이름 위치
 * @property min - 최소값 (숫자 또는 'dataMin')
 * @property max - 최대값 (숫자 또는 'dataMax')
 * @property splitLine - 분할선 표시 여부
 * @property axisLabel - 축 레이블 설정
 */
export interface AxisConfig {
  type?: 'value' | 'category' | 'time' | 'log';
  name?: string;
  nameLocation?: 'start' | 'middle' | 'end';
  min?: number | 'dataMin';
  max?: number | 'dataMax';
  splitLine?: {
    show?: boolean;
    lineStyle?: {
      type?: 'solid' | 'dashed' | 'dotted';
    };
  };
  axisLabel?: {
    formatter?: string | ((value: any) => string);
  };
}

/**
 * ECharts Scatter Chart 전체 옵션
 * scatter 차트의 모든 설정을 포함하는 최상위 타입
 *
 * @property title - 차트 제목
 * @property tooltip - 툴팁 설정
 * @property legend - 범례 설정
 * @property xAxis - X축 설정
 * @property yAxis - Y축 설정
 * @property series - 시리즈 배열 (여러 scatter 시리즈 가능)
 * @property grid - 그리드 레이아웃 설정
 * @property toolbox - 도구 모음 (저장, 확대/축소 등)
 *
 * @example
 * const option: ScatterChartOption = {
 *   title: { text: '키-몸무게 분포' },
 *   xAxis: { name: '키(cm)' },
 *   yAxis: { name: '몸무게(kg)' },
 *   series: [
 *     { name: '남성', type: 'scatter', data: [[170, 65]] }
 *   ]
 * };
 */
export interface ScatterChartOption {
  title?: {
    text?: string;
    subtext?: string;
    left?: 'left' | 'center' | 'right';
  };
  tooltip?: {
    trigger?: 'item' | 'axis';
    formatter?: string | ((params: any) => string);
    axisPointer?: {
      type?: 'line' | 'shadow' | 'cross';
    };
  };
  legend?: {
    data?: string[];
    orient?: 'horizontal' | 'vertical';
    left?: 'left' | 'center' | 'right';
    top?: 'top' | 'middle' | 'bottom' | number | string;
  };
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  series: any[]; // ScatterSeries 또는 LineSeries 등 다양한 시리즈 타입 허용
  grid?: {
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
    top?: string | number;
    containLabel?: boolean;
  };
  toolbox?: {
    feature?: {
      saveAsImage?: {};
      dataZoom?: {};
      restore?: {};
    };
  };
  [key: string]: any; // ECharts의 다양한 옵션 지원을 위한 인덱스 시그니처
}

/**
 * 통계 데이터 타입
 * scatter 차트 분석을 위한 통계 정보
 *
 * @property mean - 평균값
 * @property median - 중앙값
 * @property stdDev - 표준편차
 * @property correlation - 상관계수 (-1 ~ 1)
 */
export interface StatisticsData {
  mean: { x: number; y: number };
  median: { x: number; y: number };
  stdDev: { x: number; y: number };
  correlation: number;
}
