import type { Route } from "./+types/$";
import { Link } from "react-router";

/**
 * Docs 페이지 메타데이터
 * Splat 파라미터를 활용하여 동적으로 title 설정
 */
export const meta = ({ params }: Route.MetaArgs) => {
  const slug = params["*"] || "home";
  return [
    { title: `문서: ${slug} - React Router v7` },
    { name: "description", content: `${slug} 문서 페이지` },
  ];
};

/**
 * Docs 데이터 로더
 * Splat 파라미터 (*)를 사용하여 모든 하위 경로 처리
 *
 * 예시:
 * - /docs/getting-started → params["*"] = "getting-started"
 * - /docs/api/routes → params["*"] = "api/routes"
 * - /docs/a/b/c/d → params["*"] = "a/b/c/d"
 */
export const loader = async ({ params }: Route.LoaderArgs) => {
  const slug = params["*"] || "";

  // 샘플 문서 데이터
  const docs: Record<string, any> = {
    "": {
      title: "문서 홈",
      content: "React Router v7 문서에 오신 것을 환영합니다!",
      sections: [
        "시작하기",
        "라우팅 시스템",
        "데이터 로딩",
        "폼과 액션",
      ],
    },
    "getting-started": {
      title: "시작하기",
      content: "React Router v7을 시작하는 방법을 알아봅니다.",
      sections: [
        "설치",
        "프로젝트 생성",
        "첫 번째 라우트",
        "개발 서버 실행",
      ],
    },
    "getting-started/installation": {
      title: "설치",
      content: "React Router v7 설치 가이드입니다.",
      code: "pnpm create react-router@latest my-app",
    },
    "routing": {
      title: "라우팅 시스템",
      content: "React Router v7의 강력한 라우팅 기능을 알아봅니다.",
      sections: [
        "기본 라우팅",
        "중첩 라우팅",
        "동적 라우팅",
        "Splat Routes",
      ],
    },
    "routing/nested": {
      title: "중첩 라우팅",
      content: "레이아웃과 중첩 라우트를 사용하여 복잡한 UI를 구성합니다.",
      example: "layout() 함수를 사용하여 부모-자식 관계를 정의합니다.",
    },
    "api/loader": {
      title: "Loader API",
      content: "데이터를 로드하는 loader 함수에 대해 알아봅니다.",
      code: "export const loader = async ({ params }) => { return { data }; };",
    },
  };

  const doc = docs[slug] || {
    title: "404 - 문서를 찾을 수 없습니다",
    content: `"${slug}" 경로에 해당하는 문서가 없습니다.`,
    notFound: true,
  };

  return { doc, slug };
};

/**
 * Docs 페이지 컴포넌트
 * URL: /docs/*
 *
 * Splat Routes (Catch-all):
 * - 별표(*)를 사용하여 모든 하위 경로를 처리
 * - params["*"]로 매칭된 전체 경로에 접근
 * - 문서 시스템, 파일 브라우저 등에 유용
 */
const Docs = ({ loaderData }: Route.ComponentProps) => {
  const { doc, slug } = loaderData;

  return (
    <div style={{ fontFamily: "system-ui" }}>
      {/* 헤더 */}
      <header
        style={{
          backgroundColor: "#0f172a",
          color: "white",
          padding: "1rem 2rem",
          borderBottom: "2px solid #3b82f6",
        }}
      >
        <h1 style={{ margin: 0 }}>📚 React Router v7 문서</h1>
      </header>

      <div style={{ display: "flex" }}>
        {/* 사이드바 */}
        <nav
          style={{
            width: "250px",
            backgroundColor: "#f8fafc",
            padding: "1.5rem",
            minHeight: "calc(100vh - 70px)",
            borderRight: "1px solid #e2e8f0",
          }}
        >
          <h3 style={{ marginTop: 0, fontSize: "0.875rem", color: "#64748b", textTransform: "uppercase" }}>
            문서 목록
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <Link
                to="/docs"
                style={{
                  color: slug === "" ? "#3b82f6" : "#475569",
                  textDecoration: "none",
                  fontWeight: slug === "" ? "600" : "normal",
                }}
              >
                홈
              </Link>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <Link
                to="/docs/getting-started"
                style={{
                  color: slug === "getting-started" ? "#3b82f6" : "#475569",
                  textDecoration: "none",
                  fontWeight: slug === "getting-started" ? "600" : "normal",
                }}
              >
                시작하기
              </Link>
              <ul style={{ listStyle: "none", paddingLeft: "1rem", marginTop: "0.25rem" }}>
                <li>
                  <Link
                    to="/docs/getting-started/installation"
                    style={{
                      color: slug === "getting-started/installation" ? "#3b82f6" : "#64748b",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                    }}
                  >
                    설치
                  </Link>
                </li>
              </ul>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <Link
                to="/docs/routing"
                style={{
                  color: slug === "routing" ? "#3b82f6" : "#475569",
                  textDecoration: "none",
                  fontWeight: slug === "routing" ? "600" : "normal",
                }}
              >
                라우팅
              </Link>
              <ul style={{ listStyle: "none", paddingLeft: "1rem", marginTop: "0.25rem" }}>
                <li>
                  <Link
                    to="/docs/routing/nested"
                    style={{
                      color: slug === "routing/nested" ? "#3b82f6" : "#64748b",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                    }}
                  >
                    중첩 라우팅
                  </Link>
                </li>
              </ul>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <Link
                to="/docs/api/loader"
                style={{
                  color: slug === "api/loader" ? "#3b82f6" : "#475569",
                  textDecoration: "none",
                  fontWeight: slug === "api/loader" ? "600" : "normal",
                }}
              >
                API Reference
              </Link>
            </li>
          </ul>

          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
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

        {/* 메인 컨텐츠 */}
        <main style={{ flex: 1, padding: "2rem", maxWidth: "800px" }}>
          {/* 경로 표시 */}
          <div
            style={{
              fontSize: "0.875rem",
              color: "#64748b",
              marginBottom: "1rem",
              fontFamily: "monospace",
              backgroundColor: "#f1f5f9",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
            }}
          >
            현재 경로: /docs/{slug || "(root)"}
          </div>

          {/* 문서 제목 */}
          <h1 style={{ marginTop: "1rem", color: doc.notFound ? "#dc2626" : "#0f172a" }}>
            {doc.title}
          </h1>

          {/* 문서 내용 */}
          <p style={{ fontSize: "1.125rem", color: "#475569", lineHeight: "1.75" }}>
            {doc.content}
          </p>

          {/* 섹션 목록 */}
          {doc.sections && (
            <div style={{ marginTop: "2rem" }}>
              <h2 style={{ fontSize: "1.25rem", color: "#1e293b" }}>섹션</h2>
              <ul style={{ color: "#475569" }}>
                {doc.sections.map((section: string, index: number) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>
                    {section}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 코드 예제 */}
          {doc.code && (
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ fontSize: "1rem", color: "#1e293b", marginBottom: "0.5rem" }}>
                코드 예제
              </h3>
              <pre
                style={{
                  backgroundColor: "#1e293b",
                  color: "#e2e8f0",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  overflow: "auto",
                }}
              >
                <code>{doc.code}</code>
              </pre>
            </div>
          )}

          {/* 예제 설명 */}
          {doc.example && (
            <div
              style={{
                marginTop: "2rem",
                backgroundColor: "#f0f9ff",
                padding: "1rem",
                borderRadius: "0.5rem",
                borderLeft: "4px solid #3b82f6",
              }}
            >
              <p style={{ margin: 0, color: "#0c4a6e" }}>{doc.example}</p>
            </div>
          )}

          {/* Splat Routes 설명 */}
          <div
            style={{
              marginTop: "3rem",
              padding: "1.5rem",
              backgroundColor: "#fef3c7",
              borderRadius: "0.5rem",
              borderLeft: "4px solid #f59e0b",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#78350f" }}>
              💡 Splat Routes (Catch-all) 예제
            </h3>
            <p style={{ color: "#92400e", margin: "0.5rem 0" }}>
              이 페이지는 <code>/docs/*</code> 패턴으로 정의되어 모든 하위 경로를 처리합니다.
            </p>
            <ul style={{ color: "#92400e", marginBottom: 0 }}>
              <li>params["*"]로 전체 경로에 접근</li>
              <li>문서 시스템, 파일 브라우저 등에 활용</li>
              <li>동적으로 콘텐츠 로드 가능</li>
            </ul>
          </div>

          {/* 다른 문서 링크 */}
          {!doc.notFound && (
            <div style={{ marginTop: "2rem" }}>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                다른 문서도 확인해보세요:
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {slug !== "" && (
                  <Link
                    to="/docs"
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      textDecoration: "none",
                      borderRadius: "0.25rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    문서 홈
                  </Link>
                )}
                {slug !== "getting-started" && (
                  <Link
                    to="/docs/getting-started"
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      textDecoration: "none",
                      borderRadius: "0.25rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    시작하기
                  </Link>
                )}
                {slug !== "routing" && (
                  <Link
                    to="/docs/routing"
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      textDecoration: "none",
                      borderRadius: "0.25rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    라우팅
                  </Link>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Docs;
