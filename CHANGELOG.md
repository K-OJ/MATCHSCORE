# CHANGELOG

이 파일은 프로젝트의 버전별 변경 이력을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

---

## 작성 규칙

### 카테고리

| 카테고리 | 설명 |
|----------|------|
| `Added` | 새로운 기능 추가 |
| `Changed` | 기존 기능 변경 |
| `Deprecated` | 곧 제거될 기능 예고 (하위 호환성 안내) |
| `Removed` | 기능 제거 |
| `Fixed` | 버그 수정 |
| `Security` | 보안 취약점 수정 |

### Semantic Versioning 올림 기준

| 버전 | 트리거 |
|------|--------|
| `MAJOR` | 하위 호환 불가 변경 — API 브레이킹 체인지, DB 구조 대규모 변경 |
| `MINOR` | 하위 호환 신규 기능 추가 — 새 엔드포인트, 새 UI 기능 |
| `PATCH` | 버그 수정, 핫픽스, 문서 수정 |

### [Unreleased] 운영 방법

- **채우는 시점**: PR merge 시마다 해당 카테고리에 항목 추가
- **버전 전환 시점**: `deploy-prod` agent가 main 배포 시 `[Unreleased]` → `[x.y.z] - YYYY-MM-DD`로 전환
- **새 버전은 항상 최상단에 추가**

---

## [Unreleased]

### Added
- 방 생성 API -- 6자리 코드 자동 생성, 베팅 금액 설정 (`POST /api/v1/rooms`)
- 방 입장 API -- 이름 기반 참가자 등록 및 재접속 지원 (`POST /api/v1/rooms/{code}/join`)
- 경기 목록 API -- 대한민국 2026 월드컵 조별리그 시드 데이터 + 토너먼트 수동 추가 (`GET /api/v1/rooms/{code}/matches`)
- 스코어 예측 입력/수정 API (`POST /api/v1/rooms/{code}/predictions`)
- 결과 정산 API -- 정확 스코어 독식 / 다수 적중 N분의1 / 미적중 이월 로직 (`POST /api/v1/rooms/{code}/matches/{id}/result`)
- 정산 현황 API -- 참가자별 누적 상금 조회 (`GET /api/v1/rooms/{code}/standings`)
- React 보드 화면 -- 방 생성/입장 홈, 경기별 예측 입력 카드, 총 상금 배너, 참가자 현황 테이블, 순위 화면
- API 클라이언트 추상화 레이어 (`app/frontend/src/api/`)
- SQLAlchemy ORM 모델 -- Room, Participant, Match, Prediction (SQLite WAL 모드)
- Docker Compose 구성 -- backend / frontend / SQLite 볼륨 마운트
- pytest 통합 테스트 15개 (방 CRUD, 예측 입력, 정산 로직)
- 프로젝트 초기 템플릿 설정
- Claude Code 에이전트 정의 (sprint-planner, sprint-close, hotfix-close, deploy-prod, prd-to-roadmap)
- CI/CD 파이프라인 (GitHub Actions)
- 개발 프로세스 문서 (`docs/dev-process.md`)
- CI/CD 정책 문서 (`docs/ci-policy.md`)
- 전략 지침 문서 (`strategy/`)

---

## 참고

- 로드맵 연계: `ROADMAP.md` (Phase/Sprint 상태와 버전 연결)
- Notion 업데이트 트리거: `docs/dev-process.md` 섹션 8.5
