# 협업 플랫폼 Elasticsearch 적용 가이드

> 실전 협업 플랫폼에 Elasticsearch를 도입하는 완벽 가이드

## 🎯 학습 목표

- 협업 플랫폼의 검색 요구사항 분석
- 도메인별 인덱스 설계 (메시지, 문서, 사용자, 프로젝트)
- 실시간 검색 구현 전략
- 성능 최적화 및 확장성 고려사항

---

## 📊 협업 플랫폼 검색 시나리오 분석

### 1. 메시지 검색 (Message Search)
**사용자 스토리**:
- "배포 일정"을 검색하면 관련 메시지들이 나와야 함
- 특정 채널, 날짜 범위, 작성자로 필터링 가능
- 고정된 메시지는 상단에 노출
- 검색 결과에서 키워드 하이라이팅

**기술 요구사항**:
- 전문 검색 (Full-text search)
- 한글 형태소 분석 (Nori)
- Bool 쿼리로 복합 필터링
- Range 쿼리로 날짜 필터
- Highlighting으로 키워드 강조

### 2. 문서 검색 (Document Search)
**사용자 스토리**:
- 문서 제목, 내용, 첨부파일명 통합 검색
- 문서 타입(Markdown, PDF, Excel) 필터링
- 최근 수정일, 작성자, 프로젝트별 필터
- 관련성 높은 순으로 정렬

**기술 요구사항**:
- Multi-match 쿼리 (여러 필드 검색)
- 필드별 가중치 (제목 > 내용)
- Aggregation으로 문서 타입 통계
- 파일 첨부 검색 (Attachment plugin)

### 3. 사용자 검색 (User Search)
**사용자 스토리**:
- "@홍" 입력 시 홍길동, 홍철수 자동완성
- 이름, 이메일, 부서로 검색
- 오타 허용 ("홍김동" → "홍길동")
- 빠른 응답속도 (100ms 이하)

**기술 요구사항**:
- Prefix 쿼리 (자동완성)
- Fuzzy 매칭 (오타 허용)
- Keyword 필드로 정확한 매칭
- 캐싱으로 성능 최적화

### 4. 프로젝트 검색 (Project Search)
**사용자 스토리**:
- 프로젝트명, 설명, 태그로 검색
- 진행 상태 (진행중/완료/보류) 필터
- 멤버 수, 생성일로 정렬
- 인기 프로젝트 추천

**기술 요구사항**:
- Match + Bool 쿼리 조합
- Aggregation으로 상태별 통계
- Function Score로 인기도 계산
- Nested 쿼리 (프로젝트 멤버)

---

## 🏗️ 인덱스 설계

### 1. Messages 인덱스

#### 매핑 설계
```json
PUT /messages
{
  "settings": {
    "number_of_shards": 2,        // 메시지는 대량 데이터, 샤드 분산
    "number_of_replicas": 1,      // 고가용성
    "refresh_interval": "1s",     // 거의 실시간 검색 (기본값)
    "analysis": {
      "analyzer": {
        "korean_analyzer": {
          "type": "custom",
          "tokenizer": "nori_tokenizer",
          "filter": ["lowercase", "nori_readingform"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "message_id": {
        "type": "keyword"                    // 정확한 ID 매칭
      },
      "content": {
        "type": "text",
        "analyzer": "korean_analyzer",       // 한글 형태소 분석
        "fields": {
          "keyword": {
            "type": "keyword",               // 정렬/집계용
            "ignore_above": 256
          }
        }
      },
      "author": {
        "type": "keyword"                    // 필터링용
      },
      "author_name": {
        "type": "text",                      // 작성자명 검색용
        "analyzer": "korean_analyzer"
      },
      "channel": {
        "type": "keyword"                    // 채널 필터링
      },
      "channel_name": {
        "type": "text",                      // 채널명 검색용
        "analyzer": "korean_analyzer"
      },
      "thread_id": {
        "type": "keyword"                    // 스레드 그룹핑
      },
      "is_pinned": {
        "type": "boolean"                    // 고정 메시지
      },
      "likes": {
        "type": "integer"                    // 좋아요 수
      },
      "replies": {
        "type": "integer"                    // 답글 수
      },
      "has_attachment": {
        "type": "boolean"                    // 첨부파일 유무
      },
      "attachments": {
        "type": "nested",                    // 첨부파일 배열
        "properties": {
          "filename": {
            "type": "text",
            "analyzer": "standard"
          },
          "file_type": {
            "type": "keyword"
          },
          "size": {
            "type": "long"
          }
        }
      },
      "mentions": {
        "type": "keyword"                    // 멘션된 사용자 ID 배열
      },
      "tags": {
        "type": "keyword"                    // 태그 배열
      },
      "created_at": {
        "type": "date",
        "format": "strict_date_optional_time||epoch_millis"
      },
      "updated_at": {
        "type": "date"
      }
    }
  }
}
```

#### 샘플 데이터
```json
POST /messages/_bulk
{"index":{"_id":"msg_001"}}
{"message_id":"msg_001","content":"Q4 배포 일정 공유드립니다. 다음주 월요일 배포 예정입니다.","author":"user_001","author_name":"홍길동","channel":"ch_dev","channel_name":"개발팀","thread_id":null,"is_pinned":true,"likes":15,"replies":3,"has_attachment":true,"attachments":[{"filename":"deployment_schedule.pdf","file_type":"pdf","size":1024000}],"mentions":["user_002","user_003"],"tags":["배포","일정"],"created_at":"2025-10-14T09:00:00Z","updated_at":"2025-10-14T09:00:00Z"}
{"index":{"_id":"msg_002"}}
{"message_id":"msg_002","content":"API 버그 수정 완료했습니다. 테스트 부탁드립니다.","author":"user_002","author_name":"김개발","channel":"ch_dev","channel_name":"개발팀","thread_id":"msg_001","is_pinned":false,"likes":8,"replies":2,"has_attachment":false,"attachments":[],"mentions":["user_004"],"tags":["버그","수정"],"created_at":"2025-10-14T10:30:00Z","updated_at":"2025-10-14T10:30:00Z"}
{"index":{"_id":"msg_003"}}
{"message_id":"msg_003","content":"신규 프로젝트 킥오프 미팅 일정 조율 중입니다.","author":"user_003","author_name":"박매니저","channel":"ch_pm","channel_name":"PM팀","thread_id":null,"is_pinned":false,"likes":5,"replies":0,"has_attachment":false,"attachments":[],"mentions":[],"tags":["프로젝트","미팅"],"created_at":"2025-10-14T11:00:00Z","updated_at":"2025-10-14T11:00:00Z"}
```

### 2. Documents 인덱스

#### 매핑 설계
```json
PUT /documents
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "korean_analyzer": {
          "type": "custom",
          "tokenizer": "nori_tokenizer",
          "filter": ["lowercase", "nori_readingform"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "document_id": {
        "type": "keyword"
      },
      "title": {
        "type": "text",
        "analyzer": "korean_analyzer",
        "fields": {
          "keyword": {"type": "keyword", "ignore_above": 256}
        }
      },
      "content": {
        "type": "text",
        "analyzer": "korean_analyzer"
      },
      "file_type": {
        "type": "keyword"                    // md, pdf, docx, xlsx
      },
      "file_path": {
        "type": "keyword"
      },
      "file_size": {
        "type": "long"
      },
      "project_id": {
        "type": "keyword"
      },
      "project_name": {
        "type": "text",
        "analyzer": "korean_analyzer"
      },
      "author": {
        "type": "keyword"
      },
      "author_name": {
        "type": "text",
        "analyzer": "korean_analyzer"
      },
      "tags": {
        "type": "keyword"
      },
      "version": {
        "type": "integer"                    // 문서 버전
      },
      "status": {
        "type": "keyword"                    // draft, published, archived
      },
      "created_at": {
        "type": "date"
      },
      "updated_at": {
        "type": "date"
      },
      "last_modified_by": {
        "type": "keyword"
      }
    }
  }
}
```

#### 샘플 데이터
```json
POST /documents/_bulk
{"index":{"_id":"doc_001"}}
{"document_id":"doc_001","title":"API 설계 문서","content":"RESTful API 엔드포인트 설계 가이드입니다. GET /api/v1/users 사용자 목록 조회...","file_type":"md","file_path":"/docs/api-design.md","file_size":15360,"project_id":"proj_001","project_name":"협업 플랫폼","author":"user_001","author_name":"홍길동","tags":["API","설계","문서"],"version":3,"status":"published","created_at":"2025-10-01T00:00:00Z","updated_at":"2025-10-14T08:00:00Z","last_modified_by":"user_001"}
{"index":{"_id":"doc_002"}}
{"document_id":"doc_002","title":"배포 체크리스트","content":"프로덕션 배포 전 확인 사항: 1. 테스트 완료 2. 코드 리뷰 3. DB 마이그레이션...","file_type":"md","file_path":"/docs/deployment-checklist.md","file_size":8192,"project_id":"proj_001","project_name":"협업 플랫폼","author":"user_002","author_name":"김개발","tags":["배포","체크리스트"],"version":1,"status":"published","created_at":"2025-10-10T00:00:00Z","updated_at":"2025-10-10T00:00:00Z","last_modified_by":"user_002"}
```

### 3. Users 인덱스

#### 매핑 설계
```json
PUT /users
{
  "settings": {
    "number_of_shards": 1,                   // 사용자 데이터는 상대적으로 작음
    "number_of_replicas": 1,
    "refresh_interval": "5s"                 // 사용자 정보는 실시간성이 덜 중요
  },
  "mappings": {
    "properties": {
      "user_id": {
        "type": "keyword"
      },
      "username": {
        "type": "keyword"                    // 정확한 매칭 (로그인용)
      },
      "full_name": {
        "type": "text",
        "analyzer": "standard",              // 한글+영어 혼합
        "fields": {
          "keyword": {"type": "keyword"},
          "prefix": {                        // 자동완성용
            "type": "text",
            "analyzer": "standard",
            "search_analyzer": "standard"
          }
        }
      },
      "email": {
        "type": "keyword"                    // 정확한 이메일 매칭
      },
      "department": {
        "type": "keyword"                    // 부서 필터링
      },
      "position": {
        "type": "keyword"                    // 직책
      },
      "team": {
        "type": "keyword"                    // 팀
      },
      "phone": {
        "type": "keyword"
      },
      "avatar_url": {
        "type": "keyword",
        "index": false                       // 검색 불필요
      },
      "status": {
        "type": "keyword"                    // active, inactive, vacation
      },
      "joined_at": {
        "type": "date"
      },
      "last_active_at": {
        "type": "date"
      }
    }
  }
}
```

#### 샘플 데이터
```json
POST /users/_bulk
{"index":{"_id":"user_001"}}
{"user_id":"user_001","username":"hong.gildong","full_name":"홍길동","email":"hong@company.com","department":"개발","position":"시니어 개발자","team":"백엔드팀","phone":"010-1234-5678","avatar_url":"/avatars/user_001.jpg","status":"active","joined_at":"2023-01-15T00:00:00Z","last_active_at":"2025-10-14T12:00:00Z"}
{"index":{"_id":"user_002"}}
{"user_id":"user_002","username":"kim.dev","full_name":"김개발","email":"kim@company.com","department":"개발","position":"주니어 개발자","team":"백엔드팀","phone":"010-2345-6789","avatar_url":"/avatars/user_002.jpg","status":"active","joined_at":"2024-03-20T00:00:00Z","last_active_at":"2025-10-14T11:30:00Z"}
{"index":{"_id":"user_003"}}
{"user_id":"user_003","username":"park.manager","full_name":"박매니저","email":"park@company.com","department":"기획","position":"프로젝트 매니저","team":"PM팀","phone":"010-3456-7890","avatar_url":"/avatars/user_003.jpg","status":"active","joined_at":"2022-06-01T00:00:00Z","last_active_at":"2025-10-14T10:00:00Z"}
```

### 4. Projects 인덱스

#### 매핑 설계
```json
PUT /projects
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "project_id": {
        "type": "keyword"
      },
      "name": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": {"type": "keyword"}
        }
      },
      "description": {
        "type": "text",
        "analyzer": "standard"
      },
      "status": {
        "type": "keyword"                    // active, completed, on_hold
      },
      "priority": {
        "type": "keyword"                    // high, medium, low
      },
      "owner": {
        "type": "keyword"                    // 프로젝트 오너 user_id
      },
      "owner_name": {
        "type": "text"
      },
      "members": {
        "type": "nested",                    // 프로젝트 멤버 배열
        "properties": {
          "user_id": {"type": "keyword"},
          "role": {"type": "keyword"}        // admin, member, viewer
        }
      },
      "tags": {
        "type": "keyword"
      },
      "start_date": {
        "type": "date"
      },
      "end_date": {
        "type": "date"
      },
      "created_at": {
        "type": "date"
      },
      "updated_at": {
        "type": "date"
      },
      "member_count": {
        "type": "integer"
      },
      "task_count": {
        "type": "integer"
      },
      "completed_task_count": {
        "type": "integer"
      }
    }
  }
}
```

#### 샘플 데이터
```json
POST /projects/_bulk
{"index":{"_id":"proj_001"}}
{"project_id":"proj_001","name":"협업 플랫폼 개발","description":"실시간 협업 플랫폼 구축 프로젝트. Slack + Notion + Jira 통합 기능 제공","status":"active","priority":"high","owner":"user_001","owner_name":"홍길동","members":[{"user_id":"user_001","role":"admin"},{"user_id":"user_002","role":"member"},{"user_id":"user_003","role":"member"}],"tags":["협업","플랫폼","백엔드"],"start_date":"2025-01-01T00:00:00Z","end_date":"2025-12-31T00:00:00Z","created_at":"2025-01-01T00:00:00Z","updated_at":"2025-10-14T00:00:00Z","member_count":3,"task_count":50,"completed_task_count":25}
{"index":{"_id":"proj_002"}}
{"project_id":"proj_002","name":"모바일 앱 리뉴얼","description":"iOS/Android 앱 UI/UX 개선 프로젝트","status":"active","priority":"medium","owner":"user_003","owner_name":"박매니저","members":[{"user_id":"user_003","role":"admin"}],"tags":["모바일","리뉴얼","디자인"],"start_date":"2025-09-01T00:00:00Z","end_date":"2025-11-30T00:00:00Z","created_at":"2025-09-01T00:00:00Z","updated_at":"2025-10-14T00:00:00Z","member_count":1,"task_count":20,"completed_task_count":5}
```

---

## 🔍 실전 검색 쿼리

### 시나리오 1: 메시지 통합 검색

**요구사항**: 사용자가 "배포"를 검색했을 때
- 메시지 내용에서 "배포" 포함
- 개발팀 채널 필터링 (선택적)
- 최근 30일 이내
- 고정 메시지 우선
- 검색어 하이라이팅

```json
GET /messages/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "content": {
              "query": "배포",
              "fuzziness": "AUTO"              // 오타 허용
            }
          }
        }
      ],
      "filter": [
        {
          "range": {
            "created_at": {
              "gte": "now-30d/d"               // 최근 30일
            }
          }
        }
      ],
      "should": [
        {
          "term": {
            "is_pinned": {
              "value": true,
              "boost": 3.0                     // 고정 메시지 3배 가중치
            }
          }
        },
        {
          "match": {
            "channel_name": {
              "query": "개발팀",
              "boost": 1.5                     // 개발팀 채널 1.5배 가중치
            }
          }
        }
      ]
    }
  },
  "highlight": {
    "fields": {
      "content": {
        "pre_tags": ["<mark>"],
        "post_tags": ["</mark>"],
        "fragment_size": 150,                  // 하이라이트 조각 크기
        "number_of_fragments": 3               // 최대 3개 조각
      }
    }
  },
  "sort": [
    {"_score": "desc"},                        // 관련성 우선
    {"created_at": "desc"}                     // 최신순
  ],
  "size": 20,
  "from": 0
}
```

**응답 예시**:
```json
{
  "hits": {
    "total": {"value": 5},
    "hits": [
      {
        "_id": "msg_001",
        "_score": 8.5,
        "_source": {
          "content": "Q4 배포 일정 공유드립니다...",
          "author_name": "홍길동",
          "channel_name": "개발팀",
          "is_pinned": true,
          "created_at": "2025-10-14T09:00:00Z"
        },
        "highlight": {
          "content": [
            "Q4 <mark>배포</mark> 일정 공유드립니다. 다음주 월요일 <mark>배포</mark> 예정입니다."
          ]
        }
      }
    ]
  }
}
```

### 시나리오 2: 문서 검색 (제목/내용 통합)

**요구사항**:
- 제목과 내용에서 "API 설계" 검색
- 제목 매칭에 3배 가중치
- 특정 프로젝트 필터링
- 문서 타입별 통계

```json
GET /documents/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "API 설계",
            "fields": [
              "title^3",                       // 제목에 3배 가중치
              "content"
            ],
            "type": "best_fields",
            "fuzziness": "AUTO"
          }
        }
      ],
      "filter": [
        {
          "term": {
            "project_id": "proj_001"           // 특정 프로젝트만
          }
        },
        {
          "term": {
            "status": "published"              // 공개된 문서만
          }
        }
      ]
    }
  },
  "aggs": {
    "file_types": {
      "terms": {
        "field": "file_type",                  // 문서 타입별 통계
        "size": 10
      }
    },
    "recent_updates": {
      "date_histogram": {
        "field": "updated_at",
        "calendar_interval": "week"            // 주간 업데이트 통계
      }
    }
  },
  "sort": [
    {"_score": "desc"},
    {"updated_at": "desc"}
  ],
  "size": 10
}
```

### 시나리오 3: 사용자 자동완성

**요구사항**:
- "@홍" 입력 시 "홍길동", "홍철수" 추천
- 이름, 이메일, 부서 검색
- 빠른 응답 (100ms 이하)
- 오타 허용

```json
GET /users/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "prefix": {
            "full_name.keyword": {
              "value": "홍",
              "boost": 3.0                     // 정확한 접두사 매칭 우선
            }
          }
        },
        {
          "match": {
            "full_name": {
              "query": "홍",
              "fuzziness": "1",                // 오타 1글자 허용
              "boost": 1.0
            }
          }
        },
        {
          "prefix": {
            "email": {
              "value": "hong",
              "boost": 2.0
            }
          }
        }
      ],
      "filter": [
        {
          "term": {
            "status": "active"                 // 활성 사용자만
          }
        }
      ],
      "minimum_should_match": 1
    }
  },
  "size": 10,
  "_source": ["user_id", "username", "full_name", "email", "department", "avatar_url"]
}
```

### 시나리오 4: 프로젝트 검색 + 멤버 필터

**요구사항**:
- 프로젝트명, 설명에서 검색
- 특정 사용자가 멤버인 프로젝트만
- 진행중인 프로젝트만
- 진행률 계산

```json
GET /projects/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "협업 플랫폼",
            "fields": ["name^2", "description"]
          }
        }
      ],
      "filter": [
        {
          "term": {
            "status": "active"                 // 진행중인 프로젝트
          }
        },
        {
          "nested": {
            "path": "members",
            "query": {
              "term": {
                "members.user_id": "user_002"  // 특정 사용자가 멤버
              }
            }
          }
        }
      ]
    }
  },
  "sort": [
    {"priority": "desc"},                      // 우선순위 높은 순
    {"updated_at": "desc"}
  ],
  "size": 10
}
```

**진행률 계산** (애플리케이션 레벨):
```javascript
// Elasticsearch 응답 후 처리
const calculateProgress = (project) => {
  const progress = (project.completed_task_count / project.task_count) * 100;
  return Math.round(progress);
};
```

---

## ⚡ 성능 최적화 전략

### 1. 인덱스 최적화

#### Refresh Interval 조정
```json
PUT /messages/_settings
{
  "refresh_interval": "5s"          // 기본 1s → 5s로 변경 (쓰기 성능 향상)
}

// 대량 데이터 입력 시
PUT /messages/_settings
{
  "refresh_interval": "-1"          // refresh 비활성화
}

// 입력 완료 후
POST /messages/_refresh             // 수동 refresh
PUT /messages/_settings
{
  "refresh_interval": "5s"          // 다시 활성화
}
```

#### Force Merge (주기적 최적화)
```bash
# 읽기 전용 인덱스 최적화 (오래된 메시지)
POST /messages_2025_09/_forcemerge?max_num_segments=1
```

### 2. 쿼리 최적화

#### 필터 캐싱 활용
```json
{
  "query": {
    "bool": {
      "must": [...],
      "filter": [                    // filter는 자동 캐싱됨
        {"term": {"channel": "개발팀"}},
        {"range": {"created_at": {"gte": "now-7d"}}}
      ]
    }
  }
}
```

#### _source 필터링 (필요한 필드만)
```json
GET /messages/_search
{
  "query": {...},
  "_source": ["message_id", "content", "author_name", "created_at"],  // 필요한 필드만
  "size": 20
}
```

#### Scroll API (대량 데이터 조회)
```json
// 초기 요청
POST /messages/_search?scroll=1m
{
  "size": 1000,
  "query": {...}
}

// 다음 배치
POST /_search/scroll
{
  "scroll": "1m",
  "scroll_id": "<scroll_id>"
}
```

### 3. 샤드 전략

#### 시간 기반 인덱스 (메시지/로그)
```bash
# 월별 인덱스 분리
messages_2025_10
messages_2025_11
messages_2025_12

# 인덱스 별칭으로 통합 검색
POST /_aliases
{
  "actions": [
    {"add": {"index": "messages_2025_*", "alias": "messages"}}
  ]
}

# 검색 시
GET /messages/_search  # 모든 월 검색
GET /messages_2025_10/_search  # 특정 월만 검색
```

### 4. 캐싱 전략

#### 애플리케이션 레벨 캐싱 (Redis)
```javascript
// 인기 검색어 캐싱 (Node.js 예시)
const searchMessages = async (keyword) => {
  const cacheKey = `search:messages:${keyword}`;

  // 캐시 확인
  let result = await redis.get(cacheKey);
  if (result) {
    return JSON.parse(result);
  }

  // Elasticsearch 쿼리
  result = await esClient.search({
    index: 'messages',
    body: {
      query: {
        match: { content: keyword }
      }
    }
  });

  // 캐시 저장 (5분)
  await redis.setex(cacheKey, 300, JSON.stringify(result));

  return result;
};
```

#### 자동완성 캐싱
```javascript
// 사용자 자동완성 (전체 사용자 캐싱)
const getAllActiveUsers = async () => {
  const cacheKey = 'users:active:all';

  let users = await redis.get(cacheKey);
  if (users) {
    return JSON.parse(users);
  }

  const result = await esClient.search({
    index: 'users',
    body: {
      query: { term: { status: 'active' } },
      size: 10000  // 전체 활성 사용자
    }
  });

  users = result.hits.hits.map(h => h._source);

  // 1시간 캐싱
  await redis.setex(cacheKey, 3600, JSON.stringify(users));

  return users;
};
```

### 5. 실시간 검색 최적화

#### Debounce (타이핑 중 과도한 요청 방지)
```javascript
// React 예시
import { debounce } from 'lodash';

const searchMessages = debounce(async (keyword) => {
  if (keyword.length < 2) return;  // 2글자 이상부터 검색

  const results = await api.searchMessages(keyword);
  setSearchResults(results);
}, 300);  // 300ms 대기

// 사용
<input onChange={(e) => searchMessages(e.target.value)} />
```

#### Request Cancellation (이전 요청 취소)
```javascript
// Axios + AbortController
let cancelToken;

const searchMessages = async (keyword) => {
  // 이전 요청 취소
  if (cancelToken) {
    cancelToken.cancel('New search initiated');
  }

  cancelToken = axios.CancelToken.source();

  try {
    const results = await axios.get('/api/search', {
      params: { q: keyword },
      cancelToken: cancelToken.token
    });
    return results.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request cancelled');
    }
  }
};
```

---

## 📊 모니터링 및 성능 측정

### 1. 쿼리 성능 측정

#### Profile API
```json
GET /messages/_search
{
  "profile": true,                   // 프로파일링 활성화
  "query": {
    "match": {
      "content": "배포"
    }
  }
}

// 응답에서 실행 시간 확인
{
  "profile": {
    "shards": [
      {
        "searches": [
          {
            "query": [...],
            "rewrite_time": 12500,   // microseconds
            "collector": [
              {
                "name": "SimpleTopScoreDocCollector",
                "time_in_nanos": 2000000  // 2ms
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 2. 인덱스 통계

```bash
# 인덱스 상태 확인
GET /_cat/indices/messages?v&h=health,status,index,pri,rep,docs.count,store.size

# 샤드 분포 확인
GET /_cat/shards/messages?v

# 인덱스 통계
GET /messages/_stats
```

### 3. Slow Log 설정

```json
PUT /messages/_settings
{
  "index.search.slowlog.threshold.query.warn": "1s",
  "index.search.slowlog.threshold.query.info": "500ms",
  "index.search.slowlog.threshold.fetch.warn": "500ms",
  "index.indexing.slowlog.threshold.index.warn": "1s"
}
```

---

## 🎓 실습 과제

### 과제 1: 고급 메시지 검색 구현
**요구사항**:
- "배포" 또는 "릴리스" 검색 (OR 조건)
- 개발팀 또는 QA 채널
- 좋아요 10개 이상
- 첨부파일 있음
- 최근 14일
- 고정 메시지 상단 노출

<details>
<summary>정답 보기</summary>

```json
GET /messages/_search
{
  "query": {
    "bool": {
      "should": [
        {"match": {"content": "배포"}},
        {"match": {"content": "릴리스"}}
      ],
      "filter": [
        {"terms": {"channel": ["ch_dev", "ch_qa"]}},
        {"range": {"likes": {"gte": 10}}},
        {"term": {"has_attachment": true}},
        {"range": {"created_at": {"gte": "now-14d/d"}}}
      ],
      "minimum_should_match": 1
    }
  },
  "sort": [
    {"is_pinned": {"order": "desc"}},
    {"_score": "desc"},
    {"created_at": "desc"}
  ]
}
```
</details>

### 과제 2: 프로젝트 대시보드 통계
**요구사항**:
- 프로젝트 상태별 개수 (active, completed, on_hold)
- 우선순위별 개수
- 평균 멤버 수
- 평균 작업 완료율

<details>
<summary>정답 보기</summary>

```json
GET /projects/_search
{
  "size": 0,
  "aggs": {
    "by_status": {
      "terms": {"field": "status"}
    },
    "by_priority": {
      "terms": {"field": "priority"}
    },
    "avg_members": {
      "avg": {"field": "member_count"}
    },
    "completion_rate": {
      "avg": {
        "script": {
          "source": "doc['completed_task_count'].value / doc['task_count'].value * 100"
        }
      }
    }
  }
}
```
</details>

### 과제 3: 사용자 멘션 검색
**요구사항**:
- 특정 사용자(@user_001)가 멘션된 메시지만 검색
- 최근 7일
- 답글 1개 이상
- 최신순 정렬

<details>
<summary>정답 보기</summary>

```json
GET /messages/_search
{
  "query": {
    "bool": {
      "filter": [
        {"term": {"mentions": "user_001"}},
        {"range": {"created_at": {"gte": "now-7d/d"}}},
        {"range": {"replies": {"gte": 1}}}
      ]
    }
  },
  "sort": [
    {"created_at": "desc"}
  ]
}
```
</details>

---

## 🔄 다음 단계

협업 플랫폼 적용을 완료했다면:
- 실제 백엔드 API 통합 (Node.js/Spring Boot)
- 프론트엔드 검색 UI 구현 (React/Vue)
- 자동완성 고도화 (Completion Suggester)
- 검색 분석 및 개선 (Search Analytics)

---

## 📝 체크리스트

- [ ] 4가지 도메인 인덱스 설계 이해 (메시지/문서/사용자/프로젝트)
- [ ] 실전 검색 쿼리 4가지 구현
- [ ] 성능 최적화 5가지 전략 숙지
- [ ] 캐싱 전략 이해 및 구현
- [ ] 실시간 검색 최적화 (Debounce, Cancellation)
- [ ] 모니터링 및 Slow Log 설정
- [ ] 실습 과제 3개 완료

---

## 💡 핵심 포인트

1. **인덱스 설계가 성능의 80%를 결정**
   - 샤드 수는 데이터 크기와 검색 빈도로 결정
   - text vs keyword 필드 구분 중요
   - Nested 타입은 배열 객체 검색에 필수

2. **Bool 쿼리 + Filter가 핵심**
   - must: 점수 계산 (관련성 검색)
   - filter: 캐싱 + 빠른 필터링
   - should: 부스팅으로 우선순위 조정

3. **실시간 검색은 캐싱 + Debounce**
   - Redis로 인기 검색어 캐싱
   - 300ms Debounce로 요청 최소화
   - Request Cancellation으로 불필요한 요청 제거

4. **모니터링이 개선의 시작**
   - Profile API로 병목점 파악
   - Slow Log로 느린 쿼리 추적
   - 인덱스 통계로 용량 관리
