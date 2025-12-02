/**
 * Advanced Scatter Chart Mock 데이터
 *
 * 실무에서 사용할 수 있는 복잡한 비즈니스 데이터를 시뮬레이션합니다.
 * 여러 해(2020-2024)에 걸친 기업들의 매출, 이익, 직원 수 등을 포함합니다.
 */

/**
 * 회사 데이터 타입
 */
export interface CompanyData {
  id: string;
  name: string;
  industry: Industry;
  year: number;
  revenue: number; // 매출 (억 원)
  profit: number; // 순이익 (억 원)
  employees: number; // 직원 수
  marketShare: number; // 시장 점유율 (%)
  growthRate: number; // 성장률 (%)
}

/**
 * 산업 분류
 */
export type Industry = 'IT' | '제조' | '금융' | '유통' | '바이오';

/**
 * 통계 정보 타입
 */
export interface Statistics {
  mean: { x: number; y: number };
  median: { x: number; y: number };
  stdDev: { x: number; y: number };
  correlation: number;
  count: number;
  regressionLine: {
    slope: number;
    intercept: number;
    r2: number;
  };
}

/**
 * 회사 목록 (산업별)
 */
const companies: Record<Industry, string[]> = {
  IT: ['테크코', '디지털웍스', '클라우드솔루션', '에이아이랩', '데이터테크'],
  제조: ['글로벌제조', '스마트팩토리', '그린에너지', '모빌리티코', '소재산업'],
  금융: ['핀테크뱅크', '인슈어테크', '투자증권', '자산운용', '핀테크'],
  유통: ['이커머스', '로지스틱스', '리테일체인', '온라인몰', '배송서비스'],
  바이오: ['바이오텍', '제약회사', '헬스케어', '메디컬디바이스', '바이오연구소'],
};

/**
 * 산업별 기본 특성
 * 각 산업의 평균적인 수익률과 성장률을 반영
 */
const industryCharacteristics: Record<
  Industry,
  { profitMargin: number; growthRate: number; volatility: number }
> = {
  IT: { profitMargin: 0.15, growthRate: 0.25, volatility: 0.3 },
  제조: { profitMargin: 0.08, growthRate: 0.08, volatility: 0.15 },
  금융: { profitMargin: 0.12, growthRate: 0.1, volatility: 0.2 },
  유통: { profitMargin: 0.05, growthRate: 0.15, volatility: 0.25 },
  바이오: { profitMargin: 0.1, growthRate: 0.2, volatility: 0.4 },
};

/**
 * 랜덤 데이터 생성 헬퍼 함수
 */
const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * 정규분포 난수 생성 (Box-Muller 변환)
 */
const normalRandom = (mean: number, stdDev: number): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
};

/**
 * Mock 데이터 생성
 * 2020년부터 2024년까지 5년간의 데이터
 */
export const generateMockData = (): CompanyData[] => {
  const data: CompanyData[] = [];
  let idCounter = 1;

  // 각 산업별로 회사 데이터 생성
  (Object.keys(companies) as Industry[]).forEach((industry) => {
    companies[industry].forEach((companyName) => {
      const characteristics = industryCharacteristics[industry];

      // 초기 매출 (2020년 기준)
      let baseRevenue = randomInRange(100, 1000);

      // 2020년부터 2024년까지 데이터 생성
      for (let year = 2020; year <= 2024; year++) {
        // 매출은 성장률에 따라 증가 (변동성 포함)
        const yearlyGrowth =
          characteristics.growthRate +
          normalRandom(0, characteristics.volatility);
        baseRevenue = baseRevenue * (1 + yearlyGrowth);

        const revenue = Math.round(baseRevenue * 10) / 10;

        // 이익률 = 기본 이익률 + 랜덤 변동
        const profitMargin =
          characteristics.profitMargin +
          normalRandom(0, characteristics.volatility * 0.5);
        const profit = Math.round(revenue * profitMargin * 10) / 10;

        // 직원 수는 매출에 비례 (산업별 차이)
        const employeesPerRevenue = industry === 'IT' ? 2 : industry === '제조' ? 5 : 3;
        const employees = Math.round(revenue * employeesPerRevenue);

        // 시장 점유율 (상위 회사일수록 높음)
        const marketShare = Math.round(randomInRange(1, 15) * 10) / 10;

        // 성장률
        const growthRate = Math.round(yearlyGrowth * 100 * 10) / 10;

        data.push({
          id: `${industry}-${companyName}-${year}`,
          name: companyName,
          industry,
          year,
          revenue,
          profit,
          employees,
          marketShare,
          growthRate,
        });

        idCounter++;
      }
    });
  });

  return data;
};

/**
 * 통계 계산 함수
 */
export const calculateStatistics = (
  data: CompanyData[],
  xKey: keyof CompanyData,
  yKey: keyof CompanyData
): Statistics => {
  if (data.length === 0) {
    return {
      mean: { x: 0, y: 0 },
      median: { x: 0, y: 0 },
      stdDev: { x: 0, y: 0 },
      correlation: 0,
      count: 0,
      regressionLine: { slope: 0, intercept: 0, r2: 0 },
    };
  }

  const n = data.length;

  // 데이터 추출
  const xValues = data.map((d) => Number(d[xKey]));
  const yValues = data.map((d) => Number(d[yKey]));

  // 평균
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;

  // 중앙값
  const xSorted = [...xValues].sort((a, b) => a - b);
  const ySorted = [...yValues].sort((a, b) => a - b);
  const xMedian = n % 2 === 0 ? (xSorted[n / 2 - 1] + xSorted[n / 2]) / 2 : xSorted[Math.floor(n / 2)];
  const yMedian = n % 2 === 0 ? (ySorted[n / 2 - 1] + ySorted[n / 2]) / 2 : ySorted[Math.floor(n / 2)];

  // 표준편차
  const xVariance = xValues.reduce((sum, x) => sum + (x - xMean) ** 2, 0) / n;
  const yVariance = yValues.reduce((sum, y) => sum + (y - yMean) ** 2, 0) / n;
  const xStdDev = Math.sqrt(xVariance);
  const yStdDev = Math.sqrt(yVariance);

  // 상관계수
  const covariance = xValues.reduce((sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean), 0) / n;
  const correlation = covariance / (xStdDev * yStdDev);

  // 선형 회귀 (최소제곱법)
  const sumX = xValues.reduce((sum, x) => sum + x, 0);
  const sumY = yValues.reduce((sum, y) => sum + y, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x ** 2, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  const intercept = (sumY - slope * sumX) / n;

  // R² (결정계수)
  const yPredicted = xValues.map((x) => slope * x + intercept);
  const ssTotal = yValues.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
  const ssResidual = yValues.reduce((sum, y, i) => sum + (y - yPredicted[i]) ** 2, 0);
  const r2 = 1 - ssResidual / ssTotal;

  return {
    mean: { x: xMean, y: yMean },
    median: { x: xMedian, y: yMedian },
    stdDev: { x: xStdDev, y: yStdDev },
    correlation,
    count: n,
    regressionLine: {
      slope,
      intercept,
      r2,
    },
  };
};

/**
 * CSV 내보내기 함수
 */
export const exportToCSV = (data: CompanyData[], filename: string = 'scatter-data.csv') => {
  // CSV 헤더
  const headers = Object.keys(data[0]).join(',');

  // CSV 행
  const rows = data.map((row) =>
    Object.values(row)
      .map((value) => (typeof value === 'string' ? `"${value}"` : value))
      .join(',')
  );

  // CSV 생성
  const csv = [headers, ...rows].join('\n');

  // 다운로드
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * JSON 내보내기 함수
 */
export const exportToJSON = (data: CompanyData[], filename: string = 'scatter-data.json') => {
  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 산업별 색상 팔레트
 */
export const industryColors: Record<Industry, string> = {
  IT: '#5470c6',
  제조: '#91cc75',
  금융: '#fac858',
  유통: '#ee6666',
  바이오: '#73c0de',
};

/**
 * 데이터 필터링 함수
 */
export const filterData = (
  data: CompanyData[],
  filters: {
    industries: Industry[];
    years: number[];
    revenueRange: [number, number];
    profitRange: [number, number];
  }
): CompanyData[] => {
  return data.filter((item) => {
    const industryMatch = filters.industries.length === 0 || filters.industries.includes(item.industry);
    const yearMatch = filters.years.length === 0 || filters.years.includes(item.year);
    const revenueMatch = item.revenue >= filters.revenueRange[0] && item.revenue <= filters.revenueRange[1];
    const profitMatch = item.profit >= filters.profitRange[0] && item.profit <= filters.profitRange[1];

    return industryMatch && yearMatch && revenueMatch && profitMatch;
  });
};
