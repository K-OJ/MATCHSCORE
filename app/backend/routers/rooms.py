from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Room, Participant, Match, generate_room_code
from schemas import RoomCreate, RoomResponse, JoinRequest, ParticipantResponse

router = APIRouter(prefix="/api/v1/rooms", tags=["rooms"])

# 대한민국 2026 월드컵 조별리그 시드 데이터
KOREA_GROUP_MATCHES = [
    {"opponent": "우루과이", "match_date": "2026-06-12 11:00 KST", "stage": "조별리그", "order": 1},
    {"opponent": "볼리비아", "match_date": "2026-06-17 08:00 KST", "stage": "조별리그", "order": 2},
    {"opponent": "체코", "match_date": "2026-06-22 05:00 KST", "stage": "조별리그", "order": 3},
]


@router.post("", response_model=RoomResponse, status_code=201)
def create_room(body: RoomCreate, db: Session = Depends(get_db)):
    # 코드 충돌 방지용 루프
    for _ in range(10):
        code = generate_room_code()
        if not db.query(Room).filter(Room.code == code).first():
            break

    room = Room(code=code, host_name=body.host_name, bet_amount=body.bet_amount)
    db.add(room)
    db.flush()

    # 방장을 첫 번째 참가자로 등록
    host = Participant(room_id=room.id, name=body.host_name, is_host=True)
    db.add(host)

    # 조별리그 3경기 시드
    for m in KOREA_GROUP_MATCHES:
        db.add(Match(room_id=room.id, **m))

    db.commit()
    db.refresh(room)

    return _room_response(room)


@router.get("/{code}", response_model=RoomResponse)
def get_room(code: str, db: Session = Depends(get_db)):
    room = _get_room_or_404(code, db)
    return _room_response(room)


@router.post("/{code}/join", response_model=ParticipantResponse, status_code=201)
def join_room(code: str, body: JoinRequest, db: Session = Depends(get_db)):
    room = _get_room_or_404(code, db)

    existing = (
        db.query(Participant)
        .filter(Participant.room_id == room.id, Participant.name == body.name)
        .first()
    )
    if existing:
        return existing  # 동일 이름 재접속 허용

    participant = Participant(room_id=room.id, name=body.name)
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


# ── 헬퍼 ──────────────────────────────────────────────────────────────
def _get_room_or_404(code: str, db: Session) -> Room:
    room = db.query(Room).filter(Room.code == code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다.")
    return room


def _room_response(room: Room) -> RoomResponse:
    count = len(room.participants)
    return RoomResponse(
        id=room.id,
        code=room.code,
        host_name=room.host_name,
        bet_amount=room.bet_amount,
        created_at=room.created_at,
        participant_count=count,
        total_prize=count * room.bet_amount,
    )
