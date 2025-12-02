/**
 * Multi-Series Scatter Chart 예제
 *
 * 여러 그룹의 데이터를 하나의 차트에 표시하는 예제입니다.
 * 붓꽃(Iris) 데이터셋을 사용하여 3가지 품종을 비교합니다.
 * 머신러닝 분류 문제에서 자주 사용되는 데이터셋입니다.
 */

'use client';

import { useMemo } from 'react';
import { useECharts } from '../useECharts';
import type { ScatterChartOption, ScatterDataPoint } from '../types';
import styles from '../basic/page.module.scss';

/**
 * 붓꽃 품종별 데이터
 * 실제 Iris 데이터셋을 단순화한 샘플입니다.
 */
const irisData = {
  // Setosa 품종
  setosa: [
    [5.1, 3.5],
    [4.9, 3.0],
    [4.7, 3.2],
    [4.6, 3.1],
    [5.0, 3.6],
    [5.4, 3.9],
    [4.6, 3.4],
    [5.0, 3.4],
    [4.4, 2.9],
    [4.9, 3.1],
    [5.4, 3.7],
    [4.8, 3.4],
    [4.8, 3.0],
    [4.3, 3.0],
    [5.8, 4.0],
    [5.7, 4.4],
    [5.4, 3.9],
    [5.1, 3.5],
    [5.7, 3.8],
    [5.1, 3.8],
  ] as ScatterDataPoint[],

  // Versicolor 품종
  versicolor: [
    [7.0, 3.2],
    [6.4, 3.2],
    [6.9, 3.1],
    [5.5, 2.3],
    [6.5, 2.8],
    [5.7, 2.8],
    [6.3, 3.3],
    [4.9, 2.4],
    [6.6, 2.9],
    [5.2, 2.7],
    [5.0, 2.0],
    [5.9, 3.0],
    [6.0, 2.2],
    [6.1, 2.9],
    [5.6, 2.9],
    [6.7, 3.1],
    [5.6, 3.0],
    [5.8, 2.7],
    [6.2, 2.2],
    [5.6, 2.5],
  ] as ScatterDataPoint[],

  // Virginica 품종
  virginica: [
    [6.3, 3.3],
    [5.8, 2.7],
    [7.1, 3.0],
    [6.3, 2.9],
    [6.5, 3.0],
    [7.6, 3.0],
    [4.9, 2.5],
    [7.3, 2.9],
    [6.7, 2.5],
    [7.2, 3.6],
    [6.5, 3.2],
    [6.4, 2.7],
    [6.8, 3.0],
    [5.7, 2.5],
    [5.8, 2.8],
    [6.4, 3.2],
    [6.5, 3.0],
    [7.7, 3.8],
    [7.7, 2.6],
    [6.0, 2.2],
  ] as ScatterDataPoint[],
};

const MultiSeriesScatterPage = () => {
  /**
   * 멀티 시리즈 차트 옵션
   * 각 품종을 별도의 시리즈로 표현하여 비교 분석을 용이하게 합니다.
   */
  const option: ScatterChartOption = useMemo(
    () => ({
      title: {
        text: '붓꽃 품종별 꽃받침 크기 비교',
        subtext: 'Iris Dataset - Multi-Series Scatter Chart',
        left: 'center',
      },

      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '20%',
        containLabel: true,
      },

      // 범례 설정
      // 각 시리즈를 클릭하여 표시/숨김 가능
      legend: {
        data: ['Setosa', 'Versicolor', 'Virginica'],
        top: '10%',
        left: 'center',
      },

      // X축: 꽃받침 길이
      xAxis: {
        type: 'value',
        name: '꽃받침 길이 (cm)',
        nameLocation: 'middle',
        nameGap: 30,
        min: 4,
        max: 8,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed' },
        },
      },

      // Y축: 꽃받침 너비
      yAxis: {
        type: 'value',
        name: '꽃받침 너비 (cm)',
        nameLocation: 'middle',
        nameGap: 40,
        min: 1.5,
        max: 4.5,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed' },
        },
      },

      // 툴팁
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const [length, width] = params.value;
          return `
            <strong>${params.seriesName}</strong><br/>
            꽃받침 길이: ${length}cm<br/>
            꽃받침 너비: ${width}cm
          `;
        },
      },

      // 여러 Scatter 시리즈
      series: [
        {
          name: 'Setosa',
          type: 'scatter',
          data: irisData.setosa,
          symbolSize: 10,
          itemStyle: {
            color: '#5470c6', // 파랑
            opacity: 0.7,
          },
          emphasis: {
            focus: 'series', // 시리즈 전체 강조
            itemStyle: {
              borderColor: '#333',
              borderWidth: 2,
            },
          },
        },
        {
          name: 'Versicolor',
          type: 'scatter',
          data: irisData.versicolor,
          symbolSize: 10,
          itemStyle: {
            color: '#91cc75', // 초록
            opacity: 0.7,
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderColor: '#333',
              borderWidth: 2,
            },
          },
        },
        {
          name: 'Virginica',
          type: 'scatter',
          data: irisData.virginica,
          symbolSize: 10,
          itemStyle: {
            color: '#ee6666', // 빨강
            opacity: 0.7,
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderColor: '#333',
              borderWidth: 2,
            },
          },
        },
      ],

      toolbox: {
        feature: {
          saveAsImage: {},
          dataZoom: {},
          restore: {},
        },
      },
    }),
    []
  );

  const chartRef = useECharts(option);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Multi-Series Scatter Chart</h1>
        <p>여러 그룹의 데이터를 하나의 차트에 표시하여 비교 분석</p>
      </div>

      <div className={styles.chartWrapper}>
        <div ref={chartRef} className={styles.chart} />
      </div>

      <div className={styles.explanation}>
        <h2>코드 설명</h2>
        <div className={styles.codeBlock}>
          <h3>1. 시리즈 배열 구조</h3>
          <pre>
            {`// series 배열에 여러 개의 scatter 시리즈 추가
series: [
  {
    name: 'Setosa',
    type: 'scatter',
    data: [...],
    itemStyle: { color: '#5470c6' }
  },
  {
    name: 'Versicolor',
    type: 'scatter',
    data: [...],
    itemStyle: { color: '#91cc75' }
  },
  {
    name: 'Virginica',
    type: 'scatter',
    data: [...],
    itemStyle: { color: '#ee6666' }
  }
]`}
          </pre>

          <h3>2. 범례(Legend) 인터랙션</h3>
          <pre>
            {`// 범례 설정으로 시리즈별 표시/숨김 가능
legend: {
  data: ['Setosa', 'Versicolor', 'Virginica'],
  top: '10%',
  left: 'center'
}

// 범례를 클릭하면 해당 시리즈를 표시하거나 숨길 수 있습니다.`}
          </pre>

          <h3>3. 시리즈 강조 효과</h3>
          <pre>
            {`// emphasis.focus: 'series' - 해당 시리즈 전체 강조
emphasis: {
  focus: 'series', // 'self'는 개별 점만 강조
  itemStyle: {
    borderColor: '#333',
    borderWidth: 2
  }
}`}
          </pre>

          <h3>4. 성능 최적화 팁</h3>
          <ul>
            <li>
              <strong>large 옵션</strong> - 대량 데이터(1만 개 이상)일 때는 large:
              true 설정
            </li>
            <li>
              <strong>largeThreshold</strong> - 대량 렌더링 모드 전환 임계값 설정
            </li>
            <li>
              <strong>progressive</strong> - 점진적 렌더링으로 초기 로딩 속도 개선
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.features}>
        <h2>주요 기능</h2>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <h3>🎯 범례 인터랙션</h3>
            <p>
              범례를 클릭하면 해당 그룹을 표시/숨김할 수 있어 특정 그룹에
              집중하여 분석할 수 있습니다.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>🎨 그룹별 색상 구분</h3>
            <p>
              각 그룹마다 다른 색상을 사용하여 시각적으로 쉽게 구분할 수
              있습니다.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>📊 클러스터링 분석</h3>
            <p>
              데이터의 분포를 통해 각 그룹이 어떻게 클러스터를 형성하는지 확인할
              수 있습니다.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>✨ 시리즈 강조</h3>
            <p>
              특정 그룹에 마우스를 올리면 해당 그룹 전체가 강조되어 패턴 파악이
              쉽습니다.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <h2>💡 활용 사례</h2>
        <ul>
          <li>
            <strong>머신러닝</strong>: 분류 문제의 시각화 (클래스별 특징 분석)
          </li>
          <li>
            <strong>고객 세그먼트</strong>: 고객 그룹별 구매 패턴 비교
          </li>
          <li>
            <strong>제품 비교</strong>: 제품 카테고리별 성능/가격 비교
          </li>
          <li>
            <strong>A/B 테스트</strong>: 실험군/대조군의 결과 비교
          </li>
          <li>
            <strong>지역별 분석</strong>: 지역별 매출/인구 분포 비교
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MultiSeriesScatterPage;
