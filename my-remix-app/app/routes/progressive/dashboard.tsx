import type { Route } from "./+types/dashboard";
import { Suspense } from "react";
import { Await } from "react-router";

/**
 * 지연 함수
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 느린 데이터 로드 함수
 * 실제로는 API 호출, DB 쿼리 등
 */
const loadSlowData = async () => {
  const startTime = Date.now();
  console.log("🟢 [자식-Progressive] 느린 데이터 로드 시작:", new Date().toISOString());

  // 2초 지연 (느린 API 호출 시뮬레이션)
  await delay(2000);

  console.log("🟢 [자식-Progressive] 느린 데이터 로드 완료:", new Date().toISOString());

  return {
    stats: [
      { label: "총 매출", value: "₩12,345,678", change: "+12.5%" },
      { label: "신규 사용자", value: "1,234", change: "+23.1%" },
      { label: "활성 사용자", value: "8,901", change: "+5.3%" },
      { label: "전환율", value: "3.24%", change: "+0.8%" },
    ],
    loadTime: Date.now() - startTime,
    completedAt: new Date().toISOString(),
  };
};

/**
 * Dashboard Loader (자식 라우트)
 * Promise를 직접 반환하여 점진적 렌더링 구현
 *
 * 핵심:
 * - Promise를 직접 반환하면 React Router가 자동으로 defer 처리
 * - 컴포넌트에서 Suspense + Await로 처리
 * - 부모는 이미 렌더링되었고, 자식만 기다림
 */
export const loader = () => {
  console.log("🟢 [자식-Progressive] Dashboard loader 시작:", new Date().toISOString());

  // Promise를 직접 반환 (React Router v7에서는 defer() 불필요)
  return {
    slowData: loadSlowData(), // Promise 그대로 전달
  };
};

/**
 * Dashboard 메타데이터
 */
export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "대시보드 - 점진적 렌더링" },
    { name: "description", content: "defer와 Await를 사용한 점진적 렌더링 예제" },
  ];
};

/**
 * Dashboard 컴포넌트
 * 부모가 렌더링된 후 2초 뒤에 나타남
 */
const Dashboard = ({ loaderData }: Route.ComponentProps) => {
  console.log("🎨 [자식-Progressive] Dashboard 렌더링 시작");

  // loaderData가 undefined일 수 없지만 타입 체크를 위해 처리
  if (!loaderData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>대시보드</h1>
      <p>부모 레이아웃은 이미 보이고, 아래 데이터는 로딩 중입니다...</p>

      {/* Suspense: 데이터 로딩 중 fallback 표시 */}
      <Suspense
        fallback={
          <div
            style={{
              backgroundColor: "#fef3c7",
              padding: "2rem",
              borderRadius: "0.5rem",
              border: "2px dashed #f59e0b",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
            <div style={{ fontSize: "1.125rem", fontWeight: "600", color: "#78350f" }}>
              느린 데이터 로딩 중...
            </div>
            <div style={{ fontSize: "0.875rem", color: "#92400e", marginTop: "0.5rem" }}>
              2초 소요 예정 (API 호출 시뮬레이션)
            </div>
            <div
              style={{
                marginTop: "1rem",
                width: "100%",
                height: "4px",
                backgroundColor: "#fde68a",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#f59e0b",
                  animation: "progress 2s ease-in-out infinite",
                }}
              />
            </div>
            <style>{`
              @keyframes progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        }
      >
        {/* Await: Promise가 완료되면 데이터 렌더링 */}
        <Await resolve={loaderData.slowData}>
          {(data) => {
            console.log("🎨 [자식-Progressive] 느린 데이터 렌더링 완료");
            return (
              <div>
                {/* 로딩 완료 정보 */}
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    borderLeft: "4px solid #22c55e",
                    marginBottom: "2rem",
                  }}
                >
                  <div style={{ fontSize: "0.875rem", color: "#15803d", marginBottom: "0.5rem" }}>
                    🟢 <strong>자식 Loader 완료:</strong> {data.loadTime}ms
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#16a34a" }}>
                    완료 시간: {data.completedAt}
                  </div>
                </div>

                {/* 통계 그리드 */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginTop: "1.5rem",
                  }}
                >
                  {data.stats.map((stat: { label: string; value: string; change: string }, index: number) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: "white",
                        padding: "1.5rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#22c55e", fontWeight: "600" }}>
                        {stat.change}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 렌더링 순서 설명 */}
                <div
                  style={{
                    marginTop: "2rem",
                    backgroundColor: "#eff6ff",
                    padding: "1.5rem",
                    borderRadius: "0.5rem",
                    borderLeft: "4px solid #3b82f6",
                  }}
                >
                  <h3 style={{ marginTop: 0, color: "#1e40af" }}>
                    📊 렌더링 순서 (콘솔 확인)
                  </h3>
                  <ol style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.5rem", color: "#1e3a8a" }}>
                    <li>🔵 부모 Layout loader 시작 (0ms)</li>
                    <li>🟢 자식 Dashboard loader 시작 (동시 0ms)</li>
                    <li>🔵 부모 빠른 데이터 완료 (1000ms)</li>
                    <li>🎨 부모 Layout 렌더링 (즉시!)</li>
                    <li>🎨 자식 Dashboard 렌더링 시작 (Suspense fallback 표시)</li>
                    <li>🟢 자식 느린 데이터 완료 (2000ms)</li>
                    <li>🎨 자식 실제 데이터 렌더링 (이 화면!)</li>
                  </ol>
                </div>
              </div>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
};

export default Dashboard;
