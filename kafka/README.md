# Kafka 학습 프로젝트

> Apache Kafka 학습을 위한 Docker 기반 로컬 환경 및 학습 자료

## 📚 프로젝트 개요

협업 플랫폼에 Kafka를 도입하기 위한 체계적인 학습 프로젝트입니다.
Elasticsearch와 연동하여 이벤트 기반 아키텍처를 구축하는 것이 최종 목표입니다.

## 🏗️ 아키텍처

```
사용자 액션
    ↓
Backend API (Producer)
    ↓
┌─────────────────────┐
│    Kafka Cluster    │
│  (이벤트 버스)        │
└─────────────────────┘
    ↓ (Consumer Groups)
    ├─→ Elasticsearch (검색 인덱싱)
    ├─→ Notification (실시간 알림)
    ├─→ Analytics (통계 분석)
    └─→ Archive (장기 보관)
```

## 🚀 빠른 시작

### 1. Kafka 클러스터 실행
```bash
cd kafka
docker-compose up -d
```

### 2. Kafka UI 접속
http://localhost:30080

### 3. 첫 번째 메시지 발행
```bash
# Producer 실행
docker exec -it local-kafka kafka-console-producer \
  --bootstrap-server kafka:9093 \
  --topic test-topic

# 메시지 입력
>Hello Kafka!
```

### 4. 메시지 구독
```bash
# 새 터미널에서 Consumer 실행
docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic test-topic \
  --from-beginning
```

## 📖 학습 문서

| 단계 | 문서 | 내용 |
|------|------|------|
| 0 | [00-learning-roadmap.md](./docs/00-learning-roadmap.md) | 전체 학습 계획 (Phase 1-6) |
| 1 | [01-basic-concepts.md](./docs/01-basic-concepts.md) | Kafka 핵심 개념 |
| 2 | [02-setup-guide.md](./docs/02-setup-guide.md) | 환경 구축 가이드 |
| 3 | [03-producer-consumer.md](./docs/03-producer-consumer.md) | Producer/Consumer 실습 |
| 4 | [04-topics-partitions.md](./docs/04-topics-partitions.md) | Topics & Partitions |
| 5 | [05-consumer-groups.md](./docs/05-consumer-groups.md) | Consumer Groups |
| 6 | [06-platform-use-cases.md](./docs/06-platform-use-cases.md) | 협업 플랫폼 적용 |
| 99 | [99-troubleshooting.md](./docs/99-troubleshooting.md) | 문제 해결 가이드 |

## 🎯 학습 목표

### Phase 1-2: 기초 (1-2일)
- Kafka 아키텍처 이해
- Producer/Consumer 실습
- Topic, Partition, Offset 개념

### Phase 3-4: 중급 (2-3일)
- Consumer Group 병렬 처리
- Replication & 고가용성
- Offset 관리 전략

### Phase 5-6: 고급 (3-4일)
- Kafka Streams
- 협업 플랫폼 적용 설계
- Elasticsearch 연동

## 🔧 기술 스택

- **Kafka**: 7.5.0 (Confluent Platform)
- **Zookeeper**: 7.5.0
- **Kafka UI**: latest (Provectus)
- **Docker Compose**: 3.8

## 🌐 포트 설정

| 서비스 | 포트 | 용도 |
|--------|------|------|
| Kafka | 30092 | Broker (외부 연결) |
| Kafka | 30093 | Broker (내부 통신) |
| Zookeeper | 32181 | 메타데이터 관리 |
| Kafka UI | 30080 | 웹 관리 콘솔 |

## 📝 주요 명령어

### Topic 관리 (컨테이너 내부)
```bash
# Topic 생성
kafka-topics --create --bootstrap-server kafka:9093 \
  --topic my-topic --partitions 3 --replication-factor 1

# Topic 목록
kafka-topics --list --bootstrap-server kafka:9093

# Topic 상세 정보
kafka-topics --describe --bootstrap-server kafka:9093 --topic my-topic
```

### 메시지 발행/구독 (컨테이너 내부)
```bash
# Producer
kafka-console-producer --bootstrap-server kafka:9093 --topic my-topic

# Consumer (최신 메시지부터)
kafka-console-consumer --bootstrap-server kafka:9093 --topic my-topic

# Consumer (처음부터)
kafka-console-consumer --bootstrap-server kafka:9093 \
  --topic my-topic --from-beginning
```

### Consumer Group (컨테이너 내부)
```bash
# Consumer Group 목록
kafka-consumer-groups --list --bootstrap-server kafka:9093

# Lag 확인
kafka-consumer-groups --describe --bootstrap-server kafka:9093 \
  --group my-group
```

**참고**: 모든 명령어는 `docker exec -it local-kafka` 안에서 실행하거나, 명령어 앞에 붙여서 실행합니다.

## 🛑 종료

```bash
# 컨테이너 중지
docker-compose down

# 데이터까지 삭제
docker-compose down -v
```

## 📚 참고 자료

- [Apache Kafka 공식 문서](https://kafka.apache.org/documentation/)
- [Confluent Documentation](https://docs.confluent.io/)
- [Kafka UI GitHub](https://github.com/provectus/kafka-ui)

## 🤝 관련 프로젝트

- [../docs](../docs): Elasticsearch 학습 프로젝트
- 협업 플랫폼 이벤트 기반 아키텍처

---

**시작일**: 2025-10-14
**목표**: 협업 플랫폼에 Kafka 기반 이벤트 스트리밍 도입
