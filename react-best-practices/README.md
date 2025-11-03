# React 베스트 프랙티스 교육 프로젝트

> **실전 중심**의 React 초급자 교육 자료 - "이론이 아닌 실제 경험"

## 🎯 프로젝트 목적

React 초급 개발자가 **실무에서 자주 겪는 문제들**을 직접 체험하고, **측정 가능한 개선 방법**을 배울 수 있는 실습 중심 교육 프로젝트입니다.

### 왜 이 프로젝트를 만들었나?

- ❌ "React 문서에서 이렇게 하라고 했어요" (학문적)
- ✅ "실제로 이렇게 짰더니 이런 문제가 생겼고, 이렇게 고치니 해결됐어요" (실전)

## 📚 커리큘럼 구성

### Module 1: 컴포넌트 분리 원칙
**배울 내용**: 500줄 컴포넌트의 실제 문제점과 해결법
- 실전 문제: 버그 찾는데 30분, Git 충돌 주 3회, 코드 리뷰 불가
- 해결 방법: 역할별 분리, Presentational vs Container 패턴
- 측정 가능한 개선: 버그 수정 시간 30분 → 5분

[📖 상세 문서 보기](./docs/01-component-separation.md)

### Module 2: useEffect 올바른 사용법
**배울 내용**: useEffect 남용의 실제 버그와 대안
- 실전 문제: useEffect 체이닝으로 디버깅 1시간, 타이밍 버그 발생
- 안티패턴: 상태 동기화, 이벤트 핸들러 로직을 useEffect로 처리
- 올바른 사용: 외부 시스템 연동, fetch + AbortController, cleanup

[📖 상세 문서 보기](./docs/02-useeffect-guide.md)

### Module 3: 상태 관리 전략
**배울 내용**: Props Drilling 실전 해결법
- 실전 문제: 7단계 props 전달, 리팩토링 악몽, 타입 지옥
- 해결법: Context, Composition, Zustand
- 결정 트리: 어떤 상황에 어떤 방법을 쓸까?

[📖 상세 문서 보기](./docs/03-state-management.md)

### Module 4: 성능 최적화
**배울 내용**: 측정 기반 최적화
- 실전 문제: 과도한 memo 사용이 오히려 느리게 만듦
- 진짜 문제: 10,000개 리스트, 비싼 계산
- 해결법: react-window 가상화, useMemo (측정 후)
- 우선순위: 코드 스플리팅 > 리스트 가상화 > memo

[📖 상세 문서 보기](./docs/04-performance-optimization.md)

### Module 5: 폴더 구조
**배울 내용**: 협업을 위한 프로젝트 구조
- 실전 문제: 파일 찾기 게임, 기능 삭제 시 쓰레기 파일 남음
- Feature-based vs Type-based 비교
- Colocation 원칙: 함께 쓰는 것은 가까이

[📖 상세 문서 보기](./docs/05-folder-structure.md)

## 🚀 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 3. 학습 순서

1. **메인 페이지**: 전체 커리큘럼 네비게이션
2. **Bad Examples**: 실제 문제 재현 (코드 + 동작 확인)
3. **Good Examples**: 개선된 코드 (비교 분석)
4. **Comparison**: 나란히 비교 (성능 측정)
5. **문서 읽기**: docs/*.md (이론 + 다이어그램)

## 📂 프로젝트 구조

```
react-best-practices/
├── README.md                  # 전체 가이드 (현재 문서)
├── docs/                      # 상세 이론 문서
│   ├── 01-component-separation.md
│   ├── 02-useeffect-guide.md
│   ├── 03-state-management.md
│   ├── 04-performance-optimization.md
│   └── 05-folder-structure.md
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 메인 네비게이션
│   │   ├── bad-examples/               # ❌ 안티패턴
│   │   │   ├── god-component/          # 500줄 컴포넌트
│   │   │   ├── useeffect-hell/         # useEffect 남용
│   │   │   ├── props-drilling/         # 7단계 props 전달
│   │   │   └── unnecessary-rerenders/  # 불필요한 리렌더링
│   │   ├── good-examples/              # ✅ 베스트 프랙티스
│   │   │   ├── well-separated/         # 잘 분리된 컴포넌트
│   │   │   ├── proper-useeffect/       # 올바른 useEffect
│   │   │   ├── clean-state/            # 깔끔한 상태 관리
│   │   │   └── optimized/              # 최적화된 코드
│   │   └── comparison/                 # 🔄 직접 비교
│   ├── components/
│   │   ├── ui/                         # 공통 UI 컴포넌트
│   │   ├── features/                   # 도메인별 컴포넌트
│   │   └── layouts/                    # 레이아웃
│   └── types/                          # 타입 정의
└── package.json
```

## 🎓 학습 가이드

### 초급자용 (1-2주 차)
1. Module 1: 컴포넌트 분리 (하루 2시간, 3일)
2. Module 2: useEffect 가이드 (하루 2시간, 4일)

**실습**: Bad Example 코드 읽고 문제점 찾기 → Good Example로 개선

### 중급자용 (3-4주 차)
3. Module 3: 상태 관리 (하루 2시간, 3일)
4. Module 4: 성능 최적화 (하루 2시간, 4일)

**실습**: 실제 업무 코드에 적용해보기

### 심화 (5-6주 차)
5. Module 5: 폴더 구조 (하루 1시간, 2일)
6. 팀 프로젝트 리팩토링 (나머지 시간)

**실습**: 팀 코드베이스 개선, 코드 리뷰 진행

## 📊 각 예제의 구성

### Bad Example (문제 재현)
```typescript
// ❌ 문제 상황
// 실제 버그: 이렇게 짰더니 이런 문제가 생김
const BadComponent = () => {
  // 상세한 주석으로 문제점 설명
  // 실제 겪은 고충 공유
};
```

### Good Example (해결책)
```typescript
// ✅ 개선된 코드
// 개선 효과: 버그 수정 시간 30분 → 5분
const GoodComponent = () => {
  // 왜 이렇게 개선했는지 설명
  // 측정 가능한 개선 효과 제시
};
```

### Comparison (비교 분석)
- 나란히 놓고 차이점 비교
- 성능 측정 결과 시각화
- 코드 변경 범위 비교

## 🛠️ 기술 스택

- **Next.js 15**: App Router
- **TypeScript**: strict 모드
- **SCSS Module**: 스타일링
- **Zustand**: 전역 상태 관리 예제
- **react-window**: 리스트 가상화 예제

## 📋 코드 리뷰 체크리스트

교육 후 실무에 적용할 때 확인할 사항:

### 컴포넌트 분리
- [ ] 컴포넌트가 100줄 이하인가?
- [ ] 단일 책임 원칙을 따르는가?
- [ ] 재사용 가능한가?

### useEffect
- [ ] useEffect가 정말 필요한가?
- [ ] 의존성 배열이 정확한가?
- [ ] Cleanup 함수가 있는가?

### 성능
- [ ] 불필요한 리렌더링이 없는가?
- [ ] memo/useMemo가 과하지 않은가?
- [ ] 측정 후 최적화했는가?

### 상태 관리
- [ ] 상태가 적절한 위치에 있는가?
- [ ] Props drilling이 과하지 않은가?

### 코드 품질
- [ ] 타입이 정확한가? (`any` 사용 금지)
- [ ] 네이밍이 명확한가?
- [ ] 주석이 필요한 복잡한 로직은 없는가?

## 💡 교육 철학

### 1. 실전 경험 공유
"이렇게 하면 안 돼요"가 아닌 "이렇게 했더니 이런 문제가 생겼어요"

### 2. 측정 가능한 개선
"좋아졌어요"가 아닌 "30분 → 5분으로 개선됐어요"

### 3. 왜 그럴까? (Why)
"문서에서 그렇대요"가 아닌 "이런 이유로 이렇게 해야 해요"

### 4. 실무 중심
API 문서가 아닌 실제 프로젝트에서 겪은 경험

## 🤝 기여하기

실무에서 겪은 React 안티패턴과 해결법을 공유해주세요!

1. 문제 상황 재현 코드
2. 실제 겪은 고충 (시간, 버그 등)
3. 해결 방법
4. 측정 가능한 개선 효과

## 📞 문의

- 코드 리뷰 요청: 실무 코드에 대한 피드백
- 추가 예제 제안: 이런 케이스도 추가해주세요
- 버그 제보: 예제 코드 문제 발견 시

---

**만든 이유**: React를 배우는 후배 개발자들이 같은 실수를 반복하지 않도록, 실전 경험을 공유하기 위해 만들었습니다.
