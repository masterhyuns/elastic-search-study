/**
 * 기본 Scatter Chart 예제
 *
 * 가장 단순한 형태의 scatter 차트를 구현합니다.
 * 키와 몸무게의 관계를 시각화하여 상관관계를 파악할 수 있습니다.
 */

'use client';

import { useMemo } from 'react';
import { useECharts } from '../useECharts';
import type { ScatterChartOption } from '../types';
import styles from './page.module.scss';

/**
 * 샘플 데이터: 키(cm)와 몸무게(kg) 데이터
 * 실제 프로젝트에서는 API나 데이터베이스에서 가져올 수 있습니다.
 */
const generateHeightWeightData = () => {
  const data = [];
  // 150cm~190cm 범위의 키 데이터 생성
  for (let i = 0; i < 100; i++) {
    const height = 150 + Math.random() * 40; // 150~190cm
    // 키에 비례하는 몸무게 + 랜덤 변동
    // BMI 20~25 정도의 정상 범위를 시뮬레이션
    const weight = (height / 100) ** 2 * (20 + Math.random() * 5);
    data.push([Math.round(height), Math.round(weight * 10) / 10]);
  }
  return data;
};

const BasicScatterPage = () => {
  /**
   * 차트 옵션 메모이제이션
   * 데이터가 변경되지 않는 한 옵션 객체를 재생성하지 않아 성능 최적화
   */
  const option: ScatterChartOption = useMemo(
    () => ({
      // 차트 제목
      title: {
        text: '키-몸무게 상관관계 분석',
        subtext: '100명의 샘플 데이터',
        left: 'center',
      },

      // 그리드 레이아웃 설정
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '15%',
        containLabel: true, // 축 레이블이 그리드 영역 밖으로 나가지 않도록
      },

      // X축 설정 (키)
      xAxis: {
        type: 'value',
        name: '키 (cm)',
        nameLocation: 'middle',
        nameGap: 30,
        min: 140,
        max: 200,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed' },
        },
        axisLabel: {
          formatter: (value: number) => `${value}cm`,
        },
      },

      // Y축 설정 (몸무게)
      yAxis: {
        type: 'value',
        name: '몸무게 (kg)',
        nameLocation: 'middle',
        nameGap: 40,
        min: 40,
        max: 100,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed' },
        },
        axisLabel: {
          formatter: (value: number) => `${value}kg`,
        },
      },

      // 툴팁 설정
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const [height, weight] = params.value;
          return `키: ${height}cm<br/>몸무게: ${weight}kg`;
        },
      },

      // Scatter 시리즈
      series: [
        {
          name: '키-몸무게',
          type: 'scatter',
          data: generateHeightWeightData(),
          symbolSize: 8, // 점 크기
          itemStyle: {
            color: '#5470c6',
            opacity: 0.7, // 점이 겹쳐도 밀집도를 볼 수 있도록 투명도 설정
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

      // 도구 모음 (저장, 확대/축소 등)
      toolbox: {
        feature: {
          saveAsImage: {}, // 이미지로 저장
          dataZoom: {}, // 확대/축소 영역 선택
          restore: {}, // 초기화
        },
      },
    }),
    []
  );

  const chartRef = useECharts(option);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>기본 Scatter Chart</h1>
        <p>단순한 2차원 좌표 데이터를 시각화하는 기본 scatter 차트</p>
      </div>

      <div className={styles.chartWrapper}>
        <div ref={chartRef} className={styles.chart} />
      </div>

      <div className={styles.explanation}>
        <h2>코드 설명</h2>
        <div className={styles.codeBlock}>
          <h3>1. 데이터 구조</h3>
          <pre>
            {`// [x좌표, y좌표] 형태의 배열
const data = [
  [170, 65],  // 키 170cm, 몸무게 65kg
  [165, 58],  // 키 165cm, 몸무게 58kg
  ...
];`}
          </pre>

          <h3>2. 핵심 옵션</h3>
          <ul>
            <li>
              <strong>xAxis.type: 'value'</strong> - X축을 수치형으로 설정
            </li>
            <li>
              <strong>yAxis.type: 'value'</strong> - Y축을 수치형으로 설정
            </li>
            <li>
              <strong>series.type: 'scatter'</strong> - scatter 차트 타입 지정
            </li>
            <li>
              <strong>symbolSize</strong> - 점의 크기 조절 (숫자 또는 함수)
            </li>
            <li>
              <strong>itemStyle.opacity</strong> - 점의 투명도 (0~1)
            </li>
          </ul>

          <h3>3. 성능 최적화</h3>
          <ul>
            <li>
              <strong>useMemo</strong>로 옵션 객체 메모이제이션 - 불필요한 재렌더링
              방지
            </li>
            <li>
              <strong>useECharts</strong> 커스텀 훅 사용 - 차트 인스턴스 재사용
            </li>
            <li>
              <strong>resize 이벤트</strong> 자동 처리 - 반응형 레이아웃 지원
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.features}>
        <h2>주요 기능</h2>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <h3>🔍 툴팁 인터랙션</h3>
            <p>점에 마우스를 올리면 상세 정보 표시</p>
          </div>
          <div className={styles.feature}>
            <h3>🔧 도구 모음</h3>
            <p>우측 상단의 도구로 이미지 저장, 확대/축소 가능</p>
          </div>
          <div className={styles.feature}>
            <h3>📊 상관관계 분석</h3>
            <p>점들의 분포를 통해 키와 몸무게의 양의 상관관계 확인</p>
          </div>
          <div className={styles.feature}>
            <h3>✨ 시각적 강조</h3>
            <p>점에 호버 시 테두리로 강조하여 가독성 향상</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicScatterPage;
