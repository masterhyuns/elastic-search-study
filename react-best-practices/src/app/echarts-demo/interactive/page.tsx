/**
 * Interactive Scatter Chart 예제
 *
 * 사용자 상호작용이 가능한 동적 scatter 차트입니다.
 * 데이터 필터링, 실시간 업데이트, 클릭 이벤트 등을 구현합니다.
 */

'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import type { ScatterChartOption, ScatterDataPoint } from '../types';
import styles from './page.module.scss';

/**
 * 학생 성적 데이터 타입
 */
interface StudentData {
  id: number;
  name: string;
  studyHours: number; // 주간 공부 시간
  score: number; // 시험 점수
  category: '상위권' | '중위권' | '하위권';
}

/**
 * 랜덤 학생 데이터 생성
 * 공부 시간과 성적 사이에 양의 상관관계가 있도록 생성
 */
const generateStudentData = (count: number): StudentData[] => {
  const categories = ['상위권', '중위권', '하위권'] as const;
  return Array.from({ length: count }, (_, i) => {
    const studyHours = Math.random() * 40 + 5; // 5~45 시간
    const baseScore = studyHours * 1.5 + 30; // 기본 점수 (공부 시간에 비례)
    const noise = (Math.random() - 0.5) * 20; // 랜덤 변동
    const score = Math.max(0, Math.min(100, baseScore + noise));

    // 점수에 따라 카테고리 분류
    let category: '상위권' | '중위권' | '하위권';
    if (score >= 80) category = '상위권';
    else if (score >= 60) category = '중위권';
    else category = '하위권';

    return {
      id: i + 1,
      name: `학생${i + 1}`,
      studyHours: Math.round(studyHours * 10) / 10,
      score: Math.round(score),
      category,
    };
  });
};

const InteractiveScatterPage = () => {
  // 상태 관리
  const [students, setStudents] = useState<StudentData[]>(() =>
    generateStudentData(50)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [highlightedStudent, setHighlightedStudent] = useState<number | null>(
    null
  );
  const [showTrendLine, setShowTrendLine] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  /**
   * 필터링된 학생 데이터
   */
  const filteredStudents = useMemo(() => {
    if (selectedCategory === '전체') return students;
    return students.filter((s) => s.category === selectedCategory);
  }, [students, selectedCategory]);

  /**
   * 추세선 계산 (선형 회귀)
   * y = mx + b 형태의 직선
   */
  const trendLine = useMemo(() => {
    if (!showTrendLine || filteredStudents.length === 0) return null;

    const n = filteredStudents.length;
    const sumX = filteredStudents.reduce((sum, s) => sum + s.studyHours, 0);
    const sumY = filteredStudents.reduce((sum, s) => sum + s.score, 0);
    const sumXY = filteredStudents.reduce(
      (sum, s) => sum + s.studyHours * s.score,
      0
    );
    const sumX2 = filteredStudents.reduce(
      (sum, s) => sum + s.studyHours ** 2,
      0
    );

    // 기울기와 절편 계산
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
    const b = (sumY - m * sumX) / n;

    // 추세선 데이터 포인트 생성
    return [
      [0, b],
      [50, m * 50 + b],
    ] as ScatterDataPoint[];
  }, [filteredStudents, showTrendLine]);

  /**
   * 카테고리별 색상
   */
  const getCategoryColor = (category: string) => {
    switch (category) {
      case '상위권':
        return '#ee6666';
      case '중위권':
        return '#fac858';
      case '하위권':
        return '#5470c6';
      default:
        return '#91cc75';
    }
  };

  /**
   * 차트 옵션 생성
   */
  const option: ScatterChartOption = useMemo(() => {
    const scatterData = filteredStudents.map((student) => ({
      value: [student.studyHours, student.score] as ScatterDataPoint,
      itemStyle: {
        color: getCategoryColor(student.category),
        opacity: highlightedStudent === student.id ? 1 : 0.7,
        borderWidth: highlightedStudent === student.id ? 3 : 0,
        borderColor: '#333',
      },
    }));

    const series: any[] = [
      {
        name: '학생 성적',
        type: 'scatter',
        data: scatterData,
        symbolSize: 12,
        emphasis: {
          focus: 'self',
          itemStyle: {
            borderColor: '#333',
            borderWidth: 3,
          },
        },
      },
    ];

    // 추세선 추가
    if (trendLine) {
      series.push({
        name: '추세선',
        type: 'line',
        data: trendLine,
        lineStyle: {
          color: '#333',
          width: 2,
          type: 'dashed',
        },
        symbol: 'none',
        emphasis: {
          disabled: true,
        },
      });
    }

    return {
      title: {
        text: '공부 시간 vs 시험 점수',
        subtext: `총 ${filteredStudents.length}명의 학생 데이터`,
        left: 'center',
      },

      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },

      xAxis: {
        type: 'value',
        name: '주간 공부 시간 (시간)',
        nameLocation: 'middle',
        nameGap: 30,
        min: 0,
        max: 50,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed' },
        },
      },

      yAxis: {
        type: 'value',
        name: '시험 점수',
        nameLocation: 'middle',
        nameGap: 40,
        min: 0,
        max: 100,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed' },
        },
      },

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.seriesName === '추세선') return '';
          const index = params.dataIndex;
          const student = filteredStudents[index];
          return `
            <strong>${student.name}</strong><br/>
            공부 시간: ${student.studyHours}시간<br/>
            점수: ${student.score}점<br/>
            분류: ${student.category}
          `;
        },
      },

      series,

      toolbox: {
        feature: {
          saveAsImage: {},
          dataZoom: {},
          restore: {},
        },
      },
    };
  }, [filteredStudents, highlightedStudent, trendLine]);

  /**
   * 차트 인스턴스 초기화 및 클릭 이벤트 등록
   */
  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    chartInstanceRef.current.setOption(option);

    // 클릭 이벤트 핸들러
    const handleClick = (params: any) => {
      if (params.componentType === 'series' && params.seriesName === '학생 성적') {
        const student = filteredStudents[params.dataIndex];
        setHighlightedStudent(student.id);
        alert(`${student.name}을 선택했습니다!\n공부시간: ${student.studyHours}시간\n점수: ${student.score}점`);
      }
    };

    chartInstanceRef.current.on('click', handleClick);

    // 리사이즈 핸들러
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      chartInstanceRef.current?.off('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [option, filteredStudents]);

  /**
   * 데이터 재생성
   */
  const handleRefreshData = useCallback(() => {
    setStudents(generateStudentData(50));
    setHighlightedStudent(null);
  }, []);

  /**
   * 학생 추가
   */
  const handleAddStudent = useCallback(() => {
    const newStudents = generateStudentData(10);
    setStudents((prev) => [...prev, ...newStudents]);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Interactive Scatter Chart</h1>
        <p>사용자 상호작용이 가능한 동적 scatter 차트</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label>카테고리 필터:</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setHighlightedStudent(null);
            }}
            className={styles.select}
          >
            <option value="전체">전체</option>
            <option value="상위권">상위권</option>
            <option value="중위권">중위권</option>
            <option value="하위권">하위권</option>
          </select>
        </div>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={showTrendLine}
              onChange={(e) => setShowTrendLine(e.target.checked)}
            />
            추세선 표시
          </label>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={handleRefreshData} className={styles.button}>
            🔄 데이터 재생성
          </button>
          <button onClick={handleAddStudent} className={styles.button}>
            ➕ 학생 10명 추가
          </button>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <div ref={chartRef} className={styles.chart} />
      </div>

      <div className={styles.legend}>
        <h3>범례</h3>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: '#ee6666' }}
            />
            <span>상위권 (80점 이상)</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: '#fac858' }}
            />
            <span>중위권 (60~79점)</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: '#5470c6' }}
            />
            <span>하위권 (60점 미만)</span>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <h2>인터랙티브 기능</h2>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <h3>📊 카테고리 필터링</h3>
            <p>드롭다운으로 특정 그룹만 표시하여 집중 분석이 가능합니다.</p>
          </div>
          <div className={styles.feature}>
            <h3>📈 추세선 표시</h3>
            <p>
              선형 회귀를 통한 추세선으로 전체적인 경향성을 쉽게 파악할 수
              있습니다.
            </p>
          </div>
          <div className={styles.feature}>
            <h3>🖱️ 클릭 이벤트</h3>
            <p>점을 클릭하면 해당 학생의 상세 정보를 확인할 수 있습니다.</p>
          </div>
          <div className={styles.feature}>
            <h3>🔄 실시간 업데이트</h3>
            <p>
              버튼 클릭으로 데이터를 동적으로 추가하거나 재생성할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.codeExplanation}>
        <h2>구현 핵심 코드</h2>
        <div className={styles.codeBlock}>
          <h3>1. 클릭 이벤트 등록</h3>
          <pre>
            {`// ECharts 인스턴스에 클릭 이벤트 리스너 등록
chartInstance.on('click', (params) => {
  if (params.componentType === 'series') {
    const student = filteredStudents[params.dataIndex];
    setHighlightedStudent(student.id);
  }
});`}
          </pre>

          <h3>2. 선형 회귀 추세선</h3>
          <pre>
            {`// 최소제곱법으로 기울기(m)와 절편(b) 계산
const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
const b = (sumY - m * sumX) / n;

// 추세선 데이터 생성
const trendLine = [[0, b], [50, m * 50 + b]];`}
          </pre>

          <h3>3. 동적 데이터 업데이트</h3>
          <pre>
            {`// 상태 업데이트 시 차트 자동 재렌더링
const [students, setStudents] = useState([...]);

// 데이터 추가
setStudents(prev => [...prev, ...newStudents]);`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InteractiveScatterPage;
