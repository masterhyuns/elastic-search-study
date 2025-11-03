# Module 5: 폴더 구조 및 파일 네이밍

> **실전 중심**: "파일 찾기 게임"을 끝내는 협업 구조

## 🎯 학습 목표

이 모듈을 마치면:
- "이 파일 어디 있지?" 시간을 **90% 단축**
- Feature-based와 Type-based의 **실제 장단점** 경험
- 기능 삭제 시 **폴더째 삭제 가능**한 구조 설계
- Git 충돌을 **70% 감소**시키는 구조 적용

## 📖 목차

1. [실전 문제: 파일 찾기 게임](#1-실전-문제-파일-찾기-게임)
2. [Type-based 구조의 문제점](#2-type-based-구조의-문제점)
3. [Feature-based 구조의 장점](#3-feature-based-구조의-장점)
4. [Colocation 원칙](#4-colocation-원칙)
5. [파일 네이밍 규칙](#5-파일-네이밍-규칙)
6. [실습: 리팩토링 전후 비교](#6-실습-리팩토링-전후-비교)

---

## 1. 실전 문제: 파일 찾기 게임

### 1.1 실제 시나리오

```
PM: "로그인 버그 수정 부탁해요"
개발자: "로그인 관련 파일이 어디 있지?"

검색 시작:
1. src/components/LoginForm.tsx? (없음)
2. src/components/auth/LoginForm.tsx? (없음)
3. src/features/auth/LoginForm.tsx? (없음)
4. src/pages/login/LoginForm.tsx? (있다!)

"그럼 로그인 API 함수는?"
1. src/api/auth.ts? (없음)
2. src/services/auth.ts? (없음)
3. src/utils/api/auth.ts? (있다!)

"로그인 타입 정의는?"
1. src/types/auth.ts? (있다!)

총 소요 시간: 15분
찾은 파일 위치: 3곳에 분산
```

### 1.2 실제 겪은 문제들

#### 문제 1: 관련 파일이 3곳에 분산

```
로그인 기능 파일들:
- src/components/LoginForm.tsx (UI)
- src/services/auth.ts (API 로직)
- src/types/auth.ts (타입)
- src/hooks/useAuth.ts (Hook)
- src/utils/validators/authValidation.ts (검증)

버그 수정 시 5개 폴더 뒤짐
```

#### 문제 2: 기능 삭제 시 쓰레기 파일 남음

```
요구사항: "레거시 공지사항 기능 삭제"

삭제해야 할 파일:
- src/components/NoticeBoard.tsx (찾음)
- src/components/NoticeCard.tsx (찾음)
- src/hooks/useNotices.ts (못 찾음 → 남음)
- src/services/notice.ts (못 찾음 → 남음)
- src/types/notice.ts (못 찾음 → 남음)

결과: 불필요한 파일 3개 남음
```

#### 문제 3: 어디에 새 파일을 만들어야 할지 모름

```
신규 개발자: "장바구니 컴포넌트를 어디에 만들어야 하나요?"

선택지:
1. src/components/Cart.tsx?
2. src/components/shopping/Cart.tsx?
3. src/features/cart/components/Cart.tsx?
4. src/pages/cart/components/Cart.tsx?

팀원마다 다른 답변 → 일관성 없음
```

### 1.3 측정 가능한 피해

| 지표 | Type-based 구조 | 비고 |
|-----|----------------|-----|
| 파일 찾기 시간 | 평균 15분 | 3곳 검색 |
| 기능 삭제 시 남은 파일 | 30% | 못 찾아서 남음 |
| 신규 개발자 온보딩 | 2주 | 구조 이해 필요 |
| Git 충돌 | 주 5회 | 같은 디렉토리 수정 |

---

## 2. Type-based 구조의 문제점

### 2.1 전형적인 Type-based 구조

```
src/
├── components/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── UserProfile.tsx
│   ├── UserCard.tsx
│   ├── ProductCard.tsx
│   ├── ProductList.tsx
│   └── ... (100개 파일)
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useProduct.ts
│   └── ... (50개 파일)
├── services/
│   ├── auth.ts
│   ├── user.ts
│   ├── product.ts
│   └── ... (30개 파일)
├── types/
│   ├── auth.ts
│   ├── user.ts
│   ├── product.ts
│   └── ... (30개 파일)
└── utils/
    └── ... (40개 파일)
```

### 2.2 실제 문제 상황

#### 시나리오: 프로필 수정 기능 개발

```
작업 순서:
1. src/types/user.ts 열기 (타입 확인)
2. src/services/user.ts 열기 (API 함수 추가)
3. src/hooks/useUser.ts 열기 (Hook 수정)
4. src/components/UserProfile.tsx 열기 (UI 수정)
5. src/utils/validators/userValidation.ts 열기 (검증 추가)

열어본 폴더: 5개
VS Code 탭: 5개 동시 열림
```

#### 시나리오: Git 충돌

```
같은 날 3명이 작업:
- A: 로그인 기능 개발
- B: 회원가입 기능 개발
- C: 비밀번호 찾기 기능 개발

모두 수정하는 파일:
- src/components/ (3명 모두)
- src/services/auth.ts (3명 모두)
- src/types/auth.ts (3명 모두)

결과: Merge 시 충돌 지옥
```

---

## 3. Feature-based 구조의 장점

### 3.1 Feature-based 구조 예시

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── page.module.scss
│   │   └── register/
│   │       ├── page.tsx
│   │       └── page.module.scss
│   ├── products/                 # 상품 관련
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   └── profile/                  # 프로필 관련
│       └── page.tsx
├── features/                     # 기능별 모듈
│   ├── auth/                     # 인증 기능
│   │   ├── components/
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.module.scss
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   └── index.ts
│   │   │   └── RegisterForm/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useLogin.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── utils/
│   │       └── validatePassword.ts
│   ├── products/                 # 상품 기능
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── user/                     # 사용자 기능
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── components/                   # 공통 컴포넌트
│   ├── ui/                       # 기본 UI (버튼, 입력 등)
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   └── layouts/                  # 레이아웃
│       ├── Header/
│       └── Footer/
└── types/                        # 공통 타입
    └── common.types.ts
```

### 3.2 장점 1: 파일 찾기 쉬움

```
요구사항: "로그인 버그 수정"

Feature-based:
1. src/features/auth/ 폴더로 이동
2. 관련 파일 전부 한곳에!
   - components/LoginForm/
   - hooks/useLogin.ts
   - services/authService.ts
   - types/auth.types.ts

소요 시간: 10초
```

### 3.3 장점 2: 기능 삭제 쉬움

```
요구사항: "공지사항 기능 삭제"

Feature-based:
1. src/features/notices/ 폴더 삭제
2. 끝!

남은 쓰레기 파일: 0개
```

### 3.4 장점 3: Git 충돌 감소

```
같은 날 3명이 작업:
- A: src/features/auth/ 수정
- B: src/features/products/ 수정
- C: src/features/user/ 수정

충돌: 거의 없음 (다른 폴더 수정)
```

### 3.5 장점 4: 신규 개발자 온보딩 빠름

```
신규 개발자: "장바구니 기능을 어떻게 만들죠?"
리드: "src/features/cart/ 폴더 만들고, products 폴더 참고하세요"

온보딩 시간: 2주 → 3일
```

---

## 4. Colocation 원칙

### 4.1 Colocation이란?

```
"함께 쓰는 것은 가까이 둔다"
```

### 4.2 실전 예제

#### 예제 1: 컴포넌트 + 스타일 + 테스트

```
✅ GOOD: Colocation
src/features/auth/components/LoginForm/
├── LoginForm.tsx
├── LoginForm.module.scss  ← 같은 폴더
├── LoginForm.test.tsx     ← 같은 폴더
└── index.ts

❌ BAD: 분산
src/
├── components/LoginForm.tsx
├── styles/LoginForm.module.scss  ← 다른 폴더
└── tests/LoginForm.test.tsx      ← 다른 폴더
```

#### 예제 2: 컴포넌트 + 타입

```
✅ GOOD: 타입을 컴포넌트 파일에 함께
// LoginForm.tsx
interface LoginFormProps {
  onSubmit: (credentials: Credentials) => void;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  // ...
};

❌ BAD: 타입을 별도 파일로
// types/loginForm.types.ts
export interface LoginFormProps { ... }

// LoginForm.tsx
import { LoginFormProps } from '@/types/loginForm.types';
```

### 4.3 예외: 정말 공통인 것만 공통 폴더에

```
✅ 공통 컴포넌트
src/components/ui/
├── Button/       ← 10곳 이상에서 사용
├── Input/        ← 10곳 이상에서 사용
└── Modal/        ← 10곳 이상에서 사용

❌ 공통이 아닌 것을 공통 폴더에
src/components/
├── LoginForm/    ← auth에서만 사용 (X)
├── ProductCard/  ← products에서만 사용 (X)
```

---

## 5. 파일 네이밍 규칙

### 5.1 컴포넌트 파일

```
✅ PascalCase
LoginForm.tsx
UserProfile.tsx
ProductCard.tsx

❌ 잘못된 네이밍
login-form.tsx
loginForm.tsx
login_form.tsx
```

### 5.2 Hook 파일

```
✅ camelCase + use prefix
useAuth.ts
useUserData.ts
useProductList.ts

❌ 잘못된 네이밍
auth.ts        (use 없음)
UseAuth.ts     (대문자 시작)
```

### 5.3 타입 파일

```
✅ PascalCase + .types suffix
auth.types.ts
user.types.ts
product.types.ts

또는 단순히
types.ts       (폴더 안에 하나면 충분)
```

### 5.4 SCSS Module 파일

```
✅ 컴포넌트명.module.scss
LoginForm.module.scss
UserProfile.module.scss
ProductCard.module.scss

❌ 잘못된 네이밍
LoginForm.scss              (module 없음 → 글로벌 스타일)
loginForm.module.scss       (소문자 시작)
login-form.module.scss      (kebab-case)
```

### 5.5 일관성 예제

```
src/features/auth/components/LoginForm/
├── LoginForm.tsx              ← PascalCase
├── LoginForm.module.scss      ← 컴포넌트명.module.scss
├── LoginForm.test.tsx         ← 컴포넌트명.test.tsx
└── index.ts                   ← export만

src/features/auth/hooks/
├── useAuth.ts                 ← camelCase + use
└── useLogin.ts

src/features/auth/types/
└── auth.types.ts              ← .types suffix
```

---

## 6. 실습: 리팩토링 전후 비교

### 6.1 Before: Type-based 구조

```
src/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── UserProfile.tsx
│   ├── UserCard.tsx
│   ├── ProductCard.tsx
│   └── ... (100개)
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   └── ... (50개)
├── services/
│   ├── auth.ts
│   ├── user.ts
│   └── ... (30개)
└── types/
    ├── auth.ts
    ├── user.ts
    └── ... (30개)
```

**문제**:
- 파일 찾기: 15분
- 기능 삭제: 쓰레기 파일 30%
- Git 충돌: 주 5회

### 6.2 After: Feature-based 구조

```
src/
├── features/
│   ├── auth/                  ← 인증 관련 전부 여기
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── user/                  ← 사용자 관련 전부 여기
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── products/              ← 상품 관련 전부 여기
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
└── components/                ← 진짜 공통만
    └── ui/
```

**개선**:
- 파일 찾기: 10초 (93% 감소)
- 기능 삭제: 폴더째 삭제 (쓰레기 0%)
- Git 충돌: 주 1회 (80% 감소)

### 6.3 개선 효과 측정

| 지표 | Before | After | 개선 |
|-----|--------|-------|-----|
| 파일 찾기 시간 | 15분 | 10초 | 93% 감소 |
| 기능 삭제 시 남은 파일 | 30% | 0% | ✅ |
| Git 충돌 | 주 5회 | 주 1회 | 80% 감소 |
| 신규 개발자 온보딩 | 2주 | 3일 | 78% 감소 |

---

## 📊 요약: 폴더 구조 체크리스트

### 구조 선택

```
✅ Feature-based 사용 (권장)
- 관련 파일이 한곳에
- 기능 삭제 시 폴더째 삭제
- Git 충돌 감소

❌ Type-based 피하기
- 파일 찾기 어려움
- 쓰레기 파일 남음
- Git 충돌 증가
```

### Colocation 원칙

- [ ] 컴포넌트 + 스타일 같은 폴더
- [ ] 컴포넌트 + 테스트 같은 폴더
- [ ] 정말 공통인 것만 공통 폴더

### 파일 네이밍

- [ ] 컴포넌트: PascalCase
- [ ] Hook: camelCase + use prefix
- [ ] 타입: .types suffix
- [ ] SCSS: 컴포넌트명.module.scss

### 기능 삭제 테스트

```
"이 기능을 삭제하려면 폴더 하나만 지우면 되나?"
→ YES: 좋은 구조 ✅
→ NO: 구조 개선 필요 ❌
```

---

## 🎉 모든 모듈 완료!

축하합니다! 5개 모듈을 모두 학습했습니다.

### 배운 내용 요약

1. **컴포넌트 분리**: 500줄 → 50줄 컴포넌트
2. **useEffect**: 불필요한 useEffect 90% 제거
3. **상태 관리**: Props Drilling 해결
4. **성능 최적화**: 측정 기반 최적화
5. **폴더 구조**: Feature-based 구조

### 다음 단계

- 실제 프로젝트에 적용
- 팀원과 코드 리뷰
- 개선 효과 측정

[메인 README로 돌아가기](../README.md)
