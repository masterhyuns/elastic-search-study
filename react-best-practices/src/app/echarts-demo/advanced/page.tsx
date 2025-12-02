/**
 * Advanced Scatter Chart - Full Features
 *
 * 실무에서 사용할 수 있는 모든 고급 기능을 포함한 scatter 차트입니다.
 * Mock 데이터를 사용하여 복잡한 비즈니스 데이터 분석을 시뮬레이션합니다.
 */

'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as echarts from 'echarts';
import {
  generateMockData,
  calculateStatistics,
  filterData,
  exportToCSV,
  exportToJSON,
  industryColors,
  type CompanyData,
  type Industry,
  type Statistics,
} from './mockData';
import styles from './page.module.scss';

/**
 * 축 키 타입 (선택 가능한 데이터 필드)
 */
type AxisKey = 'revenue' | 'profit' | 'employees' | 'marketShare' | 'growthRate';

/**
 * 축 레이블 매핑
 */
const axisLabels: Record<AxisKey, { label: string; unit: string }> = {
  revenue: { label: '매출', unit: '억원' },
  profit: { label: '순이익', unit: '억원' },
  employees: { label: '직원 수', unit: '명' },
  marketShare: { label: '시장 점유율', unit: '%' },
  growthRate: { label: '성장률', unit: '%' },
};

const AdvancedScatterPage = () => {
  // Mock 데이터 생성 (컴포넌트 마운트 시 1회)
  const allData = useMemo(() => generateMockData(), []);

  // 상태 관리
  const [selectedIndustries, setSelectedIndustries] = useState<Industry[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([2024]);
  const [revenueRange, setRevenueRange] = useState<[number, number]>([0, 2000]);
  const [profitRange, setProfitRange] = useState<[number, number]>([0, 300]);
  const [xAxis, setXAxis] = useState<AxisKey>('revenue');
  const [yAxis, setYAxis] = useState<AxisKey>('profit');
  const [symbolSize, setSymbolSize] = useState(10);
  const [opacity, setOpacity] = useState(0.7);
  const [showRegressionLine, setShowRegressionLine] = useState(true);
  const [showMean, setShowMean] = useState(false);
  const [highlightedCompany, setHighlightedCompany] = useState<string | null>(null);
  const [brushEnabled, setBrushEnabled] = useState(false);
  const [selectedDataPoints, setSelectedDataPoints] = useState<CompanyData[]>([]);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  /**
   * 필터링된 데이터
   */
  const filteredData = useMemo(() => {
    return filterData(allData, {
      industries: selectedIndustries,
      years: selectedYears,
      revenueRange,
      profitRange,
    });
  }, [allData, selectedIndustries, selectedYears, revenueRange, profitRange]);

  /**
   * 통계 계산
   */
  const statistics = useMemo(() => {
    return calculateStatistics(filteredData, xAxis, yAxis);
  }, [filteredData, xAxis, yAxis]);

  /**
   * 산업별로 데이터 그룹화
   */
  const dataByIndustry = useMemo(() => {
    const grouped: Record<Industry, CompanyData[]> = {
      IT: [],
      제조: [],
      금융: [],
      유통: [],
      바이오: [],
    };

    filteredData.forEach((item) => {
      grouped[item.industry].push(item);
    });

    return grouped;
  }, [filteredData]);

  /**
   * 차트 옵션 생성
   */
  const chartOption = useMemo(() => {
    const series: any[] = [];

    // 각 산업별 시리즈 생성
    (Object.keys(dataByIndustry) as Industry[]).forEach((industry) => {
      const industryData = dataByIndustry[industry];

      if (industryData.length === 0) return;

      series.push({
        name: industry,
        type: 'scatter',
        data: industryData.map((item) => ({
          value: [item[xAxis], item[yAxis]],
          itemStyle: {
            color: industryColors[industry],
            opacity: highlightedCompany === item.id ? 1 : opacity,
            borderWidth: highlightedCompany === item.id ? 3 : 0,
            borderColor: '#333',
          },
          // 메타데이터 저장 (툴팁용)
          meta: item,
        })),
        symbolSize,
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: '#333',
            borderWidth: 2,
          },
        },
      });
    });

    // 회귀선 추가
    if (showRegressionLine && filteredData.length > 0) {
      const { slope, intercept } = statistics.regressionLine;

      // X축 최소/최대값 구하기
      const xValues = filteredData.map((d) => d[xAxis]);
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);

      series.push({
        name: '회귀선',
        type: 'line',
        data: [
          [xMin, slope * xMin + intercept],
          [xMax, slope * xMax + intercept],
        ],
        lineStyle: {
          color: '#333',
          width: 2,
          type: 'dashed',
        },
        symbol: 'none',
        silent: true,
        emphasis: {
          disabled: true,
        },
      });
    }

    // 평균선 추가
    if (showMean && filteredData.length > 0) {
      const { mean } = statistics;

      // X축 평균선 (세로선)
      series.push({
        name: 'X 평균',
        type: 'line',
        markLine: {
          silent: true,
          symbol: 'none',
          data: [{ xAxis: mean.x }],
          lineStyle: {
            color: '#ff6b6b',
            width: 1,
            type: 'dotted',
          },
          label: {
            formatter: `평균: ${mean.x.toFixed(1)}`,
          },
        },
      });

      // Y축 평균선 (가로선)
      series.push({
        name: 'Y 평균',
        type: 'line',
        markLine: {
          silent: true,
          symbol: 'none',
          data: [{ yAxis: mean.y }],
          lineStyle: {
            color: '#51cf66',
            width: 1,
            type: 'dotted',
          },
          label: {
            formatter: `평균: ${mean.y.toFixed(1)}`,
          },
        },
      });
    }

    return {
      title: {
        text: '기업 데이터 분석 (Advanced Scatter Chart)',
        subtext: `${filteredData.length}개 기업 | 상관계수: ${statistics.correlation.toFixed(3)} | R²: ${statistics.regressionLine.r2.toFixed(3)}`,
        left: 'center',
      },

      legend: {
        data: ['IT', '제조', '금융', '유통', '바이오'],
        top: '8%',
        left: 'center',
      },

      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '20%',
        containLabel: true,
      },

      xAxis: {
        type: 'value',
        name: `${axisLabels[xAxis].label} (${axisLabels[xAxis].unit})`,
        nameLocation: 'middle',
        nameGap: 30,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed' },
        },
      },

      yAxis: {
        type: 'value',
        name: `${axisLabels[yAxis].label} (${axisLabels[yAxis].unit})`,
        nameLocation: 'middle',
        nameGap: 50,
        splitLine: {
          show: true,
          lineStyle: { type: 'dashed' },
        },
      },

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (!params.data?.meta) return '';

          const data: CompanyData = params.data.meta;
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px;">
                ${data.name} (${data.industry})
              </div>
              <div style="font-size: 12px; color: #666;">
                <div>📅 ${data.year}년</div>
                <div>💰 매출: ${data.revenue.toFixed(1)}억원</div>
                <div>📈 순이익: ${data.profit.toFixed(1)}억원</div>
                <div>👥 직원: ${data.employees.toLocaleString()}명</div>
                <div>📊 시장점유율: ${data.marketShare.toFixed(1)}%</div>
                <div>🚀 성장률: ${data.growthRate.toFixed(1)}%</div>
              </div>
            </div>
          `;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: {
          color: '#333',
        },
      },

      toolbox: {
        feature: {
          saveAsImage: { title: '이미지 저장' },
          dataZoom: { title: { zoom: '영역 확대', back: '되돌리기' } },
          restore: { title: '초기화' },
          brush: brushEnabled
            ? {
                type: ['rect', 'polygon', 'clear'],
                title: {
                  rect: '사각형 선택',
                  polygon: '다각형 선택',
                  clear: '선택 해제',
                },
              }
            : undefined,
        },
      },

      brush: brushEnabled
        ? {
            toolbox: ['rect', 'polygon', 'clear'],
            xAxisIndex: 0,
            yAxisIndex: 0,
          }
        : undefined,

      series,
    };
  }, [
    dataByIndustry,
    xAxis,
    yAxis,
    symbolSize,
    opacity,
    showRegressionLine,
    showMean,
    highlightedCompany,
    filteredData,
    statistics,
    brushEnabled,
  ]);

  /**
   * 차트 초기화 및 이벤트 등록
   */
  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    chartInstanceRef.current.setOption(chartOption);

    // 클릭 이벤트
    const handleClick = (params: any) => {
      if (params.componentType === 'series' && params.data?.meta) {
        const data: CompanyData = params.data.meta;
        setHighlightedCompany(data.id);
      }
    };

    // 브러시 선택 이벤트
    const handleBrushSelected = (params: any) => {
      if (!params.batch || params.batch.length === 0) {
        setSelectedDataPoints([]);
        return;
      }

      const selected: CompanyData[] = [];
      params.batch[0].selected.forEach((selection: any) => {
        selection.dataIndex.forEach((index: number) => {
          const seriesIndex = selection.seriesIndex;
          const seriesData = chartOption.series[seriesIndex].data;
          if (seriesData[index]?.meta) {
            selected.push(seriesData[index].meta);
          }
        });
      });

      setSelectedDataPoints(selected);
    };

    chartInstanceRef.current.on('click', handleClick);
    chartInstanceRef.current.on('brushSelected', handleBrushSelected);

    // 리사이즈
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      chartInstanceRef.current?.off('click', handleClick);
      chartInstanceRef.current?.off('brushSelected', handleBrushSelected);
      window.removeEventListener('resize', handleResize);
    };
  }, [chartOption]);

  /**
   * 산업 필터 토글
   */
  const toggleIndustry = useCallback((industry: Industry) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry]
    );
  }, []);

  /**
   * 년도 필터 토글
   */
  const toggleYear = useCallback((year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  }, []);

  /**
   * 데이터 내보내기
   */
  const handleExportCSV = useCallback(() => {
    exportToCSV(filteredData, `scatter-data-${Date.now()}.csv`);
  }, [filteredData]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredData, `scatter-data-${Date.now()}.json`);
  }, [filteredData]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Advanced Scatter Chart</h1>
        <p>Full Features with Mock Data</p>
      </header>

      {/* 컨트롤 패널 */}
      <div className={styles.controlPanel}>
        {/* 필터 섹션 */}
        <div className={styles.section}>
          <h3>📊 데이터 필터</h3>

          {/* 산업 필터 */}
          <div className={styles.filterGroup}>
            <label>산업:</label>
            <div className={styles.checkboxGroup}>
              {(Object.keys(industryColors) as Industry[]).map((industry) => (
                <label key={industry} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={
                      selectedIndustries.length === 0 || selectedIndustries.includes(industry)
                    }
                    onChange={() => toggleIndustry(industry)}
                  />
                  <span
                    className={styles.colorBox}
                    style={{ backgroundColor: industryColors[industry] }}
                  />
                  {industry}
                </label>
              ))}
            </div>
          </div>

          {/* 년도 필터 */}
          <div className={styles.filterGroup}>
            <label>년도:</label>
            <div className={styles.checkboxGroup}>
              {[2020, 2021, 2022, 2023, 2024].map((year) => (
                <label key={year} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={selectedYears.includes(year)}
                    onChange={() => toggleYear(year)}
                  />
                  {year}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 축 설정 */}
        <div className={styles.section}>
          <h3>🎯 축 설정</h3>
          <div className={styles.axisGroup}>
            <div className={styles.selectGroup}>
              <label>X축:</label>
              <select value={xAxis} onChange={(e) => setXAxis(e.target.value as AxisKey)}>
                {(Object.keys(axisLabels) as AxisKey[]).map((key) => (
                  <option key={key} value={key}>
                    {axisLabels[key].label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.selectGroup}>
              <label>Y축:</label>
              <select value={yAxis} onChange={(e) => setYAxis(e.target.value as AxisKey)}>
                {(Object.keys(axisLabels) as AxisKey[]).map((key) => (
                  <option key={key} value={key}>
                    {axisLabels[key].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 시각화 옵션 */}
        <div className={styles.section}>
          <h3>🎨 시각화 옵션</h3>

          <div className={styles.sliderGroup}>
            <label>점 크기: {symbolSize}px</label>
            <input
              type="range"
              min="5"
              max="30"
              value={symbolSize}
              onChange={(e) => setSymbolSize(Number(e.target.value))}
            />
          </div>

          <div className={styles.sliderGroup}>
            <label>투명도: {(opacity * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={showRegressionLine}
                onChange={(e) => setShowRegressionLine(e.target.checked)}
              />
              회귀선 표시
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={showMean}
                onChange={(e) => setShowMean(e.target.checked)}
              />
              평균선 표시
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={brushEnabled}
                onChange={(e) => setBrushEnabled(e.target.checked)}
              />
              브러시 선택 활성화
            </label>
          </div>
        </div>

        {/* 데이터 내보내기 */}
        <div className={styles.section}>
          <h3>💾 데이터 내보내기</h3>
          <div className={styles.buttonGroup}>
            <button onClick={handleExportCSV} className={styles.exportButton}>
              📄 CSV 다운로드
            </button>
            <button onClick={handleExportJSON} className={styles.exportButton}>
              📋 JSON 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* 통계 대시보드 */}
      <div className={styles.statisticsPanel}>
        <h3>📈 통계 분석</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>데이터 개수</div>
            <div className={styles.statValue}>{statistics.count.toLocaleString()}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>상관계수 (r)</div>
            <div className={styles.statValue}>{statistics.correlation.toFixed(3)}</div>
            <div className={styles.statSubtext}>
              {Math.abs(statistics.correlation) > 0.7
                ? '강한 상관관계'
                : Math.abs(statistics.correlation) > 0.4
                  ? '중간 상관관계'
                  : '약한 상관관계'}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>결정계수 (R²)</div>
            <div className={styles.statValue}>{statistics.regressionLine.r2.toFixed(3)}</div>
            <div className={styles.statSubtext}>
              {(statistics.regressionLine.r2 * 100).toFixed(1)}% 설명력
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>X 평균</div>
            <div className={styles.statValue}>{statistics.mean.x.toFixed(1)}</div>
            <div className={styles.statSubtext}>σ = {statistics.stdDev.x.toFixed(1)}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Y 평균</div>
            <div className={styles.statValue}>{statistics.mean.y.toFixed(1)}</div>
            <div className={styles.statSubtext}>σ = {statistics.stdDev.y.toFixed(1)}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>회귀식</div>
            <div className={styles.statValue} style={{ fontSize: '0.9rem' }}>
              y = {statistics.regressionLine.slope.toFixed(2)}x +{' '}
              {statistics.regressionLine.intercept.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div className={styles.chartWrapper}>
        <div ref={chartRef} className={styles.chart} />
      </div>

      {/* 선택된 데이터 포인트 */}
      {selectedDataPoints.length > 0 && (
        <div className={styles.selectedPanel}>
          <h3>✅ 선택된 데이터 ({selectedDataPoints.length}개)</h3>
          <div className={styles.selectedGrid}>
            {selectedDataPoints.slice(0, 10).map((item) => (
              <div key={item.id} className={styles.selectedCard}>
                <div className={styles.companyName}>
                  {item.name}
                  <span
                    className={styles.industryBadge}
                    style={{ backgroundColor: industryColors[item.industry] }}
                  >
                    {item.industry}
                  </span>
                </div>
                <div className={styles.companyData}>
                  <span>매출: {item.revenue.toFixed(1)}억</span>
                  <span>이익: {item.profit.toFixed(1)}억</span>
                  <span>{item.year}년</span>
                </div>
              </div>
            ))}
            {selectedDataPoints.length > 10 && (
              <div className={styles.moreItems}>외 {selectedDataPoints.length - 10}개</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedScatterPage;
