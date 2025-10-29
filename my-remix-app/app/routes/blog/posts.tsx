import type { Route } from "./+types/posts";

/**
 * 블로그 포스트 목록 페이지 메타데이터
 */
export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "포스트 - 블로그" },
    { name: "description", content: "블로그 포스트 목록" },
  ];
};

/**
 * 지연 함수 (병렬 로딩 테스트용)
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Blog Posts Loader (자식 라우트)
 * 병렬 로딩 확인을 위해 의도적으로 1.5초 지연
 *
 * 부모 라우트(BlogLayout)의 loader와 병렬로 실행됩니다!
 * 둘 다 완료되어야 페이지가 렌더링됩니다.
 */
export const loader = async () => {
  const startTime = Date.now();
  console.log("🟢 [자식] Blog Posts loader 시작:", new Date().toISOString());

  // 1.5초 지연 (API 호출 시뮬레이션)
  await delay(1500);

  const endTime = Date.now();
  console.log("🟢 [자식] Blog Posts loader 완료:", new Date().toISOString());

  // 포스트 데이터 반환
  const posts = [
    {
      id: 1,
      title: "React Router v7 시작하기",
      excerpt: "React Router v7의 새로운 기능들을 알아봅니다.",
      date: "2025-01-15",
    },
    {
      id: 2,
      title: "중첩 라우팅 마스터하기",
      excerpt: "중첩 라우팅으로 복잡한 UI를 구성하는 방법",
      date: "2025-01-20",
    },
    {
      id: 3,
      title: "Type-safe 라우팅",
      excerpt: "TypeScript로 안전한 라우팅 구현하기",
      date: "2025-01-25",
    },
  ];

  return {
    posts,
    loadTime: endTime - startTime,
    startTime,
    endTime,
  };
};

/**
 * Blog Posts 페이지
 * URL: /blog/posts
 * BlogLayout 안에서 렌더링됨
 */
const BlogPosts = ({ loaderData }: Route.ComponentProps) => {
  const { posts, loadTime } = loaderData;
  return (
    <div>
      <h1>모든 포스트</h1>
      <p>블로그의 모든 글을 확인하세요.</p>

      {/* 병렬 로딩 정보 */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          padding: "1rem",
          borderRadius: "0.5rem",
          borderLeft: "4px solid #22c55e",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ fontSize: "0.875rem", color: "#15803d", marginBottom: "0.5rem" }}>
          🟢 <strong>자식 Loader 로딩 시간:</strong> {loadTime}ms
        </div>
        <div style={{ fontSize: "0.75rem", color: "#16a34a" }}>
          💡 부모와 자식 loader가 병렬로 실행되므로, 총 로딩 시간은 둘 중 더 긴 시간입니다.
        </div>
      </div>

      {/* 병렬 로딩 설명 */}
      <div
        style={{
          backgroundColor: "#fefce8",
          padding: "1rem",
          borderRadius: "0.5rem",
          marginBottom: "1.5rem",
          fontSize: "0.875rem",
        }}
      >
        <strong>⏱️ 병렬 로딩 테스트:</strong>
        <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.5rem" }}>
          <li>부모 loader: 1초 (사용자 정보)</li>
          <li>자식 loader: 1.5초 (포스트 목록)</li>
          <li><strong>순차 실행:</strong> 1초 + 1.5초 = 2.5초</li>
          <li><strong>병렬 실행:</strong> max(1초, 1.5초) = 1.5초 ⚡</li>
        </ul>
        <div style={{ marginTop: "0.5rem", color: "#854d0e" }}>
          브라우저 콘솔을 열어서 시작/완료 시간을 확인해보세요!
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        {posts.map((post) => (
          <article
            key={post.id}
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              marginBottom: "1rem",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
            }}
          >
            <h2 style={{ margin: "0 0 0.5rem 0", color: "#1e293b" }}>
              {post.title}
            </h2>
            <p style={{ color: "#64748b", margin: "0 0 0.5rem 0" }}>
              {post.excerpt}
            </p>
            <time style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
              {post.date}
            </time>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogPosts;
