import type { Route } from "./+types/index";

/**
 * Blog 인덱스 페이지 메타데이터
 */
export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "블로그 - React Router v7 예제" },
    { name: "description", content: "중첩 라우팅 예제" },
  ];
};

/**
 * Blog 메인 페이지
 * URL: /blog
 * BlogLayout의 자식 라우트로 렌더링됨
 */
const BlogIndex = () => {
  return (
    <div>
      <h1>블로그 메인 페이지</h1>
      <p>React Router v7의 중첩 라우팅 예제입니다.</p>

      <div style={{ marginTop: "2rem", backgroundColor: "#f0f9ff", padding: "1rem", borderRadius: "0.5rem" }}>
        <h2>중첩 라우팅의 장점</h2>
        <ul>
          <li>✅ 레이아웃 재사용으로 코드 중복 감소</li>
          <li>✅ 부모-자식 라우트간 데이터 병렬 로딩</li>
          <li>✅ 각 레벨에서 독립적인 로딩/에러 상태 관리</li>
          <li>✅ 자동 코드 분할</li>
        </ul>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <p>왼쪽 사이드바에서 '포스트' 또는 '작성자'를 클릭해보세요!</p>
      </div>
    </div>
  );
};

export default BlogIndex;
