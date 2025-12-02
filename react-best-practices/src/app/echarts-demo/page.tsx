/**
 * ECharts Scatter Chart 예제 모음 페이지
 *
 * 다양한 scatter 차트 예제를 한 페이지에서 확인할 수 있습니다.
 */

'use client';

import Link from 'next/link';
import styles from './page.module.scss';

/**
 * 예제 목록 데이터
 * 각 예제의 제목, 설명, 링크를 포함합니다.
 */
const examples = [
  {
    id: 'basic',
    title: '기본 Scatter 차트',
    description: '단순한 2차원 좌표 데이터를 시각화하는 기본 scatter 차트',
    features: ['X-Y 좌표 플로팅', '단일 시리즈', '기본 스타일링'],
  },
  {
    id: 'bubble',
    title: 'Bubble 차트',
    description: '세 번째 차원(크기)을 추가한 버블 차트로 더 많은 정보 표현',
    features: ['3차원 데이터 표현', '동적 심볼 크기', '색상 구분'],
  },
  {
    id: 'multi-series',
    title: '멀티 시리즈 Scatter',
    description: '여러 그룹의 데이터를 하나의 차트에 표시하여 비교 분석',
    features: ['여러 데이터 그룹', '범례 인터랙션', '그룹별 스타일'],
  },
  {
    id: 'interactive',
    title: '인터랙티브 Scatter',
    description: '사용자 상호작용이 가능한 동적 scatter 차트',
    features: ['데이터 필터링', '실시간 업데이트', '클릭 이벤트', '확대/축소'],
  },
  {
    id: 'advanced',
    title: '🚀 Advanced Full Features',
    description: '실무에서 바로 사용 가능한 모든 고급 기능을 포함한 종합 예제',
    features: [
      '다차원 필터링',
      '통계 분석 대시보드',
      'CSV/JSON 내보내기',
      '회귀선 & 평균선',
      '브러시 선택',
      '동적 축 변경',
    ],
  },
];

const EChartsDemoPage = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>ECharts Scatter Chart 예제</h1>
        <p className={styles.subtitle}>
          다양한 scatter 차트 패턴과 활용법을 학습하세요
        </p>
      </header>

      <div className={styles.grid}>
        {examples.map((example) => (
          <Link
            key={example.id}
            href={`/echarts-demo/${example.id}`}
            className={styles.card}
          >
            <div className={styles.cardHeader}>
              <h2>{example.title}</h2>
            </div>
            <p className={styles.description}>{example.description}</p>
            <ul className={styles.features}>
              {example.features.map((feature, index) => (
                <li key={index}>✓ {feature}</li>
              ))}
            </ul>
            <div className={styles.cardFooter}>
              <span className={styles.link}>예제 보기 →</span>
            </div>
          </Link>
        ))}
      </div>

      <section className={styles.infoSection}>
        <h2>Scatter Chart란?</h2>
        <div className={styles.infoContent}>
          <p>
            <strong>Scatter Chart(산점도)</strong>는 두 개 이상의 변수 간 관계를
            시각화하는 차트입니다. 각 데이터 포인트는 좌표 평면 위의 점으로
            표현되며, 다음과 같은 분석에 유용합니다:
          </p>
          <ul>
            <li>
              <strong>상관관계 분석</strong>: 두 변수 사이의 양의 상관관계, 음의
              상관관계, 무상관 판별
            </li>
            <li>
              <strong>패턴 발견</strong>: 데이터의 클러스터링, 이상치, 트렌드
              파악
            </li>
            <li>
              <strong>분포 시각화</strong>: 데이터의 밀집도와 분산 정도 확인
            </li>
            <li>
              <strong>다차원 데이터 표현</strong>: 색상, 크기, 모양을 활용한 3-4개
              변수 동시 표현
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default EChartsDemoPage;
