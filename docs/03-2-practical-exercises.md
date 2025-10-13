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

<details>
<summary>📝 정답 보기 (클릭)</summary>

```bash
PUT /users
{
  "mappings": {
    "properties": {
      "user_id": {"type": "keyword"},        # 정확한 매칭용 → keyword
      "username": {"type": "keyword"},       # 정확한 매칭용 → keyword
      "email": {"type": "keyword"},          # 정확한 매칭용 → keyword
      "full_name": {"type": "text"},         # 전문 검색용 → text (분석됨)
      "department": {"type": "keyword"},     # 필터링용 → keyword
      "position": {"type": "keyword"},       # 필터링용 → keyword
      "joined_at": {"type": "date"},         # 날짜 → date
      "is_active": {"type": "boolean"},      # 불린 → boolean
      "bio": {"type": "text"}                # 전문 검색용 → text
    }
  }
}
```

**핵심 포인트**:
- **keyword**: 정확한 매칭, 필터링, 정렬, 집계용 (분석 안됨)
- **text**: 전문 검색용 (analyzer로 분석됨)
- **date**: 날짜 범위 검색, 정렬용
- **boolean**: true/false 필터링용

</details>

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

<details>
<summary>📝 정답 보기 (클릭)</summary>

```bash
POST /users/_bulk
{"index": {"_id": "user_001"}}
{"user_id": "u001", "username": "hong", "email": "hong@company.com", "full_name": "홍길동", "department": "개발팀", "position": "시니어 개발자", "joined_at": "2023-01-15", "is_active": true, "bio": "백엔드 개발 전문"}
{"index": {"_id": "user_002"}}
{"user_id": "u002", "username": "kim", "email": "kim@company.com", "full_name": "김철수", "department": "디자인팀", "position": "UI/UX 디자이너", "joined_at": "2023-03-20", "is_active": true, "bio": "사용자 경험 디자인"}
{"index": {"_id": "user_003"}}
{"user_id": "u003", "username": "lee", "email": "lee@company.com", "full_name": "이영희", "department": "기획팀", "position": "프로덕트 매니저", "joined_at": "2022-11-10", "is_active": true, "bio": "제품 기획 및 전략"}
{"index": {"_id": "user_004"}}
{"user_id": "u004", "username": "park", "email": "park@company.com", "full_name": "박민수", "department": "QA팀", "position": "QA 엔지니어", "joined_at": "2024-02-01", "is_active": true, "bio": "품질 보증 전문가"}
{"index": {"_id": "user_005"}}
{"user_id": "u005", "username": "choi", "email": "choi@company.com", "full_name": "최지혜", "department": "경영지원", "position": "인사담당자", "joined_at": "2023-06-15", "is_active": true, "bio": "인사 및 조직 관리"}
```

**핵심 포인트**:
- Bulk API는 **NDJSON 형식** (각 줄이 별도 JSON)
- 첫 줄: 메타데이터 (`{"index": {"_id": "..."}}`)
- 둘째 줄: 실제 문서 데이터
- 마지막에 반드시 **줄바꿈** 필요
- 한 번에 여러 작업 → **네트워크 오버헤드 최소화**

</details>

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

<details>
<summary>📝 정답 보기 (클릭)</summary>

```bash
# ✅ 정답: 모든 필드를 다시 작성해야 함
PUT /users/_doc/user_003
{
  "user_id": "u003",
  "username": "lee",
  "email": "lee@company.com",
  "full_name": "이영희",
  "department": "개발팀",              # 부서 변경 (기획팀 → 개발팀)
  "position": "프로덕트 매니저",
  "joined_at": "2022-11-10",
  "is_active": true,
  "bio": "제품 기획 및 전략"
}
```

**핵심 포인트**:
- **PUT은 완전 교체** - 모든 필드를 다시 작성
- 필드 누락 시 → 해당 필드 삭제됨 ⚠️
- **부분 수정은 POST _update 사용** 권장
- _version이 증가함 (낙관적 동시성 제어)

**비교**:
```bash
# POST _update: 부분 수정 (안전)
POST /users/_update/user_003
{"doc": {"department": "개발팀"}}

# PUT: 전체 교체 (위험 - 필드 누락 시 삭제)
PUT /users/_doc/user_003
{"department": "개발팀"}  # ❌ 다른 필드 모두 사라짐!
```

</details>

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

<details>
<summary>📝 정답 보기 (클릭)</summary>

```bash
# ✅ 정답
POST /users/_delete_by_query
{
  "query": {
    "term": {
      "is_active": false    # boolean 타입은 true/false (문자열 아님!)
    }
  }
}
```

**핵심 포인트**:
- boolean 타입은 **true/false** (문자열 "true"/"false" 아님)
- `_delete_by_query`는 **조건에 맞는 모든 문서 삭제**
- 응답에서 `deleted` 개수 확인 가능
- 작업은 비동기로 처리됨 (큰 데이터셋의 경우)

**응답 예시**:
```json
{
  "took": 45,
  "deleted": 1,           # 삭제된 문서 수
  "batches": 1,
  "failures": []
}
```

</details>

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

<details>
<summary>📝 정답 보기 (클릭)</summary>

```bash
PUT /projects
{
  "settings": {
    "number_of_shards": 2,           # 프로젝트 수 중간 규모 (수백~수천 건)
    "number_of_replicas": 1,         # 중요 데이터 → 복제본 1개
    "refresh_interval": "5s"         # 실시간성 중간 (즉시 필요 없음)
  },
  "mappings": {
    "properties": {
      "project_id": {"type": "keyword"},        # 정확한 ID 매칭
      "name": {
        "type": "text",                         # 전문 검색
        "fields": {
          "keyword": {"type": "keyword"}        # 정렬/집계용
        }
      },
      "description": {"type": "text"},          # 전문 검색
      "status": {"type": "keyword"},            # 필터링 (진행중/완료/보류)
      "owner": {"type": "keyword"},             # 담당자 필터링
      "members": {"type": "keyword"},           # 배열로 여러 멤버
      "tags": {"type": "keyword"},              # 배열로 여러 태그
      "created_at": {"type": "date"},           # 날짜 범위 검색
      "completed_at": {"type": "date"},         # 날짜 범위 검색
      "priority": {"type": "keyword"}           # 필터링 (높음/중간/낮음)
    }
  }
}
```

**핵심 설계 결정**:

1. **number_of_shards: 2**
   - 프로젝트는 메시지보다 적지만 중요
   - 검색 성능 향상 위해 2개 샤드
   - 향후 확장 고려

2. **number_of_replicas: 1**
   - 프로젝트 정보는 중요 → 백업 필요
   - 고가용성 확보

3. **refresh_interval: 5s**
   - 프로젝트 생성/수정은 실시간 반영 불필요
   - 5초 정도 지연 허용 → 성능 개선

4. **name 필드의 multi-field**
   ```json
   "name": {
     "type": "text",              # 검색용
     "fields": {
       "keyword": {"type": "keyword"}  # 정렬용
     }
   }
   ```
   - 검색: `match {"name": "ERP"}`
   - 정렬: `sort: [{"name.keyword": "asc"}]`

5. **배열 필드 (members, tags)**
   - Elasticsearch는 배열을 자동 처리
   - `"members": ["홍길동", "김철수"]` → 각각 인덱싱

</details>

**샘플 데이터 5개 추가**:
```bash
POST /projects/_bulk
{"index": {"_id": "proj_001"}}
{"project_id": "P001", "name": "ERP 시스템 구축", "status": "진행중", ...}
// 4개 더 추가
```

<details>
<summary>📝 정답 보기 (클릭)</summary>

```bash
POST /projects/_bulk
{"index": {"_id": "proj_001"}}
{"project_id": "P001", "name": "ERP 시스템 구축", "description": "전사적 자원 관리 시스템 개발", "status": "진행중", "owner": "홍길동", "members": ["홍길동", "김철수", "이영희"], "tags": ["백엔드", "데이터베이스", "인프라"], "created_at": "2025-01-15", "completed_at": null, "priority": "높음"}
{"index": {"_id": "proj_002"}}
{"project_id": "P002", "name": "모바일 앱 리뉴얼", "description": "사용자 경험 개선 및 디자인 전면 개편", "status": "완료", "owner": "김철수", "members": ["김철수", "박민수"], "tags": ["프론트엔드", "디자인", "모바일"], "created_at": "2024-11-01", "completed_at": "2025-02-28", "priority": "중간"}
{"index": {"_id": "proj_003"}}
{"project_id": "P003", "name": "Elasticsearch 도입", "description": "검색 기능 고도화를 위한 Elasticsearch 적용", "status": "진행중", "owner": "최지혜", "members": ["최지혜", "홍길동"], "tags": ["백엔드", "검색", "인프라"], "created_at": "2025-03-01", "completed_at": null, "priority": "높음"}
{"index": {"_id": "proj_004"}}
{"project_id": "P004", "name": "결제 시스템 고도화", "description": "다양한 결제 수단 추가 및 안정성 개선", "status": "보류", "owner": "이영희", "members": ["이영희"], "tags": ["백엔드", "결제"], "created_at": "2025-02-10", "completed_at": null, "priority": "낮음"}
{"index": {"_id": "proj_005"}}
{"project_id": "P005", "name": "자동화 테스트 구축", "description": "CI/CD 파이프라인 및 자동화 테스트 환경 구축", "status": "진행중", "owner": "박민수", "members": ["박민수", "김철수"], "tags": ["QA", "자동화", "DevOps"], "created_at": "2025-01-20", "completed_at": null, "priority": "중간"}
```

**데이터 특징**:
- 다양한 상태 (진행중 3개, 완료 1개, 보류 1개)
- 여러 우선순위 (높음 2개, 중간 2개, 낮음 1개)
- 복수 멤버 및 태그 (배열 테스트)
- 완료된 프로젝트는 completed_at에 날짜
- 진행중/보류 프로젝트는 completed_at이 null

</details>

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
