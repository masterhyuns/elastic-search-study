# Elasticsearch 기본 개념

> 협업 플랫폼 개발자를 위한 Elasticsearch 핵심 개념 정리

## 🎯 Elasticsearch란?

**분산형 검색 및 분석 엔진**
- RESTful API 기반
- JSON 문서 저장
- 실시간 검색
- 수평 확장(Scale-out) 가능

### 일반 DB vs Elasticsearch

| 특성 | RDBMS | Elasticsearch |
|------|-------|---------------|
| 데이터 구조 | Table → Row → Column | Index → Document → Field |
| 스키마 | 엄격한 스키마 | 유연한 매핑 |
| 검색 방식 | LIKE '%keyword%' (느림) | Inverted Index (빠름) |
| 주 용도 | 트랜잭션 처리 | 전문 검색 |
| 조인 | 강력한 조인 | 조인 지원 약함 |

## 📚 핵심 용어

### 1. Index (인덱스)
- **RDBMS의 Database와 유사**
- 관련 문서들의 모음
- 예: `messages`, `users`, `projects`

```json
// 인덱스 생성 예시
PUT /messages
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 1
  }
}
```

### 2. Document (문서)
- **RDBMS의 Row와 유사**
- JSON 형식의 데이터
- 고유한 `_id` 보유

```json
// 문서 예시
{
  "_id": "msg_001",
  "content": "프로젝트 일정 논의 필요",
  "author": "홍길동",
  "channel": "개발팀",
  "created_at": "2025-10-13T10:30:00Z"
}
```

### 3. Field (필드)
- **RDBMS의 Column과 유사**
- 문서 내의 개별 속성
- 타입 지정 가능 (text, keyword, date, integer 등)

### 4. Mapping (매핑)
- **RDBMS의 Schema와 유사**
- 각 필드의 타입과 분석 방법 정의

```json
// 매핑 예시
PUT /messages/_mapping
{
  "properties": {
    "content": { "type": "text", "analyzer": "nori" },
    "author": { "type": "keyword" },
    "created_at": { "type": "date" }
  }
}
```

## 🔍 Inverted Index (역인덱스)

**Elasticsearch가 빠른 핵심 이유**

### 일반 검색 (선형 탐색)
```
문서1: "Elasticsearch는 빠르다"
문서2: "검색 엔진 비교"
문서3: "Elasticsearch 설치 방법"

"Elasticsearch" 검색 → 모든 문서 순회 (느림)
```

### Inverted Index 방식
```
Term           | Document IDs
---------------|-------------
elasticsearch  | [1, 3]
빠르다         | [1]
검색           | [2]
엔진           | [2]
비교           | [2]
설치           | [3]
방법           | [3]

"elasticsearch" 검색 → 즉시 [1, 3] 반환 (빠름)
```

## 🔤 Analyzer (분석기)

**텍스트를 검색 가능한 토큰으로 변환**

### Analyzer 구성 요소
1. **Character Filter**: 특수문자 제거 (`<html>` → ``)
2. **Tokenizer**: 단어 분리 (`"hello world"` → `["hello", "world"]`)
3. **Token Filter**: 소문자 변환, 불용어 제거 등

### 한글 처리의 중요성
```
텍스트: "Elasticsearch를 공부합니다"

Standard Analyzer (기본):
→ ["elasticsearch를", "공부합니다"]  ❌ 조사 포함, 검색 어려움

Nori Analyzer (한글 형태소):
→ ["elasticsearch", "공부", "하다"]  ✅ 의미 단위 분리
```

## 🎨 Field 타입

### Text vs Keyword
```json
{
  "title": {
    "type": "text",        // 전문 검색용 (분석됨)
    "fields": {
      "keyword": {
        "type": "keyword"  // 정렬/집계용 (분석 안됨)
      }
    }
  }
}
```

| 타입 | 분석 | 용도 | 예시 |
|------|------|------|------|
| text | O | 전문 검색 | 메시지 내용, 문서 본문 |
| keyword | X | 필터/정렬/집계 | 사용자 ID, 태그, 상태값 |
| date | X | 날짜 범위 검색 | 생성일, 수정일 |
| integer/long | X | 숫자 범위 검색 | 조회수, 좋아요 수 |
| boolean | X | 참/거짓 필터 | 공개 여부, 완료 상태 |

## 🏗️ 아키텍처 개념

### Cluster (클러스터)
- 하나 이상의 노드로 구성
- 데이터를 저장하고 검색 기능 제공

### Node (노드)
- 클러스터의 단일 서버
- 데이터 저장 및 검색 작업 수행

### Shard (샤드)
- 인덱스를 여러 조각으로 분할
- 수평 확장을 위한 메커니즘
- Primary Shard: 원본 데이터
- Replica Shard: 백업 데이터 (고가용성)

```
Index: messages (1GB)
├── Shard 0 (Primary): 500MB → Node 1
│   └── Shard 0 (Replica): 500MB → Node 2
└── Shard 1 (Primary): 500MB → Node 2
    └── Shard 1 (Replica): 500MB → Node 1
```

## 📊 협업 플랫폼 적용 관점

### 검색 시나리오별 설계

#### 1. 메시지 전문 검색
```
필드: content (text, nori analyzer)
쿼리: match query
특징: 형태소 분석으로 "공부하다" 검색 시 "공부합니다", "공부했어요" 매칭
```

#### 2. 사용자명 자동완성
```
필드: username (keyword + completion)
쿼리: prefix query 또는 completion suggester
특징: "홍길" 입력 시 "홍길동", "홍길순" 제안
```

#### 3. 다중 조건 필터링
```
조건: 채널 = "개발팀" AND 날짜 >= "2025-10-01" AND 작성자 IN ["홍길동", "김철수"]
쿼리: bool query (must, filter, should)
```

## 🔄 다음 단계

- [02-setup-guide.md](./02-setup-guide.md): 실제 환경 구축
- [03-crud-operations.md](./03-crud-operations.md): 기본 작업 실습

## 📝 학습 체크리스트

- [ ] Inverted Index 개념 이해
- [ ] Mapping의 중요성 이해
- [ ] Text vs Keyword 차이점 이해
- [ ] Analyzer의 역할 이해
- [ ] Shard와 Replica 개념 이해
