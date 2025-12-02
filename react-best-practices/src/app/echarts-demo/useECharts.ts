/**
 * ECharts 커스텀 훅
 *
 * ECharts 인스턴스를 생성하고 관리하는 재사용 가능한 훅입니다.
 * 리액트 생명주기에 맞춰 차트를 초기화하고, 옵션 변경 시 자동 업데이트하며,
 * 컴포넌트 언마운트 시 메모리 누수를 방지하기 위해 dispose 합니다.
 */

'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

/**
 * useECharts 훅
 *
 * @param option - ECharts 옵션 객체
 * @returns 차트가 렌더링될 div 요소의 ref
 *
 * 주요 기능:
 * 1. 컴포넌트 마운트 시 ECharts 인스턴스 생성
 * 2. option 변경 시 차트 자동 업데이트
 * 3. 윈도우 리사이즈 시 차트 크기 자동 조정
 * 4. 컴포넌트 언마운트 시 리소스 정리
 *
 * @example
 * const chartRef = useECharts({
 *   xAxis: { type: 'value' },
 *   yAxis: { type: 'value' },
 *   series: [{ type: 'scatter', data: [[1, 2], [3, 4]] }]
 * });
 *
 * return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
 */
export const useECharts = (option: EChartsOption) => {
  // 차트가 렌더링될 DOM 요소에 대한 참조
  const chartRef = useRef<HTMLDivElement>(null);

  // ECharts 인스턴스에 대한 참조 (재생성 방지)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // DOM 요소가 없으면 차트를 생성할 수 없음
    if (!chartRef.current) return;

    // 이미 인스턴스가 있으면 재사용, 없으면 새로 생성
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    // 차트 옵션 설정
    // notMerge: false - 기존 옵션과 병합
    // lazyUpdate: false - 즉시 업데이트
    chartInstanceRef.current.setOption(option, { notMerge: false, lazyUpdate: false });

    // 윈도우 리사이즈 이벤트 핸들러
    // 반응형 디자인을 위해 브라우저 창 크기가 변경되면 차트 크기도 조정
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    // 클린업 함수
    // 컴포넌트 언마운트 시 실행되어 메모리 누수 방지
    return () => {
      window.removeEventListener('resize', handleResize);

      // 차트 인스턴스가 있으면 dispose하여 리소스 해제
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [option]); // option이 변경될 때마다 차트 업데이트

  return chartRef;
};
