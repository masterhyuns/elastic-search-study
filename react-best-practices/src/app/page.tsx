import Link from 'next/link';
import styles from './page.module.scss';

/**
 * 메인 페이지 - React 베스트 프랙티스 교육 프로젝트
 *
 * 전체 커리큘럼을 보여주고 각 모듈로 이동할 수 있는 네비게이션을 제공합니다.
 */
export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>React 베스트 프랙티스</h1>
        <p className={styles.subtitle}>실전 중심 교육 프로젝트</p>
        <p className={styles.description}>
          "React 문서에서 이렇게 하라고 했어요"가 아닌,
          <strong> "실제로 이렇게 짰더니 이런 문제가 생겼고, 이렇게 고치니 해결됐어요"</strong>를
          배우는 실전 중심 교육 자료입니다.
        </p>
      </header>

      <div className={styles.infoBox}>
        <h3>📚 학습 방법</h3>
        <p>
          각 모듈은 <strong>Bad Example</strong> (문제 있는 코드) →{' '}
          <strong>Good Example</strong> (개선된 코드) →{' '}
          <strong>Comparison</strong> (나란히 비교) 순서로 학습합니다.
          실제 브라우저에서 동작하는 코드를 보며 차이를 직접 체감하세요.
        </p>
      </div>

      <div className={styles.modules}>
        {/* Module 1: 컴포넌트 분리 */}
        <div className={styles.moduleCard}>
          <h2>Module 1: 컴포넌트 분리</h2>
          <div className={styles.badge}>버그 수정 시간 83% 감소</div>
          <p>
            500줄짜리 컴포넌트의 실제 문제점을 경험하고, 역할별로 분리하여
            유지보수성을 높이는 방법을 배웁니다.
          </p>
          <ul className={styles.highlights}>
            <li>버그 찾기 시간: 30분 → 5분</li>
            <li>Git 충돌: 주 3회 → 거의 없음</li>
            <li>Presentational vs Container 패턴</li>
          </ul>
          <div className={styles.links}>
            <Link href="/bad-examples/god-component" className={`${styles.link} ${styles.danger}`}>
              ❌ Bad Example
            </Link>
            <Link href="/good-examples/well-separated" className={`${styles.link} ${styles.success}`}>
              ✅ Good Example
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              className={`${styles.link} ${styles.secondary}`}
            >
              📖 문서 보기
            </a>
          </div>
        </div>

        {/* Module 2: useEffect */}
        <div className={styles.moduleCard}>
          <h2>Module 2: useEffect 올바른 사용</h2>
          <div className={styles.badge}>useEffect 87% 감소</div>
          <p>
            useEffect 체이닝 지옥과 Race Condition 버그를 경험하고,
            진짜 필요한 경우에만 사용하는 방법을 배웁니다.
          </p>
          <ul className={styles.highlights}>
            <li>디버깅 시간: 1시간 → 10분</li>
            <li>렌더링 횟수: 10번 → 3번</li>
            <li>상태 동기화를 계산된 값으로</li>
          </ul>
          <div className={styles.links}>
            <Link href="/bad-examples/useeffect-hell" className={`${styles.link} ${styles.danger}`}>
              ❌ Bad Example
            </Link>
            <Link href="/good-examples/proper-useeffect" className={`${styles.link} ${styles.success}`}>
              ✅ Good Example
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              className={`${styles.link} ${styles.secondary}`}
            >
              📖 문서 보기
            </a>
          </div>
        </div>

        {/* Module 3: 상태 관리 */}
        <div className={styles.moduleCard}>
          <h2>Module 3: 상태 관리 전략</h2>
          <div className={styles.badge}>Props Drilling 100% 제거</div>
          <p>
            7단계 Props Drilling의 고통을 경험하고,
            Context, Composition, Zustand로 해결하는 방법을 배웁니다.
          </p>
          <ul className={styles.highlights}>
            <li>Props 전달 단계: 7단계 → 0단계</li>
            <li>타입 import: 5개 파일 → 1개 파일</li>
            <li>상태 배치 결정 트리</li>
          </ul>
          <div className={styles.links}>
            <Link href="/bad-examples/props-drilling" className={`${styles.link} ${styles.danger}`}>
              ❌ Bad Example
            </Link>
            <Link href="/good-examples/clean-state" className={`${styles.link} ${styles.success}`}>
              ✅ Good Example
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              className={`${styles.link} ${styles.secondary}`}
            >
              📖 문서 보기
            </a>
          </div>
        </div>

        {/* Module 4: 성능 최적화 */}
        <div className={styles.moduleCard}>
          <h2>Module 4: 성능 최적화</h2>
          <div className={styles.badge}>렌더링 시간 90% 감소</div>
          <p>
            과도한 최적화가 오히려 느리게 만드는 것을 경험하고,
            측정 기반으로 진짜 병목만 최적화하는 방법을 배웁니다.
          </p>
          <ul className={styles.highlights}>
            <li>10,000개 리스트: 3초 → 0.1초</li>
            <li>측정 도구: React DevTools Profiler</li>
            <li>최적화 우선순위</li>
          </ul>
          <div className={styles.links}>
            <Link href="/bad-examples/unnecessary-rerenders" className={`${styles.link} ${styles.danger}`}>
              ❌ Bad Example
            </Link>
            <Link href="/good-examples/optimized" className={`${styles.link} ${styles.success}`}>
              ✅ Good Example
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              className={`${styles.link} ${styles.secondary}`}
            >
              📖 문서 보기
            </a>
          </div>
        </div>

        {/* Module 5: 폴더 구조 */}
        <div className={styles.moduleCard}>
          <h2>Module 5: 폴더 구조</h2>
          <div className={styles.badge}>파일 찾기 93% 단축</div>
          <p>
            "파일 어디 있지?" 시간을 줄이는 Feature-based 구조를 배우고,
            기능 삭제 시 폴더째 지울 수 있는 구조를 설계합니다.
          </p>
          <ul className={styles.highlights}>
            <li>파일 찾기: 15분 → 10초</li>
            <li>Git 충돌: 80% 감소</li>
            <li>Colocation 원칙</li>
          </ul>
          <div className={styles.links}>
            <a
              href="https://github.com"
              target="_blank"
              className={`${styles.link} ${styles.primary}`}
            >
              📖 문서 보기
            </a>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>
          <strong>만든 이유</strong>: React를 배우는 후배 개발자들이 같은 실수를
          반복하지 않도록, 실전 경험을 공유하기 위해 만들었습니다.
        </p>
        <p>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub에서 보기
          </a>
        </p>
      </footer>
    </div>
  );
}
