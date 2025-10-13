# Elasticsearch CRUD 작업

> Document와 Index의 기본 생성, 조회, 수정, 삭제 실습

## 🎯 학습 목표

- Index 생성 및 관리
- Document CRUD 작업
- Bulk API 사용
- 실전 협업 플랫폼 데이터 모델 적용

---

## 📚 기본 개념 복습

### RESTful API 패턴

```
HTTP Method  | 용도
-------------|------------------
GET          | 조회 (Read)
POST         | 생성 (Create) - ID 자동 생성
PUT          | 생성/수정 (Create/Update) - ID 지정
DELETE       | 삭제 (Delete)
```

### URL 구조

```
http://localhost:30200/{index}/_doc/{document_id}
                        ↑        ↑      ↑
                      인덱스명  API타입  문서ID
```

---

## 🗂️ Index 관리

### 1. Index 생성

```json
PUT /messages
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "analyzer": {
        "default": {
          "type": "standard"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "content": {
        "type": "text"
      },
      "author": {
        "type": "keyword"
      },
      "channel": {
        "type": "keyword"
      },
      "created_at": {
        "type": "date"
      },
      "is_pinned": {
        "type": "boolean"
      },
      "likes": {
        "type": "integer"
      }
    }
  }
}
```

**설명**:
- `number_of_shards`: 데이터 분할 개수 (학습용: 1)
- `number_of_replicas`: 복제본 개수 (학습용: 0)
- `mappings`: 필드 타입 정의

### 2. Index 정보 조회

```json
# 특정 인덱스 정보
GET /messages

# 모든 인덱스 목록
GET /_cat/indices?v

# 매핑 정보만 조회
GET /messages/_mapping
```

### 3. Index 설정 수정

```json
# 인덱스 닫기 (설정 변경 전)
POST /messages/_close

# 설정 변경
PUT /messages/_settings
{
  "number_of_replicas": 1
}

# 인덱스 다시 열기
POST /messages/_open
```

### 4. Index 삭제

```json
DELETE /messages
```

⚠️ **주의**: 삭제된 인덱스는 복구 불가!

---

## 📄 Document CRUD

### Create (생성)

#### 방법 1: ID 자동 생성 (POST)

```json
POST /messages/_doc
{
  "content": "프로젝트 킥오프 미팅을 진행합니다",
  "author": "홍길동",
  "channel": "개발팀",
  "created_at": "2025-10-13T10:00:00Z",
  "is_pinned": false,
  "likes": 0
}

// 응답
{
  "_index": "messages",
  "_id": "AbC123XyZ",  // 자동 생성된 ID
  "_version": 1,
  "result": "created"
}
```

#### 방법 2: ID 직접 지정 (PUT)

```json
PUT /messages/_doc/msg_001
{
  "content": "주간 스프린트 회고",
  "author": "김철수",
  "channel": "개발팀",
  "created_at": "2025-10-13T14:00:00Z",
  "is_pinned": true,
  "likes": 5
}
```

**언제 어떤 방식을 사용할까?**
- POST (자동 ID): 메시지, 로그 등 ID가 중요하지 않은 경우
- PUT (수동 ID): 사용자, 프로젝트 등 고유 ID가 있는 경우

### Read (조회)

#### 단일 문서 조회

```json
GET /messages/_doc/msg_001

// 응답
{
  "_index": "messages",
  "_id": "msg_001",
  "_version": 1,
  "_source": {
    "content": "주간 스프린트 회고",
    "author": "김철수",
    ...
  }
}
```

#### 특정 필드만 조회

```json
GET /messages/_doc/msg_001?_source=content,author

// 또는
GET /messages/_doc/msg_001
{
  "_source": ["content", "author"]
}
```

#### 문서 존재 여부만 확인

```json
HEAD /messages/_doc/msg_001

// 응답: 200 (존재) 또는 404 (없음)
```

### Update (수정)

#### 방법 1: 부분 업데이트 (_update)

```json
POST /messages/_update/msg_001
{
  "doc": {
    "likes": 10,
    "is_pinned": false
  }
}
```

**특징**:
- 변경된 필드만 지정
- 나머지 필드는 유지
- `_version` 증가

#### 방법 2: 스크립트 업데이트

```json
POST /messages/_update/msg_001
{
  "script": {
    "source": "ctx._source.likes += params.increment",
    "params": {
      "increment": 1
    }
  }
}
```

**활용 예시**: 좋아요 +1, 조회수 증가

#### 방법 3: 전체 교체 (PUT)

```json
PUT /messages/_doc/msg_001
{
  "content": "업데이트된 내용",
  "author": "김철수",
  "channel": "개발팀",
  "created_at": "2025-10-13T14:00:00Z",
  "is_pinned": false,
  "likes": 10
}
```

⚠️ **주의**: 모든 필드를 다시 지정해야 함 (누락 시 삭제됨)

### Delete (삭제)

#### 단일 문서 삭제

```json
DELETE /messages/_doc/msg_001
```

#### 조건부 삭제 (Query로 삭제)

```json
POST /messages/_delete_by_query
{
  "query": {
    "range": {
      "created_at": {
        "lt": "2025-01-01T00:00:00Z"
      }
    }
  }
}
```

**활용 예시**: 오래된 메시지 일괄 삭제

---

## 🚀 Bulk API (대량 작업)

여러 문서를 한 번에 처리 (성능 최적화)

### 기본 문법

```json
POST /messages/_bulk
{"index": {"_id": "1"}}
{"content": "첫 번째 메시지", "author": "홍길동", "created_at": "2025-10-13T10:00:00Z"}
{"index": {"_id": "2"}}
{"content": "두 번째 메시지", "author": "김철수", "created_at": "2025-10-13T10:05:00Z"}
{"update": {"_id": "1"}}
{"doc": {"likes": 5}}
{"delete": {"_id": "2"}}
```

**주의사항**:
- 각 줄은 개별 JSON (줄바꿈으로 구분)
- 마지막 줄에도 줄바꿈 필요
- Content-Type: `application/x-ndjson`

### 협업 플랫폼 실전 예제

```json
POST /messages/_bulk
{"index": {"_id": "msg_001"}}
{"content": "Q4 목표 달성을 위한 전략 회의", "author": "홍길동", "channel": "경영지원", "created_at": "2025-10-13T09:00:00Z", "is_pinned": true, "likes": 12}
{"index": {"_id": "msg_002"}}
{"content": "신규 기능 배포 완료했습니다", "author": "김개발", "channel": "개발팀", "created_at": "2025-10-13T10:30:00Z", "is_pinned": false, "likes": 8}
{"index": {"_id": "msg_003"}}
{"content": "점심 메뉴 추천 받습니다", "author": "이사원", "channel": "잡담", "created_at": "2025-10-13T11:45:00Z", "is_pinned": false, "likes": 3}
{"index": {"_id": "msg_004"}}
{"content": "버그 리포트: 로그인 오류", "author": "박테스터", "channel": "QA", "created_at": "2025-10-13T14:20:00Z", "is_pinned": true, "likes": 0}
{"index": {"_id": "msg_005"}}
{"content": "Elasticsearch 도입 검토 중", "author": "최아키텍트", "channel": "개발팀", "created_at": "2025-10-13T15:00:00Z", "is_pinned": false, "likes": 15}
```

### Bulk 응답 확인

```json
{
  "took": 30,
  "errors": false,
  "items": [
    {
      "index": {
        "_index": "messages",
        "_id": "msg_001",
        "status": 201,
        "result": "created"
      }
    },
    ...
  ]
}
```

---

## 🧪 실습 과제

### 과제 1: 사용자 인덱스 생성

```json
// TODO: users 인덱스를 생성하세요
// 필드: username (keyword), email (keyword), full_name (text),
//       department (keyword), joined_at (date)
```

### 과제 2: 여러 사용자 추가

Bulk API를 사용하여 5명의 사용자 추가

### 과제 3: 사용자 정보 수정

부서 이동: "홍길동"의 department를 "개발팀"에서 "경영지원"으로 변경

### 과제 4: 특정 조건 삭제

2024년 이전에 가입한 사용자 모두 삭제

---

## 🔍 디버깅 팁

### 1. 작업 결과 즉시 확인

```json
# 문서 추가 후
POST /messages/_doc
{...}

# 즉시 조회
GET /messages/_doc/{반환된_id}
```

### 2. 전체 문서 검색

```json
GET /messages/_search
{
  "query": {
    "match_all": {}
  }
}
```

### 3. 특정 조건 문서 개수

```json
GET /messages/_count
{
  "query": {
    "term": {
      "author": "홍길동"
    }
  }
}
```

---

## 📊 성능 고려사항

### 1. Bulk API 사용 권장

```
개별 요청: 1000개 문서 = 1000번 HTTP 요청
Bulk API: 1000개 문서 = 1번 HTTP 요청 (100배 이상 빠름)
```

### 2. 적절한 Bulk 크기

- 권장: 1000~5000개 문서 또는 5~15MB
- 너무 크면: 메모리 부족, 타임아웃
- 너무 작으면: 성능 개선 효과 적음

### 3. Refresh 전략

```json
POST /messages/_doc?refresh=wait_for
{...}

// refresh 옵션:
// - true: 즉시 검색 가능 (느림)
// - wait_for: 다음 refresh 시점까지 대기 (기본 1초)
// - false: 백그라운드 처리 (빠름, 기본값)
```

---

## 🔄 다음 단계

CRUD를 마스터했다면 다음 문서로:
- [04-search-queries.md](./04-search-queries.md): 강력한 검색 쿼리 작성

## 📝 체크리스트

- [ ] Index 생성 및 매핑 정의 완료
- [ ] POST vs PUT 차이 이해
- [ ] Update API 3가지 방법 실습
- [ ] Bulk API로 10개 이상 문서 추가
- [ ] 조건부 삭제 실습 완료
- [ ] 협업 플랫폼 메시지 데이터 샘플 구축
