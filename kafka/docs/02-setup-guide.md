# Kafka 환경 구축 가이드

> Docker Compose를 사용한 로컬 Kafka 클러스터 구축 및 첫 번째 메시지 송수신

## 🎯 학습 목표

- Docker Compose로 Kafka 클러스터 실행
- Kafka UI로 토픽 관리 및 모니터링
- Console Producer/Consumer로 메시지 발행/구독
- 첫 번째 Topic 생성 및 메시지 테스트

---

## 📋 사전 준비

### 필수 소프트웨어
- **Docker Desktop**: 20.10+
- **Docker Compose**: 2.0+

### 포트 확인
다음 포트가 사용 가능한지 확인:
- **30092**: Kafka Broker
- **32181**: Zookeeper
- **30080**: Kafka UI

```bash
# 포트 사용 여부 확인 (macOS/Linux)
lsof -i :30092
lsof -i :32181
lsof -i :30080
```

---

## 🐳 Docker Compose 구성

### 파일 구조
```
kafka/
├── docker-compose.yml
├── .gitignore
└── docs/
```

### docker-compose.yml 설명

```yaml
version: '3.8'

services:
  # Zookeeper: Kafka 메타데이터 관리
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: local-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181      # 클라이언트 연결 포트
      ZOOKEEPER_TICK_TIME: 2000        # 시간 단위 (ms)
    ports:
      - "32181:2181"                    # Host:Container
    volumes:
      - zk-data:/var/lib/zookeeper/data
      - zk-logs:/var/lib/zookeeper/log
    networks:
      - kafka-network

  # Kafka Broker
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: local-kafka
    depends_on:
      - zookeeper                       # Zookeeper 먼저 실행
    ports:
      - "30092:9092"                    # 외부 연결
      - "30093:9093"                    # 내부 연결
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      # Listener 설정 (중요!)
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:30092,PLAINTEXT_INTERNAL://kafka:9093
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_INTERNAL:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT_INTERNAL
      # Replication 설정 (단일 Broker이므로 1)
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'  # 토픽 자동 생성
    volumes:
      - kafka-data:/var/lib/kafka/data
    networks:
      - kafka-network

  # Kafka UI: 웹 기반 관리 도구
  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: local-kafka-ui
    depends_on:
      - kafka
    ports:
      - "30080:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9093
      KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
    networks:
      - kafka-network

volumes:
  zk-data:
    driver: local
  zk-logs:
    driver: local
  kafka-data:
    driver: local

networks:
  kafka-network:
    driver: bridge
```

---

## 🚀 Kafka 클러스터 실행

### 1. 컨테이너 실행
```bash
# kafka 디렉토리로 이동
cd kafka

# Docker Compose 실행
docker-compose up -d

# 실행 확인
docker-compose ps
```

**예상 출력**:
```
NAME                IMAGE                              STATUS
local-kafka         confluentinc/cp-kafka:7.5.0        Up
local-kafka-ui      provectuslabs/kafka-ui:latest      Up
local-zookeeper     confluentinc/cp-zookeeper:7.5.0    Up
```

### 2. 로그 확인
```bash
# 전체 로그
docker-compose logs

# Kafka만 확인
docker-compose logs kafka

# 실시간 로그 (Ctrl+C로 종료)
docker-compose logs -f kafka
```

**정상 실행 로그 예시**:
```
[KafkaServer id=1] started (kafka.server.KafkaServer)
```

### 3. Kafka UI 접속
브라우저에서 http://localhost:30080 접속

**확인 사항**:
- Brokers: 1개 (local)
- Topics: 0개 (아직 생성 안함)
- Consumers: 0개

---

## 🎨 Kafka UI 둘러보기

### 메인 화면
```
┌────────────────────────────────────────┐
│         Kafka UI (local)               │
├────────────────────────────────────────┤
│ Dashboard                              │
│ ├─ Brokers         [1]                │
│ ├─ Topics          [0]                │
│ ├─ Consumers       [0]                │
│ └─ Messages        [0]                │
├────────────────────────────────────────┤
│ Topics 메뉴                            │
│ ├─ Create Topic                       │
│ └─ Topic List                         │
└────────────────────────────────────────┘
```

### 주요 기능
- **Topics**: 토픽 생성, 조회, 삭제
- **Messages**: 메시지 검색, 발행
- **Consumers**: Consumer Group 모니터링
- **Brokers**: Broker 상태 확인

---

## 📝 첫 번째 Topic 생성

### 방법 1: Kafka UI로 생성 (권장)

1. http://localhost:30080 접속
2. **Topics** 메뉴 클릭
3. **Add a Topic** 버튼 클릭
4. 설정 입력:
   - **Topic Name**: `test-topic`
   - **Number of Partitions**: `3`
   - **Replication Factor**: `1` (단일 Broker)
   - **Min In Sync Replicas**: `1`
5. **Create Topic** 클릭

### 방법 2: Docker CLI로 생성

```bash
# Kafka 컨테이너 내부 접속
docker exec -it local-kafka bash

# Topic 생성 (컨테이너 내부에서 실행)
kafka-topics --create \
  --bootstrap-server kafka:9093 \
  --topic test-topic \
  --partitions 3 \
  --replication-factor 1

# Topic 목록 확인
kafka-topics --list \
  --bootstrap-server kafka:9093

# Topic 상세 정보
kafka-topics --describe \
  --bootstrap-server kafka:9093 \
  --topic test-topic

# 컨테이너 종료
exit
```

**출력 예시**:
```
Topic: test-topic	TopicId: xY3fG9... PartitionCount: 3	ReplicationFactor: 1
	Topic: test-topic	Partition: 0	Leader: 1	Replicas: 1	Isr: 1
	Topic: test-topic	Partition: 1	Leader: 1	Replicas: 1	Isr: 1
	Topic: test-topic	Partition: 2	Leader: 1	Replicas: 1	Isr: 1
```

---

## 🔊 Console Producer로 메시지 발행

### 1. Producer 실행
```bash
# Kafka 컨테이너 접속
docker exec -it local-kafka bash

# Console Producer 실행 (컨테이너 내부)
kafka-console-producer \
  --bootstrap-server kafka:9093 \
  --topic test-topic
```

### 2. 메시지 입력
```
>Hello Kafka
>첫 번째 메시지입니다
>Kafka 학습 시작!
>
```
- `>` 프롬프트에서 메시지 입력 후 Enter
- `Ctrl+C`로 종료

### 3. Key-Value 메시지 발행
```bash
# Key와 Value를 함께 보내기 (컨테이너 내부)
kafka-console-producer \
  --bootstrap-server kafka:9093 \
  --topic test-topic \
  --property "parse.key=true" \
  --property "key.separator=:"
```

**메시지 입력**:
```
>user_001:안녕하세요
>user_002:Kafka를 배우고 있습니다
>user_001:같은 Key는 같은 파티션으로
>
```
- `Key:Value` 형식
- 같은 Key는 항상 같은 Partition

---

## 📥 Console Consumer로 메시지 구독

### 1. 기본 Consumer 실행
```bash
# 새 터미널에서 Kafka 컨테이너 접속
docker exec -it local-kafka bash

# Console Consumer 실행 (최신 메시지부터, 컨테이너 내부)
kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic test-topic
```

**다른 터미널**에서 Producer로 메시지를 보내면 실시간으로 출력됩니다.

### 2. 처음부터 읽기
```bash
# 토픽의 모든 메시지 읽기 (Offset 0부터, 컨테이너 내부)
kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic test-topic \
  --from-beginning
```

**출력 예시**:
```
Hello Kafka
첫 번째 메시지입니다
Kafka 학습 시작!
안녕하세요
Kafka를 배우고 있습니다
같은 Key는 같은 파티션으로
```

### 3. Key-Value 함께 출력
```bash
kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic test-topic \
  --from-beginning \
  --property print.key=true \
  --property key.separator=" => "
```

**출력 예시**:
```
null => Hello Kafka
null => 첫 번째 메시지입니다
user_001 => 안녕하세요
user_002 => Kafka를 배우고 있습니다
user_001 => 같은 Key는 같은 파티션으로
```

### 4. 메타데이터 함께 출력
```bash
kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic test-topic \
  --from-beginning \
  --property print.timestamp=true \
  --property print.partition=true \
  --property print.offset=true
```

**출력 예시**:
```
CreateTime:1697234567890	Partition:0	Offset:0	Hello Kafka
CreateTime:1697234568123	Partition:1	Offset:0	첫 번째 메시지입니다
CreateTime:1697234570456	Partition:2	Offset:0	Kafka 학습 시작!
```

---

## 🎓 실습 과제

### 과제 1: 협업 플랫폼 메시지 토픽 생성
**요구사항**:
- Topic Name: `messages`
- Partitions: 3개
- 채널별로 메시지 분배 (Key: channel_id)

<details>
<summary>정답 보기</summary>

```bash
# Topic 생성
docker exec -it local-kafka kafka-topics --create \
  --bootstrap-server kafka:9093 \
  --topic messages \
  --partitions 3 \
  --replication-factor 1

# Producer 실행 (Key 포함)
docker exec -it local-kafka kafka-console-producer \
  --bootstrap-server kafka:9093 \
  --topic messages \
  --property "parse.key=true" \
  --property "key.separator=:"

# 메시지 발행
>ch_dev:개발팀에서 배포 완료했습니다
>ch_pm:다음주 스프린트 계획 공유
>ch_dev:버그 수정 중입니다
```
</details>

### 과제 2: Consumer Group 실습
**요구사항**:
- 2개의 Consumer를 같은 Group으로 실행
- 파티션이 어떻게 분배되는지 확인

<details>
<summary>정답 보기</summary>

```bash
# Terminal 1: Consumer 1 실행
docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic messages \
  --group my-group \
  --property print.partition=true

# Terminal 2: Consumer 2 실행
docker exec -it local-kafka kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic messages \
  --group my-group \
  --property print.partition=true

# Terminal 3: Producer로 메시지 발행
docker exec -it local-kafka kafka-console-producer \
  --bootstrap-server kafka:9093 \
  --topic messages

# 결과: 각 Consumer가 다른 파티션을 처리
```
</details>

### 과제 3: Kafka UI로 메시지 확인
**요구사항**:
- Kafka UI에서 `messages` 토픽의 메시지 확인
- 파티션별 메시지 개수 확인

<details>
<summary>정답 보기</summary>

1. http://localhost:30080 접속
2. **Topics** → `messages` 클릭
3. **Messages** 탭 클릭
4. **Partitions** 탭에서 파티션별 Offset 확인
5. 각 파티션의 메시지 확인
</details>

---

## 🧰 유용한 명령어 모음

### Topic 관리
```bash
# 모든 Topic 목록
kafka-topics --list --bootstrap-server kafka:9093

# Topic 상세 정보
kafka-topics --describe --bootstrap-server kafka:9093 --topic test-topic

# Topic 삭제
kafka-topics --delete --bootstrap-server kafka:9093 --topic test-topic

# Topic 설정 변경 (Partition 추가)
kafka-topics --alter --bootstrap-server kafka:9093 --topic test-topic --partitions 5
```

### Consumer Group 관리
```bash
# Consumer Group 목록
kafka-consumer-groups --list --bootstrap-server kafka:9093

# Consumer Group 상세 정보 (Lag 확인)
kafka-consumer-groups --describe --bootstrap-server kafka:9093 --group my-group

# Offset 리셋 (처음부터 다시 읽기)
kafka-consumer-groups --bootstrap-server kafka:9093 \
  --group my-group \
  --topic test-topic \
  --reset-offsets --to-earliest \
  --execute
```

### 성능 테스트
```bash
# Producer 성능 테스트 (100만 개 메시지, 컨테이너 내부)
kafka-producer-perf-test \
  --topic test-topic \
  --num-records 1000000 \
  --record-size 1000 \
  --throughput 10000 \
  --producer-props bootstrap.servers=kafka:9093

# Consumer 성능 테스트 (컨테이너 내부)
kafka-consumer-perf-test \
  --topic test-topic \
  --messages 1000000 \
  --threads 1 \
  --bootstrap-server kafka:9093
```

---

## 🛠️ 문제 해결

### 1. Kafka 컨테이너가 시작되지 않음
```bash
# 로그 확인
docker-compose logs kafka

# 포트 충돌 확인
lsof -i :30092

# 컨테이너 재시작
docker-compose restart kafka
```

### 2. Producer/Consumer 연결 실패
```bash
# Kafka Broker 상태 확인
docker exec -it local-kafka kafka-broker-api-versions \
  --bootstrap-server kafka:9093

# Network 확인
docker network inspect kafka_kafka-network
```

### 3. 메시지가 보이지 않음
```bash
# Topic에 메시지가 있는지 확인 (컨테이너 내부)
kafka-console-consumer \
  --bootstrap-server kafka:9093 \
  --topic test-topic \
  --from-beginning \
  --max-messages 10

# Partition별 Offset 확인 (컨테이너 내부)
kafka-run-class kafka.tools.GetOffsetShell \
  --broker-list kafka:9093 \
  --topic test-topic
```

---

## 🔄 다음 단계

환경 구축을 완료했다면:
- [03-producer-consumer.md](./03-producer-consumer.md): Producer/Consumer 심화 실습

## 📝 체크리스트

- [ ] Docker Compose로 Kafka 클러스터 실행
- [ ] Kafka UI 접속 (http://localhost:30080)
- [ ] 첫 번째 Topic 생성 (`test-topic`)
- [ ] Console Producer로 메시지 발행
- [ ] Console Consumer로 메시지 구독
- [ ] Key-Value 메시지 발행/구독
- [ ] Consumer Group으로 병렬 처리 확인
