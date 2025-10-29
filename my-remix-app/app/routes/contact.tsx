import type { Route } from "./+types/contact";
import { Link } from "react-router";

/**
 * Contact 페이지 메타데이터
 */
export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "연락처 - React Router v7 예제" },
    { name: "description", content: "연락처 정보 페이지" },
  ];
};

/**
 * Contact 페이지 컴포넌트
 * 기본 라우팅 예제 (URL: /contact)
 */
const Contact = () => {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>연락처</h1>
      <p>React Router v7 예제 앱의 연락처 페이지입니다.</p>

      <div style={{ marginTop: "2rem" }}>
        <h2>연락 정보</h2>
        <ul>
          <li>이메일: example@example.com</li>
          <li>전화: 02-1234-5678</li>
          <li>주소: 서울시 강남구</li>
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

export default Contact;
