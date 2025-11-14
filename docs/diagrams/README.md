# PlantUML 다이어그램 템플릿 - Next.js/React 특화

Next.js 14, React 컴포넌트, 상태 관리, 데이터 플로우 시각화를 위한 실무 템플릿 모음입니다.

## 📁 디렉토리 구조

```
docs/diagrams/
├── components/              # 컴포넌트 구조
│   ├── 01-hierarchical-component.puml
│   ├── 02-module-federation.puml
│   ├── 03-nextjs-server-client-components.puml  ⭐ NEW
│   └── 04-compound-component-pattern.puml       ⭐ NEW
├── data-flow/              # 데이터 흐름
│   ├── 01-sequence-api-flow.puml
│   ├── 02-activity-order-process.puml
│   ├── 03-react-data-flow.puml
│   └── 04-nextjs-server-actions.puml            ⭐ NEW
├── state-management/       # 상태 관리
│   ├── 01-state-machine.puml
│   ├── 02-timing-diagram.puml
│   └── 03-react-query-pattern.puml              ⭐ NEW
├── type-system/            # 타입 시스템
│   ├── 01-class-diagram-typescript.puml
│   └── 02-generic-type-relationships.puml
└── README.md              # 이 파일
```

## 🚀 빠른 시작

### VSCode 설치
```bash
code --install-extension jebbs.plantuml
```

### 다이어그램 생성
```bash
# SVG 생성
plantuml -tsvg docs/diagrams/**/*.puml

# 특정 파일만
plantuml -tsvg docs/diagrams/components/03-nextjs-server-client-components.puml
```

## 📚 템플릿 카탈로그

### ⭐ Next.js 14 특화 템플릿

#### 03-nextjs-server-client-components.puml
**용도**: Server/Client Components 구분 전략

**핵심 내용**:
- Server Components (기본값, async 가능)
- Client Components ('use client' 필수)
- Server → Client 전달 (children 패턴)
- 데이터 페칭 전략 (fetch with cache)

**활용 사례**:
- App Router 마이그레이션
- 성능 최적화 (번들 크기 감소)
- 팀원 교육 자료

```tsx
// Server Component (기본)
async function Page() {
  const data = await db.users.findMany()
  return <UserList data={data} />
}

// Client Component (상태 사용)
'use client'
function SearchBar() {
  const [query, setQuery] = useState('')
  return <input onChange={(e) => setQuery(e.target.value)} />
}
```

#### 04-nextjs-server-actions.puml
**용도**: Form 제출 & Server Actions 플로우

**핵심 내용**:
- useOptimistic으로 즉시 UI 반영
- Server Action 정의 ('use server')
- revalidatePath로 캐시 무효화
- useFormState로 에러 핸들링
- useFormStatus로 로딩 상태

**활용 사례**:
- 폼 제출 최적화
- Optimistic Updates 구현
- Progressive Enhancement

```tsx
'use server'
export async function createPost(formData: FormData) {
  // 검증
  const validated = schema.parse(formData)
  // DB 저장
  await db.post.create({ data: validated })
  // 재검증
  revalidatePath('/posts')
  // 리다이렉트
  redirect('/posts')
}
```

### ⚛️ React 패턴 템플릿

#### 03-react-query-pattern.puml
**용도**: TanStack Query 데이터 패칭 패턴

**핵심 내용**:
- useQuery (캐싱, background refetch)
- useMutation (Optimistic Updates)
- useInfiniteQuery (무한 스크롤)
- Prefetching 전략
- staleTime vs cacheTime

**활용 사례**:
- API 데이터 캐싱
- 낙관적 업데이트
- 무한 스크롤 구현

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000 // 5분간 fresh
})

const mutation = useMutation({
  mutationFn: deleteUser,
  onMutate: async (userId) => {
    // Optimistic Update
    queryClient.setQueryData(['users'], old =>
      old.filter(u => u.id !== userId)
    )
  }
})
```

#### 04-compound-component-pattern.puml
**용도**: 재사용 가능한 복합 컴포넌트 패턴

**핵심 내용**:
- Context로 상태 공유
- 유연한 컴포지션
- Accordion, Tabs, Select 예시
- Radix UI, Headless UI 패턴

**활용 사례**:
- Design System 구축
- 재사용 컴포넌트 라이브러리
- 팀 컴포넌트 가이드

```tsx
<Accordion>
  <Accordion.Item id="1">
    <Accordion.Trigger>제목</Accordion.Trigger>
    <Accordion.Content>내용</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### 🔄 데이터 플로우

#### 01-sequence-api-flow.puml
**용도**: API 요청-응답 시퀀스

**핵심 내용**:
- 인증/인가 과정
- Redis 캐싱 전략
- Token 재발급 (refreshToken)
- Exponential Backoff 재시도

#### 02-activity-order-process.puml
**용도**: 복잡한 비즈니스 프로세스

**핵심 내용**:
- Saga 패턴
- 보상 트랜잭션
- 병렬 처리 (fork/join)
- 이벤트 기반 후속 처리

#### 03-react-data-flow.puml
**용도**: React 컴포넌트 데이터 흐름

**핵심 내용**:
- Props Down, Events Up
- Zustand 상태 관리
- Optimistic UI
- Context API vs Zustand

### 🎨 컴포넌트 구조

#### 01-hierarchical-component.puml
**용도**: 프론트엔드 컴포넌트 계층 구조

**핵심 내용**:
- Page → Container → Presentational → Atomic
- Props 전달 경로
- Container/Presenter 패턴

#### 02-module-federation.puml
**용도**: 마이크로 프론트엔드

**핵심 내용**:
- Webpack Module Federation
- Host/Remote 구조
- 공유 라이브러리 (React, Router)

### 📊 상태 관리

#### 01-state-machine.puml
**용도**: 상태 머신 (XState)

**핵심 내용**:
- 주문 상태 전이 (CREATED → PAID → SHIPPED)
- Timeout 정책
- 보상 트랜잭션

#### 02-timing-diagram.puml
**용도**: 실시간 협업 (WebSocket)

**핵심 내용**:
- Operational Transform
- 동시성 제어
- 성능 병목 분석

### 🔤 타입 시스템

#### 01-class-diagram-typescript.puml
**용도**: DDD 엔티티/밸류 객체

**핵심 내용**:
- IEntity, IAggregateRoot
- User, Order 도메인
- Repository 패턴

#### 02-generic-type-relationships.puml
**용도**: TypeScript 제네릭 타입

**핵심 내용**:
- Conditional Types
- Mapped Types
- Utility Types (Partial, Pick, Omit)

## 💡 실무 활용 팁

### 1. 리팩토링 문서화
```markdown
## AS-IS
![기존 구조](./diagrams/components/as-is.svg)

## TO-BE
![개선 구조](./diagrams/components/to-be.svg)
```

### 2. PR 리뷰
```markdown
### 변경 사항
- Server/Client Components 분리로 번들 크기 30% 감소
![구조 변경](./diagrams/components/03-nextjs-server-client-components.svg)
```

### 3. 온보딩 문서
```markdown
### Next.js 14 App Router 가이드
1. [Server/Client Components](./diagrams/components/03-nextjs-server-client-components.svg)
2. [Server Actions](./diagrams/data-flow/04-nextjs-server-actions.svg)
3. [React Query 패턴](./diagrams/state-management/03-react-query-pattern.svg)
```

## 🔧 커스터마이징

### 자주 사용하는 패턴

**Server Component → API 호출**
```plantuml
[YourPage] <<server>> as page
database "Your API" as api

page --> api : fetch with cache
```

**Client Component → 상태 관리**
```plantuml
[YourComponent] <<client>> as component
[useYourStore] <<hook>> as store

component --> store : useState/Zustand
```

## 📖 학습 자료

### Next.js 14
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### React Query
- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [실전 패턴](https://tkdodo.eu/blog/practical-react-query)

### Design Patterns
- [Patterns.dev](https://www.patterns.dev/)
- [React Patterns](https://reactpatterns.com/)

## 🚨 문제 해결

### PlantUML 렌더링 안 됨
```bash
# Java 설치 확인
java -version

# VSCode 설정
{
  "plantuml.server": "https://www.plantuml.com/plantuml"
}
```

### 한글 깨짐
```plantuml
@startuml
skinparam defaultFontName "맑은 고딕"
@enduml
```

## 📞 문의

- 프로젝트 Issue: [GitHub Issues](https://github.com/your-repo/issues)
- PlantUML 질문: [PlantUML Forum](https://forum.plantuml.net/)

---

**마지막 업데이트**: 2025-01-15
**대상 독자**: Next.js/React 개발자
**난이도**: 초급 ~ 고급
