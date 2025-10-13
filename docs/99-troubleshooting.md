# Elasticsearch 문제 해결 가이드

> 자주 발생하는 문제와 해결 방법

## 🔧 환경 구축 문제

### 1. Docker 컨테이너 시작 실패

**증상**: `docker-compose up` 후 컨테이너가 계속 재시작

**원인 및 해결**:

```bash
# 1. 로그 확인
docker-compose logs -f elasticsearch

# 2. 메모리 부족
# Docker Desktop → Settings → Resources → Memory: 최소 4GB 설정

# 3. 포트 충돌 확인
lsof -i :30200
lsof -i :30601

# 충돌 시 docker-compose.yml에서 포트 변경
```

### 2. Kibana 접속 불가

**증상**: http://localhost:30601 접속 안됨

**해결**:
```bash
# Elasticsearch 먼저 확인
curl http://localhost:30200

# Kibana 로그 확인
docker-compose logs -f kibana

# 재시작
docker-compose restart kibana
```

---

## 🔍 검색 문제

### 1. 한글 검색이 안됨

**증상**: "프로젝트"로 검색 시 아무것도 안 나옴

**원인**: Analyzer 미설정

**해결**:
```json
// 인덱스 재생성 (매핑 포함)
PUT /messages
{
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "standard"  // 나중에 nori로 변경
      }
    }
  }
}

// 기존 인덱스는 삭제 후 재생성 필요
DELETE /messages
```

### 2. term 쿼리가 작동 안 함

**증상**:
```json
// 이렇게 했는데 결과가 없음
{
  "query": {
    "term": {
      "content": "프로젝트"
    }
  }
}
```

**원인**: text 필드는 분석되므로 term 쿼리 부적합

**해결**:
```json
// text 필드는 match 사용
{
  "query": {
    "match": {
      "content": "프로젝트"
    }
  }
}

// keyword 필드는 term 사용
{
  "query": {
    "term": {
      "author.keyword": "홍길동"
    }
  }
}
```

### 3. 검색 결과가 너무 많음

**해결**:
```json
// 1. size 조정
GET /messages/_search
{
  "size": 20,  // 기본 10
  "query": {...}
}

// 2. 필터 조건 추가
{
  "query": {
    "bool": {
      "filter": [
        {"range": {"created_at": {"gte": "now-7d"}}}
      ]
    }
  }
}
```

---

## ⚡ 성능 문제

### 1. 검색이 느림

**진단**:
```json
// 쿼리 실행 시간 확인
GET /messages/_search
{
  "profile": true,  // 상세 성능 분석
  "query": {...}
}
```

**해결책**:

1. **filter 사용** (must 대신)
```json
// ❌ 느림 (점수 계산)
"must": [{"term": {"channel": "개발팀"}}]

// ✅ 빠름 (캐싱됨)
"filter": [{"term": {"channel": "개발팀"}}]
```

2. **불필요한 필드 제외**
```json
{
  "_source": ["content", "author"],  // 필요한 필드만
  "query": {...}
}
```

3. **와일드카드 남용 금지**
```json
// ❌ 매우 느림
"wildcard": {"content": "*프로젝트*"}

// ✅ 빠름
"match": {"content": "프로젝트"}
```

### 2. 인덱싱이 느림

**bulk 크기 최적화**:
```bash
# 너무 작음 (비효율)
POST /_bulk  # 100개 문서

# 적절함
POST /_bulk  # 1000-5000개 문서

# 너무 큼 (타임아웃)
POST /_bulk  # 50000개 문서
```

**refresh 전략**:
```json
// 실시간 필요 없으면
POST /messages/_doc?refresh=false
{...}

// 또는 refresh interval 조정
PUT /messages/_settings
{
  "index.refresh_interval": "30s"  // 기본 1s
}
```

---

## 💾 데이터 문제

### 1. 문서 업데이트가 반영 안됨

**원인**: refresh 대기 중

**해결**:
```bash
# 즉시 검색 가능하게
POST /messages/_doc/1?refresh=wait_for
{...}

# 또는 수동 refresh
POST /messages/_refresh
```

### 2. 데이터가 사라짐

**원인 1**: 인덱스 삭제
```bash
# 인덱스 목록 확인
GET /_cat/indices?v

# 인덱스 복구 (불가능, 백업 필요)
```

**원인 2**: TTL 설정
```json
// 인덱스 설정 확인
GET /messages/_settings
```

**예방**:
- 프로덕션: 자동 삭제 방지
- 정기 백업: snapshot 기능 활용

### 3. 매핑 변경이 안됨

**증상**: 매핑 수정 시 오류

**원인**: 기존 매핑은 수정 불가 (호환성)

**해결**:
```json
// 1. 새 필드 추가 (가능)
PUT /messages/_mapping
{
  "properties": {
    "new_field": {"type": "keyword"}
  }
}

// 2. 기존 필드 변경 (불가능)
// → Reindex 필요

// 새 인덱스 생성
PUT /messages_v2
{
  "mappings": {
    "properties": {
      "content": {"type": "text", "analyzer": "nori"}
    }
  }
}

// 데이터 복사
POST /_reindex
{
  "source": {"index": "messages"},
  "dest": {"index": "messages_v2"}
}

// 별칭 전환
POST /_aliases
{
  "actions": [
    {"remove": {"index": "messages", "alias": "messages_alias"}},
    {"add": {"index": "messages_v2", "alias": "messages_alias"}}
  ]
}
```

---

## 🔐 보안 문제

### 1. 외부에서 접근 안됨

**원인**: 로컬호스트만 바인딩

**해결**:
```yaml
# docker-compose.yml
environment:
  - network.host=0.0.0.0  # 모든 인터페이스
```

⚠️ **주의**: 프로덕션에서는 방화벽 설정 필수

### 2. 인증 설정 (학습 후)

```yaml
# docker-compose.yml
environment:
  - xpack.security.enabled=true
  - ELASTIC_PASSWORD=your_password
```

---

## 📊 모니터링

### 클러스터 상태 확인

```bash
# 헬스 체크
curl "http://localhost:30200/_cluster/health?pretty"

# 노드 통계
curl "http://localhost:30200/_nodes/stats?pretty"

# 인덱스별 통계
curl "http://localhost:30200/_stats?pretty"
```

### Kibana Monitoring

1. Kibana → Stack Monitoring
2. Elasticsearch 클러스터 선택
3. 노드, 인덱스, 검색 성능 확인

---

## 🆘 긴급 복구

### 모든 데이터 초기화

```bash
# 컨테이너 및 볼륨 삭제
docker-compose down -v

# 재시작
docker-compose up -d
```

### 특정 인덱스만 초기화

```bash
# 인덱스 삭제
curl -X DELETE "http://localhost:30200/messages"

# 재생성
curl -X PUT "http://localhost:30200/messages" -H 'Content-Type: application/json' -d'
{
  "mappings": {...}
}'
```

---

## 📚 유용한 디버깅 쿼리

### 1. 매핑 확인

```json
GET /messages/_mapping
```

### 2. 분석기 테스트

```json
GET /messages/_analyze
{
  "field": "content",
  "text": "Elasticsearch를 공부합니다"
}
```

### 3. Explain API (점수 계산)

```json
GET /messages/_explain/msg_001
{
  "query": {
    "match": {"content": "프로젝트"}
  }
}
```

### 4. Validate API (쿼리 검증)

```json
GET /messages/_validate/query?explain
{
  "query": {
    "match": {"content": "프로젝트"}
  }
}
```

---

## 🔗 추가 리소스

- [Elasticsearch 공식 트러블슈팅](https://www.elastic.co/guide/en/elasticsearch/reference/current/troubleshooting.html)
- [성능 튜닝 가이드](https://www.elastic.co/guide/en/elasticsearch/reference/current/tune-for-search-speed.html)

## 📝 트러블슈팅 체크리스트

문제 발생 시 순서대로 확인:

- [ ] Elasticsearch 컨테이너 실행 중인가? (`docker ps`)
- [ ] 헬스 체크 통과? (`curl localhost:30200/_cluster/health`)
- [ ] 인덱스가 존재하는가? (`GET /_cat/indices`)
- [ ] 매핑이 올바른가? (`GET /인덱스명/_mapping`)
- [ ] 쿼리 문법이 맞는가? (Validate API)
- [ ] 로그 확인 (`docker-compose logs`)
