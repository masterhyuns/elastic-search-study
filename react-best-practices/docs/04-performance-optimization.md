# Module 4: 성능 최적화

> **실전 중심**: 측정 없는 최적화가 오히려 느리게 만든 실제 사례

## 🎯 학습 목표

이 모듈을 마치면:
- "최적화"가 오히려 **성능을 저하**시키는 실제 사례 경험
- React DevTools Profiler로 **병목 지점 측정**
- 10,000개 리스트를 **0.1초로 렌더링**
- 최적화 우선순위를 **측정 기반**으로 결정

## 📖 목차

1. [실전 문제: 과도한 최적화의 역효과](#1-실전-문제-과도한-최적화의-역효과)
2. [측정 도구: React DevTools Profiler](#2-측정-도구-react-devtools-profiler)
3. [진짜 문제 1: 무거운 리스트](#3-진짜-문제-1-무거운-리스트)
4. [진짜 문제 2: 불필요한 리렌더링](#4-진짜-문제-2-불필요한-리렌더링)
5. [최적화 우선순위](#5-최적화-우선순위)
6. [실습: 최적화 전후 비교](#6-실습-최적화-전후-비교)

---

## 1. 실전 문제: 과도한 최적화의 역효과

### 1.1 실제 코드: 모든 것에 memo

```typescript
// ❌ 과도한 최적화 - 오히려 느림
const Button = React.memo(({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
});

const Text = React.memo(({ children }: { children: string }) => {
  return <span>{children}</span>;
});

const Icon = React.memo(({ name }: { name: string }) => {
  return <i className={`icon-${name}`} />;
});

// 사용
const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Text>Count: {count}</Text>
      <Button label="증가" onClick={() => setCount(count + 1)} />
    </div>
  );
};
```

### 1.2 실제 성능 측정

```
React DevTools Profiler 결과:

memo 없는 Button:
- 렌더링 시간: 0.1ms
- 메모리: 1KB

memo 있는 Button:
- Props 비교 시간: 0.05ms
- 렌더링 시간: 0.1ms
- 총 시간: 0.15ms (50% 느림!)
- 메모리: 2KB (2배 증가)
```

**결론**: 간단한 컴포넌트는 memo가 **오히려 느림**

### 1.3 실제 겪은 문제들

#### 문제 1: 함수 props로 인한 무한 메모이제이션

```typescript
// ❌ memo 했는데도 매번 리렌더링
const ExpensiveChild = React.memo(({ onAction }: { onAction: () => void }) => {
  console.log('[ExpensiveChild] 렌더링');
  // 무거운 연산...
  return <button onClick={onAction}>실행</button>;
});

const Parent = () => {
  const [count, setCount] = useState(0);

  // 🔴 문제: 매 렌더링마다 새 함수 생성
  const handleAction = () => {
    console.log('액션!');
  };

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>카운트: {count}</button>
      <ExpensiveChild onAction={handleAction} />
    </div>
  );
};

// 콘솔 출력:
// [ExpensiveChild] 렌더링
// (버튼 클릭)
// [ExpensiveChild] 렌더링 ← memo 했는데도 리렌더링!
```

**원인**: 함수는 매번 새로 생성되어 props 비교 시 "다름"으로 판정

#### 문제 2: useCallback 지옥

```typescript
// ❌ useCallback 남발
const Parent = () => {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);

  const handleAction = useCallback(() => {
    console.log('액션!');
  }, []);

  const handleSubmit = useCallback(() => {
    console.log('제출!');
  }, []);

  const handleCancel = useCallback(() => {
    console.log('취소!');
  }, []);

  const handleEdit = useCallback(() => {
    console.log('수정!');
  }, []);

  // 10개 더...

  return <div>{/* UI */}</div>;
};
```

**문제**:
- 코드 가독성 저하
- useCallback 자체도 비용 (메모리, 비교)
- 대부분 불필요 (자식이 memo 안 했으면 의미 없음)

### 1.4 측정 가능한 피해

| 컴포넌트 | memo 없음 | memo + 최적화 | 결과 |
|----------|-----------|--------------|-----|
| Button (간단) | 0.1ms | 0.15ms | 50% 느림 |
| Text (간단) | 0.05ms | 0.08ms | 60% 느림 |
| Icon (간단) | 0.03ms | 0.05ms | 66% 느림 |
| ExpensiveList (복잡) | 50ms | 0.5ms | 99% 빠름 ✅ |

**교훈**: 측정 후 최적화!

---

## 2. 측정 도구: React DevTools Profiler

### 2.1 설치 및 사용법

```bash
# Chrome/Edge Extension 설치
# "React Developer Tools" 검색

# 사용법:
# 1. 개발자 도구 열기 (F12)
# 2. "Profiler" 탭 선택
# 3. 녹화 버튼 클릭
# 4. 앱 사용 (클릭, 입력 등)
# 5. 녹화 중지
# 6. 분석 결과 확인
```

### 2.2 읽는 법

```
Profiler 결과 해석:

Flame Chart:
- 높이: 컴포넌트 트리 깊이
- 넓이: 렌더링 시간
- 색상: 느림 (빨강) → 빠름 (초록)

Ranked Chart:
- 렌더링 시간 순서대로 정렬
- 최적화 우선순위 파악

Component Chart:
- 특정 컴포넌트 렌더링 횟수
- 불필요한 리렌더링 발견
```

### 2.3 실전 예제: 병목 찾기

```
시나리오: "앱이 느려요"

Step 1: Profiler 녹화
- 느린 동작 재현 (버튼 클릭, 페이지 이동 등)

Step 2: Flame Chart 확인
[Parent] ████████████████ 500ms
├─ [Header] ██ 10ms
├─ [Sidebar] ██ 10ms
└─ [ProductList] ██████████████ 450ms ← 병목!
   └─ [ProductCard] ███ (100개 × 4ms)

Step 3: 병목 발견
- ProductList가 450ms (전체의 90%)
- 원인: 100개 카드를 한 번에 렌더링

Step 4: 최적화 방향 결정
- 가상화 (react-window) 적용
- 목표: 450ms → 50ms
```

---

## 3. 진짜 문제 1: 무거운 리스트

### 3.1 실전 버그: 10,000개 리스트

```typescript
// ❌ 10,000개 한 번에 렌더링 - 3초 걸림
const HeavyList = () => {
  const [items] = useState(() =>
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      price: Math.random() * 1000,
    }))
  );

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <div key={item.id} className={styles.item}>
          <h3>{item.name}</h3>
          <p>{item.price.toFixed(2)}원</p>
          <button>상세보기</button>
        </div>
      ))}
    </div>
  );
};

// 성능 측정:
// - 초기 렌더링: 3초
// - 스크롤: 버벅임 (1fps)
// - 사용자 이탈률: 40% (3초 이상 로딩)
```

### 3.2 해결 1: react-window로 가상화

```typescript
// ✅ 가상화 - 보이는 것만 렌더링
import { FixedSizeList } from 'react-window';

const OptimizedList = () => {
  const [items] = useState(() =>
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      price: Math.random() * 1000,
    }))
  );

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    return (
      <div style={style} className={styles.item}>
        <h3>{item.name}</h3>
        <p>{item.price.toFixed(2)}원</p>
        <button>상세보기</button>
      </div>
    );
  };

  return (
    <FixedSizeList
      height={600} // 보이는 영역 높이
      itemCount={items.length} // 전체 아이템 수
      itemSize={80} // 각 아이템 높이
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};

// 성능 개선:
// - 초기 렌더링: 3초 → 0.1초 (30배 빠름!)
// - 스크롤: 버벅임 → 부드러움 (60fps)
// - 실제 렌더링: 10,000개 → 8개 (화면에 보이는 것만)
```

### 3.3 가상화 원리

```
기존 방식:
[Item 1]
[Item 2]
[Item 3]
...
[Item 9998]
[Item 9999]
[Item 10000]
→ 10,000개 전부 DOM에 존재

가상화 방식:
┌─────────────────┐
│ [Item 5]        │ ← 화면에 보임
│ [Item 6]        │ ← 화면에 보임
│ [Item 7]        │ ← 화면에 보임
│ [Item 8]        │ ← 화면에 보임
└─────────────────┘
→ 보이는 8개만 DOM에 존재
→ 스크롤 시 동적 교체
```

### 3.4 언제 가상화를 써야 할까?

```
✅ 가상화 사용 시점:
- [ ] 리스트 아이템 100개 이상
- [ ] 초기 렌더링 1초 이상
- [ ] 스크롤 시 버벅임
- [ ] 각 아이템 높이가 일정

❌ 가상화 불필요:
- [ ] 리스트 아이템 50개 이하
- [ ] 빠른 렌더링 (0.1초 이하)
- [ ] 각 아이템 높이가 다름 (고급 기능 필요)
```

---

## 4. 진짜 문제 2: 불필요한 리렌더링

### 4.1 실전 버그: 부모 리렌더링 → 자식도 리렌더링

```typescript
// ❌ 문제 상황
const Dashboard = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <div>
        <button onClick={() => setCount(count + 1)}>카운트: {count}</button>
      </div>

      {/* count와 무관한데 매번 리렌더링 */}
      <ExpensiveChart data={chartData} />
      <ExpensiveTable data={tableData} />
      <ExpensiveMap data={mapData} />
    </div>
  );
};

// ExpensiveChart 렌더링 시간: 100ms
// 버튼 클릭 시마다 100ms 딜레이 발생!
```

### 4.2 해결: React.memo로 선택적 리렌더링

```typescript
// ✅ memo로 불필요한 리렌더링 방지
const ExpensiveChart = React.memo(({ data }: { data: ChartData }) => {
  console.log('[ExpensiveChart] 렌더링');

  // 무거운 연산...
  const processedData = processChartData(data); // 50ms

  return <div>{/* 차트 렌더링 50ms */}</div>;
});

const Dashboard = () => {
  const [count, setCount] = useState(0);
  const [chartData] = useState(loadChartData());

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>카운트: {count}</button>
      <ExpensiveChart data={chartData} />
    </div>
  );
};

// 개선 효과:
// - 버튼 클릭: 100ms → 0.1ms (1000배 빠름)
// - chartData 변경 시에만 ExpensiveChart 리렌더링
```

### 4.3 memo 사용 기준

```
✅ memo를 써야 하는 경우:
- [ ] 렌더링 시간이 16ms(60fps) 이상
- [ ] Props가 자주 변경되지 않음
- [ ] 부모가 자주 리렌더링됨
- [ ] Profiler로 확인한 병목

❌ memo를 쓰지 말아야 하는 경우:
- [ ] 렌더링 시간이 1ms 이하
- [ ] Props가 매번 변경됨
- [ ] 간단한 컴포넌트 (Button, Text 등)
```

### 4.4 useMemo로 비싼 계산 캐싱

```typescript
// ❌ 매 렌더링마다 정렬 (100ms)
const ProductList = ({ products, sortBy }) => {
  // 🔴 매번 정렬 (products 안 바뀌어도)
  const sortedProducts = products.sort((a, b) => {
    // 복잡한 정렬 로직...
  });

  return <div>{/* 리스트 */}</div>;
};

// ✅ useMemo로 캐싱
const ProductList = ({ products, sortBy }) => {
  const sortedProducts = useMemo(() => {
    console.log('[useMemo] 정렬 실행');
    return products.sort((a, b) => {
      // 복잡한 정렬 로직...
    });
  }, [products, sortBy]); // products나 sortBy 변경 시에만 재계산

  return <div>{/* 리스트 */}</div>;
};

// 개선 효과:
// - 렌더링 시간: 100ms → 0.1ms (의존성 안 변할 때)
// - products 변경 시에만 100ms
```

### 4.5 useMemo 사용 기준

```
✅ useMemo 써야 하는 경우:
- [ ] 계산 시간이 10ms 이상
- [ ] 의존성이 자주 변경되지 않음
- [ ] Profiler로 확인한 병목

❌ useMemo 쓰지 말아야 하는 경우:
- [ ] 계산 시간이 1ms 이하 (count * 2 같은 간단한 연산)
- [ ] 의존성이 매번 변경됨
- [ ] 측정 안 해봄
```

---

## 5. 최적화 우선순위

### 5.1 최적화 순서 (효과 큰 순서)

```
1. 코드 스플리팅 (lazy + Suspense)
   → 초기 로딩 시간 50% 감소
   → 작업 시간: 30분
   → ROI: ⭐⭐⭐⭐⭐

2. 이미지 최적화
   → 페이지 로딩 시간 30% 감소
   → 작업 시간: 1시간
   → ROI: ⭐⭐⭐⭐⭐

3. 리스트 가상화 (100개 이상)
   → 렌더링 시간 90% 감소
   → 작업 시간: 2시간
   → ROI: ⭐⭐⭐⭐

4. 측정 후 memo (병목만)
   → 특정 페이지 50% 개선
   → 작업 시간: 1시간
   → ROI: ⭐⭐⭐

5. useMemo/useCallback (정말 필요한 경우만)
   → 미미한 개선 (5-10%)
   → 작업 시간: 2시간
   → ROI: ⭐
```

### 5.2 실전 적용 순서

```
Step 1: 측정
- Lighthouse 실행
- React DevTools Profiler 확인
- 병목 지점 찾기

Step 2: 코드 스플리팅
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>

Step 3: 이미지 최적화
// Next.js Image 사용
<Image src="/image.jpg" width={500} height={300} alt="" />

Step 4: 큰 리스트 가상화
<FixedSizeList>...</FixedSizeList>

Step 5: Profiler로 다시 측정
→ 목표 달성 시 중단
→ 미달 시 memo 고려
```

### 5.3 최적화 전후 비교표

| 최적화 기법 | 적용 전 | 적용 후 | 작업 시간 |
|-----------|---------|---------|----------|
| 코드 스플리팅 | 2MB 번들 | 500KB | 30분 |
| 이미지 최적화 | 5초 로딩 | 1.5초 | 1시간 |
| 리스트 가상화 | 3초 렌더링 | 0.1초 | 2시간 |
| memo (병목만) | 500ms | 50ms | 1시간 |
| 전체 memo (X) | 100ms | 150ms | 4시간 (역효과!) |

---

## 6. 실습: 최적화 전후 비교

### 6.1 Before: 최적화 없음

```typescript
// ❌ 느린 대시보드
const Dashboard = () => {
  const [data] = useState(loadData()); // 10,000개

  return (
    <div>
      <ExpensiveChart data={data.chartData} />
      <div>
        {data.items.map((item) => (
          <HeavyItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

// 성능:
// - 초기 렌더링: 5초
// - 스크롤: 1fps
// - 사용자 이탈률: 60%
```

### 6.2 After: 최적화 적용

```typescript
// ✅ 최적화된 대시보드
import { lazy, Suspense } from 'react';
import { FixedSizeList } from 'react-window';

// 1. 코드 스플리팅
const ExpensiveChart = lazy(() => import('./ExpensiveChart'));

const Dashboard = () => {
  const [data] = useState(loadData());

  // 2. memo로 불필요한 리렌더링 방지
  const MemoizedChart = useMemo(() =>
    <ExpensiveChart data={data.chartData} />,
    [data.chartData]
  );

  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        {MemoizedChart}
      </Suspense>

      {/* 3. 가상화로 리스트 최적화 */}
      <FixedSizeList
        height={600}
        itemCount={data.items.length}
        itemSize={80}
        width="100%"
      >
        {({ index, style }) => (
          <HeavyItem
            key={data.items[index].id}
            item={data.items[index]}
            style={style}
          />
        )}
      </FixedSizeList>
    </div>
  );
};

// 성능 개선:
// - 초기 렌더링: 5초 → 0.5초 (10배 빠름)
// - 스크롤: 1fps → 60fps
// - 사용자 이탈률: 60% → 5%
```

### 6.3 개선 효과 종합

| 지표 | Before | After | 개선 |
|-----|--------|-------|-----|
| 초기 렌더링 | 5초 | 0.5초 | 90% 감소 |
| 스크롤 FPS | 1fps | 60fps | 60배 개선 |
| 번들 크기 | 2MB | 500KB | 75% 감소 |
| 이탈률 | 60% | 5% | 91% 개선 |
| Lighthouse 점수 | 30점 | 95점 | +65점 |

---

## 📊 요약: 성능 최적화 체크리스트

### 최적화 전 필수

- [ ] React DevTools Profiler로 측정
- [ ] Lighthouse 실행
- [ ] 병목 지점 확인 (16ms 이상)

### 우선순위 순서

1. [ ] 코드 스플리팅 (lazy + Suspense)
2. [ ] 이미지 최적화
3. [ ] 리스트 가상화 (100개 이상)
4. [ ] 측정 후 memo (병목만)
5. [ ] useMemo (계산 10ms 이상만)

### 하지 말아야 할 것

- [ ] 측정 없이 최적화
- [ ] 모든 컴포넌트에 memo
- [ ] 모든 함수에 useCallback
- [ ] 간단한 계산에 useMemo

### 개선 효과 확인

- [ ] Profiler로 다시 측정
- [ ] 목표 달성 시 중단
- [ ] 과도한 최적화 금지

---

## 🎯 다음 단계

Module 5에서는 **폴더 구조**를 배웁니다.
- Feature-based vs Type-based 비교
- Colocation 원칙
- 협업을 위한 프로젝트 구조

[Module 5로 이동 →](./05-folder-structure.md)
