# Elasticsearch 로컬 환경 구축

> Docker Compose를 사용한 학습 환경 세팅

## 🎯 구성 요소

- **Elasticsearch 8.11.0**: 검색 엔진
- **Kibana 8.11.0**: 시각화 및 관리 도구
- **Docker Compose**: 컨테이너 오케스트레이션

## 📦 사전 요구사항

```bash
# Docker 설치 확인
docker --version
docker-compose --version
```

## 🚀 실행 방법

### 1. Docker Compose 실행

```bash
# 백그라운드로 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 컨테이너 상태 확인
docker-compose ps
```

### 2. Elasticsearch 헬스체크

```bash
# 클러스터 상태 확인 (30초 정도 대기 후)
curl http://localhost:30200

# 응답 예시
{
  "name" : "es-node-01",
  "cluster_name" : "es-learning-cluster",
  "cluster_uuid" : "...",
  "version" : {
    "number" : "8.11.0",
    ...
  },
  "tagline" : "You Know, for Search"
}
```

```bash
# 클러스터 헬스 확인
curl http://localhost:30200/_cluster/health?pretty

# 응답 예시
{
  "cluster_name" : "es-learning-cluster",
  "status" : "yellow",  # 단일 노드는 yellow가 정상
  "number_of_nodes" : 1,
  ...
}
```

### 3. Kibana 접속

브라우저에서 접속: http://localhost:30601

**Dev Tools 사용법**
1. 좌측 메뉴 → Management → Dev Tools
2. 콘솔에서 쿼리 실행

```
# 첫 번째 테스트 쿼리
GET /
```

## 🔧 설정 설명

### docker-compose.yml 주요 설정

```yaml
# Elasticsearch 메모리 설정
ES_JAVA_OPTS=-Xms512m -Xmx512m
# 최소/최대 힙 크기: 512MB (학습용)
# 프로덕션: 최소 2GB 이상 권장

# 보안 설정
xpack.security.enabled=false
# 학습 편의를 위해 비활성화
# 프로덕션: 반드시 활성화 필요

# 디스커버리 모드
discovery.type=single-node
# 단일 노드 모드 (클러스터 구성 불필요)
```

### 포트 매핑

| 서비스 | 내부 포트 | 외부 포트 | 용도 |
|--------|-----------|-----------|------|
| Elasticsearch | 9200 | 30200 | REST API |
| Elasticsearch | 9300 | 30300 | 노드 간 통신 |
| Kibana | 5601 | 30601 | 웹 UI |

## 🧪 동작 확인 테스트

### 1. 인덱스 생성 테스트

```bash
# 테스트 인덱스 생성
curl -X PUT "http://localhost:30200/test-index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}'

# 생성 확인
curl "http://localhost:30200/_cat/indices?v"
```

### 2. 문서 추가 테스트

```bash
# 문서 추가
curl -X POST "http://localhost:30200/test-index/_doc/1" -H 'Content-Type: application/json' -d'
{
  "message": "Hello Elasticsearch",
  "timestamp": "2025-10-13T10:00:00Z"
}'

# 문서 조회
curl "http://localhost:30200/test-index/_doc/1?pretty"
```

### 3. 검색 테스트

```bash
# 전체 문서 검색
curl "http://localhost:30200/test-index/_search?pretty"
```

## 🛠️ 유용한 명령어

### Docker 관리

```bash
# 서비스 중지
docker-compose down

# 데이터 포함 완전 삭제
docker-compose down -v

# 서비스 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart elasticsearch

# 로그 확인 (실시간)
docker-compose logs -f elasticsearch
```

### Elasticsearch 관리

```bash
# 모든 인덱스 목록
curl "http://localhost:30200/_cat/indices?v"

# 클러스터 노드 정보
curl "http://localhost:30200/_cat/nodes?v"

# 인덱스 삭제
curl -X DELETE "http://localhost:30200/test-index"
```

## ⚠️ 문제 해결

### 1. Elasticsearch 시작 실패

**증상**: 컨테이너가 계속 재시작됨

```bash
# 로그 확인
docker-compose logs elasticsearch
```

**해결 방법**:
- 메모리 부족: Docker Desktop 메모리 설정 증가 (최소 4GB)
- 포트 충돌: 30200/30300/30601 포트가 사용 중인지 확인

```bash
# 포트 사용 확인 (macOS/Linux)
lsof -i :30200

# 포트 사용 프로세스 종료
kill -9 <PID>
```

### 2. Kibana 접속 안됨

**증상**: http://localhost:30601 접속 불가

**해결 방법**:
```bash
# Kibana 로그 확인
docker-compose logs kibana

# Elasticsearch 연결 확인
curl http://localhost:30200
```

### 3. vm.max_map_count 오류 (Linux)

**증상**: `max virtual memory areas vm.max_map_count [65530] is too low`

**해결 방법**:
```bash
# 임시 설정 (재부팅 시 초기화)
sudo sysctl -w vm.max_map_count=262144

# 영구 설정
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 📊 리소스 모니터링

### Docker 리소스 사용량 확인

```bash
# 실시간 모니터링
docker stats

# 결과 예시
CONTAINER ID   NAME                  CPU %   MEM USAGE / LIMIT
abc123         local-elasticsearch   15%     800MB / 2GB
def456         local-kibana          5%      400MB / 2GB
```

### Elasticsearch 내부 통계

```bash
# 노드 통계
curl "http://localhost:30200/_nodes/stats?pretty"

# 인덱스별 통계
curl "http://localhost:30200/_stats?pretty"
```

## 🔄 다음 단계

환경 구축이 완료되었으면 다음 문서로 이동:
- [03-crud-operations.md](./03-crud-operations.md): 기본 CRUD 작업 실습

## 📝 체크리스트

- [ ] Docker Compose 실행 성공
- [ ] Elasticsearch 헬스체크 통과 (http://localhost:30200)
- [ ] Kibana 접속 성공 (http://localhost:30601)
- [ ] Dev Tools에서 쿼리 실행 성공
- [ ] 테스트 인덱스 생성 및 문서 추가 성공
