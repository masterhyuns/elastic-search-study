# Index Settings 완벽 이해

> Elasticsearch 인덱스 생성 시 Settings의 역할과 주요 옵션 상세 설명

## 🎯 Settings vs Mappings

```json
PUT /messages
{
  "settings": {      // 인덱스가 "어떻게 동작할지" (성능, 저장 방식)
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {      // 데이터가 "어떤 구조인지" (스키마)
    "properties": {
      "content": {"type": "text"}
    }
  }
}
```

### RDBMS 비유

```sql
-- RDBMS 세계
CREATE DATABASE mydb
  WITH ENCODING 'UTF8'           -- Settings와 비슷
  PARTITION BY RANGE (date);     -- Settings와 비슷

CREATE TABLE messages (
  content TEXT,                  -- Mappings
  author VARCHAR(100)            -- Mappings
) TABLESPACEfast_storage;        -- Settings와 비슷
```

---

## 📊 Settings의 핵심 역할

Settings는 **3가지 카테고리**로 나뉩니다:

### 1. Static Settings (정적 설정)
인덱스 생성 시에만 설정 가능, **이후 변경 불가**

### 2. Dynamic Settings (동적 설정)
인덱스 생성 후에도 변경 가능

### 3. Analysis Settings (분석 설정)
텍스트 분석 방법 정의

---

## 🔧 주요 Settings 상세 설명

### 1. number_of_shards (샤드 개수) - Static

**역할**: 인덱스 데이터를 몇 개로 나눌지 결정

```json
{
  "settings": {
    "number_of_shards": 3
  }
}
```

#### 샤드란?
- 데이터를 분할하는 단위
- 수평 확장(Scale-out)의 핵심
- **생성 후 변경 불가** (Reindex 필요)

#### 시각화
```
인덱스: messages (100만 건 문서)

number_of_shards: 1
├─ Shard 0: 100만 건 (노드 1)

number_of_shards: 3
├─ Shard 0: 33만 건 (노드 1)
├─ Shard 1: 33만 건 (노드 2)
└─ Shard 2: 34만 건 (노드 3)
```

#### 어떻게 결정할까?

**학습 환경**:
```json
"number_of_shards": 1  // 단일 노드, 데이터 적음
```

**소규모 프로덕션** (< 10GB, < 100만 건):
```json
"number_of_shards": 1-2
```

**중규모 프로덕션** (10GB - 100GB):
```json
"number_of_shards": 3-5
```

**대규모 프로덕션** (> 100GB):
```json
"number_of_shards": 10-20
```

#### 계산 공식
```
적정 샤드 수 = 예상 데이터 크기(GB) / 30GB
              또는
              총 노드 수 * 1~3개
```

#### 트레이드오프
```
샤드 수 ↑
  ✅ 장점: 병렬 처리 빠름, 노드 추가 시 분산 용이
  ❌ 단점: 오버헤드 증가, 메모리 사용 증가

샤드 수 ↓
  ✅ 장점: 관리 단순, 오버헤드 적음
  ❌ 단점: 확장 제한, 단일 노드 부하 집중
```

---

### 2. number_of_replicas (복제본 개수) - Dynamic

**역할**: 각 샤드의 복사본을 몇 개 만들지 결정 (고가용성)

```json
{
  "settings": {
    "number_of_replicas": 1
  }
}
```

#### 복제본이란?
- Primary Shard의 백업
- 장애 대응 + 검색 성능 향상
- **생성 후 변경 가능**

#### 시각화
```
number_of_replicas: 0 (복제본 없음)
노드 1: [Shard 0 Primary]
  → 노드 1 장애 시 데이터 손실!

number_of_replicas: 1 (복제본 1개)
노드 1: [Shard 0 Primary]
노드 2: [Shard 0 Replica]
  → 노드 1 장애 시 노드 2가 Primary로 승격 ✅

number_of_replicas: 2 (복제본 2개)
노드 1: [Shard 0 Primary]
노드 2: [Shard 0 Replica]
노드 3: [Shard 0 Replica]
  → 최대 2개 노드 동시 장애까지 대응
```

#### 어떻게 결정할까?

**학습 환경**:
```json
"number_of_replicas": 0  // 단일 노드, 데이터 손실 무관
```

**개발 환경**:
```json
"number_of_replicas": 0-1
```

**프로덕션 (일반)**:
```json
"number_of_replicas": 1  // 표준 설정
```

**프로덕션 (중요 데이터)**:
```json
"number_of_replicas": 2-3  // 금융, 의료 등
```

#### 동적 변경 예시
```bash
# 운영 중 복제본 수 변경
curl -X PUT "http://localhost:30200/messages/_settings" -H 'Content-Type: application/json' -d'
{
  "number_of_replicas": 1
}'
```

#### 트레이드오프
```
복제본 ↑
  ✅ 장점: 고가용성, 읽기 성능 향상 (부하 분산)
  ❌ 단점: 디스크 공간 2배 이상 필요, 인덱싱 느려짐

복제본 ↓
  ✅ 장점: 디스크 절약, 인덱싱 빠름
  ❌ 단점: 장애 시 데이터 손실 위험
```

---

### 3. refresh_interval (갱신 주기) - Dynamic

**역할**: 새로 추가된 문서가 검색 가능해지는 주기

```json
{
  "settings": {
    "refresh_interval": "1s"  // 기본값
  }
}
```

#### Refresh란?
- 메모리의 데이터를 디스크의 검색 가능한 세그먼트로 변환
- **Near Real-time** 검색의 핵심

#### 시각화
```
문서 추가:
POST /messages/_doc {"content": "새 메시지"}
  ↓ (메모리에 저장)

[refresh_interval 대기]
  ↓

검색 가능:
GET /messages/_search → 새 메시지 검색됨 ✅
```

#### 설정 옵션

**실시간 검색 (기본)**:
```json
"refresh_interval": "1s"  // 1초마다 갱신
```

**성능 우선 (대량 데이터 입력 시)**:
```json
"refresh_interval": "30s"  // 30초마다 갱신
// 또는
"refresh_interval": "-1"   // 수동 갱신만
```

**즉시 검색 필요**:
```bash
# 개별 요청에 refresh 옵션
POST /messages/_doc?refresh=wait_for
{"content": "긴급 메시지"}
```

#### 협업 플랫폼 적용 예시

**채팅 메시지** (실시간 중요):
```json
"refresh_interval": "1s"  // 기본값 사용
```

**로그 데이터** (대량, 실시간 불필요):
```json
"refresh_interval": "30s"
```

**배치 작업 중** (임시):
```bash
# 배치 시작 전
PUT /messages/_settings
{"refresh_interval": "-1"}

# 대량 데이터 입력
...

# 배치 완료 후
PUT /messages/_settings
{"refresh_interval": "1s"}

# 수동 갱신
POST /messages/_refresh
```

---

### 4. max_result_window (검색 결과 제한) - Dynamic

**역할**: 검색 시 반환 가능한 최대 문서 개수

```json
{
  "settings": {
    "max_result_window": 10000  // 기본값
  }
}
```

#### 왜 제한이 필요할까?

**메모리 보호**:
```bash
# 이런 요청을 막기 위해
GET /messages/_search
{
  "from": 9000,
  "size": 10000  // 9000~19000번째 문서 조회
}
# → 메모리 부족으로 클러스터 다운 위험
```

#### Deep Pagination 문제

```
페이지네이션:
- 1페이지 (0-10): 빠름 ✅
- 10페이지 (90-100): 빠름 ✅
- 1000페이지 (9990-10000): 느림 ⚠️
  → 앞의 9990개를 모두 읽고 정렬해야 함
```

#### 해결 방법

**방법 1: 설정 값 증가** (비권장)
```json
"max_result_window": 50000  // 메모리 주의
```

**방법 2: Search After 사용** (권장)
```bash
# 첫 페이지
GET /messages/_search
{
  "size": 100,
  "sort": [{"created_at": "desc"}]
}

# 다음 페이지 (마지막 문서의 sort 값 사용)
GET /messages/_search
{
  "size": 100,
  "search_after": ["2025-10-13T15:00:00Z"],
  "sort": [{"created_at": "desc"}]
}
```

**방법 3: Scroll API** (대량 데이터 export)
```bash
# 스냅샷 생성
GET /messages/_search?scroll=5m
{"size": 1000}

# 다음 배치
GET /_search/scroll
{"scroll_id": "...", "scroll": "5m"}
```

---

### 5. analysis (분석기 설정) - Static

**역할**: 텍스트를 어떻게 분석할지 정의

```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "stop"]
        }
      }
    }
  }
}
```

#### 분석기 구성 요소

```
텍스트: "Elasticsearch는 빠릅니다!"

1. Character Filter: 특수문자 제거
   → "Elasticsearch는 빠릅니다"

2. Tokenizer: 단어 분리
   → ["Elasticsearch는", "빠릅니다"]

3. Token Filter: 소문자 변환, 불용어 제거
   → ["elasticsearch", "빠릅니다"]
```

#### 한글 분석기 예시

**기본 (Standard Analyzer)**:
```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "type": "standard"
        }
      }
    }
  }
}
```
```
"Elasticsearch를 공부합니다"
→ ["elasticsearch를", "공부합니다"]  ❌ 조사 포함
```

**한글 형태소 (Nori Analyzer)**:
```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "korean": {
          "type": "nori",
          "decompound_mode": "mixed"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "korean"
      }
    }
  }
}
```
```
"Elasticsearch를 공부합니다"
→ ["elasticsearch", "공부", "하다"]  ✅ 의미 단위 분리
```

#### 커스텀 분석기 예시

```json
{
  "settings": {
    "analysis": {
      "char_filter": {
        "my_char_filter": {
          "type": "mapping",
          "mappings": ["ㅋ => 크크", "ㅎ => 하하"]
        }
      },
      "tokenizer": {
        "my_tokenizer": {
          "type": "ngram",
          "min_gram": 2,
          "max_gram": 3
        }
      },
      "filter": {
        "my_stop_filter": {
          "type": "stop",
          "stopwords": ["있다", "하다"]
        }
      },
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "char_filter": ["my_char_filter"],
          "tokenizer": "my_tokenizer",
          "filter": ["lowercase", "my_stop_filter"]
        }
      }
    }
  }
}
```

---

## 🎨 실전 예시: 협업 플랫폼 인덱스 설계

### 메시지 인덱스 (실시간 중요)

```json
PUT /messages
{
  "settings": {
    "number_of_shards": 3,           // 메시지 많음
    "number_of_replicas": 1,         // 고가용성 필요
    "refresh_interval": "1s",        // 실시간 검색
    "max_result_window": 10000,      // 기본값
    "analysis": {
      "analyzer": {
        "message_analyzer": {
          "type": "custom",
          "tokenizer": "nori_tokenizer",
          "filter": ["lowercase", "nori_part_of_speech"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "message_analyzer"
      },
      "author": {"type": "keyword"},
      "channel": {"type": "keyword"},
      "created_at": {"type": "date"}
    }
  }
}
```

### 로그 인덱스 (대량 데이터)

```json
PUT /logs
{
  "settings": {
    "number_of_shards": 5,           // 데이터 매우 많음
    "number_of_replicas": 0,         // 로그는 손실 허용
    "refresh_interval": "30s",       // 실시간 불필요
    "max_result_window": 50000
  },
  "mappings": {
    "properties": {
      "level": {"type": "keyword"},
      "message": {"type": "text"},
      "timestamp": {"type": "date"}
    }
  }
}
```

### 사용자 인덱스 (작은 데이터)

```json
PUT /users
{
  "settings": {
    "number_of_shards": 1,           // 사용자 수 적음
    "number_of_replicas": 2,         // 중요 데이터
    "refresh_interval": "5s"         // 즉시 필요 없음
  },
  "mappings": {
    "properties": {
      "username": {"type": "keyword"},
      "email": {"type": "keyword"},
      "full_name": {"type": "text"}
    }
  }
}
```

---

## 🔍 Settings 확인 및 변경

### 현재 설정 조회

```bash
# 전체 설정
GET /messages/_settings

# 특정 설정만
GET /messages/_settings?include_defaults=false
```

### Dynamic 설정 변경

```bash
PUT /messages/_settings
{
  "number_of_replicas": 2,
  "refresh_interval": "5s"
}
```

### Static 설정 변경 (Reindex 필요)

```bash
# 1. 새 인덱스 생성 (새 설정)
PUT /messages_v2
{
  "settings": {
    "number_of_shards": 5  // 변경
  }
}

# 2. 데이터 복사
POST /_reindex
{
  "source": {"index": "messages"},
  "dest": {"index": "messages_v2"}
}

# 3. 별칭 전환
POST /_aliases
{
  "actions": [
    {"remove": {"index": "messages", "alias": "messages_alias"}},
    {"add": {"index": "messages_v2", "alias": "messages_alias"}}
  ]
}
```

---

## 📊 Settings 결정 플로우차트

```
인덱스 생성 전 체크리스트:

1. 데이터 크기?
   - < 10GB → shards: 1-2
   - 10-100GB → shards: 3-5
   - > 100GB → shards: 10+

2. 중요도?
   - 테스트/로그 → replicas: 0
   - 일반 서비스 → replicas: 1
   - 중요 데이터 → replicas: 2+

3. 실시간 필요?
   - 채팅/알림 → refresh_interval: 1s
   - 일반 검색 → refresh_interval: 5s
   - 로그/분석 → refresh_interval: 30s

4. 한글 검색?
   - 필요 → analyzer: nori
   - 불필요 → analyzer: standard
```

---

## 🧪 실습: Settings 비교 테스트

### 실습 1: Refresh Interval 테스트

```bash
# 1. 빠른 갱신 인덱스
PUT /test-fast
{
  "settings": {"refresh_interval": "1s"}
}

# 2. 느린 갱신 인덱스
PUT /test-slow
{
  "settings": {"refresh_interval": "30s"}
}

# 3. 데이터 추가
POST /test-fast/_doc
{"message": "즉시 검색됨"}

POST /test-slow/_doc
{"message": "30초 후 검색됨"}

# 4. 즉시 검색 시도
GET /test-fast/_search    # ✅ 1초 내 검색됨
GET /test-slow/_search    # ❌ 30초 대기 필요
```

### 실습 2: Shard 분산 확인

```bash
# 1. 샤드 3개 인덱스
PUT /test-shards
{
  "settings": {"number_of_shards": 3}
}

# 2. 문서 1000개 추가
POST /test-shards/_bulk
...

# 3. 샤드별 문서 분포 확인
GET /_cat/shards/test-shards?v

# 결과:
# index       shard replica docs
# test-shards 0     p       334
# test-shards 1     p       333
# test-shards 2     p       333
```

---

## 📝 요약

| 설정 | 역할 | 변경 가능 | 기본값 | 권장값 |
|------|------|----------|--------|--------|
| number_of_shards | 데이터 분할 | ❌ | 1 | 데이터 크기/노드 수 고려 |
| number_of_replicas | 복제본 | ✅ | 1 | 프로덕션: 1-2 |
| refresh_interval | 검색 갱신 주기 | ✅ | 1s | 실시간: 1s, 배치: 30s |
| max_result_window | 검색 결과 한계 | ✅ | 10000 | 10000 (Search After 사용) |
| analysis | 텍스트 분석 방법 | ❌ | standard | 한글: nori |

## 🔄 다음 단계

- [05-mapping-analyzers.md](./05-mapping-analyzers.md): 한글 형태소 분석기 (Nori) 상세
- [06-platform-use-cases.md](./06-platform-use-cases.md): 실전 인덱스 설계 패턴
