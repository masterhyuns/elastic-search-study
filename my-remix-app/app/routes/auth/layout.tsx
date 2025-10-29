import { Outlet, Link } from "react-router";

/**
 * Auth 레이아웃 컴포넌트
 * 인증 관련 페이지들의 공통 레이아웃
 * /login, /register 페이지에서 공유됨
 *
 * 특징:
 * - 중앙 정렬된 인증 폼 레이아웃
 * - 로고와 브랜딩 영역
 * - 푸터 정보
 */
const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        fontFamily: "system-ui",
      }}
    >
      {/* 로고 영역 */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#3b82f6",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            fontSize: "2.5rem",
          }}
        >
          🚀
        </div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#1e293b" }}>
          React Router v7
        </h1>
        <p style={{ margin: "0.5rem 0 0 0", color: "#64748b" }}>
          레이아웃 라우트 예제
        </p>
      </div>

      {/* 폼 컨테이너 */}
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
        }}
      >
        {/* 자식 라우트 (login, register)가 여기 렌더링됨 */}
        <Outlet />
      </div>

      {/* 푸터 */}
      <footer
        style={{
          marginTop: "2rem",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "0.875rem",
        }}
      >
        <p style={{ margin: "0 0 0.5rem 0" }}>
          © 2025 React Router v7 예제 앱
        </p>
        <Link
          to="/"
          style={{
            color: "#64748b",
            textDecoration: "none",
          }}
        >
          홈으로 돌아가기
        </Link>
      </footer>
    </div>
  );
};

export default AuthLayout;
