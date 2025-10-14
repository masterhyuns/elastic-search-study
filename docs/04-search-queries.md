# Elasticsearch 검색 쿼리

> Query DSL을 활용한 강력한 검색 구현

## 🎯 학습 목표

- Query DSL 기본 구조 이해
- Match, Term, Bool 등 핵심 쿼리 마스터
- 협업 플랫폼 검색 시나리오 구현
- Aggregation을 통한 데이터 집계

---

## 📚 Query DSL 기본 구조

```json
GET /messages/_search
{
  "query": {           // 검색 조건
    "쿼리_타입": {
      "필드명": "검색어"
    }
  },
  "size": 10,          // 결과 개수 (기본 10)
  "from": 0,           // 페이지네이션
  "sort": [            // 정렬
    {"created_at": "desc"}
  ],
  "_source": ["필드1", "필드2"],  // 반환할 필드
  "aggs": {}           // 집계 (통계)
}
```

---

## 🔍 기본 검색 쿼리

### 1. match_all (전체 조회)

```json
GET /messages/_search
{
  "query": {
    "match_all": {}
  }
}
```

**활용**: 전체 데이터 확인, 테스트

### 2. match (전문 검색)

```json
GET /messages/_search
{
  "query": {
    "match": {
      "content": "프로젝트 회의"
    }
  }
}
```

**특징**:
- 검색어가 분석됨: "프로젝트 회의" → ["프로젝트", "회의"]
- OR 조건: "프로젝트" **또는** "회의" 포함 문서
- 관련성 점수(_score)로 정렬

**협업 플랫폼 예시**:
```json
// 메시지 내용 검색
GET /messages/_search
{
  "query": {
    "match": {
      "content": "배포 일정"
    }
  }
}
```

### 3. match_phrase (구문 검색)

```json
GET /messages/_search
{
  "query": {
    "match_phrase": {
      "content": "프로젝트 회의"
    }
  }
}
```

**특징**:
- 정확한 순서로 매칭
- "프로젝트 회의" ✅
- "회의 프로젝트" ❌

### 4. term (정확한 매칭)

```json
GET /messages/_search
{
  "query": {
    "term": {
      "author": "홍길동"
    }
  }
}
```

**특징**:
- 분석 안됨 (keyword 필드에 사용)
- 대소문자 구분
- 필터링에 주로 사용

**주의**:
```json
// ❌ text 필드에 term 사용 (예상과 다른 결과)
"term": {"content": "프로젝트"}

// ✅ keyword 필드에 term 사용
"term": {"author.keyword": "홍길동"}
```

### 5. terms (여러 값 중 하나)

```json
GET /messages/_search
{
  "query": {
    "terms": {
      "channel": ["개발팀", "QA", "디자인팀"]
    }
  }
}
```

**활용**: 특정 채널들의 메시지만 조회

---

## 🎨 복합 쿼리 (Bool Query)

**가장 강력하고 자주 사용되는 쿼리**

### 구조

```json
{
  "query": {
    "bool": {
      "must": [],      // AND 조건 (점수 영향 O)
      "filter": [],    // AND 조건 (점수 영향 X, 빠름)
      "should": [],    // OR 조건 (최소 1개 이상)
      "must_not": []   // NOT 조건 (제외)
    }
  }
}
```

### 예제 1: 다중 조건 검색

```json
// "개발팀" 채널에서 "배포" 또는 "릴리스" 포함, "테스트" 제외
GET /messages/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "content": "배포 릴리스"
          }
        }
      ],
      "filter": [
        {
          "term": {
            "channel": "개발팀"
          }
        }
      ],
      "must_not": [
        {
          "match": {
            "content": "테스트"
          }
        }
      ]
    }
  }
}
```

### 예제 2: 날짜 범위 + 필터

```json
// 최근 7일, 고정된 메시지, 좋아요 5개 이상
GET /messages/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "term": {
            "is_pinned": true
          }
        },
        {
          "range": {
            "created_at": {
              "gte": "now-7d/d"
            }
          }
        },
        {
          "range": {
            "likes": {
              "gte": 5
            }
          }
        }
      ]
    }
  }
}
```

### 예제 3: 협업 플랫폼 통합 검색

```json
// "프로젝트" 검색 시: 제목, 내용, 작성자에서 검색
GET /messages/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "content": {
              "query": "프로젝트",
              "boost": 2  // 내용 매칭에 2배 가중치
            }
          }
        },
        {
          "match": {
            "author": "프로젝트"
          }
        },
        {
          "match": {
            "channel": "프로젝트"
          }
        }
      ],
      "minimum_should_match": 1
    }
  }
}
```

---

## 📊 범위 검색 (Range Query)

### 날짜 범위

```json
GET /messages/_search
{
  "query": {
    "range": {
      "created_at": {
        "gte": "2025-10-01",      // 이상
        "lte": "2025-10-31",      // 이하
        "format": "yyyy-MM-dd"
      }
    }
  }
}
```

**날짜 계산식**:
```json
{
  "range": {
    "created_at": {
      "gte": "now-1M/M",  // 지난달 1일
      "lte": "now/M"      // 이번달 1일
    }
  }
}

// now-1d: 어제
// now-7d: 7일 전
// now-1M: 1개월 전
// now/d: 오늘 00:00:00
```

### 숫자 범위

```json
GET /messages/_search
{
  "query": {
    "range": {
      "likes": {
        "gte": 10,
        "lt": 100
      }
    }
  }
}
```

---

## 🔤 고급 텍스트 검색

### 1. multi_match (여러 필드 검색)

```json
GET /messages/_search
{
  "query": {
    "multi_match": {
      "query": "프로젝트",
      "fields": ["content^3", "channel^2", "author"],
      "type": "best_fields"
    }
  }
}
```

**필드 가중치**:
- `content^3`: 3배 중요도
- `channel^2`: 2배 중요도
- `author`: 기본 중요도

### 2. wildcard (와일드카드)

```json
GET /messages/_search
{
  "query": {
    "wildcard": {
      "author.keyword": "홍*"
    }
  }
}

// 홍길동, 홍길순, 홍철수 등 매칭
```

⚠️ **성능 주의**: `*project*` 같은 앞쪽 와일드카드는 느림

### 3. prefix (접두사 검색)

```json
GET /users/_search
{
  "query": {
    "prefix": {
      "username.keyword": "hong"
    }
  }
}
```

**활용**: 자동완성 기능

### 4. fuzzy (오타 허용)

```json
GET /messages/_search
{
  "query": {
    "fuzzy": {
      "content": {
        "value": "프로젝ㅌ",
        "fuzziness": "AUTO"
      }
    }
  }
}

// "프로젝트"도 검색됨 (편집 거리 1-2)
```

---

## 🎯 협업 플랫폼 실전 시나리오

### 시나리오 1: 통합 검색

```json
// 사용자가 "배포"를 검색했을 때
GET /messages/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "content": {
              "query": "배포",
              "boost": 3
            }
          }
        },
        {
          "match": {
            "channel": {
              "query": "배포",
              "boost": 1.5
            }
          }
        }
      ]
    }
  },
  "highlight": {
    "fields": {
      "content": {}
    }
  }
}
```

**하이라이트 결과**:
```json
{
  "hits": [
    {
      "_source": {
        "content": "내일 신규 기능 배포 예정입니다"
      },
      "highlight": {
        "content": ["내일 신규 기능 <em>배포</em> 예정입니다"]
      }
    }
  ]
}
```

### 시나리오 2: 필터링 + 검색

```json
// 개발팀 채널, 최근 30일, "버그" 검색
GET /messages/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "content": "버그"
          }
        }
      ],
      "filter": [
        {
          "term": {
            "channel": "개발팀"
          }
        },
        {
          "range": {
            "created_at": {
              "gte": "now-30d/d"
            }
          }
        }
      ]
    }
  },
  "sort": [
    {"_score": "desc"},
    {"created_at": "desc"}
  ]
}
```

### 시나리오 3: 인기 메시지 추천

```json
// 최근 7일, 좋아요 10개 이상, 고정 메시지 우선
GET /messages/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "created_at": {
              "gte": "now-7d/d"
            }
          }
        },
        {
          "range": {
            "likes": {
              "gte": 10
            }
          }
        }
      ],
      "should": [
        {
          "term": {
            "is_pinned": {
              "value": true,
              "boost": 2
            }
          }
        }
      ]
    }
  },
  "sort": [
    {"likes": "desc"},
    {"created_at": "desc"}
  ]
}
```

---

## 📈 Aggregation (집계)

### 1. 채널별 메시지 개수

```json
GET /messages/_search
{
  "size": 0,  // 문서는 필요 없고 집계만
  "aggs": {
    "channels": {
      "terms": {
        "field": "channel",
        "size": 10
      }
    }
  }
}

// 응답
{
  "aggregations": {
    "channels": {
      "buckets": [
        {"key": "개발팀", "doc_count": 45},
        {"key": "QA", "doc_count": 23},
        {"key": "디자인팀", "doc_count": 18}
      ]
    }
  }
}
```

### 2. 날짜별 메시지 통계

```json
GET /messages/_search
{
  "size": 0,
  "aggs": {
    "messages_over_time": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "day"
      }
    }
  }
}
```

### 3. 좋아요 통계

```json
GET /messages/_search
{
  "size": 0,
  "aggs": {
    "likes_stats": {
      "stats": {
        "field": "likes"
      }
    }
  }
}

// 응답: count, min, max, avg, sum
```

### 4. 중첩 집계 (채널별 평균 좋아요)

```json
GET /messages/_search
{
  "size": 0,
  "aggs": {
    "channels": {
      "terms": {
        "field": "channel"
      },
      "aggs": {
        "avg_likes": {
          "avg": {
            "field": "likes"
          }
        }
      }
    }
  }
}
```

---

---

## 🎓 실전 실습 결과

### Range 쿼리 테스트

#### 1. 날짜 범위 검색 (2025-10-01 ~ 2025-10-10)
```json
GET /messages/_search
{
  "query": {
    "range": {
      "created_at": {
        "gte": "2025-10-01",
        "lte": "2025-10-10"
      }
    }
  },
  "sort": [{"created_at": "asc"}]
}

// 결과: 3건 발견
// - 2025-10-01: 김철수 "오늘 회의가 있습니다"
// - 2025-10-05: 이영희 "어제 배포 완료했습니다"
// - 2025-10-10: 박민수 "다음주 릴리스 준비중"
```

#### 2. 숫자 범위 검색 (좋아요 10~20개)
```json
GET /messages/_search
{
  "query": {
    "range": {
      "likes": {
        "gte": 10,
        "lte": 20
      }
    }
  },
  "sort": [{"likes": "desc"}]
}

// 결과: 4건 발견 (likes: 15, 15, 12, 12)
```

#### 3. 날짜 계산식 (최근 5일)
```json
GET /messages/_search
{
  "query": {
    "range": {
      "created_at": {
        "gte": "now-5d/d"  // 5일 전 00:00:00부터
      }
    }
  }
}

// 결과: 7건 발견
// now/d: 오늘 자정, now-1d: 어제, now-7d: 7일 전
```

### Wildcard 쿼리 테스트

#### 1. 접두사 패턴 (홍*)
```json
GET /messages/_search
{
  "query": {
    "wildcard": {
      "author": "홍*"
    }
  }
}

// 결과: 2건 발견 (홍길동)
// ⚠️ keyword 타입 필드에만 사용 가능
```

#### 2. 중간 패턴 (*수*)
```json
GET /messages/_search
{
  "query": {
    "wildcard": {
      "author": "*수*"
    }
  }
}

// 결과: 3건 발견 (김철수, 박민수, 정수진)
// ⚠️ 앞쪽 와일드카드는 성능 저하 주의
```

#### 3. 접미사 패턴 (*팀)
```json
GET /messages/_search
{
  "query": {
    "wildcard": {
      "channel": "*팀"
    }
  }
}

// 결과: 6건 발견 (개발팀으로 끝나는 채널들)
```

### Fuzzy 쿼리 테스트 (오타 허용)

#### Match 쿼리 + Fuzziness (권장)
```json
GET /messages/_search
{
  "query": {
    "match": {
      "content": {
        "query": "회외",           // 오타
        "fuzziness": "1"          // 편집 거리 1
      }
    }
  },
  "highlight": {
    "fields": {
      "content": {}
    }
  }
}

// 결과: 1건 발견 → "회의" 매칭 ✨
// 하이라이트: "전략 <em>회의</em>"
```

**Fuzziness 값**:
- `"AUTO"`: 단어 길이에 따라 자동 (권장)
  - 1-2 글자: 0 (허용 안함)
  - 3-5 글자: 1
  - 6+ 글자: 2
- `"0"`: 정확한 매칭만
- `"1"`: 편집 거리 1 (문자 1개 차이)
- `"2"`: 편집 거리 2 (문자 2개 차이)

**협업 플랫폼 활용**:
```json
// 사용자가 "프로젝ㅌ" 입력 시 "프로젝트" 검색
GET /messages/_search
{
  "query": {
    "match": {
      "content": {
        "query": "프로젝ㅌ",
        "fuzziness": "AUTO"
      }
    }
  }
}
```

---

## 🧪 실습 과제

### 과제 1: 복합 검색
"개발팀" 또는 "QA" 채널에서 "버그" 포함, 최근 14일 메시지 검색

<details>
<summary>정답 보기</summary>

```json
GET /messages/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "content": "버그"
          }
        }
      ],
      "filter": [
        {
          "terms": {
            "channel": ["개발팀", "QA"]
          }
        },
        {
          "range": {
            "created_at": {
              "gte": "now-14d/d"
            }
          }
        }
      ]
    }
  }
}
```
</details>

### 과제 2: 사용자 활동 분석
"홍길동"이 작성한 메시지 중 좋아요 5개 이상인 메시지 조회

<details>
<summary>정답 보기</summary>

```json
GET /messages/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "term": {
            "author": "홍길동"
          }
        },
        {
          "range": {
            "likes": {
              "gte": 5
            }
          }
        }
      ]
    }
  }
}
```
</details>

### 과제 3: 오타 허용 검색
사용자가 "버그"를 "버긔", "버근" 등으로 입력해도 검색 가능하도록 구현

<details>
<summary>정답 보기</summary>

```json
GET /messages/_search
{
  "query": {
    "match": {
      "content": {
        "query": "버긔",           // 오타 입력
        "fuzziness": "AUTO",      // 자동 오타 허용
        "operator": "and"
      }
    }
  },
  "highlight": {
    "fields": {
      "content": {}
    }
  }
}

// fuzziness를 사용하면 편집 거리 내의 단어도 매칭
// 협업 플랫폼에서 사용자 경험 향상
```
</details>

---

## 🔄 다음 단계

검색 쿼리를 마스터했다면:
- [05-nori-korean-analyzer.md](./05-nori-korean-analyzer.md): 한글 형태소 분석기
- [06-platform-use-cases.md](./06-platform-use-cases.md): 협업 플랫폼 적용

## 📝 체크리스트

- [x] match vs term 차이 이해
- [x] bool 쿼리로 복합 조건 구현
- [x] range 쿼리로 날짜/숫자 필터링
- [x] wildcard로 패턴 매칭 검색
- [x] fuzzy/fuzziness로 오타 허용 검색
- [x] multi_match로 여러 필드 검색
- [x] aggregation으로 통계 집계
- [x] 협업 플랫폼 검색 시나리오 구현
