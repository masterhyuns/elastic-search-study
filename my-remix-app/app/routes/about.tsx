import type { Route } from "./+types/about";
import { Link } from "react-router";

/**
 * About 페이지 메타데이터
 * SEO를 위한 title과 description 설정
 */
export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "소개 - React Router v7 예제" },
    { name: "description", content: "React Router v7 라우팅 시스템 소개" },
  ];
};

/**
 * About 페이지 컴포넌트
 * 기본 라우팅 예제 (URL: /about)
 */
const About = () => {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>소개 페이지</h1>
      <p>이 페이지는 React Router v7의 기본 라우팅 예제입니다.</p>

      <div style={{ marginTop: "2rem" }}>
        <h2>라우팅 특징</h2>
        <ul>
          <li>✅ routes.ts에서 명시적으로 정의된 라우트</li>
          <li>✅ Type-safe한 Route 타입 사용</li>
          <li>✅ meta 함수로 SEO 최적화</li>
        </ul>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Link to="/" style={{ color: "blue", textDecoration: "underline" }}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default About;
