# Kafka 문제 해결 가이드

> 자주 발생하는 오류 및 해결 방법

## 🚨 Docker / 환경 문제

### 1. 컨테이너가 시작되지 않음
```bash
# 로그 확인
docker-compose logs

# 특정 서비스 로그
docker-compose logs kafka
docker-compose logs zookeeper

# 컨테이너 상태
docker-compose ps
```

**해결책**:
- 포트 충돌: `lsof -i :30092` 확인
- Docker 재시작: `docker-compose down && docker-compose up -d`
- Volume 삭제 후 재시작: `docker-compose down -v`

### 2. Zookeeper 연결 실패
**증상**: `java.net.ConnectException: Connection refused`

**해결책**:
```bash
# Zookeeper가 먼저 실행되었는지 확인
docker-compose ps

# Zookeeper 재시작
docker-compose restart zookeeper

# Kafka 재시작 (Zookeeper 의존성)
docker-compose restart kafka
```

### 3. Kafka UI 접속 안됨
**증상**: http://localhost:30080 연결 거부

**해결책**:
```bash
# Kafka UI 컨테이너 확인
docker logs local-kafka-ui

# Kafka 연결 확인
docker exec -it local-kafka-ui curl http://kafka:9093

# 재시작
docker-compose restart kafka-ui
```

---

## 📡 Connection 문제

### 1. Producer/Consumer 연결 실패
**증상**: `org.apache.kafka.common.errors.TimeoutException`

**해결책**:
```bash
# Kafka Broker 상태 확인
docker exec -it local-kafka kafka-broker-api-versions \
  --bootstrap-server localhost:9092

# Listener 설정 확인
docker exec -it local-kafka env | grep KAFKA_ADVERTISED_LISTENERS
```

### 2. Host에서 연결 시 주의사항
- **컨테이너 내부**: `bootstrap-server kafka:9093`
- **Host (로컬)**: `bootstrap-server localhost:30092`
- **외부 서버**: `bootstrap-server <IP>:30092`

---

## 🔍 Topic / 메시지 문제

### 1. Topic이 생성되지 않음
```bash
# Topic 목록 확인
docker exec -it local-kafka kafka-topics --list \
  --bootstrap-server localhost:9092

# 권한 확인
docker exec -it local-kafka kafka-acls --list \
  --bootstrap-server localhost:9092
```

### 2. 메시지가 보이지 않음
```bash
# Offset 확인
kafka-run-class kafka.tools.GetOffsetShell \
  --broker-list localhost:9092 \
  --topic test-topic

# Consumer Group Offset 확인
kafka-consumer-groups --describe \
  --bootstrap-server localhost:9092 \
  --group my-group
```

### 3. Lag이 계속 증가
**원인**: Consumer 처리 속도 < Producer 발행 속도

**해결책**:
- Consumer 수 증가 (파티션 수 이하)
- Consumer 처리 로직 최적화
- 파티션 수 증가

---

## ⚙️ 성능 문제

### 1. 처리량이 낮음
**해결책**:
- 파티션 수 증가
- `batch.size` 증가 (Producer)
- `fetch.min.bytes` 조정 (Consumer)
- Compression 활성화 (`compression.type=lz4`)

### 2. 메모리 부족
```bash
# Kafka 메모리 설정 확인
docker exec -it local-kafka env | grep KAFKA_HEAP_OPTS

# docker-compose.yml에 추가
environment:
  KAFKA_HEAP_OPTS: "-Xms512m -Xmx1g"
```

---

## 🛠️ 유용한 디버깅 명령어

```bash
# Kafka 버전 확인
docker exec -it local-kafka kafka-broker-api-versions \
  --bootstrap-server localhost:9092 | head -1

# JMX Metrics 확인
docker exec -it local-kafka kafka-run-class \
  kafka.tools.JmxTool \
  --object-name kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec

# 로그 레벨 변경
docker exec -it local-kafka kafka-configs \
  --bootstrap-server localhost:9092 \
  --entity-type brokers \
  --entity-name 1 \
  --alter \
  --add-config log4j.logger.kafka=DEBUG
```

---

## 📚 참고 자료

- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Confluent Community](https://forum.confluent.io/)
- [Kafka JIRA](https://issues.apache.org/jira/browse/KAFKA)
