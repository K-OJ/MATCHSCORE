from datetime import datetime
from pydantic import BaseModel, field_validator


# ── Room ──────────────────────────────────────────────────────────────
class RoomCreate(BaseModel):
    host_name: str
    bet_amount: int = 5000

    @field_validator("bet_amount")
    @classmethod
    def bet_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("베팅 금액은 0보다 커야 합니다.")
        return v


class RoomResponse(BaseModel):
    id: int
    code: str
    host_name: str
    bet_amount: int
    created_at: datetime
    participant_count: int = 0
    total_prize: int = 0

    model_config = {"from_attributes": True}


# ── Participant ───────────────────────────────────────────────────────
class JoinRequest(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("이름을 입력해주세요.")
        return v


class ParticipantResponse(BaseModel):
    id: int
    name: str
    is_host: bool
    joined_at: datetime

    model_config = {"from_attributes": True}


# ── Match ─────────────────────────────────────────────────────────────
class MatchCreate(BaseModel):
    opponent: str
    match_date: str
    stage: str = "토너먼트"


class MatchResponse(BaseModel):
    id: int
    opponent: str
    match_date: str
    stage: str
    order: int
    home_score: int | None
    away_score: int | None
    is_finished: bool

    model_config = {"from_attributes": True}


# ── Prediction ────────────────────────────────────────────────────────
class PredictionUpsert(BaseModel):
    participant_name: str
    match_id: int
    home_score: int
    away_score: int

    @field_validator("home_score", "away_score")
    @classmethod
    def score_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("점수는 0 이상이어야 합니다.")
        return v


class PredictionResponse(BaseModel):
    id: int
    participant_name: str
    match_id: int
    home_score: int
    away_score: int
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Result / Standings ────────────────────────────────────────────────
class ResultInput(BaseModel):
    home_score: int
    away_score: int
    host_name: str  # 방장 인증용


class SettlementResult(BaseModel):
    match_id: int
    winners: list[str]
    prize_per_winner: int
    is_rollover: bool
    cumulative_prize: int


class StandingsEntry(BaseModel):
    participant_name: str
    total_won: int
    correct_count: int


class BoardResponse(BaseModel):
    room_code: str
    bet_amount: int
    participant_count: int
    total_prize: int
    cumulative_prize: int
    matches: list[MatchResponse]
    predictions: list[PredictionResponse]
    standings: list[StandingsEntry]
