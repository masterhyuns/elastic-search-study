# Remix 완벽 가이드 - 01. Remix 소개

## 목차
1. [Remix란 무엇인가?](#remix란-무엇인가)
2. [Remix의 핵심 철학](#remix의-핵심-철학)
3. [Remix vs 다른 프레임워크](#remix-vs-다른-프레임워크)
4. [Remix의 주요 특징](#remix의-주요-특징)
5. [언제 Remix를 사용해야 하는가?](#언제-remix를-사용해야-하는가)
6. [프로젝트 시작하기](#프로젝트-시작하기)

---

## Remix란 무엇인가?

**Remix**는 React 기반의 풀스택 웹 프레임워크로, 2021년 Shopify에 인수되어 현재는 오픈소스로 운영되고 있습니다.

### 핵심 정의
```
Remix = React Router + Server-Side Rendering + Progressive Enhancement
```

### 주요 목표
- **웹 표준 활용**: fetch, FormData, Headers 등 웹 표준 API를 최대한 활용
- **네트워크 최적화**: 불필요한 데이터 요청을 제거하고 병렬 로딩 최적화
- **사용자 경험 우선**: 빠른 페이지 로드와 부드러운 전환
- **개발자 경험 향상**: 직관적인 API와 강력한 타입 안정성

---

## Remix의 핵심 철학

### 1. 웹 플랫폼을 먼저 생각한다

Remix는 브라우저와 HTTP의 기본 동작을 존중합니다.

```typescript
// ❌ 일반적인 React 방식 (클라이언트 중심)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  // 상태 업데이트, 에러 처리, 로딩 상태 관리...
};

// ✅ Remix 방식 (웹 표준 활용)
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  // 서버에서 처리하고 자동으로 재검증
  return redirect('/users');
};
```

**장점:**
- JavaScript가 로드되기 전에도 폼이 동작
- 자동 에러 처리 및 재시도
- 브라우저 뒤로 가기/앞으로 가기 완벽 지원

### 2. 서버와 클라이언트의 경계를 명확히 한다

```typescript
// app/routes/users.$userId.tsx

// 🟦 서버에서만 실행 (데이터 로딩)
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const user = await db.user.findUnique({
    where: { id: params.userId }
  });
  return json({ user });
};

// 🟦 서버에서만 실행 (데이터 변경)
export const action = async ({ request }: ActionFunctionArgs) => {
  // 데이터베이스 직접 접근 가능
  return json({ success: true });
};

// 🟩 클라이언트에서 실행 (UI 렌더링)
export default function UserPage() {
  const { user } = useLoaderData<typeof loader>();
  return <div>{user.name}</div>;
}
```

### 3. Progressive Enhancement (점진적 향상)

JavaScript 없이도 동작하고, JavaScript가 있으면 더 좋은 경험을 제공합니다.

```typescript
// JavaScript가 비활성화되어도 이 폼은 동작합니다!
<Form method="post" action="/login">
  <input name="email" type="email" />
  <input name="password" type="password" />
  <button type="submit">로그인</button>
</Form>
```

---

## Remix vs 다른 프레임워크

### Remix vs Next.js

| 특징 | Remix | Next.js |
|------|-------|---------|
| **라우팅** | 파일 기반 + 중첩 라우팅 | 파일 기반 (App Router) |
| **데이터 페칭** | loader/action (서버 함수) | Server Components + Server Actions |
| **렌더링 전략** | SSR 중심 | SSR, SSG, ISR 등 다양 |
| **폼 처리** | 웹 표준 Form 활용 | React 기반 |
| **에러 처리** | 중첩 ErrorBoundary | Error.tsx 파일 |
| **배포** | 다양한 플랫폼 (어댑터) | Vercel 최적화 |
| **학습 곡선** | 중간 (웹 표준 이해 필요) | 낮음 → 높음 (기능 많음) |

### Remix vs SPA (React + React Router)

| 특징 | Remix | SPA |
|------|-------|-----|
| **초기 로딩** | 빠름 (SSR) | 느림 (JS 다운로드 필요) |
| **SEO** | 우수 | 별도 처리 필요 |
| **코드 스플리팅** | 자동 (라우트별) | 수동 설정 |
| **데이터 관리** | 서버 중심 | 클라이언트 상태 관리 |
| **네트워크 폭포** | 제거됨 | 발생 가능 |

---

## Remix의 주요 특징

### 1. 중첩 라우팅 (Nested Routing)

```
/dashboard
  /dashboard/settings
  /dashboard/analytics
```

각 라우트가 독립적으로 데이터를 로드하고 에러를 처리합니다.

```typescript
// app/routes/dashboard.tsx
export const loader = async () => {
  return json({ user: await getUser() });
};

export default function Dashboard() {
  return (
    <div>
      <Sidebar />
      <Outlet /> {/* 자식 라우트가 여기 렌더링 */}
    </div>
  );
}

// app/routes/dashboard.settings.tsx
export const loader = async () => {
  return json({ settings: await getSettings() });
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  return <div>{settings.theme}</div>;
}
```

**장점:**
- 페이지 전체가 아닌 필요한 부분만 업데이트
- 병렬 데이터 로딩으로 성능 향상
- 각 레벨에서 독립적인 에러 처리

### 2. 자동 코드 스플리팅

라우트별로 자동으로 코드를 분할하여 필요한 코드만 로드합니다.

```typescript
// app/routes/about.tsx
// 이 컴포넌트는 /about 경로에 접근할 때만 로드됩니다
export default function About() {
  return <h1>About Page</h1>;
}
```

### 3. 자동 에러 처리

```typescript
// app/routes/users.$userId.tsx

// 에러 발생 시 자동으로 이 컴포넌트가 렌더링
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }

  return <div>예상치 못한 오류가 발생했습니다</div>;
}
```

### 4. 최적화된 데이터 재검증

```typescript
// 폼 제출 후 자동으로 관련된 모든 loader가 재실행됩니다
<Form method="post" action="/tasks">
  <input name="title" />
  <button type="submit">추가</button>
</Form>
```

---

## 언제 Remix를 사용해야 하는가?

### ✅ Remix가 적합한 경우

1. **콘텐츠 중심 웹사이트**
   - 블로그, 뉴스 사이트, 문서 사이트
   - SEO가 중요한 마케팅 사이트

2. **대시보드 & 관리 도구**
   - 많은 폼과 데이터 업데이트가 있는 경우
   - 실시간 데이터 동기화가 필요한 경우

3. **전자상거래**
   - 빠른 초기 로딩이 중요
   - 복잡한 폼 처리 (주문, 결제)

4. **웹 성능이 중요한 경우**
   - 모바일 사용자가 많은 서비스
   - 느린 네트워크 환경 대응

### ❌ Remix가 적합하지 않은 경우

1. **정적 사이트만 필요한 경우**
   - 서버가 필요 없는 완전 정적 사이트 → Astro, Jekyll 고려

2. **매우 복잡한 클라이언트 상태 관리**
   - 실시간 협업 도구 (Figma 같은)
   - WebSocket 중심 애플리케이션

3. **API 서버만 필요한 경우**
   - REST API만 제공 → Express, Fastify 고려

---

## 프로젝트 시작하기

### 1. 새 프로젝트 생성

```bash
# npx를 사용한 프로젝트 생성
npx create-remix@latest my-remix-app

# 또는 pnpm 사용 (권장)
pnpm create remix@latest my-remix-app
```

**선택 옵션:**
```
? Where should we create your new project?
  ./my-remix-app

? What type of app do you want to create?
  ❯ Just the basics

? Where do you want to deploy?
  ❯ Remix App Server

? TypeScript or JavaScript?
  ❯ TypeScript

? Do you want me to run `pnpm install`?
  ❯ Yes
```

### 2. 프로젝트 구조

```
my-remix-app/
├── app/
│   ├── routes/              # 라우트 파일들
│   │   └── _index.tsx       # / 경로
│   ├── root.tsx             # 루트 레이아웃
│   └── entry.client.tsx     # 클라이언트 진입점
│   └── entry.server.tsx     # 서버 진입점
├── public/                  # 정적 파일
├── remix.config.js          # Remix 설정
├── package.json
└── tsconfig.json
```

### 3. 개발 서버 실행

```bash
cd my-remix-app
pnpm run dev
```

브라우저에서 `http://localhost:3000` 접속!

### 4. 첫 번째 라우트 만들기

```typescript
// app/routes/hello.tsx
export default function Hello() {
  return (
    <div>
      <h1>Hello Remix! 🎉</h1>
      <p>첫 번째 Remix 페이지입니다.</p>
    </div>
  );
}
```

`http://localhost:3000/hello` 접속하면 페이지 확인 가능!

---

## 핵심 개념 미리보기

### Loader (데이터 로딩)
```typescript
export const loader = async () => {
  const data = await fetchData();
  return json({ data });
};
```

### Action (데이터 변경)
```typescript
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  await saveData(formData);
  return redirect('/success');
};
```

### Component (UI)
```typescript
export default function MyRoute() {
  const { data } = useLoaderData<typeof loader>();
  return <div>{data}</div>;
}
```

---

## 다음 단계

다음 문서에서는 Remix의 라우팅 시스템을 상세히 알아보겠습니다:
- 파일 기반 라우팅
- 중첩 라우팅
- 동적 라우팅
- 라우트 모듈 API

**계속 학습하기**: [02-라우팅-시스템.md](./02-라우팅-시스템.md)
