from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Room, Match, Participant, Prediction
from schemas import ResultInput, SettlementResult, StandingsEntry, BoardResponse, MatchResponse, PredictionResponse

router = APIRouter(prefix="/api/v1/rooms", tags=["results"])

# 경기별 이월 누적 상금 (메모리 저장 — 재시작 시 초기화되므로 DB 저장 권장하나 MVP에서는 허용)
_rollover_pool: dict[str, int] = {}  # key: room_code


@router.post("/{code}/matches/{match_id}/result", response_model=SettlementResult)
def submit_result(code: str, match_id: int, body: ResultInput, db: Session = Depends(get_db)):
    """방장이 실제 스코어 입력 → 자동 정산"""
    room = _get_room_or_404(code, db)

    if room.host_name != body.host_name:
        raise HTTPException(status_code=403, detail="방장만 결과를 입력할 수 있습니다.")

    match = db.query(Match).filter(Match.id == match_id, Match.room_id == room.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="경기를 찾을 수 없습니다.")
    if match.is_finished:
        raise HTTPException(status_code=400, detail="이미 정산된 경기입니다.")

    match.home_score = body.home_score
    match.away_score = body.away_score
    match.is_finished = True
    db.flush()

    # 정산 계산
    participant_count = len(room.participants)
    base_prize = participant_count * room.bet_amount
    rollover_key = code.upper()
    accumulated = _rollover_pool.get(rollover_key, 0)
    total_pool = base_prize + accumulated

    # 정답자 찾기
    winners = []
    for pred in match.predictions:
        if pred.home_score == body.home_score and pred.away_score == body.away_score:
            winners.append(pred.participant.name)

    if winners:
        prize_each = total_pool // len(winners)
        _rollover_pool[rollover_key] = 0  # 이월 초기화
        is_rollover = False
    else:
        prize_each = 0
        _rollover_pool[rollover_key] = total_pool  # 이월 누적
        is_rollover = True

    db.commit()

    return SettlementResult(
        match_id=match_id,
        winners=winners,
        prize_per_winner=prize_each,
        is_rollover=is_rollover,
        cumulative_prize=_rollover_pool.get(rollover_key, 0) if is_rollover else 0,
    )


@router.get("/{code}/board", response_model=BoardResponse)
def get_board(code: str, db: Session = Depends(get_db)):
    """보드 전체 현황 — 참가자 예측 테이블 + 총 상금 + 정산 현황"""
    room = _get_room_or_404(code, db)

    participant_count = len(room.participants)
    total_prize = participant_count * room.bet_amount
    rollover_key = code.upper()
    cumulative = _rollover_pool.get(rollover_key, 0)

    matches = [MatchResponse(
        id=m.id, opponent=m.opponent, match_date=m.match_date,
        stage=m.stage, order=m.order,
        home_score=m.home_score, away_score=m.away_score,
        is_finished=m.is_finished,
    ) for m in sorted(room.matches, key=lambda x: x.order)]

    predictions = []
    for p in room.participants:
        for pred in p.predictions:
            predictions.append(PredictionResponse(
                id=pred.id,
                participant_name=p.name,
                match_id=pred.match_id,
                home_score=pred.home_score,
                away_score=pred.away_score,
                updated_at=pred.updated_at,
            ))

    # 간단 순위표
    standings_map: dict[str, dict] = {p.name: {"total_won": 0, "correct_count": 0} for p in room.participants}
    for match in room.matches:
        if not match.is_finished:
            continue
        for pred in match.predictions:
            if pred.home_score == match.home_score and pred.away_score == match.away_score:
                standings_map[pred.participant.name]["correct_count"] += 1

    standings = [
        StandingsEntry(participant_name=name, **data)
        for name, data in standings_map.items()
    ]
    standings.sort(key=lambda x: x.correct_count, reverse=True)

    return BoardResponse(
        room_code=room.code,
        bet_amount=room.bet_amount,
        participant_count=participant_count,
        total_prize=total_prize,
        cumulative_prize=cumulative,
        matches=matches,
        predictions=predictions,
        standings=standings,
    )


@router.get("/{code}/standings", response_model=list[StandingsEntry])
def get_standings(code: str, db: Session = Depends(get_db)):
    room = _get_room_or_404(code, db)
    standings_map: dict[str, dict] = {p.name: {"total_won": 0, "correct_count": 0} for p in room.participants}
    for match in room.matches:
        if not match.is_finished:
            continue
        for pred in match.predictions:
            if pred.home_score == match.home_score and pred.away_score == match.away_score:
                standings_map[pred.participant.name]["correct_count"] += 1
    result = [StandingsEntry(participant_name=name, **data) for name, data in standings_map.items()]
    result.sort(key=lambda x: x.correct_count, reverse=True)
    return result


def _get_room_or_404(code: str, db: Session) -> Room:
    room = db.query(Room).filter(Room.code == code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다.")
    return room
