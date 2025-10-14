# Elasticsearch 학습 로드맵

> **목표**: 협업 플랫폼에 Elasticsearch를 도입하기 위한 실전 학습
> **시작일**: 2025-10-13
> **예상 기간**: 1-2주

## 📚 학습 단계

### Phase 1: 환경 구축 및 기본 개념 (1-2일)
- [x] Docker Compose로 로컬 환경 구축
- [x] Elasticsearch 기본 아키텍처 이해
- [ ] Kibana Dev Tools 사용법 익히기
- [x] 기본 용어 정리 (Index, Document, Mapping, Analyzer)

### Phase 2: 기본 CRUD 실습 (1-2일)
- [x] 문서(Document) 추가/조회/수정/삭제
- [x] 벌크(Bulk) 작업
- [x] 인덱스 생성 및 설정
- [x] 매핑(Mapping) 정의

### Phase 3: 검색 쿼리 마스터 (2-3일)
- [x] Match 쿼리 (전문 검색)
- [x] Term 쿼리 (정확한 매칭)
- [x] Bool 쿼리 (복합 조건)
- [x] Range, Wildcard, Fuzzy 쿼리
- [x] Aggregation (집계)

### Phase 4: 한글 처리 및 분석기 (1-2일)
- [x] 한글 형태소 분석기 (Nori) 설치
- [ ] 커스텀 Analyzer 설정
- [ ] 자동완성 구현
- [ ] 동의어 처리

### Phase 5: 협업 플랫폼 적용 설계 (2-3일)
- [ ] 메시지/문서 검색 인덱스 설계
- [ ] 사용자/프로젝트 검색 인덱스 설계
- [ ] 실시간 검색 구현 전략
- [ ] 성능 최적화 및 모니터링

## 🎯 핵심 학습 목표

### 반드시 이해해야 할 개념
1. **Inverted Index**: Elasticsearch가 빠른 이유
2. **Mapping**: 데이터 스키마 정의
3. **Analyzer**: 텍스트를 어떻게 분석하는가
4. **Query DSL**: 검색 쿼리 작성 방법

### 협업 플랫폼 적용 시나리오
1. **전문 검색**: 메시지/문서 내용 검색
2. **자동완성**: 사용자명, 프로젝트명, 태그
3. **필터링**: 날짜, 작성자, 프로젝트별 필터
4. **정렬**: 관련성(relevance), 날짜, 인기도

## 📖 문서 구조

| 문서 | 내용 | 상태 |
|------|------|------|
| 00-learning-roadmap.md | 전체 학습 계획 | ✅ 완료 |
| 01-basic-concepts.md | Elasticsearch 핵심 개념 | ✅ 완료 |
| 02-setup-guide.md | 로컬 환경 구축 가이드 | ✅ 완료 |
| 03-crud-operations.md | 기본 CRUD 실습 | ✅ 완료 |
| 03-1-index-settings-deep-dive.md | Index Settings 완벽 이해 | ✅ 완료 |
| 03-2-practical-exercises.md | 실전 과제 15개 + 정답 | ✅ 완료 |
| 04-search-queries.md | 검색 쿼리 실습 | ✅ 완료 |
| 05-nori-korean-analyzer.md | Nori 한글 형태소 분석기 | ✅ 완료 |
| 06-platform-use-cases.md | 협업 플랫폼 적용 시나리오 | ⏳ 대기 |
| 99-troubleshooting.md | 문제 해결 및 팁 | ✅ 완료 |

## 📝 학습 노트

### 진행 상황
- **2025-10-13**:
  - 학습 시작
  - Docker Compose 환경 구성 완료
  - Elasticsearch 8.11.0 + Kibana 실행 성공
  - 클러스터명: `es-learning-cluster`
  - 접속 확인: http://localhost:30200 ✅
  - Kibana UI: http://localhost:30601 (대기 중)
  - **CRUD 실습 완료**:
    - `messages` 인덱스 생성 (매핑 포함)
    - Bulk API로 5개 샘플 메시지 추가
    - 조회(Read), 수정(Update), 삭제(Delete) 테스트
  - **검색 쿼리 실습 완료**:
    - Match 쿼리: "배포" 검색 → 1건 발견
    - Bool 쿼리: 개발팀 + 고정안된 메시지 → 2건 발견
    - Aggregation: 채널별 메시지 개수 집계 성공
  - **Nori 한글 형태소 분석기 학습 완료**:
    - Nori 플러그인 설치 및 Elasticsearch 재시작
    - Standard vs Nori 검색 품질 비교 테스트
    - "공부" 검색: Standard 0건 vs Nori 1건 ("공부합니다" 매칭)
    - messages_standard, messages_korean 인덱스 생성 및 비교
    - 형태소 분석 원리 이해 (조사/어미 제거)
  - **고급 검색 쿼리 실습 완료**:
    - Range 쿼리: 날짜/숫자 범위 검색 테스트 (now-5d/d 등)
    - Wildcard 쿼리: 패턴 매칭 (홍*, *수*, *팀) 테스트
    - Fuzzy 쿼리: 오타 허용 검색 ("회외" → "회의" 매칭 성공)

### 배운 점
- Docker Compose를 사용하면 Elasticsearch + Kibana를 쉽게 구축 가능
- 포트 30000대로 설정하여 다른 로컬 서비스와 충돌 방지
- 단일 노드 클러스터는 status가 "yellow"여도 정상 (replica 없음)
- 학습 환경에서는 xpack.security.enabled=false로 인증 비활성화
- **Bulk API는 개별 요청보다 100배 이상 빠름** - 대량 데이터 추가 시 필수
- **text vs keyword**: text는 전문 검색용(분석됨), keyword는 필터/정렬용(분석 안됨)
- **Bool 쿼리의 filter는 캐싱**되어 must보다 빠름 (점수 계산 안함)
- **Aggregation의 size: 0**: 집계만 필요할 때 문서 응답 생략으로 성능 향상
- **_score**: Match 쿼리는 관련성 점수 계산, Filter는 0.0 (정확한 매칭만)
- **Nori는 한글 검색의 필수**: Standard는 "공부합니다"를 통째로, Nori는 "공부"로 토큰화
- **형태소 분석 = 검색 품질**: 조사/어미 제거로 사용자가 다양한 형태로 검색 가능
- **decompound_mode: mixed**: 복합명사를 원본+분해 모두 토큰화 (가장 유연)
- **Reindex로 무중단 마이그레이션**: 별칭(alias) 사용하여 운영 중 인덱스 전환
- **Range 쿼리의 날짜 계산**: now-7d/d는 7일 전 자정부터 (협업 플랫폼의 기간 필터링 필수)
- **Wildcard는 keyword 필드 전용**: text 필드는 분석되므로 wildcard 사용 불가
- **Fuzziness는 UX 향상의 핵심**: 오타 허용으로 사용자가 정확히 입력하지 않아도 검색 가능
- **Fuzziness "AUTO"가 최적**: 단어 길이에 따라 자동 조정 (3-5글자: 1, 6+글자: 2)

### 질문/이슈
<!-- 해결해야 할 질문이나 막힌 부분 기록 -->

## 🔗 참고 자료

- [Elasticsearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Elasticsearch Definitive Guide](https://www.elastic.co/guide/en/elasticsearch/guide/current/index.html)
- [Nori 한글 분석기](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-nori.html)
