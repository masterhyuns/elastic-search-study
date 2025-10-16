# Remix 완벽 가이드 - 04. Form과 사용자 상호작용

## 목차
1. [Form 컴포넌트 완벽 가이드](#form-컴포넌트-완벽-가이드)
2. [useFetcher 마스터하기](#usefetcher-마스터하기)
3. [useNavigation으로 로딩 상태 관리](#usenavigation으로-로딩-상태-관리)
4. [낙관적 UI (Optimistic UI)](#낙관적-ui-optimistic-ui)
5. [폼 유효성 검증](#폼-유효성-검증)
6. [파일 업로드](#파일-업로드)
7. [고급 폼 패턴](#고급-폼-패턴)

---

## Form 컴포넌트 완벽 가이드

Remix의 `<Form>` 컴포넌트는 웹 표준 `<form>`을 확장하여 더 나은 사용자 경험을 제공합니다.

### 1. 기본 사용법

```typescript
// app/routes/contacts.new.tsx
import { Form, useActionData, redirect } from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");

  // 유효성 검증
  if (!name || !email) {
    return json({
      errors: { name: !name ? "이름을 입력해주세요" : null, email: !email ? "이메일을 입력해주세요" : null }
    }, { status: 400 });
  }

  // 데이터 저장
  const contact = await db.contact.create({
    data: { name: name.toString(), email: email.toString() }
  });

  return redirect(`/contacts/${contact.id}`);
};

export default function NewContact() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <div>
        <label htmlFor="name">이름</label>
        <input
          id="name"
          name="name"
          type="text"
          aria-invalid={actionData?.errors?.name ? true : undefined}
          aria-describedby="name-error"
        />
        {actionData?.errors?.name && (
          <p id="name-error" style={{ color: "red" }}>
            {actionData.errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          name="email"
          type="email"
          aria-invalid={actionData?.errors?.email ? true : undefined}
          aria-describedby="email-error"
        />
        {actionData?.errors?.email && (
          <p id="email-error" style={{ color: "red" }}>
            {actionData.errors.email}
          </p>
        )}
      </div>

      <button type="submit">저장</button>
    </Form>
  );
}
```

**Form의 장점:**
- ✅ JavaScript 없이도 동작 (Progressive Enhancement)
- ✅ 자동 재검증 (제출 후 loader 재실행)
- ✅ 에러 처리 자동화
- ✅ 로딩 상태 관리 간편

### 2. Form vs form (일반 HTML)

```typescript
// ❌ 일반 HTML form
<form method="post" onSubmit={handleSubmit}>
  {/* 직접 fetch 호출, 상태 관리, 에러 처리 필요 */}
</form>

// ✅ Remix Form
<Form method="post">
  {/* Remix가 모든 것을 자동 처리 */}
</Form>
```

### 3. HTTP 메소드

```typescript
// POST (기본값)
<Form method="post">
  {/* 새로운 데이터 생성 */}
</Form>

// GET (검색, 필터링)
<Form method="get">
  <input name="search" type="text" />
  <button type="submit">검색</button>
</Form>
// URL: /posts?search=keyword

// PUT (수정)
<Form method="put">
  {/* 데이터 업데이트 */}
</Form>

// DELETE (삭제)
<Form method="delete">
  <button type="submit">삭제</button>
</Form>
```

### 4. action 속성 (다른 라우트로 제출)

```typescript
// 현재 라우트가 아닌 다른 라우트의 action 호출
<Form method="post" action="/api/newsletter">
  <input name="email" type="email" />
  <button type="submit">구독</button>
</Form>
```

### 5. replace 속성 (히스토리 대체)

```typescript
// 브라우저 히스토리에 새 항목을 추가하지 않고 현재 항목 대체
<Form method="post" replace>
  <input name="search" />
  <button type="submit">검색</button>
</Form>
```

---

## useFetcher 마스터하기

`useFetcher`는 페이지 네비게이션 없이 서버와 통신하는 강력한 도구입니다.

### 1. 기본 사용법

```typescript
import { useFetcher } from "@remix-run/react";

export default function Newsletter() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action="/api/newsletter">
      <input name="email" type="email" />
      <button type="submit">
        {fetcher.state === "submitting" ? "제출 중..." : "구독"}
      </button>

      {fetcher.data?.success && (
        <p style={{ color: "green" }}>구독 완료!</p>
      )}

      {fetcher.data?.error && (
        <p style={{ color: "red" }}>{fetcher.data.error}</p>
      )}
    </fetcher.Form>
  );
}
```

### 2. fetcher.state (상태 관리)

```typescript
const fetcher = useFetcher();

// fetcher.state 값:
// - "idle": 대기 중
// - "submitting": 제출 중 (action 실행 중)
// - "loading": 로딩 중 (loader 실행 중)

<button disabled={fetcher.state !== "idle"}>
  {fetcher.state === "submitting" && "제출 중..."}
  {fetcher.state === "loading" && "로딩 중..."}
  {fetcher.state === "idle" && "저장"}
</button>
```

### 3. fetcher.submit() (프로그래밍 방식 제출)

```typescript
const fetcher = useFetcher();

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const formData = new FormData();
  formData.append("completed", event.target.checked.toString());
  formData.append("id", todo.id);

  // 프로그래밍 방식으로 제출
  fetcher.submit(formData, {
    method: "post",
    action: "/api/todos/update"
  });
};

return (
  <input
    type="checkbox"
    checked={todo.completed}
    onChange={handleChange}
  />
);
```

### 4. fetcher.load() (loader 데이터 가져오기)

```typescript
const fetcher = useFetcher();

useEffect(() => {
  // 다른 라우트의 loader 데이터 가져오기
  fetcher.load("/api/user/preferences");
}, []);

return (
  <div>
    {fetcher.state === "loading" && <p>로딩 중...</p>}
    {fetcher.data && <p>테마: {fetcher.data.theme}</p>}
  </div>
);
```

### 5. 여러 fetcher 동시 사용

```typescript
export default function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

const TodoItem = ({ todo }) => {
  const fetcher = useFetcher(); // 각 항목마다 독립적인 fetcher

  const isCompleted = fetcher.formData
    ? fetcher.formData.get("completed") === "true"
    : todo.completed;

  return (
    <li>
      <fetcher.Form method="post" action={`/todos/${todo.id}`}>
        <input
          type="checkbox"
          name="completed"
          value="true"
          checked={isCompleted}
          onChange={(e) => fetcher.submit(e.currentTarget.form)}
        />
        <span style={{ textDecoration: isCompleted ? "line-through" : "none" }}>
          {todo.title}
        </span>
      </fetcher.Form>
    </li>
  );
};
```

### 6. useFetchers (모든 fetcher 상태 확인)

```typescript
import { useFetchers } from "@remix-run/react";

export default function GlobalLoadingIndicator() {
  const fetchers = useFetchers();

  const isAnySubmitting = fetchers.some(
    fetcher => fetcher.state === "submitting" || fetcher.state === "loading"
  );

  return isAnySubmitting ? (
    <div className="global-loading">처리 중...</div>
  ) : null;
}
```

---

## useNavigation으로 로딩 상태 관리

`useNavigation`은 페이지 네비게이션 상태를 추적합니다.

### 1. 기본 사용법

```typescript
import { useNavigation } from "@remix-run/react";

export default function Root() {
  const navigation = useNavigation();

  return (
    <html>
      <body>
        {navigation.state === "loading" && (
          <div className="global-spinner">로딩 중...</div>
        )}

        <Outlet />
      </body>
    </html>
  );
}
```

### 2. navigation.state 상세

```typescript
const navigation = useNavigation();

// navigation.state 값:
// - "idle": 대기 중
// - "submitting": 폼 제출 중 (action 실행 중)
// - "loading": 페이지 로딩 중 (loader 실행 중)

<div>
  {navigation.state === "idle" && "대기 중"}
  {navigation.state === "submitting" && "제출 중..."}
  {navigation.state === "loading" && "로딩 중..."}
</div>
```

### 3. 진행 표시줄 (Progress Bar)

```typescript
import { useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function ProgressBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (navigation.state === "loading") {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [navigation.state]);

  if (navigation.state === "idle") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "#e0e0e0"
      }}
    >
      <div
        style={{
          height: "100%",
          background: "#3b82f6",
          width: `${progress}%`,
          transition: "width 0.3s ease"
        }}
      />
    </div>
  );
}
```

### 4. 특정 경로의 로딩만 표시

```typescript
const navigation = useNavigation();

// 현재 네비게이션 정보
console.log(navigation.location?.pathname); // 이동할 경로
console.log(navigation.formData);           // 제출된 폼 데이터
console.log(navigation.formMethod);         // HTTP 메소드

// 특정 경로로 이동 중일 때만 로딩 표시
const isLoadingPosts =
  navigation.state === "loading" &&
  navigation.location?.pathname.startsWith("/posts");

return (
  <div>
    {isLoadingPosts && <Spinner />}
  </div>
);
```

---

## 낙관적 UI (Optimistic UI)

서버 응답을 기다리지 않고 즉시 UI를 업데이트하여 더 빠른 사용자 경험을 제공합니다.

### 1. fetcher를 사용한 낙관적 UI

```typescript
const TodoItem = ({ todo }) => {
  const fetcher = useFetcher();

  // 낙관적 상태 계산
  const isCompleted = fetcher.formData
    ? fetcher.formData.get("completed") === "true" // 제출된 값 사용
    : todo.completed;                               // 기존 값 사용

  return (
    <fetcher.Form method="post" action={`/todos/${todo.id}`}>
      <input
        type="hidden"
        name="completed"
        value={(!isCompleted).toString()}
      />
      <button type="submit">
        <span style={{ textDecoration: isCompleted ? "line-through" : "none" }}>
          {todo.title}
        </span>
      </button>
    </fetcher.Form>
  );
};
```

### 2. useNavigation을 사용한 낙관적 UI

```typescript
import { useNavigation } from "@remix-run/react";

export default function PostsList({ posts }) {
  const navigation = useNavigation();

  // 제출 중인 새 포스트
  const submittingPost = navigation.formData && {
    id: "temp-" + Date.now(),
    title: navigation.formData.get("title"),
    content: navigation.formData.get("content"),
    createdAt: new Date().toISOString()
  };

  // 낙관적으로 새 포스트 추가
  const optimisticPosts = submittingPost
    ? [submittingPost, ...posts]
    : posts;

  return (
    <div>
      <Form method="post">
        <input name="title" placeholder="제목" />
        <textarea name="content" placeholder="내용" />
        <button type="submit">작성</button>
      </Form>

      <ul>
        {optimisticPosts.map(post => (
          <li
            key={post.id}
            style={{ opacity: post.id.startsWith("temp-") ? 0.5 : 1 }}
          >
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. 삭제 시 낙관적 UI

```typescript
const DeleteButton = ({ postId }) => {
  const fetcher = useFetcher();

  // 삭제 중인지 확인
  const isDeleting =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === "delete";

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="delete" />
      <input type="hidden" name="postId" value={postId} />
      <button
        type="submit"
        disabled={isDeleting}
        style={{ opacity: isDeleting ? 0.5 : 1 }}
      >
        {isDeleting ? "삭제 중..." : "삭제"}
      </button>
    </fetcher.Form>
  );
};

// 리스트에서 낙관적으로 제거
export default function PostsList({ posts }) {
  const fetchers = useFetchers();

  // 삭제 중인 포스트 ID 목록
  const deletingPostIds = fetchers
    .filter(f => f.formData?.get("intent") === "delete")
    .map(f => f.formData?.get("postId"));

  // 삭제 중인 포스트 제외
  const optimisticPosts = posts.filter(
    post => !deletingPostIds.includes(post.id)
  );

  return (
    <ul>
      {optimisticPosts.map(post => (
        <li key={post.id}>
          {post.title}
          <DeleteButton postId={post.id} />
        </li>
      ))}
    </ul>
  );
}
```

---

## 폼 유효성 검증

### 1. 서버 사이드 검증

```typescript
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  const errors: Record<string, string> = {};

  // 이메일 검증
  if (!email || typeof email !== "string") {
    errors.email = "이메일을 입력해주세요";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "올바른 이메일 형식이 아닙니다";
  }

  // 비밀번호 검증
  if (!password || typeof password !== "string") {
    errors.password = "비밀번호를 입력해주세요";
  } else if (password.length < 8) {
    errors.password = "비밀번호는 8자 이상이어야 합니다";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  // 로그인 처리
  const user = await login(email, password);

  return redirect("/dashboard");
};
```

### 2. Zod를 사용한 검증

```typescript
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다")
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const result = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!result.success) {
    return json({
      errors: result.error.flatten().fieldErrors
    }, { status: 400 });
  }

  const { email, password } = result.data;
  const user = await login(email, password);

  return redirect("/dashboard");
};
```

### 3. 클라이언트 사이드 검증 (선택적)

```typescript
import { useState } from "react";

export default function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const actionData = useActionData<typeof action>();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const clientErrors: Record<string, string> = {};

    const email = formData.get("email")?.toString();
    if (!email) {
      clientErrors.email = "이메일을 입력해주세요";
      e.preventDefault();
    }

    const password = formData.get("password")?.toString();
    if (!password) {
      clientErrors.password = "비밀번호를 입력해주세요";
      e.preventDefault();
    }

    setErrors(clientErrors);
  };

  const displayErrors = actionData?.errors || errors;

  return (
    <Form method="post" onSubmit={handleSubmit}>
      <div>
        <input name="email" type="email" />
        {displayErrors.email && (
          <p style={{ color: "red" }}>{displayErrors.email}</p>
        )}
      </div>

      <div>
        <input name="password" type="password" />
        {displayErrors.password && (
          <p style={{ color: "red" }}>{displayErrors.password}</p>
        )}
      </div>

      <button type="submit">로그인</button>
    </Form>
  );
}
```

---

## 파일 업로드

### 1. 기본 파일 업로드

```typescript
// app/routes/upload.tsx
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return json({ error: "파일을 선택해주세요" }, { status: 400 });
  }

  // 파일 크기 검증 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return json({ error: "파일 크기는 5MB 이하여야 합니다" }, { status: 400 });
  }

  // 파일 타입 검증
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return json({ error: "이미지 파일만 업로드 가능합니다" }, { status: 400 });
  }

  // 파일을 Buffer로 변환
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 파일 저장 (예: S3)
  const fileName = `${Date.now()}-${file.name}`;
  const url = await uploadToS3(buffer, fileName, file.type);

  return json({ success: true, url });
};

export default function Upload() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isUploading = navigation.state === "submitting";

  return (
    <Form method="post" encType="multipart/form-data">
      <input
        type="file"
        name="file"
        accept="image/*"
        disabled={isUploading}
      />

      <button type="submit" disabled={isUploading}>
        {isUploading ? "업로드 중..." : "업로드"}
      </button>

      {actionData?.error && (
        <p style={{ color: "red" }}>{actionData.error}</p>
      )}

      {actionData?.url && (
        <img src={actionData.url} alt="Uploaded" />
      )}
    </Form>
  );
}
```

### 2. 다중 파일 업로드

```typescript
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return json({ error: "파일을 선택해주세요" }, { status: 400 });
  }

  const uploadedUrls = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${file.name}`;
    const url = await uploadToS3(buffer, fileName, file.type);
    uploadedUrls.push(url);
  }

  return json({ success: true, urls: uploadedUrls });
};

export default function MultiUpload() {
  return (
    <Form method="post" encType="multipart/form-data">
      <input type="file" name="files" multiple />
      <button type="submit">업로드</button>
    </Form>
  );
}
```

### 3. 이미지 미리보기

```typescript
import { useState } from "react";

export default function ImageUploadWithPreview() {
  const [preview, setPreview] = useState<string | null>(null);
  const actionData = useActionData<typeof action>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form method="post" encType="multipart/form-data">
      <input
        type="file"
        name="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {preview && (
        <div>
          <h3>미리보기</h3>
          <img src={preview} alt="Preview" style={{ maxWidth: "300px" }} />
        </div>
      )}

      <button type="submit">업로드</button>

      {actionData?.url && (
        <div>
          <h3>업로드 완료</h3>
          <img src={actionData.url} alt="Uploaded" />
        </div>
      )}
    </Form>
  );
}
```

---

## 고급 폼 패턴

### 1. 자동 저장 (Auto-save)

```typescript
import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { useDebounce } from "~/hooks/useDebounce";

export default function AutoSaveEditor({ note }) {
  const fetcher = useFetcher();
  const [content, setContent] = useState(note.content);
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    if (debouncedContent !== note.content) {
      const formData = new FormData();
      formData.append("content", debouncedContent);
      formData.append("noteId", note.id);

      fetcher.submit(formData, {
        method: "post",
        action: "/api/notes/save"
      });
    }
  }, [debouncedContent]);

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div>
        {fetcher.state === "submitting" && "저장 중..."}
        {fetcher.state === "idle" && fetcher.data && "저장됨"}
      </div>
    </div>
  );
}

// hooks/useDebounce.ts
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

### 2. 인라인 편집 (Inline Edit)

```typescript
const InlineEdit = ({ item }) => {
  const fetcher = useFetcher();
  const [isEditing, setIsEditing] = useState(false);

  const value = fetcher.formData?.get("title") || item.title;

  return isEditing ? (
    <fetcher.Form
      method="post"
      action={`/items/${item.id}`}
      onSubmit={() => setIsEditing(false)}
    >
      <input
        name="title"
        defaultValue={item.title}
        autoFocus
        onBlur={(e) => {
          if (e.currentTarget.value !== item.title) {
            fetcher.submit(e.currentTarget.form);
          }
          setIsEditing(false);
        }}
      />
    </fetcher.Form>
  ) : (
    <div onClick={() => setIsEditing(true)}>
      {value}
    </div>
  );
};
```

### 3. 검색 필터 (URL 동기화)

```typescript
// app/routes/products.tsx
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";
  const minPrice = url.searchParams.get("minPrice") || "0";

  const products = await db.product.findMany({
    where: {
      name: { contains: search },
      category: category || undefined,
      price: { gte: parseFloat(minPrice) }
    }
  });

  return json({ products, search, category, minPrice });
};

export default function Products() {
  const { products, search, category, minPrice } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const isSearching = navigation.location?.pathname === "/products";

  return (
    <div>
      <Form method="get">
        <input
          name="search"
          defaultValue={search}
          placeholder="검색..."
        />
        <select name="category" defaultValue={category}>
          <option value="">모든 카테고리</option>
          <option value="electronics">전자제품</option>
          <option value="clothing">의류</option>
        </select>
        <input
          name="minPrice"
          type="number"
          defaultValue={minPrice}
          placeholder="최소 가격"
        />
        <button type="submit">검색</button>
      </Form>

      {isSearching && <div>검색 중...</div>}

      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 다음 단계

다음 문서에서는 Remix의 에러 처리와 메타데이터를 상세히 알아보겠습니다:
- ErrorBoundary 완벽 가이드
- 에러 처리 전략
- SEO 메타데이터
- 동적 메타 태그

**계속 학습하기**: [05-에러처리와-메타데이터.md](./05-에러처리와-메타데이터.md)
