# Sprint Planner 메모리

이 파일은 sprint-planner 에이전트의 영구 메모리입니다.
프로젝트 진행 상황, 기술 스택, 패턴 등을 기록합니다.

## 스프린트 현황

<!-- sprint-close 완료 시 업데이트 -->
- 마지막 완료 스프린트: Sprint 1 (2026-06-11)
- 다음 스프린트 번호: 2

## 반복 위반 패턴 (세션 로그 기반)

<!-- session-summary.md에서 3회 이상 반복 패턴 발생 시 여기에 기록 -->
<!-- 형식: - [YYYY-MM-DD] {패턴}: {파일 또는 규칙} -> 스프린트 계획 시 주의 -->

## 기술 스택 및 프로젝트 특이사항

- **프로젝트명**: MatchScore -- 월드컵 스코어 맞추기 내기 보드판
- **기술 스택**: FastAPI + SQLite(WAL) + React(Vite) + Tailwind CSS
- **인증**: 없음 (이름 기반 식별)
- **DB**: SQLite (PostgreSQL/Redis 불사용 -- CLAUDE.md 템플릿과 다름에 주의)
- docker-compose.yml에 SQLite 볼륨 마운트 (별도 DB 컨테이너 불필요)
- 정산 로직: 정확 맞춤 독식 / 다수 맞춤 N분의1 / 미적중 이월
