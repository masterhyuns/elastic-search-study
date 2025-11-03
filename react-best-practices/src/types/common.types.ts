/**
 * 공통 타입 정의
 *
 * 프로젝트 전역에서 사용되는 공통 타입들을 정의합니다.
 * 각 feature별 타입은 해당 feature 폴더 내 types/ 디렉토리에 정의하세요.
 */

/**
 * 사용자 정보 타입
 * 인증, 프로필 등 여러 곳에서 사용됩니다.
 */
export interface User {
  /** 사용자 고유 ID */
  id: string;
  /** 사용자 이름 */
  name: string;
  /** 이메일 주소 */
  email: string;
  /** 프로필 이미지 URL */
  avatar?: string;
  /** 사용자 역할 (admin, user 등) */
  role: 'admin' | 'user' | 'guest';
}

/**
 * 주문 정보 타입
 * 예제 코드에서 사용됩니다.
 */
export interface Order {
  /** 주문 고유 ID */
  id: string;
  /** 사용자 ID */
  userId: string;
  /** 상품 ID */
  productId: string;
  /** 상품명 */
  productName: string;
  /** 가격 */
  price: number;
  /** 수량 */
  quantity: number;
  /** 주문 상태 */
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  /** 주문 일시 */
  createdAt: string;
}

/**
 * 상품 정보 타입
 * 예제 코드에서 사용됩니다.
 */
export interface Product {
  /** 상품 고유 ID */
  id: string;
  /** 상품명 */
  name: string;
  /** 상품 설명 */
  description: string;
  /** 가격 */
  price: number;
  /** 할인율 (0-1 사이 값, 예: 0.1 = 10% 할인) */
  discount: number;
  /** 할인 적용된 가격 */
  discountedPrice: number;
  /** 상품 이미지 URL */
  image: string;
  /** 신상품 여부 (7일 이내 등록) */
  isNew: boolean;
  /** 재고 수량 */
  stock: number;
  /** 카테고리 */
  category: string;
}

/**
 * API 응답 타입
 * 모든 API 응답의 기본 구조입니다.
 */
export interface ApiResponse<T> {
  /** 성공 여부 */
  success: boolean;
  /** 응답 데이터 */
  data: T;
  /** 에러 메시지 (실패 시) */
  error?: string;
  /** HTTP 상태 코드 */
  statusCode: number;
}

/**
 * 페이지네이션 타입
 * 리스트 API에서 사용됩니다.
 */
export interface Pagination {
  /** 현재 페이지 (1부터 시작) */
  page: number;
  /** 페이지당 아이템 수 */
  pageSize: number;
  /** 전체 아이템 수 */
  totalItems: number;
  /** 전체 페이지 수 */
  totalPages: number;
}

/**
 * 페이지네이션 응답 타입
 * 리스트 데이터 + 페이지네이션 정보
 */
export interface PaginatedResponse<T> {
  /** 아이템 리스트 */
  items: T[];
  /** 페이지네이션 정보 */
  pagination: Pagination;
}

/**
 * 로딩 상태 타입
 * 비동기 작업의 상태를 관리합니다.
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 비동기 데이터 상태 타입
 * 데이터 + 로딩 + 에러를 함께 관리합니다.
 */
export interface AsyncData<T> {
  /** 데이터 */
  data: T | null;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 로딩 상태 */
  status: LoadingState;
}
