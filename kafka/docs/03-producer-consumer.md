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

---

## 🔄 다음 단계
- [04-topics-partitions.md](./04-topics-partitions.md): Topics & Partitions 설계
