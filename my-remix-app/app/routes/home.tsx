import type { Route } from "./+types/home";
import { Link } from "react-router";

/**
 * Home 페이지 메타데이터
 */
export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "React Router v7 라우팅 예제" },
    { name: "description", content: "React Router v7의 다양한 라우팅 패턴 예제" },
  ];
};

/**
 * Home 페이지 컴포넌트
 * 모든 라우팅 예제로 이동할 수 있는 허브 페이지
 */
const Home = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* 헤더 */}
      <header
        style={{
          backgroundColor: "#0f172a",
          color: "white",
          padding: "3rem 2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: "0 0 1rem 0", fontSize: "3rem" }}>
          React Router v7
        </h1>
        <p style={{ margin: 0, fontSize: "1.25rem", color: "#94a3b8" }}>
          라우팅 시스템 예제 모음
        </p>
      </header>

      {/* 메인 컨텐츠 */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
        {/* 소개 */}
        <section style={{ marginBottom: "3rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.125rem", color: "#475569", lineHeight: "1.75" }}>
            React Router v7의 다양한 라우팅 패턴을 실제 동작하는 예제로 확인하세요.
            <br />
            각 카드를 클릭하여 해당 예제를 체험할 수 있습니다.
          </p>
        </section>

        {/* 예제 그리드 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* 기본 라우팅 */}
          <ExampleCard
            icon="📄"
            title="기본 라우팅"
            description="routes.ts에서 정의하는 정적 라우트 예제"
            links={[
              { to: "/about", label: "소개 페이지" },
              { to: "/contact", label: "연락처 페이지" },
            ]}
          />

          {/* 중첩 라우팅 */}
          <ExampleCard
            icon="📚"
            title="중첩 라우팅"
            description="레이아웃과 자식 라우트를 사용한 계층적 구조"
            links={[
              { to: "/blog", label: "블로그 홈" },
              { to: "/blog/posts", label: "포스트 목록" },
              { to: "/blog/authors", label: "작성자 목록" },
            ]}
          />

          {/* 동적 라우팅 */}
          <ExampleCard
            icon="👤"
            title="동적 라우팅"
            description="URL 파라미터를 사용한 동적 페이지"
            links={[
              { to: "/users/1", label: "사용자 1" },
              { to: "/users/2", label: "사용자 2" },
              { to: "/users/3", label: "사용자 3" },
            ]}
          />

          {/* 레이아웃 라우트 */}
          <ExampleCard
            icon="🔐"
            title="레이아웃 라우트"
            description="공통 레이아웃을 공유하는 인증 페이지"
            links={[
              { to: "/login", label: "로그인" },
              { to: "/register", label: "회원가입" },
            ]}
          />

          {/* Splat Routes */}
          <ExampleCard
            icon="📖"
            title="Splat Routes"
            description="모든 하위 경로를 처리하는 캐치올 라우트"
            links={[
              { to: "/docs", label: "문서 홈" },
              { to: "/docs/getting-started", label: "시작하기" },
              { to: "/docs/routing/nested", label: "중첩 라우팅" },
            ]}
          />

          {/* 404 예제 */}
          <ExampleCard
            icon="❌"
            title="404 처리"
            description="존재하지 않는 경로 처리 예제"
            links={[
              { to: "/non-existent", label: "존재하지 않는 페이지" },
              { to: "/users/999", label: "존재하지 않는 사용자" },
            ]}
          />
        </div>

        {/* 추가 정보 */}
        <section
          style={{
            marginTop: "4rem",
            padding: "2rem",
            backgroundColor: "#f0f9ff",
            borderRadius: "0.5rem",
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#1e293b" }}>
            📝 React Router v7 주요 변경사항
          </h2>
          <ul style={{ color: "#475569", lineHeight: "1.75" }}>
            <li>
              <strong>routes.ts 기반 라우팅:</strong> 파일 기반 자동 라우팅 대신 명시적 정의
            </li>
            <li>
              <strong>Type-safe 라우팅:</strong> TypeScript로 완벽한 타입 안정성 제공
            </li>
            <li>
              <strong>개선된 레이아웃 시스템:</strong> layout() 헬퍼로 중첩 구조 명확화
            </li>
            <li>
              <strong>향상된 성능:</strong> 자동 코드 분할과 병렬 데이터 로딩
            </li>
          </ul>
        </section>
      </main>

      {/* 푸터 */}
      <footer
        style={{
          textAlign: "center",
          padding: "2rem",
          color: "#94a3b8",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <p style={{ margin: 0 }}>
          React Router v7 라우팅 예제 © 2025
        </p>
      </footer>
    </div>
  );
};

/**
 * 예제 카드 컴포넌트
 */
interface ExampleCardProps {
  icon: string;
  title: string;
  description: string;
  links: Array<{ to: string; label: string }>;
}

const ExampleCard = ({ icon, title, description, links }: ExampleCardProps) => {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "1.5rem",
        borderRadius: "0.5rem",
        border: "1px solid #e2e8f0",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{icon}</div>
      <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e293b" }}>{title}</h3>
      <p style={{ margin: "0 0 1rem 0", color: "#64748b", fontSize: "0.875rem" }}>
        {description}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f1f5f9",
              color: "#3b82f6",
              textDecoration: "none",
              borderRadius: "0.25rem",
              textAlign: "center",
              fontSize: "0.875rem",
              fontWeight: "500",
              transition: "background-color 0.2s",
            }}
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
