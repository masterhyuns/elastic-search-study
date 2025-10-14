# Kafka 기본 개념

> Apache Kafka의 핵심 아키텍처와 주요 개념 이해

## 🎯 학습 목표

- Kafka가 무엇이고 왜 필요한지 이해
- Kafka의 핵심 구성 요소 파악
- 분산 메시징 시스템의 동작 원리
- 전통적인 메시지 큐와의 차이점 이해

---

## 🤔 Kafka란?

**Apache Kafka**는 LinkedIn에서 개발한 **분산 이벤트 스트리밍 플랫폼**입니다.

### 핵심 특징
- **높은 처리량**: 초당 수백만 개의 메시지 처리
- **확장성**: 수평 확장 가능 (Broker 추가)
- **내구성**: 디스크에 메시지 저장 (데이터 손실 방지)
- **실시간 처리**: 낮은 지연시간 (ms 단위)
- **고가용성**: 복제를 통한 장애 대응

### 사용 사례
1. **메시징 시스템**: 서비스 간 비동기 통신
2. **로그 수집**: 애플리케이션/시스템 로그 중앙화
3. **스트림 처리**: 실시간 데이터 파이프라인
4. **이벤트 소싱**: 모든 상태 변경을 이벤트로 저장
5. **CDC (Change Data Capture)**: DB 변경사항 실시간 추적

---

## 🏗️ Kafka 아키텍처

### 전체 구조
```
┌──────────────────────────────────────────────────────┐
│                  Kafka Cluster                        │
│                                                       │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐          │
│  │ Broker  │   │ Broker  │   │ Broker  │          │
│  │    1    │   │    2    │   │    3    │          │
│  └─────────┘   └─────────┘   └─────────┘          │
│       │              │              │                │
│       └──────────────┴──────────────┘                │
│                      │                                │
│              ┌───────▼────────┐                      │
│              │   Zookeeper    │                      │
│              │  (메타데이터)    │                      │
│              └────────────────┘                      │
└──────────────────────────────────────────────────────┘
         ▲                              │
         │                              │
         │                              ▼
   ┌──────────┐                  ┌──────────┐
   │ Producer │                  │ Consumer │
   │ (발행자)   │                  │ (구독자)   │
   └──────────┘                  └──────────┘
```

---

## 🔑 핵심 구성 요소

### 1. Broker (브로커)
**Kafka 서버**로, 메시지를 저장하고 클라이언트 요청을 처리합니다.

**특징**:
- 하나의 Kafka Cluster는 여러 Broker로 구성
- 각 Broker는 고유한 ID를 가짐
- 수평 확장 가능 (Broker 추가)

**예시**:
```
Broker 1: 토픽 A 파티션 0, 토픽 B 파티션 1
Broker 2: 토픽 A 파티션 1, 토픽 B 파티션 2
Broker 3: 토픽 A 파티션 2, 토픽 B 파티션 0
```

### 2. Topic (토픽)
**메시지를 분류하는 카테고리**입니다. 데이터베이스의 "테이블"과 유사합니다.

**특징**:
- 논리적인 메시지 그룹
- 하나의 Cluster에 여러 Topic 존재 가능
- Topic 이름은 고유해야 함

**예시**:
```
Topic: messages       # 협업 플랫폼 메시지
Topic: notifications  # 알림 이벤트
Topic: user-activity  # 사용자 활동 로그
```

### 3. Partition (파티션)
**Topic을 물리적으로 분할한 단위**입니다. Kafka의 병렬 처리와 확장성의 핵심입니다.

**특징**:
- 하나의 Topic은 여러 Partition으로 구성
- 각 Partition은 순서가 보장된 메시지 큐
- Partition마다 다른 Broker에 분산 저장
- Partition 번호는 0부터 시작

**구조**:
```
Topic: messages (3 Partitions)

Partition 0: [msg0, msg3, msg6, msg9]
Partition 1: [msg1, msg4, msg7, msg10]
Partition 2: [msg2, msg5, msg8, msg11]
             ↑
           Offset (메시지 위치)
```

**파티션 분배 규칙**:
- **Key 없음**: Round-Robin으로 분배
- **Key 있음**: Key의 Hash 값으로 파티션 결정 (같은 Key는 항상 같은 파티션)

### 4. Producer (프로듀서)
**메시지를 Kafka에 발행하는 클라이언트**입니다.

**역할**:
- Topic에 메시지 발행
- 파티션 선택 (Key 기반 또는 Round-Robin)
- 전송 성공/실패 확인

**코드 예시** (개념적):
```javascript
// Producer가 메시지를 발행
producer.send({
  topic: 'messages',
  key: 'user_001',           // 같은 사용자 메시지는 같은 파티션
  value: JSON.stringify({
    id: 'msg_001',
    content: '안녕하세요',
    timestamp: Date.now()
  })
});
```

### 5. Consumer (컨슈머)
**Kafka로부터 메시지를 구독하는 클라이언트**입니다.

**역할**:
- Topic에서 메시지 읽기
- Offset 관리 (읽은 위치 추적)
- 처리 완료 후 Commit

**코드 예시** (개념적):
```javascript
// Consumer가 메시지를 구독
consumer.subscribe(['messages']);

consumer.on('message', (message) => {
  console.log('Received:', message.value);
  // 메시지 처리 로직
  // Elasticsearch에 인덱싱
  // 알림 발송
});
```

### 6. Consumer Group (컨슈머 그룹)
**여러 Consumer를 하나의 그룹으로 묶어 병렬 처리**합니다.

**특징**:
- 같은 Group의 Consumer들은 파티션을 나눠서 처리
- 하나의 파티션은 Group 내 하나의 Consumer만 할당
- 확장성: Consumer 추가로 처리량 증가

**구조**:
```
Topic: messages (3 Partitions)

Consumer Group: "search-indexer"
  ├─ Consumer A → Partition 0
  ├─ Consumer B → Partition 1
  └─ Consumer C → Partition 2

Consumer Group: "notification"
  ├─ Consumer X → Partition 0, 1
  └─ Consumer Y → Partition 2
```

### 7. Offset (오프셋)
**파티션 내 메시지의 고유 순번**입니다. 데이터베이스의 "Primary Key"와 유사합니다.

**특징**:
- 각 파티션마다 독립적인 Offset
- 0부터 순차적으로 증가
- Consumer가 읽은 위치를 추적하는 데 사용

**구조**:
```
Partition 0:
┌────────┬────────┬────────┬────────┬────────┐
│ Offset │   0    │   1    │   2    │   3    │
├────────┼────────┼────────┼────────┼────────┤
│ Message│ "Hello"│ "World"│ "Kafka"│ "Event"│
└────────┴────────┴────────┴────────┴────────┘
                             ▲
                       Consumer가 읽은 위치
                       (Offset 2까지 처리 완료)
```

### 8. Zookeeper
**Kafka 클러스터의 메타데이터를 관리하는 코디네이터**입니다.

**역할**:
- Broker 목록 관리
- Topic 설정 저장
- Leader 선출
- Consumer Group 정보 관리

**참고**: Kafka 3.0+부터 Zookeeper 없이 운영 가능 (KRaft 모드)

---

## 🆚 전통적인 메시지 큐 vs Kafka

### RabbitMQ / ActiveMQ (전통적인 MQ)
```
Producer → Queue → Consumer (메시지 삭제됨)
```
- 메시지를 Consumer가 읽으면 즉시 삭제
- 하나의 메시지는 하나의 Consumer만 처리
- 처리량: ~10,000 msg/s

### Kafka (이벤트 스트리밍)
```
Producer → Topic (Partition) → Consumer Group A
                              → Consumer Group B
                              → Consumer Group C
                              (메시지 유지, 여러 Consumer 가능)
```
- 메시지를 Retention 기간 동안 유지 (기본 7일)
- 여러 Consumer Group이 같은 메시지 읽기 가능
- 처리량: ~1,000,000+ msg/s

**Kafka의 장점**:
- **재처리 가능**: Offset을 되돌려 과거 메시지 다시 읽기
- **다중 구독**: 여러 Consumer Group이 독립적으로 구독
- **높은 처리량**: 파티션 병렬 처리

---

## 📊 Kafka의 메시지 흐름

### 1. 메시지 발행 (Produce)
```
Producer
   ├─ Key: "user_001"
   ├─ Value: {"action": "message_created", "id": "msg_001"}
   ├─ Timestamp: 1697234567890
   └─ Headers: {"source": "web", "version": "1.0"}
        │
        ▼
   [Partition 선택]
        │
        ▼ (Key Hash % Partition 개수)
   Topic: messages, Partition 1
        │
        ▼
   Broker 2 (Disk에 저장)
```

### 2. 메시지 구독 (Consume)
```
Consumer (Group: search-indexer)
   │
   ├─ Subscribe: messages
   ├─ Partition: 1 (자동 할당)
   ├─ Offset: 100 (마지막으로 읽은 위치)
   │
   ▼
Read Offset 101, 102, 103...
   │
   ├─ Process: Elasticsearch 인덱싱
   ├─ Commit Offset: 103 (처리 완료)
   └─ Next: Offset 104부터 읽기
```

---

## 🔄 Replication (복제)

### Leader / Follower 구조
```
Topic: messages, Partition 0, Replication Factor: 3

Broker 1 (Leader)
  ├─ Write/Read 처리
  └─ Partition 0 (Original)

Broker 2 (Follower)
  └─ Partition 0 (Replica 1)

Broker 3 (Follower)
  └─ Partition 0 (Replica 2)
```

**동작 방식**:
- **Leader**: 모든 Read/Write 요청 처리
- **Follower**: Leader로부터 데이터 복제
- **Leader 장애 시**: 자동으로 Follower 중 하나가 Leader로 승격

**ISR (In-Sync Replica)**:
- Leader와 동기화된 Follower 목록
- Producer는 모든 ISR에 메시지가 복제될 때까지 대기 가능

---

## 🎓 핵심 개념 정리

| 개념 | 설명 | 비유 |
|------|------|------|
| Broker | Kafka 서버 | 우체국 |
| Topic | 메시지 카테고리 | 우편함 종류 (일반, 등기) |
| Partition | Topic의 물리적 분할 | 우편함 구획 |
| Producer | 메시지 발행자 | 편지 발송인 |
| Consumer | 메시지 구독자 | 편지 수신인 |
| Consumer Group | Consumer 그룹 | 수신인 팀 (업무 분담) |
| Offset | 메시지 순번 | 편지 일련번호 |
| Zookeeper | 메타데이터 관리 | 우체국 관리자 |

---

## 💡 협업 플랫폼 적용 예시

### 시나리오: 사용자가 메시지를 작성했을 때

```
1. Backend API (Producer)
   ↓
   Topic: "messages"
   Key: "channel_id_123"
   Value: {
     "id": "msg_001",
     "content": "프로젝트 배포 완료",
     "author": "user_001",
     "channel": "dev-team",
     "timestamp": 1697234567890
   }

2. Kafka Broker
   ↓ (파티션 분배)
   Partition 0: channel_id_123 → Broker 1

3. Consumer Groups (병렬 처리)
   ├─ search-indexer
   │   └─ Elasticsearch에 인덱싱 (검색 가능)
   │
   ├─ notification
   │   └─ 멘션된 사용자에게 실시간 알림
   │
   ├─ analytics
   │   └─ 사용자 활동 통계 수집
   │
   └─ archive
       └─ S3에 장기 보관
```

**장점**:
- **확장성**: Consumer 추가로 새로운 기능 추가 (기존 코드 수정 없음)
- **복원력**: 한 Consumer 장애 시 다른 Consumer는 정상 동작
- **재처리**: 과거 메시지를 다시 읽어 데이터 복구 가능

---

## 📝 체크리스트

- [ ] Kafka가 "이벤트 스트리밍 플랫폼"임을 이해
- [ ] Broker, Topic, Partition 개념 이해
- [ ] Producer와 Consumer의 역할 파악
- [ ] Consumer Group의 병렬 처리 방식 이해
- [ ] Offset이 메시지 위치 추적에 사용됨을 이해
- [ ] Replication으로 고가용성 보장 방법 이해
- [ ] 전통적인 MQ와의 차이점 파악

---

## 🔄 다음 단계

기본 개념을 이해했다면:
- [02-setup-guide.md](./02-setup-guide.md): 로컬 환경 구축 및 첫 번째 메시지 발행
