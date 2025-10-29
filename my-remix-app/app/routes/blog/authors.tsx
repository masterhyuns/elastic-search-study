import type { Route } from "./+types/authors";

/**
 * 블로그 작성자 페이지 메타데이터
 */
export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "작성자 - 블로그" },
    { name: "description", content: "블로그 작성자 소개" },
  ];
};

/**
 * 샘플 작성자 데이터
 */
const authors = [
  {
    id: 1,
    name: "김개발",
    role: "Frontend Developer",
    bio: "React와 TypeScript를 사랑하는 개발자",
    posts: 15,
  },
  {
    id: 2,
    name: "이디자인",
    role: "UI/UX Designer",
    bio: "사용자 경험을 최우선으로 생각합니다",
    posts: 8,
  },
  {
    id: 3,
    name: "박풀스택",
    role: "Full Stack Developer",
    bio: "프론트엔드부터 백엔드까지",
    posts: 23,
  },
];

/**
 * Blog Authors 페이지
 * URL: /blog/authors
 * BlogLayout 안에서 렌더링됨
 */
const BlogAuthors = () => {
  return (
    <div>
      <h1>작성자</h1>
      <p>블로그를 함께 만들어가는 작성자들을 소개합니다.</p>

      <div
        style={{
          marginTop: "2rem",
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        }}
      >
        {authors.map((author) => (
          <div
            key={author.id}
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#3b82f6",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              {author.name.charAt(0)}
            </div>
            <h3 style={{ margin: "0 0 0.25rem 0" }}>{author.name}</h3>
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 0.5rem 0" }}>
              {author.role}
            </p>
            <p style={{ color: "#475569", margin: "0 0 0.5rem 0" }}>
              {author.bio}
            </p>
            <div style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
              {author.posts}개의 글
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogAuthors;
