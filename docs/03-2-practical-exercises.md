# CRUD 및 Index Settings 실전 과제

> 직접 해보면서 Elasticsearch의 핵심 개념을 체득하는 실습 과제 모음

## 🎯 학습 목표

- Index 생성부터 검색까지 전체 플로우 이해
- Settings 값 변경에 따른 동작 차이 체감
- 실제 서비스 시나리오 적용 능력 향상

---

## 📚 난이도별 과제 구성

```
🟢 기본 (Basic)     - CRUD 기본 조작 익히기
🟡 중급 (Advanced)  - Settings 이해 및 최적화
🔴 고급 (Expert)    - 실전 시나리오 구현
```

---

## 🟢 기본 과제 (Basic)

### 과제 1: 사용자 인덱스 만들기

**목표**: 협업 플랫폼의 사용자 정보를 저장할 인덱스 생성

**요구사항**:
```json
인덱스명: users

필드:
- user_id: 문자열 (정확한 매칭용)
- username: 문자열 (정확한 매칭용)
- email: 문자열 (정확한 매칭용)
- full_name: 텍스트 (전문 검색용)
- department: 문자열 (필터링용)
- position: 문자열 (필터링용)
- joined_at: 날짜
- is_active: 불린
- bio: 텍스트 (전문 검색용, 선택)
```

**힌트**:
```json
PUT /users
{
  "mappings": {
    "properties": {
      "user_id": {"type": "keyword"},
      "username": {"type": "???"},
      // 나머지 필드 작성
    }
  }
}
```

**검증**:
```bash
# 매핑 확인
GET /users/_mapping

# 예상 결과: 9개 필드가 올바른 타입으로 정의되어야 함
```

---

### 과제 2: 팀원 데이터 5명 추가하기

**목표**: Bulk API를 사용한 효율적인 데이터 입력

**요구사항**:
- 5명의 팀원 데이터를 한 번에 추가
- 각자 다른 부서 (개발팀, 디자인팀, 기획팀, QA팀, 경영지원)
- ID는 직접 지정 (user_001 ~ user_005)

**힌트**:
```bash
POST /users/_bulk
{"index": {"_id": "user_001"}}
{"user_id": "u001", "username": "hong", "email": "hong@company.com", ...}
{"index": {"_id": "user_002"}}
{"user_id": "u002", ...}
```

**검증**:
```bash
# 전체 사용자 조회
GET /users/_search
{
  "query": {"match_all": {}}
}

# 예상 결과: total.value = 5
```

---

### 과제 3: 사용자 정보 수정하기

**목표**: Update API 3가지 방법 이해

**요구사항**:

**3-1. 부분 수정 (Partial Update)**
```bash
# user_001의 부서를 "개발팀"에서 "경영지원"으로 변경
POST /users/_update/user_001
{
  "doc": {
    "department": "경영지원"
  }
}
```

**3-2. 스크립트 수정**
```bash
# user_002를 비활성 상태로 변경
POST /users/_update/user_002
{
  "script": {
    "source": "ctx._source.is_active = false"
  }
}
```

**3-3. 전체 교체 (PUT)**
```bash
# user_003의 모든 정보를 새로 작성
PUT /users/_doc/user_003
{
  "user_id": "u003",
  "username": "kim",
  // 모든 필드 다시 작성
}
```

**검증**:
```bash
# 변경 확인
GET /users/_doc/user_001
GET /users/_doc/user_002
GET /users/_doc/user_003

# _version 값이 증가했는지 확인
```

---

### 과제 4: 조건부 검색 및 삭제

**목표**: 쿼리 기반 작업 이해

**요구사항**:

**4-1. 특정 부서 검색**
```bash
# 개발팀 소속 사용자 모두 찾기
GET /users/_search
{
  "query": {
    "term": {
      "department": "개발팀"
    }
  }
}
```

**4-2. 비활성 사용자 삭제**
```bash
# is_active = false인 사용자 모두 삭제
POST /users/_delete_by_query
{
  "query": {
    "term": {
      "is_active": ???
    }
  }
}
```

**검증**:
```bash
# 삭제 후 전체 사용자 수 확인
GET /users/_count

# 비활성 사용자가 사라졌는지 확인
GET /users/_search
{
  "query": {"term": {"is_active": false}}
}
# 예상 결과: total.value = 0
```

---

## 🟡 중급 과제 (Advanced)

### 과제 5: Settings 비교 실험

**목표**: Settings 값에 따른 동작 차이 체감

**요구사항**:

**5-1. 빠른 갱신 vs 느린 갱신 인덱스**
```bash
# 인덱스 A: 1초 갱신
PUT /test-fast
{
  "settings": {
    "refresh_interval": "1s"
  }
}

# 인덱스 B: 30초 갱신
PUT /test-slow
{
  "settings": {
    "refresh_interval": "30s"
  }
}

# 데이터 추가
POST /test-fast/_doc
{"message": "빠른 인덱스"}

POST /test-slow/_doc
{"message": "느린 인덱스"}

# 즉시 검색 시도 (추가 직후)
GET /test-fast/_search
GET /test-slow/_search
```

**질문에 답하기**:
1. test-fast는 몇 초 후에 검색되나요?
2. test-slow는 몇 초 후에 검색되나요?
3. 실시간 채팅 서비스는 어떤 설정을 써야 할까요?
4. 로그 저장용 인덱스는 어떤 설정이 좋을까요?

---

### 과제 6: Shard 분산 확인

**목표**: 샤드가 데이터를 어떻게 분할하는지 이해

**요구사항**:

**6-1. 샤드 3개 인덱스 생성**
```bash
PUT /test-shards
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 0
  }
}
```

**6-2. 데이터 100개 추가**
```bash
# 간단한 스크립트로 100개 추가
for i in {1..100}; do
  curl -X POST "http://localhost:30200/test-shards/_doc" \
    -H 'Content-Type: application/json' \
    -d "{\"id\": $i, \"message\": \"Test message $i\"}"
done
```

**6-3. 샤드별 문서 분포 확인**
```bash
GET /_cat/shards/test-shards?v

# 결과 예시:
# index       shard prirep state   docs
# test-shards 0     p      STARTED 33
# test-shards 1     p      STARTED 34
# test-shards 2     p      STARTED 33
```

**질문에 답하기**:
1. 각 샤드에 문서가 균등하게 분배되었나요?
2. 특정 샤드에만 데이터를 넣을 수 있나요?
3. 샤드 수를 5개로 바꾸려면 어떻게 해야 하나요?

---

### 과제 7: Replica 고가용성 실험

**목표**: 복제본의 역할 이해

**요구사항**:

**7-1. Replica 없는 인덱스**
```bash
PUT /no-replica
{
  "settings": {
    "number_of_replicas": 0
  }
}

# 클러스터 상태 확인
GET /_cluster/health?pretty

# 예상 결과: status = "yellow" or "green"
```

**7-2. Replica 추가**
```bash
PUT /no-replica/_settings
{
  "number_of_replicas": 1
}

# 클러스터 상태 다시 확인
GET /_cluster/health?pretty

# 단일 노드에서는 status = "yellow"
# (replica를 배치할 다른 노드가 없음)
```

**질문에 답하기**:
1. 단일 노드에서 replica를 1로 설정하면 왜 yellow 상태일까요?
2. 프로덕션에서 replica 0은 언제 사용하나요?
3. replica 2는 어떤 경우에 필요할까요?

---

### 과제 8: 대량 데이터 성능 비교

**목표**: Bulk API vs 개별 요청 성능 차이 체감

**요구사항**:

**8-1. 개별 요청 (100개)**
```bash
# 시간 측정 시작
start_time=$(date +%s)

for i in {1..100}; do
  curl -X POST "http://localhost:30200/test-individual/_doc" \
    -H 'Content-Type: application/json' \
    -d "{\"id\": $i}" \
    -s -o /dev/null
done

end_time=$(date +%s)
echo "개별 요청 소요 시간: $((end_time - start_time))초"
```

**8-2. Bulk 요청 (100개)**
```bash
# bulk.json 파일 생성 (100개 문서)
for i in {1..100}; do
  echo "{\"index\": {}}"
  echo "{\"id\": $i}"
done > bulk.json

# 시간 측정
start_time=$(date +%s)

curl -X POST "http://localhost:30200/test-bulk/_bulk" \
  -H 'Content-Type: application/json' \
  --data-binary @bulk.json

end_time=$(date +%s)
echo "Bulk 요청 소요 시간: $((end_time - start_time))초"
```

**질문에 답하기**:
1. 어느 방법이 얼마나 빨랐나요?
2. 1000개면 차이가 얼마나 날까요?
3. Bulk API의 적정 크기는 몇 개일까요?

---

## 🔴 고급 과제 (Expert)

### 과제 9: 협업 플랫폼 프로젝트 인덱스 설계

**목표**: 실제 서비스 시나리오 적용

**요구사항**:

**9-1. 프로젝트 인덱스 설계**
```
비즈니스 요구사항:
- 프로젝트 이름, 설명으로 전문 검색
- 상태별 필터링 (진행중, 완료, 보류)
- 생성일/완료일 범위 검색
- 담당자별 프로젝트 검색
- 태그별 분류

필요한 필드:
- project_id
- name (검색 가능)
- description (검색 가능)
- status (필터링)
- owner (담당자)
- members (배열)
- tags (배열)
- created_at
- completed_at
- priority (높음/중간/낮음)
```

**직접 설계하기**:
```json
PUT /projects
{
  "settings": {
    "number_of_shards": ???,      // 예상 데이터 크기 고려
    "number_of_replicas": ???,    // 중요도 고려
    "refresh_interval": ???       // 실시간성 고려
  },
  "mappings": {
    "properties": {
      "project_id": {"type": "???"},
      "name": {"type": "???"},
      // 나머지 필드 설계
    }
  }
}
```

**샘플 데이터 5개 추가**:
```bash
POST /projects/_bulk
{"index": {"_id": "proj_001"}}
{"project_id": "P001", "name": "ERP 시스템 구축", "status": "진행중", ...}
// 4개 더 추가
```

---

### 과제 10: 복합 검색 쿼리 구현

**목표**: Bool 쿼리를 활용한 실전 검색

**요구사항**:

**10-1. 진행중인 프로젝트 중 "시스템" 포함**
```bash
GET /projects/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {"name": "시스템"}}
      ],
      "filter": [
        {"term": {"status": "진행중"}}
      ]
    }
  }
}
```

**10-2. 특정 담당자 + 높은 우선순위 + 미완료**
```bash
GET /projects/_search
{
  "query": {
    "bool": {
      "filter": [
        {"term": {"owner": "홍길동"}},
        {"term": {"priority": "높음"}},
        {"range": {"completed_at": {"gte": "now"}}}  // 완료일이 미래 = 미완료
      ]
    }
  }
}
```

**10-3. 특정 태그 중 하나라도 포함 + 날짜 범위**
```bash
GET /projects/_search
{
  "query": {
    "bool": {
      "must": [
        {"terms": {"tags": ["백엔드", "인프라"]}}
      ],
      "filter": [
        {
          "range": {
            "created_at": {
              "gte": "2025-01-01",
              "lte": "2025-12-31"
            }
          }
        }
      ]
    }
  }
}
```

---

### 과제 11: 통계 및 집계

**목표**: Aggregation을 활용한 데이터 분석

**요구사항**:

**11-1. 상태별 프로젝트 개수**
```bash
GET /projects/_search
{
  "size": 0,
  "aggs": {
    "by_status": {
      "terms": {
        "field": "status"
      }
    }
  }
}
```

**11-2. 담당자별 프로젝트 개수 (Top 5)**
```bash
GET /projects/_search
{
  "size": 0,
  "aggs": {
    "top_owners": {
      "terms": {
        "field": "owner",
        "size": 5
      }
    }
  }
}
```

**11-3. 월별 프로젝트 생성 추이**
```bash
GET /projects/_search
{
  "size": 0,
  "aggs": {
    "projects_over_time": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "month"
      }
    }
  }
}
```

**11-4. 우선순위별 평균 완료 시간 (중첩 집계)**
```bash
GET /projects/_search
{
  "size": 0,
  "aggs": {
    "by_priority": {
      "terms": {
        "field": "priority"
      },
      "aggs": {
        "avg_duration": {
          "avg": {
            "script": {
              "source": "doc['completed_at'].value.millis - doc['created_at'].value.millis"
            }
          }
        }
      }
    }
  }
}
```

---

### 과제 12: 인덱스 최적화 및 Reindex

**목표**: 운영 중 인덱스 개선 시나리오

**시나리오**:
```
운영 중인 messages 인덱스의 문제점:
1. 샤드가 1개라서 검색이 느림
2. 한글 검색 품질이 낮음 (standard analyzer)
3. replica가 0이라 장애 위험

해결 방법:
1. 샤드 3개로 증가
2. nori analyzer 적용 (한글 형태소)
3. replica 1개 추가
```

**요구사항**:

**12-1. 새 인덱스 설계**
```bash
PUT /messages_v2
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "korean": {
          "type": "nori"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "korean"
      },
      "author": {"type": "keyword"},
      "channel": {"type": "keyword"},
      "created_at": {"type": "date"}
    }
  }
}
```

**12-2. 데이터 이관 (Reindex)**
```bash
POST /_reindex
{
  "source": {
    "index": "messages"
  },
  "dest": {
    "index": "messages_v2"
  }
}
```

**12-3. 별칭으로 무중단 전환**
```bash
# 기존 별칭 제거 + 새 별칭 추가 (원자적 실행)
POST /_aliases
{
  "actions": [
    {"remove": {"index": "messages", "alias": "messages_current"}},
    {"add": {"index": "messages_v2", "alias": "messages_current"}}
  ]
}

# 이제 애플리케이션은 "messages_current" 사용
GET /messages_current/_search
```

**12-4. 구 인덱스 삭제**
```bash
# 충분한 검증 후
DELETE /messages
```

---

## 🎓 보너스 과제

### 과제 13: 자동완성 구현

**목표**: Prefix 쿼리로 사용자명 자동완성

```bash
# 사용자가 "hong" 입력 시
GET /users/_search
{
  "query": {
    "prefix": {
      "username": "hong"
    }
  }
}

# 결과: "hongkildong", "hongchulsoo" 등 반환
```

---

### 과제 14: 오타 허용 검색

**목표**: Fuzzy 쿼리로 오타 대응

```bash
# "Elasticsarch" (오타) 검색
GET /projects/_search
{
  "query": {
    "fuzzy": {
      "name": {
        "value": "Elasticsarch",
        "fuzziness": "AUTO"
      }
    }
  }
}

# "Elasticsearch" 포함 프로젝트도 검색됨
```

---

### 과제 15: 멀티 인덱스 검색

**목표**: 여러 인덱스 동시 검색

```bash
# messages와 projects 인덱스 동시 검색
GET /messages,projects/_search
{
  "query": {
    "multi_match": {
      "query": "배포",
      "fields": ["content", "name", "description"]
    }
  }
}
```

---

## 📊 과제 체크리스트

### 🟢 기본 과제
- [ ] 과제 1: users 인덱스 생성
- [ ] 과제 2: 팀원 5명 Bulk 추가
- [ ] 과제 3: 사용자 정보 3가지 방법으로 수정
- [ ] 과제 4: 조건부 검색 및 삭제

### 🟡 중급 과제
- [ ] 과제 5: refresh_interval 비교 실험
- [ ] 과제 6: Shard 분산 확인
- [ ] 과제 7: Replica 고가용성 이해
- [ ] 과제 8: Bulk vs 개별 요청 성능 비교

### 🔴 고급 과제
- [ ] 과제 9: projects 인덱스 설계
- [ ] 과제 10: 복합 검색 쿼리 3개
- [ ] 과제 11: Aggregation 4개 유형
- [ ] 과제 12: Reindex 및 무중단 전환

### 🎓 보너스
- [ ] 과제 13: 자동완성
- [ ] 과제 14: 오타 허용 검색
- [ ] 과제 15: 멀티 인덱스 검색

---

## 💡 과제 수행 팁

### 1. 단계별 검증
매 과제마다 결과를 확인하세요:
```bash
# 인덱스 생성 후
GET /_cat/indices?v

# 데이터 추가 후
GET /인덱스명/_count

# 설정 변경 후
GET /인덱스명/_settings
```

### 2. 에러 해결
에러 메시지를 자세히 읽어보세요:
```bash
# 상세한 에러 정보
GET /인덱스명/_search?error_trace=true
```

### 3. 문서 참고
막힐 때는 작성한 학습 문서를 참고:
- `01-basic-concepts.md`: 용어 정리
- `03-crud-operations.md`: CRUD 문법
- `03-1-index-settings-deep-dive.md`: Settings 상세
- `04-search-queries.md`: 검색 쿼리
- `99-troubleshooting.md`: 문제 해결

### 4. 실험 정신
- 값을 바꿔보세요 (refresh_interval: 1s → 60s)
- 필드 타입을 바꿔보세요 (text → keyword)
- 에러가 나도 괜찮습니다. 배우는 과정입니다!

---

## 🎯 완료 후 얻을 수 있는 것

이 과제들을 모두 완료하면:
- ✅ Elasticsearch 기본 CRUD 완벽 숙지
- ✅ Index Settings의 실전 적용 능력
- ✅ 성능 최적화 기본 개념 이해
- ✅ 협업 플랫폼 검색 시스템 설계 능력
- ✅ 운영 중 인덱스 개선 노하우

---

## 📝 제출 (선택)

과제를 완료하면 다음 형식으로 기록하세요:

```markdown
# 과제 X 완료

## 실행 코드
\`\`\`bash
실제 실행한 명령어
\`\`\`

## 결과
\`\`\`json
응답 결과
\`\`\`

## 배운 점
- 핵심 깨달음 1
- 핵심 깨달음 2

## 질문
- 궁금한 점이나 어려웠던 부분
\`\`\`

이 내용을 `docs/my-exercises.md`에 기록하세요!
