# Module 3: 상태 관리 전략

> **실전 중심**: Props Drilling 7단계의 실제 고통과 해결법

## 🎯 학습 목표

이 모듈을 마치면:
- Props Drilling의 **실제 피해**를 측정하고 해결
- Context, Composition, Zustand 중 **어떤 상황에 어떤 방법**을 쓸지 결정
- 상태 배치를 **결정 트리**로 판단
- 리팩토링 후 **Git 충돌, 타입 에러 90% 감소** 경험

## 📖 목차

1. [실전 문제: Props Drilling 7단계의 악몽](#1-실전-문제-props-drilling-7단계의-악몽)
2. [해결법 1: Composition 패턴](#2-해결법-1-composition-패턴)
3. [해결법 2: Context API](#3-해결법-2-context-api)
4. [해결법 3: Zustand 전역 상태](#4-해결법-3-zustand-전역-상태)
5. [상태 배치 결정 트리](#5-상태-배치-결정-트리)
6. [실습: 리팩토링 전후 비교](#6-실습-리팩토링-전후-비교)

---

## 1. 실전 문제: Props Drilling 7단계의 악몽

### 1.1 실제 코드

```typescript
// ❌ App.tsx - user를 7단계 전달
interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  return <Layout user={user} />;
};

// Layout.tsx
interface LayoutProps {
  user: User | null; // 안 쓰는데 전달만 함
}

const Layout = ({ user }: LayoutProps) => {
  return (
    <div>
      <PageContainer user={user} />
    </div>
  );
};

// PageContainer.tsx
interface PageContainerProps {
  user: User | null; // 안 쓰는데 전달만 함
}

const PageContainer = ({ user }: PageContainerProps) => {
  return <MainSection user={user} />;
};

// MainSection.tsx
const MainSection = ({ user }: { user: User | null }) => {
  return <ContentArea user={user} />;
};

// ContentArea.tsx
const ContentArea = ({ user }: { user: User | null }) => {
  return <ArticleList user={user} />;
};

// ArticleList.tsx
const ArticleList = ({ user }: { user: User | null }) => {
  return (
    <div>
      {articles.map(article => (
        <Article key={article.id} article={article} user={user} />
      ))}
    </div>
  );
};

// Article.tsx
const Article = ({ article, user }: { article: Article; user: User | null }) => {
  return (
    <div>
      <ArticleHeader user={user} />
      <ArticleBody content={article.content} />
    </div>
  );
};

// ArticleHeader.tsx - 여기서 드디어 사용!
const ArticleHeader = ({ user }: { user: User | null }) => {
  return (
    <div>
      {user && <Avatar src={user.avatar} name={user.name} />}
    </div>
  );
};
```

### 1.2 실제 겪은 문제들

#### 문제 1: 리팩토링 악몽

```
요구사항: user → currentUser로 이름 변경
수정해야 할 파일: 7개
소요 시간: 30분
발생한 버그: 2개 (한 곳에서 이름 안 바꿈)
```

#### 문제 2: 타입 지옥

```typescript
// 중간 컴포넌트들이 user 타입을 알아야 함 (안 쓰는데!)

// Layout.tsx
import { User } from '@/types/user'; // 불필요한 import

// PageContainer.tsx
import { User } from '@/types/user'; // 불필요한 import

// 총 5개 파일에 불필요한 import
```

#### 문제 3: Props 빠뜨림 버그

```typescript
// 실수로 한 곳에서 props 안 넘김
const ContentArea = ({ user }: { user: User | null }) => {
  // 🐛 버그: ArticleList에 user 안 넘김
  return <ArticleList />; // user props 누락
};

// 결과: 런타임 에러 (user is undefined)
// 발견 시점: 프로덕션 배포 후
```

실제 발생률: 월 1-2회

#### 문제 4: 테스트 지옥

```typescript
// ArticleHeader 테스트하려면...
test('아바타 표시', () => {
  render(
    <App> {/* 7단계 전부 렌더링 */}
      <Layout>
        <PageContainer>
          <MainSection>
            <ContentArea>
              <ArticleList>
                <Article>
                  <ArticleHeader user={mockUser} />
                </Article>
              </ArticleList>
            </ContentArea>
          </MainSection>
        </PageContainer>
      </Layout>
    </App>
  );
});

// 포기...
```

### 1.3 측정 가능한 피해

| 지표 | Props Drilling | 비고 |
|-----|----------------|-----|
| 리팩토링 시 수정 파일 | 7개 | user 이름 변경 시 |
| 불필요한 타입 import | 5개 파일 | 안 쓰는데 타입 필요 |
| Props 누락 버그 | 월 1-2회 | 런타임 에러 |
| 테스트 복잡도 | 7배 | 전체 트리 필요 |
| 새 개발자 이해 시간 | 1시간+ | Props 추적 어려움 |

---

## 2. 해결법 1: Composition 패턴

### 2.1 언제 사용?

```
✅ Composition 사용 시점:
- Props가 1-2개만 깊게 전달
- 전체 앱이 아닌 일부 트리에서만 필요
- 재사용성이 중요한 경우
```

### 2.2 실전 적용

```typescript
// ✅ Composition으로 해결
const App = () => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <Layout>
      <PageContainer>
        <MainSection>
          {/* Avatar를 직접 넘김 */}
          <ContentArea header={<Avatar user={user} />}>
            <ArticleList />
          </ContentArea>
        </MainSection>
      </PageContainer>
    </Layout>
  );
};

// ContentArea는 user 몰라도 됨
interface ContentAreaProps {
  header: React.ReactNode;
  children: React.ReactNode;
}

const ContentArea = ({ header, children }: ContentAreaProps) => {
  return (
    <div>
      <div className={styles.header}>{header}</div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

// Avatar만 user 알면 됨
const Avatar = ({ user }: { user: User | null }) => {
  if (!user) return null;
  return <img src={user.avatar} alt={user.name} />;
};
```

### 2.3 개선 효과

| 지표 | Before | After | 개선 |
|-----|--------|-------|-----|
| Props 전달 단계 | 7단계 | 0단계 | 100% 제거 |
| 타입 import | 5개 파일 | 1개 파일 | 80% 감소 |
| Props 누락 버그 | 월 1-2회 | 0회 | ✅ |
| 테스트 복잡도 | 7배 | 1배 | ✅ |

### 2.4 Composition 패턴 더 알아보기

#### 예제 1: Modal 컴포넌트

```typescript
// ❌ BAD: Props로 모든 것 전달
<Modal
  title="사용자 정보"
  content={<UserProfile user={user} />}
  footer={<Button>닫기</Button>}
/>

// ✅ GOOD: Composition
<Modal>
  <Modal.Header>
    <h2>사용자 정보</h2>
  </Modal.Header>
  <Modal.Body>
    <UserProfile user={user} />
  </Modal.Body>
  <Modal.Footer>
    <Button>닫기</Button>
  </Modal.Footer>
</Modal>
```

#### 예제 2: Card 컴포넌트

```typescript
// ✅ Composition으로 유연한 Card
const ProductPage = ({ product, user }) => {
  return (
    <Card>
      <Card.Image src={product.image} />
      <Card.Title>{product.name}</Card.Title>
      <Card.Price>{product.price}원</Card.Price>
      {user && <Card.Actions>
        <AddToCartButton product={product} user={user} />
      </Card.Actions>}
    </Card>
  );
};

// Card는 user 몰라도 됨
```

---

## 3. 해결법 2: Context API

### 3.1 언제 사용?

```
✅ Context 사용 시점:
- 전역적으로 자주 쓰이는 데이터 (테마, 언어, 인증)
- 트리 깊은 곳까지 전달
- 자주 변경되지 않는 값
```

### 3.2 실전 적용

```typescript
// ✅ UserContext.tsx
import { createContext, useContext, useState } from 'react';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

// Custom Hook으로 사용 편의성 증가
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const value = {
    user,
    setUser,
    isAuthenticated: user !== null,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// App.tsx
const App = () => {
  return (
    <UserProvider>
      <Layout>
        <PageContainer>
          <MainSection>
            <ContentArea>
              <ArticleList />
            </ContentArea>
          </MainSection>
        </PageContainer>
      </Layout>
    </UserProvider>
  );
};

// Avatar.tsx - 어디서든 user 접근 가능
const Avatar = () => {
  const { user } = useUser(); // Props 전달 불필요!

  if (!user) return null;
  return <img src={user.avatar} alt={user.name} />;
};

// UserMenu.tsx - 다른 곳에서도 사용
const UserMenu = () => {
  const { user, isAuthenticated, setUser } = useUser();

  if (!isAuthenticated) return <LoginButton />;

  return (
    <Menu>
      <MenuItem>안녕하세요, {user?.name}님</MenuItem>
      <MenuItem onClick={() => setUser(null)}>로그아웃</MenuItem>
    </Menu>
  );
};
```

### 3.3 Context 성능 최적화

```typescript
// 🔴 안티패턴: 자주 변경되는 값을 Context에
const CounterContext = createContext<{ count: number; setCount: (n: number) => void }>(null);

// 문제: count 변경 시 모든 Consumer가 리렌더링

// ✅ 해결 1: Context 분리
const CounterValueContext = createContext<number>(0);
const CounterActionsContext = createContext<{ increment: () => void }>(null);

// ✅ 해결 2: useMemo로 value 메모이제이션
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
```

### 3.4 Context 사용 시 주의사항

```typescript
// ❌ 안티패턴: 모든 상태를 Context에
const AppContext = createContext({
  user: null,
  theme: 'light',
  language: 'ko',
  sidebarOpen: false,
  notifications: [],
  cart: [],
  // ... 20개 더
});

// 문제:
// 1. 어느 하나 변경돼도 모든 Consumer 리렌더링
// 2. 관심사가 뒤섞임
// 3. 테스트 복잡

// ✅ Context는 역할별로 분리
<UserProvider>
  <ThemeProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ThemeProvider>
</UserProvider>
```

---

## 4. 해결법 3: Zustand 전역 상태

### 4.1 언제 사용?

```
✅ Zustand 사용 시점:
- 여러 컴포넌트에서 읽고 쓰는 경우
- 자주 변경되는 전역 상태
- Context Provider 계층 피하고 싶을 때
- 예: 사이드바 열림/닫힘, 알림 목록, 장바구니
```

### 4.2 실전 적용

```typescript
// ✅ stores/useSidebarStore.ts
import { create } from 'zustand';

interface SidebarStore {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

// Header.tsx - 어디서든 사용
const Header = () => {
  const toggle = useSidebarStore((state) => state.toggle);

  return (
    <header>
      <button onClick={toggle}>☰</button>
    </header>
  );
};

// Sidebar.tsx
const Sidebar = () => {
  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <aside className={isOpen ? styles.open : styles.closed}>
      {/* 사이드바 내용 */}
    </aside>
  );
};

// MainContent.tsx
const MainContent = () => {
  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <main className={isOpen ? styles.withSidebar : styles.fullWidth}>
      {/* 메인 컨텐츠 */}
    </main>
  );
};
```

### 4.3 Zustand 성능 최적화

```typescript
// ✅ Selector로 필요한 값만 구독
// GOOD: isOpen만 변경돼도 이 컴포넌트만 리렌더링
const Sidebar = () => {
  const isOpen = useSidebarStore((state) => state.isOpen);
  // ...
};

// BAD: 전체 store 구독 (모든 변경에 리렌더링)
const Sidebar = () => {
  const store = useSidebarStore();
  const { isOpen } = store;
  // ...
};
```

### 4.4 복잡한 예제: 알림 Store

```typescript
// ✅ stores/useNotificationStore.ts
import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

interface NotificationStore {
  notifications: Notification[];
  add: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  add: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36),
      timestamp: Date.now(),
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // 5초 후 자동 제거
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== newNotification.id),
      }));
    }, 5000);
  },

  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clear: () => set({ notifications: [] }),
}));

// 사용 예제
const SaveButton = () => {
  const addNotification = useNotificationStore((state) => state.add);

  const handleSave = async () => {
    try {
      await saveData();
      addNotification({ type: 'success', message: '저장되었습니다' });
    } catch (error) {
      addNotification({ type: 'error', message: '저장 실패' });
    }
  };

  return <button onClick={handleSave}>저장</button>;
};

// NotificationList.tsx
const NotificationList = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const remove = useNotificationStore((state) => state.remove);

  return (
    <div className={styles.notificationList}>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => remove(notification.id)}
        />
      ))}
    </div>
  );
};
```

---

## 5. 상태 배치 결정 트리

### 5.1 플로우차트

```
상태 배치 결정 프로세스:

1. "이 상태가 한 컴포넌트에서만 쓰이나?"
   YES → useState (로컬 상태)
   NO → 2번으로

2. "부모-자식 간 공유인가?"
   YES → Props로 전달 or Lift up
   NO → 3번으로

3. "형제 컴포넌트 간 공유인가?"
   YES → 공통 부모로 Lift up
   NO → 4번으로

4. "3단계 이상 깊게 전달하나?"
   YES → 5번으로
   NO → Props로 전달 (괜찮음)

5. "전역적으로 자주 쓰이나? (테마, 인증 등)"
   YES → Context 고려
   NO → 6번으로

6. "여러 페이지에서 읽고 쓰나?"
   YES → Zustand 고려
   NO → 7번으로

7. "서버에서 가져온 데이터인가?"
   YES → useEffect + fetch (or React Query)
   NO → 다시 1번부터 검토
```

### 5.2 실전 예제

#### 예제 1: 모달 상태

```
Q: "로그인 모달 상태를 어디에 둘까?"

1. 한 컴포넌트에서만? NO (Header와 Modal 2곳)
2. 부모-자식? NO
3. 형제? YES → 공통 부모로 Lift up

// ✅ 해결
const App = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <Header onLoginClick={() => setIsLoginModalOpen(true)} />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
```

#### 예제 2: 사이드바 상태

```
Q: "사이드바 열림/닫힘 상태를 어디에?"

1. 한 컴포넌트에서만? NO (Header, Sidebar, MainContent 3곳)
2. 부모-자식? NO
3. 형제? YES
4. 3단계 이상? YES (App → Layout → Header)
5. 전역적으로 자주? YES
6. 여러 페이지에서? YES → Zustand

// ✅ 해결: Zustand
const useSidebarStore = create((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
```

#### 예제 3: 테마 상태

```
Q: "다크모드 테마 상태를 어디에?"

1. 한 컴포넌트에서만? NO
2-4. 3단계 이상? YES
5. 전역적으로? YES
6. 자주 변경? NO (가끔 토글)
→ Context

// ✅ 해결: Context
<ThemeProvider>
  <App />
</ThemeProvider>
```

### 5.3 비교표

| 상황 | 해결책 | 예시 |
|-----|--------|-----|
| 로컬 UI 상태 | `useState` | 모달 open/close, 폼 입력값 |
| 부모-자식 공유 | Props | 버튼 클릭 이벤트 |
| 형제 공유 | Lift up | 탭 active 상태 |
| 깊은 트리 전달 (정적) | Context | 테마, 언어, 현재 사용자 |
| 전역 UI 상태 (동적) | Zustand | 사이드바, 알림, 장바구니 |
| 서버 데이터 | fetch/useEffect | API 응답 |

---

## 6. 실습: 리팩토링 전후 비교

### 6.1 Before: Props Drilling 지옥

```typescript
// 7단계 Props 전달
<App user={user}>
  <Layout user={user}>
    <PageContainer user={user}>
      <MainSection user={user}>
        <ContentArea user={user}>
          <ArticleList user={user}>
            <Article user={user}>
              <Avatar user={user} />
            </Article>
          </ArticleList>
        </ContentArea>
      </MainSection>
    </PageContainer>
  </Layout>
</App>
```

**문제**:
- 리팩토링 시 7개 파일 수정
- 타입 import 5개 파일
- Props 누락 버그 월 1-2회

### 6.2 After: Context로 해결

```typescript
// ✅ Context로 깔끔하게
<UserProvider>
  <App>
    <Layout>
      <PageContainer>
        <MainSection>
          <ContentArea>
            <ArticleList>
              <Article>
                <Avatar /> {/* useUser()로 접근 */}
              </Article>
            </ArticleList>
          </ContentArea>
        </MainSection>
      </PageContainer>
    </Layout>
  </App>
</UserProvider>

// Avatar.tsx
const Avatar = () => {
  const { user } = useUser();
  // ...
};
```

### 6.3 개선 효과 측정

| 지표 | Before | After | 개선 |
|-----|--------|-------|-----|
| Props 전달 단계 | 7단계 | 0단계 | 100% 제거 |
| 리팩토링 시 수정 파일 | 7개 | 2개 | 71% 감소 |
| 타입 import | 5개 파일 | 1개 파일 | 80% 감소 |
| Props 누락 버그 | 월 1-2회 | 0회 | ✅ |
| 테스트 복잡도 | 7배 | 1배 | ✅ |

---

## 📊 요약: 상태 관리 체크리스트

### 상태 배치 결정

```
로컬 → Props → Lift up → Context → Zustand
(가능한 한 로컬에, 필요할 때만 위로)
```

### 각 방법의 장단점

#### useState (로컬)
✅ 장점: 간단, 격리, 테스트 쉬움
❌ 단점: 공유 불가

#### Props
✅ 장점: 명시적, 추적 쉬움
❌ 단점: 3단계 이상 불편

#### Context
✅ 장점: 전역 접근, Props 제거
❌ 단점: Provider 필요, 자주 변경 시 성능 이슈

#### Zustand
✅ 장점: 간단, 성능 좋음, Provider 불필요
❌ 단점: 전역 상태 (테스트 시 초기화 필요)

### 안티패턴

- [ ] 모든 상태를 전역에 (시작부터 Context/Zustand)
- [ ] Props를 3단계 이상 전달
- [ ] Context에 자주 변경되는 값
- [ ] Zustand에 로컬 UI 상태

---

## 🎯 다음 단계

Module 4에서는 **성능 최적화**를 배웁니다.
- 과도한 memo의 실제 성능 저하
- 10,000개 리스트 가상화
- 측정 기반 최적화

[Module 4로 이동 →](./04-performance-optimization.md)
