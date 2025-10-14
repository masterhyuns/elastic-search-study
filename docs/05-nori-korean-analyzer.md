# Nori 한글 형태소 분석기

> 한국어 검색 품질 향상을 위한 필수 플러그인

## 🎯 학습 목표

- Nori 플러그인 설치 및 설정
- 한글 형태소 분석 원리 이해
- Standard vs Nori 검색 품질 비교
- 실전 협업 플랫폼 적용

---

## 🤔 왜 Nori가 필요한가?

### 문제 상황: Standard Analyzer의 한계

```
저장된 텍스트: "Elasticsearch를 공부합니다"

Standard Analyzer 분석 결과:
→ ["elasticsearch를", "공부합니다"]

검색 시도:
- "공부" 검색 → ❌ 0건 (매칭 안됨)
- "공부합니다" 검색 → ✅ 1건 (정확히 일치)
```

**문제점**:
- 조사("를", "을", "는")가 붙은 채로 저장
- 어미("합니다", "했어요")가 붙은 채로 저장
- 사용자가 정확한 형태로 입력해야만 검색됨

### 해결책: Nori Analyzer

```
저장된 텍스트: "Elasticsearch를 공부합니다"

Nori Analyzer 분석 결과:
→ ["elasticsearch", "공부"]

검색 시도:
- "공부" 검색 → ✅ 1건 (매칭됨!)
- "공부합니다" 검색 → ✅ 1건 (어간 추출)
- "공부했어요" 검색 → ✅ 1건 (어간이 같음)
```

---

## 🔧 Nori 플러그인 설치

### 1. 설치 확인

```bash
# 현재 설치된 플러그인 확인
curl "http://localhost:30200/_cat/plugins?v"

# 예상 결과 (설치 전):
# name       component     version
# (빈 결과)
```

### 2. 플러그인 설치

```bash
# Docker 컨테이너에 Nori 설치
docker exec local-elasticsearch bin/elasticsearch-plugin install analysis-nori -b

# 출력:
# -> Installing analysis-nori
# -> Downloading analysis-nori from elastic
# -> Installed analysis-nori
# -> Please restart Elasticsearch to activate any plugins installed
```

### 3. Elasticsearch 재시작

```bash
# Docker Compose 재시작
docker-compose restart elasticsearch

# 30초 정도 대기 (초기화 시간)
sleep 30

# 설치 확인
curl "http://localhost:30200/_cat/plugins?v"

# 예상 결과:
# name       component     version
# es-node-01 analysis-nori 8.11.0
```

---

## 🔬 Nori 동작 원리

### 형태소 분석이란?

**형태소**: 의미를 가진 가장 작은 단위

```
"공부합니다" 형태소 분석:
├─ "공부" (명사) - 의미를 가진 어간
└─ "합니다" (어미) - 문법적 기능
   ├─ "하" (동사 어간)
   ├─ "ㅂ니다" (어말 어미)
```

### Nori의 토큰화 과정

```
입력: "Elasticsearch를 열심히 공부합니다"
↓
1. 품사 분석
├─ "Elasticsearch" → 영문 (SL)
├─ "를" → 조사 (JKO)
├─ "열심히" → 부사 (MAG)
├─ "공부" → 명사 (NNG)
└─ "합니다" → 동사 (XSV+EP+EF)
↓
2. 불용 품사 제거 (조사, 어미 등)
├─ "를" 제거
└─ "합니다" 제거
↓
3. 토큰 생성
→ ["elasticsearch", "열심히", "공부"]
```

---

## 🧪 실전 비교 테스트

### 테스트 1: 인덱스 생성

```bash
# Standard Analyzer 인덱스
PUT /messages_standard
{
  "mappings": {
    "properties": {
      "content": {"type": "text", "analyzer": "standard"}
    }
  }
}

# Nori Analyzer 인덱스
PUT /messages_korean
{
  "settings": {
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
      "content": {"type": "text", "analyzer": "korean"}
    }
  }
}
```

### 테스트 2: 같은 데이터 추가

```bash
# Standard 인덱스에 추가
POST /messages_standard/_doc/1
{
  "content": "Elasticsearch를 공부합니다"
}

# Nori 인덱스에 추가
POST /messages_korean/_doc/1
{
  "content": "Elasticsearch를 공부합니다"
}
```

### 테스트 3: 검색 비교

```bash
# Standard: "공부" 검색
GET /messages_standard/_search
{
  "query": {
    "match": {"content": "공부"}
  }
}
# 결과: total = 0 ❌

# Nori: "공부" 검색
GET /messages_korean/_search
{
  "query": {
    "match": {"content": "공부"}
  }
}
# 결과: total = 1 ✅
```

### 테스트 4: 분석기 직접 확인

```bash
# Standard Analyzer 테스트
POST /_analyze
{
  "analyzer": "standard",
  "text": "Elasticsearch를 공부합니다"
}
# 결과:
# ["elasticsearch를", "공부합니다"]

# Nori Analyzer 테스트
POST /_analyze
{
  "analyzer": "nori",
  "text": "Elasticsearch를 공부합니다"
}
# 결과:
# ["elasticsearch", "공부"]
```

---

## 🎨 Nori 설정 옵션

### 1. decompound_mode (복합명사 처리)

한글의 복합명사를 어떻게 처리할지 결정

```bash
PUT /test-nori-modes
{
  "settings": {
    "analysis": {
      "analyzer": {
        "nori_none": {
          "type": "nori",
          "decompound_mode": "none"      # 분해 안함
        },
        "nori_discard": {
          "type": "nori",
          "decompound_mode": "discard"   # 분해만 (원본 버림)
        },
        "nori_mixed": {
          "type": "nori",
          "decompound_mode": "mixed"     # 원본 + 분해 (기본값)
        }
      }
    }
  }
}
```

**테스트**:
```bash
# "백엔드개발자" 분석
POST /test-nori-modes/_analyze
{
  "analyzer": "nori_none",
  "text": "백엔드개발자"
}
# 결과: ["백엔드개발자"]

POST /test-nori-modes/_analyze
{
  "analyzer": "nori_discard",
  "text": "백엔드개발자"
}
# 결과: ["백엔드", "개발자"]

POST /test-nori-modes/_analyze
{
  "analyzer": "nori_mixed",
  "text": "백엔드개발자"
}
# 결과: ["백엔드개발자", "백엔드", "개발자"]
```

**권장**: `mixed` (기본값)
- "백엔드개발자" 검색 → 완전 매칭
- "백엔드" 검색 → 부분 매칭
- "개발자" 검색 → 부분 매칭

### 2. user_dictionary (사용자 사전)

회사/도메인 특화 용어 정의

```bash
PUT /messages_custom
{
  "settings": {
    "analysis": {
      "tokenizer": {
        "nori_user_dict": {
          "type": "nori_tokenizer",
          "decompound_mode": "mixed",
          "user_dictionary_rules": [
            "Elasticsearch",
            "Kibana",
            "Docker Compose",
            "협업플랫폼"
          ]
        }
      },
      "analyzer": {
        "korean_custom": {
          "type": "custom",
          "tokenizer": "nori_user_dict"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "content": {"type": "text", "analyzer": "korean_custom"}
    }
  }
}
```

### 3. stoptags (제외 품사)

특정 품사를 토큰에서 제외

```bash
PUT /messages_filtered
{
  "settings": {
    "analysis": {
      "analyzer": {
        "korean_filtered": {
          "type": "nori",
          "stoptags": [
            "E",   # 어미
            "IC",  # 감탄사
            "J",   # 조사
            "MAG", # 일반 부사
            "MAJ", # 접속 부사
            "MM",  # 관형사
            "SP",  # 공백
            "SSC", # 닫는 괄호
            "SSO", # 여는 괄호
            "SC",  # 구분자
            "SE",  # 줄임표
            "XPN", # 접두사
            "XSA", # 형용사 파생 접미사
            "XSN", # 명사 파생 접미사
            "XSV", # 동사 파생 접미사
            "UNA", # 분석 불능
            "NA",  # 분석 불능
            "VSV"  # 동사
          ]
        }
      }
    }
  }
}
```

---

## 🚀 협업 플랫폼 적용

### 기존 messages 인덱스 개선

**문제점**:
```bash
# 현재 messages 인덱스
GET /messages/_mapping

# content 필드가 standard analyzer 사용 (또는 기본 설정)
# → 한글 검색 품질 낮음
```

**해결 방법**: Reindex로 마이그레이션

#### Step 1: 새 인덱스 생성 (Nori 적용)

```bash
PUT /messages_v2
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
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
        "analyzer": "korean",               # Nori 분석기
        "fields": {
          "keyword": {"type": "keyword"}    # 정렬/집계용
        }
      },
      "author": {"type": "keyword"},
      "channel": {"type": "keyword"},
      "created_at": {"type": "date"},
      "is_pinned": {"type": "boolean"},
      "likes": {"type": "integer"}
    }
  }
}
```

#### Step 2: 데이터 이관

```bash
# 기존 데이터 복사
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

#### Step 3: 별칭으로 무중단 전환

```bash
# 별칭 생성 (애플리케이션은 별칭 사용)
POST /_aliases
{
  "actions": [
    {"add": {"index": "messages_v2", "alias": "messages_current"}}
  ]
}

# 이후 애플리케이션에서는 "messages_current" 사용
GET /messages_current/_search
{
  "query": {
    "match": {"content": "공부"}  # ✅ 이제 잘 검색됨!
  }
}
```

#### Step 4: 검증 및 구 인덱스 삭제

```bash
# 충분한 검증 후
DELETE /messages
```

---

## 📊 검색 품질 비교표

| 검색 시나리오 | Standard | Nori | 설명 |
|--------------|---------|------|------|
| "공부" → "공부합니다" | ❌ | ✅ | 어간 추출 |
| "배포했습니다" → "배포" | ❌ | ✅ | 어간 추출 |
| "Elasticsearch를" → "elasticsearch" | ❌ | ✅ | 조사 제거 |
| "열심히 공부" → "공부" | ❌ | ✅ | 복합 검색 |
| "프로젝트관리" → "관리" | ❌ | ✅ | 복합명사 분해 |

---

## 🎓 실전 과제

### 과제 1: Nori 설치 및 확인

```bash
# 1. Nori 설치
docker exec local-elasticsearch bin/elasticsearch-plugin install analysis-nori -b

# 2. 재시작
docker-compose restart elasticsearch

# 3. 확인
curl "http://localhost:30200/_cat/plugins?v"
```

### 과제 2: 분석 결과 비교

```bash
# 다양한 한글 문장으로 테스트
POST /_analyze
{
  "analyzer": "nori",
  "text": "협업 플랫폼을 개발하고 있습니다"
}

# 어떤 토큰들이 생성되었나요?
```

### 과제 3: users 인덱스에 Nori 적용

```bash
# full_name, bio 필드에 Nori 적용
PUT /users_v2
{
  "settings": {
    "analysis": {
      "analyzer": {
        "korean": {"type": "nori"}
      }
    }
  },
  "mappings": {
    "properties": {
      "full_name": {"type": "text", "analyzer": "korean"},
      "bio": {"type": "text", "analyzer": "korean"},
      "username": {"type": "keyword"},
      "email": {"type": "keyword"}
    }
  }
}
```

### 과제 4: 검색 품질 테스트

```bash
# 데이터 추가
POST /users_v2/_doc/1
{
  "full_name": "김철수",
  "bio": "백엔드 개발을 담당하고 있습니다"
}

# 검색 테스트
GET /users_v2/_search
{
  "query": {
    "match": {"bio": "개발"}  # "개발을", "개발자" 등 모두 매칭
  }
}
```

---

## 💡 Nori 사용 팁

### 1. 언제 Nori를 사용할까?

**✅ 사용해야 하는 경우**:
- 한글 텍스트 전문 검색
- 사용자 입력 검색 (다양한 형태)
- 메시지, 문서, 댓글 내용

**❌ 사용하지 않는 경우**:
- 정확한 매칭이 필요한 필드 (이름, 코드)
- 영어만 있는 필드
- keyword 타입 필드

### 2. 성능 고려사항

```
Nori 분석 비용:
- 토큰화 시간: Standard보다 약간 느림 (무시할 수준)
- 인덱스 크기: 토큰 수 증가로 약간 커짐
- 검색 속도: 거의 동일

결론: 한글 검색 품질 향상 >> 미미한 성능 영향
```

### 3. 디버깅 방법

```bash
# 특정 필드의 분석기 확인
GET /messages_korean/_mapping

# 특정 텍스트가 어떻게 분석되는지 확인
GET /messages_korean/_analyze
{
  "field": "content",
  "text": "디버깅할 텍스트"
}

# 검색이 왜 안되는지 확인
GET /messages_korean/_validate/query?explain
{
  "query": {
    "match": {"content": "검색어"}
  }
}
```

---

## 🔄 다음 단계

- [06-platform-use-cases.md](./06-platform-use-cases.md): 협업 플랫폼 실전 시나리오
- [03-2-practical-exercises.md](./03-2-practical-exercises.md): 과제 13-15 (자동완성, 오타 검색)

---

## 📝 체크리스트

- [ ] Nori 플러그인 설치 완료
- [ ] Standard vs Nori 차이 이해
- [ ] messages 인덱스에 Nori 적용
- [ ] users 인덱스에 Nori 적용
- [ ] 검색 품질 개선 확인
- [ ] decompound_mode 옵션 이해
- [ ] Reindex로 무중단 마이그레이션 이해

---

## 🎯 핵심 요약

```bash
# Nori = 한국어 검색의 게임 체인저

설치:
docker exec local-elasticsearch bin/elasticsearch-plugin install analysis-nori -b

적용:
{
  "settings": {
    "analysis": {
      "analyzer": {
        "korean": {"type": "nori"}
      }
    }
  },
  "mappings": {
    "properties": {
      "content": {"type": "text", "analyzer": "korean"}
    }
  }
}

결과:
"공부합니다" → ["공부"]
"개발했어요" → ["개발"]
"프로젝트를" → ["프로젝트"]

→ 사용자 경험 대폭 향상! 🚀
```
