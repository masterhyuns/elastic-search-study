# Kafka 학습 로드맵

> **목표**: 협업 플랫폼에 Kafka를 도입하여 이벤트 기반 아키텍처 구축
> **시작일**: 2025-10-14
> **예상 기간**: 1-2주

## 📚 학습 단계

### Phase 1: 환경 구축 및 기본 개념 (1일)
- [ ] Docker Compose로 Kafka 클러스터 구축
- [ ] Kafka 아키텍처 이해 (Broker, Topic, Partition)
- [ ] 기본 용어 정리 (Producer, Consumer, Consumer Group)
- [ ] Kafka UI로 토픽/메시지 모니터링

### Phase 2: Producer & Consumer 실습 (1-2일)
- [ ] Console Producer/Consumer 사용
- [ ] 메시지 발행 (Produce) 실습
- [ ] 메시지 구독 (Consume) 실습
- [ ] Key-Value 메시지 구조
- [ ] Serialization (String, JSON)

### Phase 3: Topics & Partitions (1-2일)
- [ ] 토픽 생성 및 설정
- [ ] 파티션 개념 및 분산 처리
- [ ] Replication Factor (복제)
- [ ] Leader/Follower 구조
- [ ] Offset 관리

### Phase 4: Consumer Groups (1-2일)
- [ ] Consumer Group 개념 및 실습
- [ ] 파티션 분배 전략 (Round Robin, Range, Sticky)
- [ ] Rebalancing 시나리오
- [ ] Commit 전략 (auto vs manual)
- [ ] Lag 모니터링

### Phase 5: 고급 기능 (1-2일)
- [ ] Kafka Streams 소개
- [ ] Exactly-Once Semantics
- [ ] Idempotent Producer
- [ ] Transactions
- [ ] Schema Registry (Avro)

### Phase 6: 협업 플랫폼 적용 (2-3일)
- [ ] 메시지 이벤트 스트리밍 설계
- [ ] 실시간 알림 시스템 구축
- [ ] 이벤트 소싱 아키텍처
- [ ] CQRS 패턴 적용
- [ ] Elasticsearch 연동 (Change Data Capture)

## 🎯 핵심 학습 목표

### 반드시 이해해야 할 개념
1. **분산 메시징**: Kafka가 높은 처리량을 달성하는 방법
2. **파티션**: 병렬 처리 및 확장성의 핵심
3. **Consumer Group**: 메시지 분산 처리
4. **Offset**: 메시지 소비 위치 추적
5. **Replication**: 고가용성 보장

### 협업 플랫폼 적용 시나리오
1. **이벤트 스트리밍**: 사용자 액션 → Kafka → 다수의 Consumer
2. **실시간 알림**: 메시지/멘션 발생 시 실시간 푸시
3. **검색 인덱싱**: Kafka → Elasticsearch 실시간 동기화
4. **분석 파이프라인**: 사용자 활동 로그 수집 및 분석
5. **CQRS**: Command/Query 분리 아키텍처

## 📖 문서 구조

| 문서 | 내용 | 상태 |
|------|------|------|
| 00-learning-roadmap.md | 전체 학습 계획 | ✅ 완료 |
| 01-basic-concepts.md | Kafka 핵심 개념 | ⏳ 대기 |
| 02-setup-guide.md | 로컬 환경 구축 가이드 | ⏳ 대기 |
| 03-producer-consumer.md | Producer/Consumer 실습 | ⏳ 대기 |
| 04-topics-partitions.md | Topics & Partitions 이해 | ⏳ 대기 |
| 05-consumer-groups.md | Consumer Groups 마스터 | ⏳ 대기 |
| 06-platform-use-cases.md | 협업 플랫폼 적용 시나리오 | ⏳ 대기 |
| 99-troubleshooting.md | 문제 해결 및 팁 | ⏳ 대기 |

## 📝 학습 노트

### 진행 상황

#### 2025-10-14 (Day 1)
- **환경 구축 완료**:
  - Docker Compose 작성 (Kafka + Zookeeper + Kafka UI)
  - 포트 설정: Kafka 30092, Zookeeper 32181, Kafka UI 30080
  - 학습 문서 구조 생성

### 배운 점
- Docker Compose로 Kafka 클러스터를 쉽게 구축 가능
- 포트 30000대로 설정하여 Elasticsearch와 충돌 방지
- Kafka UI를 통해 토픽/메시지를 시각적으로 모니터링 가능

### 질문/이슈
<!-- 해결해야 할 질문이나 막힌 부분 기록 -->

## 🔄 Elasticsearch와의 연동 시나리오

```
┌─────────────────────────────────────────────────────────┐
│                    협업 플랫폼 아키텍처                      │
└─────────────────────────────────────────────────────────┘

사용자 액션 (메시지 작성)
    ↓
Backend API (Producer)
    ↓
┌──────────────────┐
│   Kafka Topic    │  ← 이벤트 버스
│   "messages"     │
└──────────────────┘
    ↓ (Consumer Groups)
    ├─→ [Elasticsearch Consumer]  검색 인덱싱
    ├─→ [Notification Consumer]   실시간 알림
    ├─→ [Analytics Consumer]      통계 분석
    └─→ [Archive Consumer]        장기 보관

┌──────────────────┐     ┌──────────────────┐
│  Elasticsearch   │     │   PostgreSQL     │
│  (검색 엔진)       │     │   (메인 DB)       │
└──────────────────┘     └──────────────────┘
```

## 📌 학습 체크리스트

### Phase 1 완료 기준
- [ ] Kafka 컨테이너 정상 실행
- [ ] Kafka UI 접속 (http://localhost:30080)
- [ ] 첫 번째 토픽 생성 성공
- [ ] Console Producer/Consumer로 메시지 송수신

### Phase 2 완료 기준
- [ ] Producer로 메시지 발행 10회 이상
- [ ] Consumer로 메시지 구독 성공
- [ ] Key-Value 메시지 이해
- [ ] JSON 메시지 발행/구독

### Phase 3 완료 기준
- [ ] 3개 파티션 토픽 생성
- [ ] Replication Factor 이해
- [ ] Offset 개념 이해
- [ ] Partition 분배 확인

### Phase 4 완료 기준
- [ ] Consumer Group으로 병렬 처리
- [ ] Rebalancing 관찰
- [ ] Lag 모니터링
- [ ] Manual Commit 구현

### Phase 5 완료 기준
- [ ] Kafka Streams 예제 실행
- [ ] Idempotent Producer 설정
- [ ] Transaction 이해

### Phase 6 완료 기준
- [ ] 협업 플랫폼 이벤트 설계
- [ ] Kafka → Elasticsearch 연동
- [ ] 실시간 알림 시스템 POC
- [ ] CQRS 패턴 적용 예제

## 🎓 다음 단계

학습 완료 후:
- [ ] 실제 협업 플랫폼 백엔드에 Kafka Producer 통합
- [ ] Consumer 애플리케이션 개발 (Node.js/Spring Boot)
- [ ] Kafka Connect로 Elasticsearch 연동
- [ ] 모니터링 및 알람 설정 (Prometheus, Grafana)
