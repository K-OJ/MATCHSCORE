from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Room, Match, Participant, Prediction
from schemas import PredictionUpsert, PredictionResponse

router = APIRouter(prefix="/api/v1/rooms", tags=["predictions"])


@router.post("/{code}/predictions", response_model=PredictionResponse, status_code=201)
def upsert_prediction(code: str, body: PredictionUpsert, db: Session = Depends(get_db)):
    room = _get_room_or_404(code, db)

    match = db.query(Match).filter(Match.id == body.match_id, Match.room_id == room.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="경기를 찾을 수 없습니다.")
    if match.is_finished:
        raise HTTPException(status_code=400, detail="이미 종료된 경기입니다.")

    participant = (
        db.query(Participant)
        .filter(Participant.room_id == room.id, Participant.name == body.participant_name)
        .first()
    )
    if not participant:
        raise HTTPException(status_code=404, detail="참가자를 찾을 수 없습니다. 먼저 방에 입장하세요.")

    prediction = (
        db.query(Prediction)
        .filter(Prediction.participant_id == participant.id, Prediction.match_id == body.match_id)
        .first()
    )
    if prediction:
        prediction.home_score = body.home_score
        prediction.away_score = body.away_score
        prediction.updated_at = datetime.utcnow()
    else:
        prediction = Prediction(
            participant_id=participant.id,
            match_id=body.match_id,
            home_score=body.home_score,
            away_score=body.away_score,
        )
        db.add(prediction)

    db.commit()
    db.refresh(prediction)

    return PredictionResponse(
        id=prediction.id,
        participant_name=participant.name,
        match_id=prediction.match_id,
        home_score=prediction.home_score,
        away_score=prediction.away_score,
        updated_at=prediction.updated_at,
    )


@router.get("/{code}/predictions", response_model=list[PredictionResponse])
def list_predictions(code: str, db: Session = Depends(get_db)):
    room = _get_room_or_404(code, db)
    result = []
    for participant in room.participants:
        for pred in participant.predictions:
            if pred.match.room_id == room.id:
                result.append(PredictionResponse(
                    id=pred.id,
                    participant_name=participant.name,
                    match_id=pred.match_id,
                    home_score=pred.home_score,
                    away_score=pred.away_score,
                    updated_at=pred.updated_at,
                ))
    return result


def _get_room_or_404(code: str, db: Session) -> Room:
    room = db.query(Room).filter(Room.code == code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다.")
    return room
