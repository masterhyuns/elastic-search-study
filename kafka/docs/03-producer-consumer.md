# Producer & Consumer 실습

> Kafka Producer와 Consumer의 동작 원리 및 설정

## 🎯 학습 목표
- Producer 설정 및 메시지 발행 전략
- Consumer 설정 및 메시지 구독 패턴
- Serialization (String, JSON)
- Acknowledgement 전략
- Error Handling

---

## 📤 Producer 심화

### 1. Producer 설정
```properties
bootstrap.servers=localhost:30092
key.serializer=org.apache.kafka.common.serialization.StringSerializer
value.serializer=org.apache.kafka.common.serialization.StringSerializer
acks=all
retries=3
batch.size=16384
linger.ms=10
compression.type=lz4
```

### 2. Acks 전략
- **acks=0**: 응답 대기 안함 (빠름, 손실 가능)
- **acks=1**: Leader만 확인 (균형)
- **acks=all**: 모든 ISR 확인 (안전, 느림)

### 3. 파티션 선택 전략
- Key 없음: Round-Robin
- Key 있음: Hash(Key) % Partitions
- Custom Partitioner 구현 가능

---

## 📥 Consumer 심화

### 1. Consumer 설정
```properties
bootstrap.servers=localhost:30092
group.id=my-group
key.deserializer=org.apache.kafka.common.serialization.StringDeserializer
value.deserializer=org.apache.kafka.common.serialization.StringDeserializer
auto.offset.reset=earliest
enable.auto.commit=true
auto.commit.interval.ms=5000
max.poll.records=500
```

### 2. Offset Commit 전략
- **Auto Commit**: 자동 커밋 (간단, 중복 가능)
- **Manual Commit**: 수동 커밋 (정확, 복잡)
- **Async Commit**: 비동기 커밋 (빠름, 손실 가능)

### 3. Rebalancing
- Consumer 추가/제거 시 파티션 재분배
- 일시적으로 메시지 처리 중단

---

## 🧪 실습 과제

### 과제 1: JSON 메시지 발행
```bash
# JSON Producer
kafka-console-producer --bootstrap-server localhost:9092 \
  --topic messages \
  --property "parse.key=true" \
  --property "key.separator=:"

>user_001:{"action":"message_created","content":"Hello"}
```

### 과제 2: Consumer Group 병렬 처리
3개의 Consumer를 같은 Group으로 실행하여 파티션 분배 확인

**목표**: Consumer Group의 파티션 자동 할당 및 병렬 처리 확인

---

## ✅ 과제 정답 및 해설

### 과제 1 정답: JSON 메시지 발행

**1단계: Topic 생성 (파티션 3개)**
```bash
docker exec -it local-kafka kafka-topics --create \
  --bootstrap-server kafka:9093 \
  --topic json-messages \
  --partitions 3 \
  --replication-factor 1
```

**2단계: JSON Producer 실행**
```bash
docker exec -it local-kafka kafka-console-producer \
  --bootstrap-server kafka:9093 \
  --topic json-messages \
  --property "parse.key=true" \
  --property "key.separator=:"
```

**3단계: 메시지 발행 (Producer 터미널에서)**
```json
user_001:{"action":"message_created","user_id":"user_001","content":"Hello from user 1","timestamp":"2025-10-14T10:00:00Z"}
user_002:{"action":"message_updated","user_id":"user_002","content":"Updated message","timestamp":"2025-10-14T10:01:00Z"}
user_003:{"action":"message_deleted","user_id":"user_003","message_id":"msg_123","timestamp":"2025-10-14T10:02:00Z"}
project_100:{"action":"project_created","project_id":"project_100","name":"New Project","timestamp":"2025-10-14T10:03:00Z"}
task_200:{"action":"task_assigned","task_id":"task_200","assignee":"user_001","priority":"high","timestamp":"2025-10-14T10:04:00Z"}
```

**4단계: Consumer로 확인 (새 터미널)**
```bash
docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic json-messages \
  --from-beginning \
  --property "print.key=true" \
  --property "key.separator= => "
```

**예상 결과:**
```
user_001 => {"action":"message_created","user_id":"user_001","content":"Hello from user 1","timestamp":"2025-10-14T10:00:00Z"}
user_002 => {"action":"message_updated","user_id":"user_002","content":"Updated message","timestamp":"2025-10-14T10:01:00Z"}
...
```

`★ Insight ─────────────────────────────────────`
**Key-Value 메시지의 장점:**
- Key를 기준으로 파티션 할당되어 같은 사용자/프로젝트의 이벤트가 순서 보장
- Key가 동일하면 항상 같은 파티션으로 라우팅되어 Consumer가 순차 처리 가능
- 협업 플랫폼에서 사용자별, 프로젝트별 이벤트 순서 보장에 필수적
`─────────────────────────────────────────────────`

---

### 과제 2 정답: Consumer Group 병렬 처리

**실습 시나리오**: 3개 파티션을 가진 Topic에 3개의 Consumer를 같은 Group으로 실행하여 1:1 파티션 할당 확인

**1단계: Topic 생성 (파티션 3개)**
```bash
docker exec -it local-kafka kafka-topics --create \
  --bootstrap-server kafka:9093 \
  --topic parallel-test \
  --partitions 3 \
  --replication-factor 1
```

**2단계: Consumer 3개 실행 (각각 다른 터미널)**

**터미널 1 - Consumer A:**
```bash
docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic parallel-test \
  --group parallel-group \
  --property print.partition=true
```

**터미널 2 - Consumer B:**
```bash
docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic parallel-test \
  --group parallel-group \
  --property print.partition=true
```

**터미널 3 - Consumer C:**
```bash
docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic parallel-test \
  --group parallel-group \
  --property print.partition=true
```

**3단계: 파티션 할당 확인**
```bash
# 새 터미널에서 Consumer Group 상태 확인
docker exec -it local-kafka kafka-consumer-groups \
  --bootstrap-server kafka:9093 \
  --describe \
  --group parallel-group
```

**예상 결과:**
```
GROUP           TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG  CONSUMER-ID                                    HOST            CLIENT-ID
parallel-group  parallel-test   0          0               0               0    consumer-parallel-group-1-abc123               /172.18.0.3     consumer-parallel-group-1
parallel-group  parallel-test   1          0               0               0    consumer-parallel-group-1-def456               /172.18.0.4     consumer-parallel-group-1
parallel-group  parallel-test   2          0               0               0    consumer-parallel-group-1-ghi789               /172.18.0.5     consumer-parallel-group-1
```

**확인 포인트:**
- ✅ **파티션 0, 1, 2가 각각 다른 Consumer에게 할당됨** (1:1 매핑)
- ✅ **3개 Consumer 모두 ACTIVE 상태**
- ✅ **LAG = 0** (모든 메시지 처리 완료)

**4단계: 메시지 발행 테스트 (새 터미널)**
```bash
docker exec -it local-kafka kafka-console-producer \
  --bootstrap-server kafka:9093 \
  --topic parallel-test
```

**메시지 10개 발행:**
```
Message 1
Message 2
Message 3
Message 4
Message 5
Message 6
Message 7
Message 8
Message 9
Message 10
```

**5단계: 각 Consumer 터미널에서 결과 확인**

**예상 분배:**
- **Consumer A**: Partition:0 - Message 1, 4, 7, 10 (약 3-4개)
- **Consumer B**: Partition:1 - Message 2, 5, 8 (약 3개)
- **Consumer C**: Partition:2 - Message 3, 6, 9 (약 3개)

`★ Insight ─────────────────────────────────────`
**병렬 처리의 핵심 원리:**
1. **파티션 수 = Consumer 수** 일 때 최적의 병렬 처리 (1:1 할당)
2. **파티션 수 > Consumer 수**: 일부 Consumer가 여러 파티션 처리 (예: 3파티션, 2Consumer = 2:1 분배)
3. **파티션 수 < Consumer 수**: 일부 Consumer는 Idle 상태 (예: 3파티션, 5Consumer = 2개 놀림)
4. **협업 플랫폼 적용**: 사용자 수/트래픽에 따라 파티션 수 설계 → Consumer 수 조정으로 스케일링
`─────────────────────────────────────────────────`

---

### 🧪 추가 실험: Rebalancing 관찰

**실험 목표**: Consumer가 추가/제거될 때 파티션 재분배 과정 관찰

**1단계: Consumer 1개만 실행**
```bash
docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic parallel-test \
  --group rebalance-test \
  --property print.partition=true
```

**확인:**
```bash
docker exec -it local-kafka kafka-consumer-groups \
  --bootstrap-server kafka:9093 \
  --describe \
  --group rebalance-test
```
→ Consumer 1이 파티션 0, 1, 2 모두 담당

**2단계: Consumer 2 추가 (새 터미널)**
```bash
docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic parallel-test \
  --group rebalance-test \
  --property print.partition=true
```

**관찰 포인트:**
- Consumer 1 터미널에 **"partition revoked"** 로그 출력
- 잠시 후 **"partition assigned"** 로그 출력
- Consumer 1: 파티션 0, 1 담당
- Consumer 2: 파티션 2 담당

**3단계: Consumer 3 추가 (새 터미널)**
```bash
docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic parallel-test \
  --group rebalance-test \
  --property print.partition=true
```

**최종 분배:**
- Consumer 1: 파티션 0
- Consumer 2: 파티션 1
- Consumer 3: 파티션 2

**4단계: Consumer 1 종료 (Ctrl+C)**

**관찰:**
- Consumer 2와 3에서 Rebalancing 발생
- 파티션 0이 Consumer 2 또는 3으로 재할당

`★ Insight ─────────────────────────────────────`
**Rebalancing의 트레이드오프:**
- ✅ **장점**: 자동 부하 분산, Consumer 장애 시 자동 복구
- ❌ **단점**: Rebalancing 중 일시적 메시지 처리 중단 (수백ms ~ 수초)
- **최적화 방안**: `session.timeout.ms`, `heartbeat.interval.ms` 튜닝으로 불필요한 Rebalancing 최소화
- **협업 플랫폼 적용**: 실시간 알림 등 지연에 민감한 서비스는 파티션/Consumer 수를 사전에 충분히 확보
`─────────────────────────────────────────────────`

---

### 📊 성능 테스트: 병렬 처리 효과 측정

**실험**: Consumer 1개 vs 3개의 처리 속도 비교

**1단계: 대량 메시지 생성 (10,000개)**
```bash
# 10,000개 메시지 생성 스크립트
docker exec -it local-kafka bash -c '
for i in {1..10000}; do
  echo "Message $i - $(date +%s%N)"
done | kafka-console-producer \
  --bootstrap-server kafka:9093 \
  --topic performance-test
'
```

**2단계: Consumer 1개로 처리 시간 측정**
```bash
time docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic performance-test \
  --group perf-single \
  --from-beginning \
  --max-messages 10000 \
  > /dev/null
```

**3단계: 동일 Topic, Consumer 3개로 처리 (병렬)**
```bash
# 터미널 3개에서 동시 실행
time docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic performance-test \
  --group perf-parallel \
  --from-beginning \
  > /dev/null
```

**예상 결과:**
- **단일 Consumer**: ~30초
- **3개 Consumer**: ~10초 (약 3배 빠름)

**성능 향상 공식:**
```
이론적 처리량 = 파티션 수 × Consumer당 처리 속도
실제 처리량 = 이론값 × 0.7~0.9 (Rebalancing, 네트워크 오버헤드)
```

---

## 🎓 학습 정리

### Consumer Group 병렬 처리 핵심 개념

| 개념 | 설명 | 협업 플랫폼 적용 |
|------|------|------------------|
| **파티션 할당** | 1개 파티션 = 1개 Consumer (같은 Group 내) | 프로젝트별 파티션으로 프로젝트당 전담 Consumer |
| **병렬 처리** | 파티션 수만큼 동시 처리 가능 | 사용자 수 증가 시 파티션/Consumer 수 증가로 확장 |
| **Rebalancing** | Consumer 변경 시 자동 재분배 | 배포/장애 시 자동 복구, 단 순간 지연 발생 |
| **순서 보장** | 같은 파티션 내에서만 순서 보장 | Key 기반 라우팅으로 사용자별 이벤트 순서 보장 |

### 실전 체크리스트

- [ ] JSON 메시지를 Key-Value 형태로 발행할 수 있다
- [ ] Consumer Group의 파티션 할당 상태를 확인할 수 있다
- [ ] 3개 Consumer가 3개 파티션을 1:1로 처리하는 것을 확인했다
- [ ] Rebalancing 과정을 관찰하고 이해했다
- [ ] 병렬 처리로 인한 성능 향상을 측정했다

---

## 🔄 다음 단계
- [04-topics-partitions.md](./04-topics-partitions.md): Topics & Partitions 설계
