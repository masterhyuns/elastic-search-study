# Topics & Partitions

> Kafka Topic 설계 및 Partition 전략

## 🎯 학습 목표
- Topic 설계 원칙
- Partition 개수 결정
- Replication Factor 설정
- Retention 정책
- Compaction

---

## 📊 Topic 설계

### 1. Naming Convention
```
<domain>.<entity>.<event-type>
예: platform.messages.created
    platform.notifications.sent
    analytics.user.activity
```

### 2. Partition 개수 결정
```
Partition 수 = max(Producer 처리량, Consumer 처리량) / 단일 파티션 처리량
```

**고려사항**:
- 너무 많으면: 메타데이터 증가, Rebalancing 느림
- 너무 적으면: 병렬 처리 제한, 확장성 부족

### 3. Replication Factor
- **1**: 빠름, 장애 시 데이터 손실
- **2**: 균형 (권장)
- **3+**: 안전, 저장 공간 증가

---

## 🔄 Retention 정책

### 1. 시간 기반
```properties
retention.ms=604800000  # 7일
```

### 2. 크기 기반
```properties
retention.bytes=1073741824  # 1GB
```

### 3. Compaction
```properties
cleanup.policy=compact
```
- Key 기반 최신 값만 유지
- 사용 사례: 상태 저장 (User Profile, Config)

---

## 🧪 실습 과제

### 과제 1: 협업 플랫폼 Topic 설계
- messages (메시지)
- notifications (알림)
- user-activity (사용자 활동)

각각 적절한 Partition 수와 Retention 설정

---

## 🔄 다음 단계
- [05-consumer-groups.md](./05-consumer-groups.md): Consumer Groups 마스터
