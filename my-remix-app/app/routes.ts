import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // 홈페이지
  index("routes/home.tsx"),

  // 기본 라우팅
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),

  // 중첩 라우팅 - Blog (병렬 로딩)
  layout("routes/blog/layout.tsx", [
    index("routes/blog/index.tsx"),
    route("posts", "routes/blog/posts.tsx"),
    route("authors", "routes/blog/authors.tsx"),
  ]),

  // 점진적 렌더링 - Progressive (defer + Await)
  layout("routes/progressive/layout.tsx", [
    route("dashboard", "routes/progressive/dashboard.tsx"),
  ]),

  // 동적 라우팅 - Users
  route("users/:userId", "routes/users/$userId.tsx"),

  // 레이아웃 라우트 - Auth (pathless layout)
  layout("routes/auth/layout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("register", "routes/auth/register.tsx"),
  ]),

  // Splat Routes - Docs (catch-all)
  route("docs/*", "routes/docs/$.tsx"),
] satisfies RouteConfig;
