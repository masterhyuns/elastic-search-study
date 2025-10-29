import type { Route } from "./+types/layout";
import { Outlet, Link } from "react-router";
import { Suspense } from "react";
import { Await } from "react-router";

/**
 * 지연 함수
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Progressive Layout Loader (부모 라우트)
 * defer()를 사용하여 점진적 렌더링 구현
 *
 * 핵심 차이점:
 * - 빠른 데이터는 await로 즉시 반환
 * - 느린 데이터는 Promise 그대로 반환 (defer 필요 없음, 자동으로 처리)
 */
export const loader = async () => {
  const startTime = Date.now();
  console.log("🔵 [부모-Progressive] Layout loader 시작:", new Date().toISOString());

  // 빠른 데이터: 즉시 로드 (1초)
  await delay(1000);
  const fastData = {
    user: {
      name: "김개발",
      role: "관리자",
    },
    loadTime: Date.now() - startTime,
  };

  console.log("🔵 [부모-Progressive] 빠른 데이터 완료:", new Date().toISOString());

  // 중요: 빠른 데이터만 반환하고 즉시 렌더링 시작!
  return fastData;
};

/**
 * Progressive Layout 컴포넌트
 * 부모는 빠르게 렌더링되고, 자식은 준비되는 대로 나타납니다
 */
const ProgressiveLayout = ({ loaderData }: Route.ComponentProps) => {
  const { user, loadTime } = loaderData;

  console.log("🎨 [부모-Progressive] Layout 렌더링 시작");

  return (
    <div style={{ fontFamily: "system-ui" }}>
      {/* 헤더 - 즉시 렌더링 */}
      <header
        style={{
          backgroundColor: "#7c3aed",
          color: "white",
          padding: "1rem 2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0 }}>점진적 렌더링 대시보드</h1>
          <div style={{ fontSize: "0.875rem", color: "#e9d5ff" }}>
            {user.name} ({user.role})
          </div>
        </div>
      </header>

      {/* 로딩 정보 - 즉시 표시 */}
      <div
        style={{
          backgroundColor: "#faf5ff",
          padding: "1rem 2rem",
          borderBottom: "1px solid #e9d5ff",
        }}
      >
        <div style={{ fontSize: "0.875rem", color: "#6b21a8" }}>
          🔵 <strong>부모 Loader (즉시 렌더링):</strong> {loadTime}ms
        </div>
      </div>

      {/* 설명 섹션 - 즉시 표시 */}
      <div
        style={{
          backgroundColor: "#fffbeb",
          padding: "1.5rem 2rem",
          borderBottom: "1px solid #fef3c7",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#78350f" }}>⚡ 점진적 렌더링 (Progressive Rendering)</h3>
        <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.5rem", color: "#92400e" }}>
          <li>부모는 빠른 데이터(1초)만 로드하고 <strong>즉시 렌더링</strong></li>
          <li>자식은 느린 데이터(2초)를 로드하는 동안 <strong>로딩 상태 표시</strong></li>
          <li>사용자는 부모가 먼저 보이므로 체감 속도가 빠름 ⚡</li>
          <li>브라우저 콘솔을 열어 렌더링 순서를 확인하세요!</li>
        </ul>
      </div>

      <div style={{ display: "flex" }}>
        {/* 사이드바 - 즉시 렌더링 */}
        <nav
          style={{
            width: "200px",
            backgroundColor: "#f5f3ff",
            padding: "1rem",
            minHeight: "calc(100vh - 180px)",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <Link
                to="/progressive/dashboard"
                style={{
                  display: "block",
                  padding: "0.5rem",
                  backgroundColor: "#7c3aed",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "0.25rem",
                }}
              >
                대시보드
              </Link>
            </li>
          </ul>

          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #ddd6fe" }}>
            <Link
              to="/"
              style={{
                color: "#6b21a8",
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              ← 홈으로
            </Link>
          </div>
        </nav>

        {/* 메인 컨텐츠 - 자식 라우트 */}
        <main style={{ flex: 1, padding: "2rem" }}>
          {/* 자식 라우트는 준비되는 대로 렌더링됩니다 */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProgressiveLayout;
