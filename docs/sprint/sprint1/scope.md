---
Sprint: 1  |  Date: 2026-06-11  |  Session: #1
---

## 이번 세션에서 수정할 파일
<!-- 수정 횟수가 [3회 ⚠️]에 도달하면 loop-detection 스킬 즉시 실행 -->
| 파일 | 수정 횟수 | 비고 |
|------|---------|------|
| docker-compose.yml | [1회] | T1: backend/frontend/sqlite 서비스 정의 |
| app/backend/Dockerfile | [2회] | T1: 백엔드 컨테이너 빌드 |
| app/frontend/Dockerfile | [0회] | T1: 프론트엔드 컨테이너 빌드 |
| app/backend/main.py | [1회] | T2: FastAPI 앱 초기화 |
| app/backend/requirements.txt | [0회] | T2: 의존성 (fastapi, sqlalchemy 등) |
| app/backend/routers/ | [0회] | T4~T7: API 라우터 |
| app/backend/models.py | [1회] | T3: SQLAlchemy 모델 |
| app/backend/schemas.py | [1회] | T3: Pydantic 스키마 |
| app/backend/database.py | [1회] | T3: DB 초기화 |
| app/backend/tests/ | [0회] | T8: pytest 테스트 |
| app/frontend/src/ | [0회] | T9~T13: React 컴포넌트 및 API 클라이언트 |
| app/frontend/package.json | [1회] | T2: 프론트엔드 의존성 |

## 수정하지 않을 파일 (Forbidden Areas 포함)
- ⬜ .github/workflows/ — CI/CD 파이프라인 (hook이 차단)
- ⬜ SETUP.sh — 초기화 스크립트 (hook이 차단)
- ⬜ CLAUDE.md — 프로젝트 지침
- ⬜ ARCHITECTURE.md — 아키텍처 문서

## 완료 기준 (이번 세션)
- ⬜ T1: docker-compose.yml 작성 완료
- ⬜ T2: FastAPI + React 기본 구조 세팅
- ⬜ T3: DB 모델 및 스키마 정의
- ⬜ T4: 방 API 구현
- ⬜ T5: 경기 데이터 API 구현
- ⬜ T6: 예측 API 구현
- ⬜ T7: 결과 입력 및 정산 API 구현
- ⬜ T8: 백엔드 테스트 작성
- ⬜ T9: 메인 페이지 및 방 입장 UI
- ⬜ T10: 보드 화면 UI
- ⬜ T11: 스코어 예측 입력 UI
- ⬜ T12: 방장 관리 UI
- ⬜ T13: API 클라이언트 레이어
