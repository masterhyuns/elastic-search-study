/**
 * Bubble Chart 예제
 *
 * 3차원 데이터를 표현하는 버블 차트입니다.
 * X, Y 좌표뿐만 아니라 점의 크기(세 번째 차원)를 통해 추가 정보를 시각화합니다.
 * 예제: 국가별 GDP, 인구, 1인당 GDP를 동시에 표현
 */

'use client';

import { useMemo } from 'react';
import { useECharts } from '../useECharts';
import type { ScatterChartOption, BubbleDataPoint } from '../types';
import styles from '../basic/page.module.scss';

/**
 * 국가 데이터 타입
 */
interface CountryData {
  name: string;
  gdp: number; // GDP (조 달러)
  population: number; // 인구 (백만 명)
  gdpPerCapita: number; // 1인당 GDP (천 달러)
}

/**
 * 샘플 데이터: 주요 국가들의 경제 지표
 * 실제 데이터를 단순화한 예제입니다.
 */
const countryData: CountryData[] = [
  { name: '미국', gdp: 25.5, population: 331, gdpPerCapita: 77 },
  { name: '중국', gdp: 17.9, population: 1412, gdpPerCapita: 12.7 },
  { name: '일본', gdp: 4.2, population: 125, gdpPerCapita: 33.8 },
  { name: '독일', gdp: 4.1, population: 83, gdpPerCapita: 49.8 },
  { name: '인도', gdp: 3.5, population: 1393, gdpPerCapita: 2.5 },
  { name: '영국', gdp: 3.1, population: 67, gdpPerCapita: 46.4 },
  { name: '프랑스', gdp: 2.9, population: 65, gdpPerCapita: 44.9 },
  { name: '캐나다', gdp: 2.1, population: 38, gdpPerCapita: 55.3 },
  { name: '이탈리아', gdp: 2.0, population: 60, gdpPerCapita: 33.7 },
  { name: '브라질', gdp: 1.9, population: 214, gdpPerCapita: 8.9 },
  { name: '한국', gdp: 1.8, population: 51, gdpPerCapita: 35.5 },
  { name: '러시아', gdp: 1.8, population: 144, gdpPerCapita: 12.5 },
  { name: '호주', gdp: 1.7, population: 26, gdpPerCapita: 65.4 },
  { name: '스페인', gdp: 1.4, population: 47, gdpPerCapita: 29.9 },
  { name: '멕시코', gdp: 1.3, population: 128, gdpPerCapita: 10.2 },
];

const BubbleChartPage = () => {
  /**
   * 차트 옵션 생성
   * 버블 크기는 1인당 GDP에 비례하도록 설정
   */
  const option: ScatterChartOption = useMemo(() => {
    /**
     * 데이터를 버블 차트 형식으로 변환
     * [GDP, 인구, 1인당GDP] 형태
     */
    const bubbleData: BubbleDataPoint[] = countryData.map((country) => [
      country.gdp,
      country.population,
      country.gdpPerCapita,
    ]);

    /**
     * 1인당 GDP에 따른 색상 결정
     * 선진국(높은 1인당 GDP)과 개발도상국을 시각적으로 구분
     */
    const getColor = (gdpPerCapita: number) => {
      if (gdpPerCapita > 50) return '#e74c3c'; // 빨강: 매우 높음
      if (gdpPerCapita > 30) return '#f39c12'; // 주황: 높음
      if (gdpPerCapita > 15) return '#3498db'; // 파랑: 중간
      return '#95a5a6'; // 회색: 낮음
    };

    return {
      title: {
        text: '국가별 GDP vs 인구 (버블 차트)',
        subtext: '버블 크기 = 1인당 GDP',
        left: 'center',
      },

      grid: {
        left: '12%',
        right: '12%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },

      // X축: GDP
      xAxis: {
        type: 'value',
        name: 'GDP (조 달러)',
        nameLocation: 'middle',
        nameGap: 30,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed' },
        },
      },

      // Y축: 인구
      yAxis: {
        type: 'value',
        name: '인구 (백만 명)',
        nameLocation: 'middle',
        nameGap: 50,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed' },
        },
      },

      // 툴팁
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const index = params.dataIndex;
          const country = countryData[index];
          return `
            <strong>${country.name}</strong><br/>
            GDP: ${country.gdp}조 달러<br/>
            인구: ${country.population}백만 명<br/>
            1인당 GDP: ${country.gdpPerCapita}천 달러
          `;
        },
      },

      // Scatter 시리즈
      series: [
        {
          name: '국가 경제 지표',
          type: 'scatter',
          data: bubbleData.map((item, index) => ({
            value: item,
            itemStyle: {
              color: getColor(item[2]), // 1인당 GDP로 색상 결정
              opacity: 0.8,
            },
            label: {
              show: true,
              formatter: () => countryData[index].name,
              position: 'top',
              fontSize: 10,
            },
          })),
          // 동적 심볼 크기: 1인당 GDP에 비례
          symbolSize: (value: any) => {
            const gdpPerCapita = value[2];
            return Math.sqrt(gdpPerCapita) * 5; // 제곱근으로 크기 조정 (시각적 균형)
          },
          emphasis: {
            focus: 'self',
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
    };
  }, []);

  const chartRef = useECharts(option);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Bubble Chart (버블 차트)</h1>
        <p>3차원 데이터를 점의 크기로 표현하는 scatter 차트 변형</p>
      </div>

      <div className={styles.chartWrapper}>
        <div ref={chartRef} className={styles.chart} />
      </div>

      <div className={styles.explanation}>
        <h2>코드 설명</h2>
        <div className={styles.codeBlock}>
          <h3>1. 데이터 구조</h3>
          <pre>
            {`// [x좌표, y좌표, 크기값] 형태
const bubbleData: BubbleDataPoint[] = [
  [25.5, 331, 77],  // 미국: GDP 25.5조, 인구 331백만, 1인당 GDP 77천불
  [17.9, 1412, 12.7], // 중국: GDP 17.9조, 인구 1412백만, 1인당 GDP 12.7천불
  ...
];`}
          </pre>

          <h3>2. 동적 심볼 크기</h3>
          <pre>
            {`// symbolSize에 함수 전달하여 데이터에 따라 크기 조절
symbolSize: (value: any) => {
  const gdpPerCapita = value[2]; // 세 번째 값
  return Math.sqrt(gdpPerCapita) * 5; // 제곱근으로 크기 균형 맞춤
}`}
          </pre>

          <h3>3. 조건부 색상</h3>
          <pre>
            {`// 1인당 GDP 수준에 따라 색상 변경
const getColor = (gdpPerCapita: number) => {
  if (gdpPerCapita > 50) return '#e74c3c'; // 선진국
  if (gdpPerCapita > 30) return '#f39c12'; // 중진국
  if (gdpPerCapita > 15) return '#3498db'; // 개도국
  return '#95a5a6'; // 저개발국
};`}
          </pre>

          <h3>4. 레이블 표시</h3>
          <ul>
            <li>
              <strong>label.show: true</strong> - 모든 점에 레이블 표시
            </li>
            <li>
              <strong>label.formatter</strong> - 국가명을 레이블로 표시
            </li>
            <li>
              <strong>label.position: 'top'</strong> - 점 위에 레이블 배치
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.features}>
        <h2>버블 차트의 장점</h2>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <h3>📊 다차원 데이터 표현</h3>
            <p>
              X, Y 좌표 외에 크기(Z)를 통해 3개 변수를 동시에 시각화할 수 있습니다.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>🎨 색상으로 4차원 표현</h3>
            <p>
              색상을 추가하면 4개의 변수를 하나의 차트에 표현할 수 있어 데이터
              인사이트를 빠르게 파악할 수 있습니다.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>🔍 상대적 크기 비교</h3>
            <p>
              점의 크기를 통해 값의 상대적 크기를 직관적으로 비교할 수 있습니다.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>✨ 패턴 발견</h3>
            <p>
              크기와 색상의 조합으로 데이터의 클러스터링과 이상치를 쉽게 발견할 수
              있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <h2>💡 활용 사례</h2>
        <ul>
          <li>
            <strong>비즈니스 분석</strong>: 제품별 매출(X), 비용(Y), 이익률(크기)
          </li>
          <li>
            <strong>마케팅</strong>: 광고비(X), 클릭수(Y), 전환율(크기)
          </li>
          <li>
            <strong>헬스케어</strong>: 운동량(X), 칼로리(Y), 체중감소(크기)
          </li>
          <li>
            <strong>금융</strong>: 수익률(X), 리스크(Y), 투자액(크기)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BubbleChartPage;
