# 협업 플랫폼 Kafka 적용 가이드

> 실전 협업 플랫폼에 Kafka 기반 이벤트 스트리밍 도입

## 🎯 학습 목표
- 이벤트 기반 아키텍처 설계
- Kafka → Elasticsearch 연동
- 실시간 알림 시스템 구축
- CQRS 패턴 적용
- 이벤트 소싱

---

## 🏗️ 아키텍처 설계

### 전체 구조
```
┌─────────────────────────────────────────────┐
│           협업 플랫폼 Backend API            │
│         (Producer: 이벤트 발행)              │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│            Kafka Event Bus                   │
│  ┌──────────┬──────────┬──────────────┐    │
│  │ messages │ notif... │ user-activity│    │
│  └──────────┴──────────┴──────────────┘    │
└──────────────┬───────────────────────────────┘
               │
      ┌────────┼────────┬──────────┐
      ▼        ▼        ▼          ▼
┌──────────┐ ┌─────┐ ┌──────┐ ┌────────┐
│Elastic   │ │Noti │ │Analy │ │Archive │
│search    │ │fic  │ │tics  │ │        │
└──────────┘ └─────┘ └──────┘ └────────┘
(검색)      (알림)   (분석)   (보관)
```

---

## 📨 이벤트 설계

### 1. Message Created Event
```json
{
  "event_type": "message.created",
  "event_id": "evt_001",
  "timestamp": 1697234567890,
  "payload": {
    "message_id": "msg_001",
    "channel_id": "ch_dev",
    "author_id": "user_001",
    "content": "프로젝트 배포 완료",
    "mentions": ["user_002"],
    "attachments": []
  }
}
```

### 2. Topic 설계
```
platform.messages.created      # 메시지 생성 이벤트
platform.messages.updated      # 메시지 수정 이벤트
platform.messages.deleted      # 메시지 삭제 이벤트
platform.notifications.sent    # 알림 발송 이벤트
platform.users.activity        # 사용자 활동 로그
```

---

## 🔗 Elasticsearch 연동

### 1. Consumer 구현 (Node.js)
```javascript
const { Kafka } = require('kafkajs');
const { Client } = require('@elastic/elasticsearch');

const kafka = new Kafka({
  clientId: 'search-indexer',
  brokers: ['localhost:30092']
});

const esClient = new Client({
  node: 'http://localhost:30200'
});

const consumer = kafka.consumer({
  groupId: 'search-indexer'
});

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: 'platform.messages.created',
    fromBeginning: false
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());

      // Elasticsearch 인덱싱
      await esClient.index({
        index: 'messages',
        id: event.payload.message_id,
        document: {
          content: event.payload.content,
          author: event.payload.author_id,
          channel: event.payload.channel_id,
          created_at: new Date(event.timestamp)
        }
      });

      console.log(`Indexed: ${event.payload.message_id}`);
    }
  });
};

run().catch(console.error);
```

### 2. Kafka Connect (선택)
```json
{
  "name": "elasticsearch-sink",
  "config": {
    "connector.class": "io.confluent.connect.elasticsearch.ElasticsearchSinkConnector",
    "tasks.max": "1",
    "topics": "platform.messages.created",
    "connection.url": "http://localhost:30200",
    "type.name": "_doc",
    "key.ignore": "true"
  }
}
```

---

## 🔔 실시간 알림 시스템

### 1. Notification Consumer
```javascript
const consumer = kafka.consumer({
  groupId: 'notification-service'
});

await consumer.subscribe({
  topic: 'platform.messages.created'
});

await consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value.toString());
    const mentions = event.payload.mentions || [];

    // 멘션된 사용자에게 알림
    for (const userId of mentions) {
      await sendPushNotification(userId, {
        title: '새 멘션',
        body: event.payload.content,
        data: {
          message_id: event.payload.message_id,
          channel_id: event.payload.channel_id
        }
      });
    }
  }
});
```

---

## 📊 CQRS 패턴

### Command (Write) Side
```javascript
// Backend API: 메시지 작성
app.post('/messages', async (req, res) => {
  const message = await db.messages.create(req.body);

  // Kafka에 이벤트 발행
  await producer.send({
    topic: 'platform.messages.created',
    messages: [{
      key: message.channel_id,
      value: JSON.stringify({
        event_type: 'message.created',
        event_id: uuidv4(),
        timestamp: Date.now(),
        payload: message
      })
    }]
  });

  res.json(message);
});
```

### Query (Read) Side
```javascript
// Search API: Elasticsearch에서 검색
app.get('/messages/search', async (req, res) => {
  const results = await esClient.search({
    index: 'messages',
    body: {
      query: {
        match: {
          content: req.query.q
        }
      }
    }
  });

  res.json(results.hits.hits);
});
```

---

## 🎯 이벤트 소싱

### 1. 이벤트 저장
```javascript
// 모든 상태 변경을 이벤트로 저장
const events = [
  { type: 'message.created', data: {...} },
  { type: 'message.updated', data: {...} },
  { type: 'message.deleted', data: {...} }
];

// Kafka는 이벤트 로그로 사용
// Compaction으로 최신 상태 유지 가능
```

### 2. 이벤트 재생
```javascript
// 과거 이벤트를 재생하여 상태 복원
const rebuildState = async () => {
  const consumer = kafka.consumer({
    groupId: 'state-rebuilder'
  });

  await consumer.subscribe({
    topic: 'platform.messages.created',
    fromBeginning: true  // 처음부터 읽기
  });

  let state = {};
  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      // 이벤트를 순차적으로 적용하여 상태 재구성
      state = applyEvent(state, event);
    }
  });

  return state;
};
```

---

## 🧪 실습 과제

### 과제 1: 메시지 이벤트 파이프라인 구축
1. Backend에서 Kafka Producer로 메시지 이벤트 발행
2. Consumer에서 Elasticsearch 인덱싱
3. Kafka UI에서 메시지 흐름 확인

### 과제 2: 알림 시스템 POC
1. 멘션 이벤트 발행
2. Notification Consumer 구현
3. 실시간 알림 발송 (Console 로그)

### 과제 3: CQRS 패턴 적용
1. Write: PostgreSQL + Kafka Event
2. Read: Elasticsearch
3. 성능 비교 (Write vs Read)

---

## 📊 모니터링

### 1. Kafka UI
- Topic별 처리량
- Consumer Lag
- Partition 분배

### 2. Metrics
- Messages In/Out per Second
- Consumer Lag
- Rebalancing 빈도

---

## 📝 체크리스트

- [ ] 이벤트 기반 아키텍처 설계 완료
- [ ] Kafka Producer 통합
- [ ] Elasticsearch Consumer 구현
- [ ] 실시간 알림 Consumer 구현
- [ ] CQRS 패턴 적용
- [ ] 모니터링 대시보드 구축

---

**다음 단계**: 실제 프로덕션 배포 및 최적화
