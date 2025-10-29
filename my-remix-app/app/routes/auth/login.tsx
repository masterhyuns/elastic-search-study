import type { Route } from "./+types/login";
import { Form, Link } from "react-router";

/**
 * Login 페이지 메타데이터
 */
export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "로그인 - React Router v7" },
    { name: "description", content: "로그인 페이지" },
  ];
};

/**
 * Login 폼 액션 핸들러
 * Form 제출 시 실행됨
 *
 * 실제 환경에서는 인증 로직을 구현합니다.
 */
export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  // 여기서 실제 인증 로직을 구현합니다
  console.log("로그인 시도:", { email, password });

  // 예제: 성공 시 리다이렉트
  // return redirect("/dashboard");

  return { success: true };
};

/**
 * Login 페이지 컴포넌트
 * URL: /login
 * AuthLayout 안에서 렌더링됨
 *
 * Form 컴포넌트 사용:
 * - method="post"로 action 함수 호출
 * - 자동 에러 핸들링
 * - 낙관적 UI 업데이트 가능
 */
const Login = () => {
  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#1e293b" }}>
        로그인
      </h2>

      <Form method="post">
        {/* 이메일 입력 */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="example@example.com"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* 비밀번호 입력 */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            placeholder="••••••••"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            fontSize: "1rem",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          로그인
        </button>
      </Form>

      {/* 회원가입 링크 */}
      <div
        style={{
          marginTop: "1.5rem",
          textAlign: "center",
          fontSize: "0.875rem",
          color: "#64748b",
        }}
      >
        계정이 없으신가요?{" "}
        <Link
          to="/register"
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          회원가입
        </Link>
      </div>
    </div>
  );
};

export default Login;
