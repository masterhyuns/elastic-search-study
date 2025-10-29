import type { Route } from "./+types/$userId";
import { Link, useNavigate } from "react-router";

/**
 * User Profile 페이지 메타데이터
 * params를 활용하여 동적으로 title 설정
 */
export const meta = ({ params }: Route.MetaArgs) => {
  return [
    { title: `사용자 ${params.userId} - 프로필` },
    { name: "description", content: `사용자 ${params.userId}의 프로필 페이지` },
  ];
};

/**
 * User Profile 데이터 로더
 * URL 파라미터를 사용하여 데이터 로드
 *
 * 실제 환경에서는 API나 DB에서 데이터를 가져옵니다.
 */
export const loader = async ({ params }: Route.LoaderArgs) => {
  const userId = params.userId;

  // 샘플 사용자 데이터
  const users: Record<string, any> = {
    "1": {
      id: "1",
      name: "김개발",
      email: "kim@example.com",
      role: "Frontend Developer",
      joinDate: "2024-01-15",
      bio: "React와 TypeScript를 좋아하는 개발자입니다.",
      stats: {
        posts: 42,
        followers: 156,
        following: 89,
      },
    },
    "2": {
      id: "2",
      name: "이디자인",
      email: "lee@example.com",
      role: "UI/UX Designer",
      joinDate: "2024-02-20",
      bio: "사용자 경험을 최우선으로 생각합니다.",
      stats: {
        posts: 28,
        followers: 203,
        following: 67,
      },
    },
    "3": {
      id: "3",
      name: "박풀스택",
      email: "park@example.com",
      role: "Full Stack Developer",
      joinDate: "2024-03-10",
      bio: "프론트엔드부터 백엔드까지 다룹니다.",
      stats: {
        posts: 67,
        followers: 342,
        following: 125,
      },
    },
  };

  const user = users[userId];

  // 사용자를 찾지 못한 경우 404 응답
  if (!user) {
    throw new Response("사용자를 찾을 수 없습니다", { status: 404 });
  }

  return { user };
};

/**
 * User Profile 페이지 컴포넌트
 * URL: /users/:userId
 *
 * 동적 라우팅 예제:
 * - /users/1 → userId = "1"
 * - /users/2 → userId = "2"
 * - /users/abc → userId = "abc"
 */
const UserProfile = ({ loaderData }: Route.ComponentProps) => {
  const { user } = loaderData;
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      {/* 헤더 */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={handleGoBack}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: "0.25rem",
            cursor: "pointer",
          }}
        >
          ← 뒤로 가기
        </button>
      </div>

      {/* 프로필 카드 */}
      <div
        style={{
          maxWidth: "600px",
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        {/* 커버 이미지 */}
        <div
          style={{
            height: "120px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        />

        {/* 프로필 정보 */}
        <div style={{ padding: "2rem" }}>
          {/* 아바타 */}
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginTop: "-70px",
              border: "4px solid white",
            }}
          >
            {user.name.charAt(0)}
          </div>

          {/* 이름과 역할 */}
          <h1 style={{ marginTop: "1rem", marginBottom: "0.25rem" }}>
            {user.name}
          </h1>
          <p style={{ color: "#64748b", margin: "0 0 0.5rem 0" }}>
            {user.role}
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem 0" }}>
            {user.email}
          </p>

          {/* 자기소개 */}
          <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
            {user.bio}
          </p>

          {/* 통계 */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              padding: "1rem",
              backgroundColor: "#f8fafc",
              borderRadius: "0.5rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>
                {user.stats.posts}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>포스트</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>
                {user.stats.followers}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>팔로워</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>
                {user.stats.following}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>팔로잉</div>
            </div>
          </div>

          {/* 가입일 */}
          <div style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "#94a3b8" }}>
            가입일: {user.joinDate}
          </div>
        </div>
      </div>

      {/* 동적 라우팅 설명 */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          backgroundColor: "#f0f9ff",
          borderRadius: "0.5rem",
          maxWidth: "600px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>동적 라우팅 예제</h3>
        <p style={{ margin: "0.5rem 0" }}>
          현재 URL: <code style={{ backgroundColor: "#e0f2fe", padding: "0.25rem 0.5rem", borderRadius: "0.25rem" }}>/users/{user.id}</code>
        </p>
        <p style={{ margin: "0.5rem 0" }}>다른 사용자 보기:</p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            to="/users/1"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.25rem",
            }}
          >
            사용자 1
          </Link>
          <Link
            to="/users/2"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.25rem",
            }}
          >
            사용자 2
          </Link>
          <Link
            to="/users/3"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.25rem",
            }}
          >
            사용자 3
          </Link>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Link to="/" style={{ color: "#3b82f6", textDecoration: "underline" }}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default UserProfile;
