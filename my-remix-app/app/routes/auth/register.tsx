import type { Route } from "./+types/register";
import { Form, Link } from "react-router";

/**
 * Register 페이지 메타데이터
 */
export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "회원가입 - React Router v7" },
    { name: "description", content: "회원가입 페이지" },
  ];
};

/**
 * Register 폼 액션 핸들러
 * Form 제출 시 실행됨
 */
export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  // 여기서 실제 회원가입 로직을 구현합니다
  console.log("회원가입 시도:", { name, email, password });

  // 예제: 성공 시 리다이렉트
  // return redirect("/login");

  return { success: true };
};

/**
 * Register 페이지 컴포넌트
 * URL: /register
 * AuthLayout 안에서 렌더링됨
 */
const Register = () => {
  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#1e293b" }}>
        회원가입
      </h2>

      <Form method="post">
        {/* 이름 입력 */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="name"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            이름
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="홍길동"
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
        <div style={{ marginBottom: "1rem" }}>
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

        {/* 비밀번호 확인 */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="confirmPassword"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
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
          회원가입
        </button>
      </Form>

      {/* 로그인 링크 */}
      <div
        style={{
          marginTop: "1.5rem",
          textAlign: "center",
          fontSize: "0.875rem",
          color: "#64748b",
        }}
      >
        이미 계정이 있으신가요?{" "}
        <Link
          to="/login"
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          로그인
        </Link>
      </div>
    </div>
  );
};

export default Register;
