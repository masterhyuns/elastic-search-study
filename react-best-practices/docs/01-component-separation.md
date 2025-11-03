# Module 1: 컴포넌트 분리 원칙

> **실전 중심**: 500줄 컴포넌트의 실제 문제점과 해결법

## 🎯 학습 목표

이 모듈을 마치면:
- 500줄 넘는 컴포넌트가 왜 문제인지 **실제 경험**으로 이해
- 컴포넌트 분리 시점을 **측정 가능한 기준**으로 판단
- Presentational vs Container 패턴을 **실무에 적용**
- Git 충돌, 버그 찾기 시간을 **실제로 줄이기**

## 📖 목차

1. [실전 문제: 500줄 컴포넌트의 악몽](#1-실전-문제-500줄-컴포넌트의-악몽)
2. [실전 분리 기준](#2-실전-분리-기준)
3. [Presentational vs Container 패턴](#3-presentational-vs-container-패턴)
4. [Custom Hook으로 로직 분리](#4-custom-hook으로-로직-분리)
5. [실습: 리팩토링 전후 비교](#5-실습-리팩토링-전후-비교)

---

## 1. 실전 문제: 500줄 컴포넌트의 악몽

### 1.1 실제 시나리오

당신은 대시보드 기능을 개발하고 있습니다. 처음에는 "간단하니까 한 파일에 다 넣자"고 생각했습니다.

```typescript
// ❌ UserDashboard.tsx - 500줄
const UserDashboard = () => {
  // 20개의 useState
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderFilters, setOrderFilters] = useState({});
  const [sortBy, setSortBy] = useState('date');
  // ... 12개 더

  // 10개의 useEffect
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchOrders();
    }
  }, [userData]);

  // ... 8개 더

  // 50줄짜리 데이터 페칭 로직
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user');
      // ... 복잡한 데이터 가공
    } catch (error) {
      // ... 에러 처리
    } finally {
      setLoading(false);
    }
  };

  // 30줄짜리 폼 검증 로직
  const validateForm = (data) => {
    const errors = {};
    if (!data.name) errors.name = '이름을 입력하세요';
    if (!data.email) errors.email = '이메일을 입력하세요';
    // ... 20줄 더
    return errors;
  };

  // 40줄짜리 폼 제출 로직
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    // ... 30줄 더
  };

  // 200줄짜리 렌더링
  return (
    <div>
      {/* 프로필 섹션 - 80줄 */}
      <div>
        <h2>프로필</h2>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            {/* 폼 필드 30줄 */}
          </form>
        ) : (
          <div>
            {/* 프로필 표시 50줄 */}
          </div>
        )}
      </div>

      {/* 주문 목록 - 120줄 */}
      <div>
        <h2>주문 내역</h2>
        {/* 필터 UI 40줄 */}
        {/* 테이블 80줄 */}
      </div>
    </div>
  );
};
```

### 1.2 실제 겪은 문제들

#### 문제 1: 버그 찾기 시간 폭발

```
상황: "주문 목록 필터가 작동하지 않습니다" 버그 리포트
소요 시간: 30분
```

**왜 30분이나 걸렸나?**
1. 파일 열기 (500줄이라 스크롤 지옥)
2. 주문 관련 상태 찾기 (20개 useState 중 어디?)
3. 주문 필터 로직 찾기 (10개 useEffect 중 어디?)
4. 관련 이벤트 핸들러 찾기 (400줄 스크롤 다운)
5. 마침내 버그 발견: `orderFilters` 업데이트가 주문 목록 갱신을 안 함

**실제 버그는 2줄이었지만, 찾는데 28분 소요**

#### 문제 2: Git 충돌 지옥

```
상황: 3명이 동시에 UserDashboard.tsx 수정
- A: 프로필 편집 기능 추가
- B: 주문 목록 정렬 기능 추가
- C: 프로필 사진 업로드 기능 추가

결과: Merge 할 때 충돌 50줄
해결 시간: 각자 1시간 = 총 3시간 낭비
```

#### 문제 3: 코드 리뷰 불가

```
PR 코멘트: "파일이 너무 길어서 대충 봤습니다 👍"
```

리뷰어가 500줄을 꼼꼼히 볼 리가 없습니다. 결국 버그가 프로덕션에 배포되었습니다.

#### 문제 4: 재사용 불가

```
상황: 설정 페이지에도 프로필 카드가 필요
해결: 복사-붙여넣기 (150줄)
문제: 버그 수정 시 2곳 모두 수정해야 함
```

#### 문제 5: 테스트 불가

```typescript
// 테스트하려면...
test('프로필 편집', () => {
  // userData mock 필요
  // orders mock 필요
  // API 전부 mock 필요
  // 결국 포기
});
```

### 1.3 측정 가능한 피해

| 지표 | 500줄 컴포넌트 | 비고 |
|-----|-------------|-----|
| 버그 수정 시간 | 평균 30분 | 버그 찾는데만 28분 |
| Git 충돌 발생 | 주 3회 | 같은 파일 수정 많음 |
| 코드 리뷰 시간 | 2분 (대충) | 제대로 안 봄 |
| 재사용성 | 0% | 복붙만 가능 |
| 테스트 커버리지 | 0% | 테스트 불가 |
| 신규 개발자 이해 시간 | 2시간+ | 어디서부터 봐야 할지 모름 |

---

## 2. 실전 분리 기준

"그럼 언제 나눠야 하나요?" - 가장 많이 받는 질문

### 2.1 기준 1: 3번 스크롤하면 분리

```
파일을 열었을 때, 전체 구조가 한눈에 안 들어오면 분리
```

**테스트 방법**:
1. 파일 열기
2. Cmd/Ctrl + Home (맨 위로)
3. 3번 Page Down
4. 아직도 같은 컴포넌트면? → 분리 필요

### 2.2 기준 2: "그리고"가 3번 나오면 분리

컴포넌트 설명할 때 "그리고"가 3번 이상 나오면 여러 책임을 가진 것입니다.

```
❌ "이 컴포넌트는 유저 데이터를 가져오고,
    그리고 프로필을 보여주고,
    그리고 프로필을 수정하고,
    그리고 주문 목록도 보여줘요"

→ 4개 책임 = 4개 컴포넌트로 분리
```

### 2.3 기준 3: Git blame 5명 이상이면 분리

```bash
git blame UserDashboard.tsx
```

5명 이상이 수정했다면? → 여러 기능이 뒤섞여 있다는 신호

### 2.4 기준 4: 2주 뒤 내가 이해 못 하면 분리

```
"이 코드 내가 짰는데... 이게 뭐지?"
```

2주 뒤 자신이 이해 못 한다면 분리 필요

### 2.5 실용적인 기준 정리

```
✅ 즉시 분리해야 하는 신호
- [ ] 100줄 이상
- [ ] useState가 5개 이상
- [ ] useEffect가 3개 이상
- [ ] 이벤트 핸들러가 5개 이상
- [ ] 같은 날 2명 이상이 수정
- [ ] "그리고"가 3번 나옴

⚠️ 분리 고려해야 하는 신호
- [ ] 50-100줄
- [ ] useState 3-4개
- [ ] useEffect 2개
- [ ] 스크롤이 필요함

✅ 적절한 크기
- [ ] 50줄 이하
- [ ] useState 0-2개
- [ ] useEffect 0-1개
- [ ] 한 화면에 전체 보임
```

---

## 3. Presentational vs Container 패턴

### 3.1 실전 문제 시나리오

```typescript
// ❌ ProductCard.tsx - 로직과 UI 뒤섞임
const ProductCard = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // API 호출 로직 50줄
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`, {
          signal: controller.signal
        });
        const data = await response.json();

        // 데이터 가공 20줄
        const processed = {
          ...data,
          discountedPrice: data.price * (1 - data.discount),
          isNew: Date.now() - new Date(data.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
        };

        setProduct(processed);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    return () => controller.abort();
  }, [productId]);

  // UI 렌더링 100줄
  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className={styles.card}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className={styles.price}>
        {product.discount > 0 ? (
          <>
            <span className={styles.original}>{product.price}원</span>
            <span className={styles.discounted}>{product.discountedPrice}원</span>
          </>
        ) : (
          <span>{product.price}원</span>
        )}
      </p>
      {product.isNew && <span className={styles.badge}>NEW</span>}
      <button>장바구니</button>
    </div>
  );
};
```

**실제 문제**:
1. **디자이너가 UI 수정 못 함**: API 로직 때문에 겁남
2. **Storybook 등록 불가**: API 호출이 필요해서 독립 실행 불가
3. **테스트 어려움**: API를 mock 해야만 UI 테스트 가능

### 3.2 해결: 로직과 UI 분리

```typescript
// ✅ ProductCardContainer.tsx - 로직만
const ProductCardContainer = ({ productId }) => {
  const { product, loading, error } = useProduct(productId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return <ProductCard product={product} />;
};

// ✅ ProductCard.tsx - UI만
interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className={styles.card}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>

      <ProductPrice
        price={product.price}
        discount={product.discount}
        discountedPrice={product.discountedPrice}
      />

      {product.isNew && <Badge>NEW</Badge>}

      <AddToCartButton productId={product.id} />
    </div>
  );
};

// ✅ useProduct.ts - 데이터 로직만
const useProduct = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchProduct(productId, controller.signal)
      .then(data => {
        setProduct(processProductData(data));
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [productId]);

  return { product, loading, error };
};
```

### 3.3 개선 효과

| 지표 | Before | After | 개선 |
|-----|--------|-------|-----|
| ProductCard 줄 수 | 150줄 | 30줄 | 80% 감소 |
| Storybook 등록 | 불가 | 가능 | ✅ |
| UI 수정 시간 | 30분 | 5분 | 83% 감소 |
| 재사용 | 불가 | 3곳에서 사용 | ✅ |
| 테스트 커버리지 | 0% | 90% | ✅ |

### 3.4 분리 패턴 다이어그램

```
┌─────────────────────────────────────┐
│  ProductCardContainer (Container)   │
│  - 데이터 로직                        │
│  - API 호출                          │
│  - 상태 관리                         │
│  - 에러 처리                         │
└──────────────┬──────────────────────┘
               │ props (product)
               ↓
┌─────────────────────────────────────┐
│  ProductCard (Presentational)       │
│  - UI만 렌더링                       │
│  - Props 받아서 표시                 │
│  - 재사용 가능                       │
│  - Storybook 가능                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  useProduct (Custom Hook)           │
│  - 재사용 가능한 로직                 │
│  - 다른 컴포넌트에서도 사용           │
│  - 독립 테스트 가능                  │
└─────────────────────────────────────┘
```

---

## 4. Custom Hook으로 로직 분리

### 4.1 실전 문제: 컴포넌트에 로직이 너무 많음

```typescript
// ❌ UserProfileForm.tsx - 폼 로직이 컴포넌트에 다 있음
const UserProfileForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', bio: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 유효성 검사
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';

    if (name === 'name' && !value) {
      error = '이름을 입력하세요';
    } else if (name === 'name' && value.length < 2) {
      error = '이름은 2글자 이상이어야 합니다';
    } else if (name === 'email' && !value) {
      error = '이메일을 입력하세요';
    } else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = '올바른 이메일 형식이 아닙니다';
    }
    // ... 더 많은 검증 로직

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 전체 검증
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });

    if (Object.values(errors).some(error => error)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile(formData);
      alert('저장 완료');
    } catch (error) {
      alert('저장 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 UI */}
    </form>
  );
};
```

**문제**:
- 다른 폼에서 이 로직을 재사용할 수 없음
- 컴포넌트가 복잡함
- 테스트가 어려움

### 4.2 해결: Custom Hook으로 추출

```typescript
// ✅ useForm.ts - 재사용 가능한 폼 로직
interface UseFormOptions<T> {
  initialValues: T;
  validate: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void>;
}

const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) => {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const fieldErrors = validate({ ...formData, [name]: value });
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldErrors = validate(formData);
    setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};

// ✅ UserProfileForm.tsx - 깔끔해진 컴포넌트
const UserProfileForm = () => {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm({
    initialValues: { name: '', email: '', bio: '' },
    validate: validateUserProfile, // 별도 함수로 분리
    onSubmit: updateProfile,
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        onBlur={() => handleBlur('name')}
      />
      {touched.name && errors.name && <span>{errors.name}</span>}

      {/* 나머지 필드 */}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '저장 중...' : '저장'}
      </button>
    </form>
  );
};

// ✅ 다른 폼에서도 재사용!
const LoginForm = () => {
  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    onSubmit: login,
  });

  // 같은 패턴으로 사용 가능
};
```

### 4.3 Custom Hook의 장점

| 항목 | 개선 효과 |
|-----|---------|
| 재사용성 | 5개 폼에서 동일한 로직 사용 |
| 컴포넌트 크기 | 150줄 → 50줄 (66% 감소) |
| 테스트 | Hook만 독립 테스트 가능 |
| 가독성 | 비즈니스 로직과 UI 분리 |

---

## 5. 실습: 리팩토링 전후 비교

### 5.1 Before: God Component

```
UserDashboard.tsx (500줄)
├── 20개 useState
├── 10개 useEffect
├── 데이터 페칭 로직 (50줄)
├── 폼 검증 로직 (30줄)
├── 이벤트 핸들러 (100줄)
└── UI 렌더링 (200줄)
```

**문제점 측정**:
- 버그 찾기: 30분
- Git 충돌: 주 3회
- 코드 리뷰: 불가능
- 재사용: 0%
- 테스트: 0%

### 5.2 After: 잘 분리된 컴포넌트

```
pages/
└── UserDashboard.tsx (50줄) ← 조합만
    │
    ├─> hooks/
    │   ├── useUserData.ts (30줄)
    │   ├── useOrders.ts (35줄)
    │   └── useProfileForm.ts (40줄)
    │
    └─> components/
        ├── ProfileCard/ (80줄)
        │   ├── ProfileCard.tsx
        │   ├── ProfileCard.module.scss
        │   └── ProfileCard.test.tsx
        │
        ├── ProfileEditForm/ (120줄)
        │   ├── ProfileEditForm.tsx
        │   ├── ProfileEditForm.module.scss
        │   └── ProfileEditForm.test.tsx
        │
        └── OrderList/ (100줄)
            ├── OrderList.tsx
            ├── OrderList.module.scss
            └── OrderList.test.tsx
```

**개선 효과 측정**:
- 버그 찾기: 5분 (83% 감소)
- Git 충돌: 거의 없음 (다른 파일 수정)
- 코드 리뷰: 파일별로 명확
- 재사용: ProfileCard 3곳에서 사용
- 테스트: 70% 커버리지

### 5.3 실제 리팩토링 순서

#### Step 1: UI 섹션 분리 (가장 쉬움)
```typescript
// Before: 모든 UI가 한 컴포넌트에
const Dashboard = () => {
  return (
    <div>
      {/* 프로필 섹션 80줄 */}
      {/* 주문 섹션 120줄 */}
    </div>
  );
};

// After: 섹션별 컴포넌트로
const Dashboard = () => {
  return (
    <div>
      <ProfileSection />
      <OrderSection />
    </div>
  );
};
```

#### Step 2: 데이터 로직을 Custom Hook으로
```typescript
// Before: 컴포넌트에 로직
const Dashboard = () => {
  const [user, setUser] = useState(null);
  useEffect(() => { /* fetch */ }, []);
  // ...
};

// After: Hook으로 분리
const Dashboard = () => {
  const { user, loading } = useUserData();
  // ...
};
```

#### Step 3: Presentational 컴포넌트로 UI 분리
```typescript
// Before: 로직 + UI
const ProfileSection = () => {
  const { user } = useUserData();
  return <div>{/* UI */}</div>;
};

// After: Container + Presentational
const ProfileSection = () => {
  const { user, loading } = useUserData();
  if (loading) return <LoadingSpinner />;
  return <ProfileCard user={user} />;
};

const ProfileCard = ({ user }) => {
  return <div>{/* UI만 */}</div>;
};
```

---

## 📊 요약: 컴포넌트 분리 체크리스트

### 즉시 분리해야 하는 신호
- [ ] 100줄 넘음
- [ ] useState 5개 이상
- [ ] useEffect 3개 이상
- [ ] "그리고"가 3번 나옴
- [ ] 버그 찾는데 10분 이상
- [ ] Git 충돌 자주 발생

### 분리 방법 선택
```
UI 섹션이 명확 → 섹션별 컴포넌트
로직이 복잡 → Custom Hook
API 호출 있음 → Container/Presentational
재사용 필요 → Props 기반 컴포넌트
```

### 기대 효과
- 버그 찾기 시간: **30분 → 5분**
- Git 충돌: **주 3회 → 거의 없음**
- 코드 리뷰: **불가 → 명확**
- 재사용: **0% → 재사용 가능**
- 테스트: **0% → 70%+**

---

## 🎯 다음 단계

Module 2에서는 **useEffect의 올바른 사용법**을 배웁니다.
- useEffect 체이닝 지옥 해결
- 불필요한 useEffect 제거
- fetch + AbortController 패턴

[Module 2로 이동 →](./02-useeffect-guide.md)
