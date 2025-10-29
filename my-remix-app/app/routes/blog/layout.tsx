import type { Route } from "./+types/layout";
import { Outlet, Link, NavLink } from "react-router";

/**
 * 지연 함수 (병렬 로딩 테스트용)
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Blog Layout Loader (부모 라우트)
 * 병렬 로딩 확인을 위해 의도적으로 1초 지연
 *
 * 자식 라우트의 loader와 병렬로 실행됩니다!
 */
export const loader = async () => {
  const startTime = Date.now();
  console.log("🔵 [부모] Blog Layout loader 시작:", new Date().toISOString());

  // 1초 지연 (API 호출 시뮬레이션)
  await delay(1000);

  const endTime = Date.now();
  console.log("🔵 [부모] Blog Layout loader 완료:", new Date().toISOString());

  return {
    user: {
      name: "김개발",
      role: "작성자",
    },
    loadTime: endTime - startTime,
    startTime,
    endTime,
  };
};

/**
 * Blog 레이아웃 컴포넌트
 * 중첩 라우팅의 부모 레이아웃 역할
 * /blog, /blog/posts, /blog/authors에서 공통으로 사용
 *
 * 주요 기능:
 * - 네비게이션 메뉴 제공
 * - Outlet을 통해 자식 라우트 렌더링
 * - NavLink로 활성 링크 스타일링
 */
const BlogLayout = ({ loaderData }: Route.ComponentProps) => {
  const { user, loadTime } = loaderData;
  return (
    <div style={{ fontFamily: "system-ui" }}>
      {/* 헤더 */}
      <header
        style={{
          backgroundColor: "#1e293b",
          color: "white",
          padding: "1rem 2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0 }}>블로그</h1>
          <div style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
            {user.name} ({user.role})
          </div>
        </div>
      </header>

      {/* 병렬 로딩 정보 */}
      <div
        style={{
          backgroundColor: "#f0f9ff",
          padding: "1rem 2rem",
          borderBottom: "1px solid #bfdbfe",
        }}
      >
        <div style={{ fontSize: "0.875rem", color: "#1e40af" }}>
          🔵 <strong>부모 Loader 로딩 시간:</strong> {loadTime}ms
        </div>
      </div>

      <div style={{ display: "flex" }}>
        {/* 사이드바 네비게이션 */}
        <nav
          style={{
            width: "200px",
            backgroundColor: "#f1f5f9",
            padding: "1rem",
            minHeight: "calc(100vh - 60px)",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <NavLink
                to="/blog"
                end
                style={({ isActive }) => ({
                  display: "block",
                  padding: "0.5rem",
                  backgroundColor: isActive ? "#3b82f6" : "transparent",
                  color: isActive ? "white" : "#1e293b",
                  textDecoration: "none",
                  borderRadius: "0.25rem",
                })}
              >
                블로그 홈
              </NavLink>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <NavLink
                to="/blog/posts"
                style={({ isActive }) => ({
                  display: "block",
                  padding: "0.5rem",
                  backgroundColor: isActive ? "#3b82f6" : "transparent",
                  color: isActive ? "white" : "#1e293b",
                  textDecoration: "none",
                  borderRadius: "0.25rem",
                })}
              >
                포스트
              </NavLink>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <NavLink
                to="/blog/authors"
                style={({ isActive }) => ({
                  display: "block",
                  padding: "0.5rem",
                  backgroundColor: isActive ? "#3b82f6" : "transparent",
                  color: isActive ? "white" : "#1e293b",
                  textDecoration: "none",
                  borderRadius: "0.25rem",
                })}
              >
                작성자
              </NavLink>
            </li>
          </ul>

          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #cbd5e1" }}>
            <Link
              to="/"
              style={{
                color: "#64748b",
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              ← 홈으로
            </Link>
          </div>
        </nav>

        {/* 메인 컨텐츠 영역 */}
        <main style={{ flex: 1, padding: "2rem" }}>
          {/* 자식 라우트가 여기에 렌더링됩니다 */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BlogLayout;
