# Consumer Groups

> Consumer Group을 통한 병렬 처리 및 확장성

## 🎯 학습 목표
- Consumer Group 동작 원리
- 파티션 분배 전략
- Rebalancing 이해
- Offset 관리
- Lag 모니터링

---

## 👥 Consumer Group 개념

### 1. 동작 방식
```
Topic: messages (3 Partitions)

Consumer Group: "search-indexer"
├─ Consumer A → Partition 0
├─ Consumer B → Partition 1
└─ Consumer C → Partition 2
```

**규칙**:
- 하나의 파티션은 Group 내 하나의 Consumer만
- Consumer 수 > Partition 수: 일부 Consumer는 유휴
- Consumer 수 < Partition 수: 일부 Consumer가 여러 파티션 처리

### 2. 파티션 분배 전략
- **Range**: 연속된 파티션 할당
- **RoundRobin**: 균등 분배
- **Sticky**: Rebalancing 최소화
- **CooperativeSticky**: 점진적 Rebalancing (권장)

---

## 🔄 Rebalancing

### 1. 발생 조건
- Consumer 추가/제거
- Consumer 장애
- Partition 추가
- Heartbeat 타임아웃

### 2. 영향
- 일시적으로 메시지 처리 중단
- Offset 커밋 필요

### 3. 최소화 방법
```properties
session.timeout.ms=30000
heartbeat.interval.ms=3000
max.poll.interval.ms=300000
```

---

## 📊 Lag 모니터링

### 1. Lag 확인
```bash
kafka-consumer-groups --describe \
  --bootstrap-server localhost:9092 \
  --group my-group
```

**출력**:
```
GROUP  TOPIC      PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
my-group messages  0          100             150             50
my-group messages  1          200             200             0
my-group messages  2          150             180             30
```

### 2. Lag 해결
- Consumer 수 증가
- 처리 로직 최적화
- Batch 크기 조정

---

## 🧪 실습 과제

### 과제 1: Consumer Group 실습
1. 3개의 Consumer를 같은 Group으로 실행
2. Producer로 메시지 발행
3. 각 Consumer가 처리하는 파티션 확인

### 과제 2: Rebalancing 관찰
1. Consumer 2개로 시작
2. 3번째 Consumer 추가
3. Rebalancing 로그 확인

---

## 🔄 다음 단계
- [06-platform-use-cases.md](./06-platform-use-cases.md): 협업 플랫폼 적용
