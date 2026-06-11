from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Room, Match
from schemas import MatchCreate, MatchResponse

router = APIRouter(prefix="/api/v1/rooms", tags=["matches"])


@router.get("/{code}/matches", response_model=list[MatchResponse])
def list_matches(code: str, db: Session = Depends(get_db)):
    room = _get_room_or_404(code, db)
    return sorted(room.matches, key=lambda m: m.order)


@router.post("/{code}/matches", response_model=MatchResponse, status_code=201)
def add_match(code: str, body: MatchCreate, db: Session = Depends(get_db)):
    """방장이 토너먼트 경기를 수동 추가"""
    room = _get_room_or_404(code, db)
    next_order = max((m.order for m in room.matches), default=0) + 1
    match = Match(
        room_id=room.id,
        opponent=body.opponent,
        match_date=body.match_date,
        stage=body.stage,
        order=next_order,
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


def _get_room_or_404(code: str, db: Session) -> Room:
    room = db.query(Room).filter(Room.code == code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다.")
    return room
