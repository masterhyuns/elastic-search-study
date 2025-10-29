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
 * 샘플 포스트 데이터
 */
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

/**
 * Blog Posts 페이지
 * URL: /blog/posts
 * BlogLayout 안에서 렌더링됨
 */
const BlogPosts = () => {
  return (
    <div>
      <h1>모든 포스트</h1>
      <p>블로그의 모든 글을 확인하세요.</p>

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
