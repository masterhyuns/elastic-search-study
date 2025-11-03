'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.scss';

/**
 * ❌ Bad Example: God Component (500줄+ 컴포넌트)
 *
 * 실제 문제:
 * - 버그 찾기 시간: 30분+ (스크롤 지옥)
 * - Git 충돌: 여러 사람이 같은 파일 수정
 * - 재사용 불가: 프로필 카드만 다른 곳에서 쓰고 싶은데 불가능
 * - 테스트 불가: 전체를 mock 해야 해서 포기
 */
export default function GodComponentPage() {
  // 🔴 문제 1: 20개가 넘는 useState
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', bio: '' });
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderFilters, setOrderFilters] = useState({ status: 'all', sortBy: 'date' });
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔴 문제 2: 복잡한 데이터 페칭 로직 (50줄+)
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      // 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 🔴 문제: 데이터 가공 로직도 여기에
      const mockUser = {
        id: '1',
        name: '김철수',
        email: 'kim@example.com',
        bio: 'React 개발자입니다.',
        avatar: 'https://via.placeholder.com/150',
        role: 'admin' as const,
      };

      setUserData(mockUser);

      // 🔴 문제: 주문 데이터도 같은 함수에서 처리
      const mockOrders = [
        { id: '1', productName: '상품 A', price: 10000, status: 'completed', createdAt: '2024-01-01' },
        { id: '2', productName: '상품 B', price: 20000, status: 'processing', createdAt: '2024-01-02' },
        { id: '3', productName: '상품 C', price: 15000, status: 'pending', createdAt: '2024-01-03' },
      ];

      setOrders(mockOrders);
      setIsLoading(false);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      setIsLoading(false);
    }
  };

  // 🔴 문제 3: 30줄짜리 폼 검증 로직
  const validateForm = () => {
    const errors: any = {};

    if (!formData.name) {
      errors.name = '이름을 입력하세요';
    } else if (formData.name.length < 2) {
      errors.name = '이름은 2글자 이상이어야 합니다';
    }

    if (!formData.email) {
      errors.email = '이메일을 입력하세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 🔴 문제 4: 40줄짜리 폼 제출 로직
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUserData({ ...userData, ...formData });
      setIsEditing(false);
      alert('저장되었습니다!');
    } catch (err) {
      alert('저장 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 초기 데이터 로드
  if (!userData && !isLoading && !error) {
    fetchUserData();
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  // 🔴 문제 5: 200줄+ 렌더링 로직
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>❌ Bad Example: God Component</h1>
        <p className={styles.subtitle}>모든 것을 하나의 컴포넌트에 넣은 500줄+ 코드</p>
        <Link href="/" className={styles.backLink}>← 메인으로 돌아가기</Link>
      </div>

      <div className={styles.problemBox}>
        <h3>🔴 실제 문제점</h3>
        <ul>
          <li><strong>버그 찾기 시간: 30분+</strong> - 500줄 스크롤하며 찾아야 함</li>
          <li><strong>Git 충돌 지옥</strong> - 3명이 같은 파일 수정 → 50줄 충돌</li>
          <li><strong>재사용 불가</strong> - 프로필 카드만 다른 곳에서 쓰고 싶은데 불가능</li>
          <li><strong>테스트 불가</strong> - 전체를 mock 해야 해서 포기</li>
        </ul>
      </div>

      {/* 🔴 프로필 섹션 - 80줄 */}
      <div className={styles.section}>
        <h2>프로필</h2>

        {isEditing ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {validationErrors.name && (
                <span className={styles.error}>{validationErrors.name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {validationErrors.email && (
                <span className={styles.error}>{validationErrors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>자기소개</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)}>
                취소
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.profileCard}>
            <img src={userData?.avatar} alt={userData?.name} />
            <div className={styles.profileInfo}>
              <h3>{userData?.name}</h3>
              <p>{userData?.email}</p>
              <p>{userData?.bio}</p>
              <button onClick={() => {
                setIsEditing(true);
                setFormData({
                  name: userData?.name || '',
                  email: userData?.email || '',
                  bio: userData?.bio || '',
                });
              }}>
                수정
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔴 주문 목록 섹션 - 120줄 */}
      <div className={styles.section}>
        <h2>주문 내역</h2>

        {/* 필터 UI - 40줄 */}
        <div className={styles.filters}>
          <select
            value={orderFilters.status}
            onChange={(e) => setOrderFilters({ ...orderFilters, status: e.target.value })}
          >
            <option value="all">전체</option>
            <option value="pending">대기</option>
            <option value="processing">처리 중</option>
            <option value="completed">완료</option>
          </select>

          <select
            value={orderFilters.sortBy}
            onChange={(e) => setOrderFilters({ ...orderFilters, sortBy: e.target.value })}
          >
            <option value="date">날짜순</option>
            <option value="price">가격순</option>
          </select>
        </div>

        {/* 테이블 - 80줄 */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>상품명</th>
              <th>가격</th>
              <th>상태</th>
              <th>날짜</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {orders
              .filter((order) => orderFilters.status === 'all' || order.status === orderFilters.status)
              .sort((a, b) => {
                if (orderFilters.sortBy === 'price') {
                  return b.price - a.price;
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map((order) => (
                <tr key={order.id} className={selectedOrder === order.id ? styles.selected : ''}>
                  <td>{order.productName}</td>
                  <td>{order.price.toLocaleString()}원</td>
                  <td>
                    <span className={`${styles.badge} ${styles[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.createdAt}</td>
                  <td>
                    <button onClick={() => setSelectedOrder(order.id)}>상세</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <p>
          <strong>코드 줄 수:</strong> 약 300줄 (실제로는 500줄 이상)
        </p>
        <p>
          <strong>개선 방법:</strong>{' '}
          <Link href="/good-examples/well-separated">✅ Good Example 보기</Link>
        </p>
      </div>
    </div>
  );
}
