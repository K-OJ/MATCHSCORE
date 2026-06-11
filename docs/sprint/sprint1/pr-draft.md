# PR 초안: Sprint 1 완료 -- MatchScore MVP 전체 구현

> 원격 저장소 설정 후 아래 내용으로 PR을 생성하세요.
> `gh pr create --base develop --head sprint1 --title "feat: Sprint 1 완료 - MatchScore MVP 전체 구현"`

---

## 제목

`feat: Sprint 1 완료 - MatchScore MVP 전체 구현`

## 베이스 브랜치

`sprint1` → `develop`

## 스프린트 목표 및 구현 내용 요약

2026 FIFA 월드컵 스코어 예측 내기 보드판 웹앱의 MVP 전체 기능을 1회 스프린트에서 완성했습니다.

### 구현된 기능

| 작업 | 내용 |
|------|------|
| T1 | `docker-compose.yml` -- backend / frontend / SQLite 볼륨 구성 |
| T2 | FastAPI 앱 초기화, React + Vite + Tailwind CSS 프로젝트 구조 세팅 |
| T3 | SQLAlchemy 모델 정의 (Room, Participant, Match, Prediction), SQLite WAL 모드 |
| T4 | 방 생성/입장 API (`POST /api/v1/rooms`, `POST /api/v1/rooms/{code}/join`) -- 6자리 코드, 이름 기반 재접속 |
| T5 | 경기 목록 API -- 조별리그 시드 데이터 + 토너먼트 수동 추가 |
| T6 | 예측 입력/수정 API (`POST /api/v1/rooms/{code}/predictions`) |
| T7 | 결과 정산 API -- 독식 / N분의1 / 이월 3가지 로직 |
| T8 | pytest 통합 테스트 15개 전체 통과 |
| T9~T13 | React 보드 화면 -- 예측 입력, 상금 배너, 참가자 현황, 순위 테이블 |

### 기술 검증 결과

- pytest 15개 전체 통과
- TypeScript 빌드 성공

## 주요 변경 파일 목록

### 백엔드
- `app/backend/main.py` -- FastAPI 앱 진입점
- `app/backend/models.py` -- SQLAlchemy ORM 모델
- `app/backend/schemas.py` -- Pydantic 스키마
- `app/backend/database.py` -- DB 초기화 및 세션 관리
- `app/backend/routers/rooms.py` -- 방 생성/입장 API
- `app/backend/routers/matches.py` -- 경기 목록 API
- `app/backend/routers/predictions.py` -- 예측 API
- `app/backend/routers/results.py` -- 결과 정산 API
- `app/backend/tests/test_rooms.py` -- 방 관련 테스트
- `app/backend/tests/test_predictions.py` -- 예측 관련 테스트
- `app/backend/tests/test_results.py` -- 정산 로직 테스트
- `app/backend/requirements.txt`

### 프론트엔드
- `app/frontend/src/App.tsx` -- 라우팅 루트
- `app/frontend/src/pages/HomePage.tsx` -- 방 생성/입장 화면
- `app/frontend/src/pages/BoardPage.tsx` -- 보드/예측/순위 화면
- `app/frontend/src/components/MatchCard.tsx` -- 경기별 예측 카드
- `app/frontend/src/components/PrizeBanner.tsx` -- 상금 배너
- `app/frontend/src/api/client.ts` -- Axios 클라이언트
- `app/frontend/src/api/rooms.ts` -- API 추상화 레이어
- `app/frontend/src/types/index.ts` -- 공유 타입 정의

### 인프라
- `docker-compose.yml`
- `app/backend/Dockerfile`
- `app/frontend/Dockerfile`
- `app/frontend/nginx.conf`

## 코드 리뷰 및 검증 안내

코드 리뷰 및 자동 검증은 **sprint-review 에이전트**가 담당합니다.
원격 저장소 설정 후 PR 생성 시 sprint-review 에이전트로 리뷰를 진행하세요.
