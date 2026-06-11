import random
import string
from datetime import datetime
from sqlalchemy import Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


def generate_room_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(6), unique=True, index=True)
    host_name: Mapped[str] = mapped_column(String(50))
    bet_amount: Mapped[int] = mapped_column(Integer, default=5000)  # 인당 베팅 금액 (원)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    participants: Mapped[list["Participant"]] = relationship(back_populates="room", cascade="all, delete-orphan")
    matches: Mapped[list["Match"]] = relationship(back_populates="room", cascade="all, delete-orphan")


class Participant(Base):
    __tablename__ = "participants"
    __table_args__ = (UniqueConstraint("room_id", "name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"))
    name: Mapped[str] = mapped_column(String(50))
    is_host: Mapped[bool] = mapped_column(Boolean, default=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    room: Mapped["Room"] = relationship(back_populates="participants")
    predictions: Mapped[list["Prediction"]] = relationship(back_populates="participant", cascade="all, delete-orphan")


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"))
    opponent: Mapped[str] = mapped_column(String(50))
    match_date: Mapped[str] = mapped_column(String(30))  # "2026-06-12 11:00 KST"
    stage: Mapped[str] = mapped_column(String(30))  # "조별리그", "16강" 등
    order: Mapped[int] = mapped_column(Integer)  # 경기 순서

    # 실제 결과 (방장 입력)
    home_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    away_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_finished: Mapped[bool] = mapped_column(Boolean, default=False)

    room: Mapped["Room"] = relationship(back_populates="matches")
    predictions: Mapped[list["Prediction"]] = relationship(back_populates="match", cascade="all, delete-orphan")


class Prediction(Base):
    __tablename__ = "predictions"
    __table_args__ = (UniqueConstraint("participant_id", "match_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    participant_id: Mapped[int] = mapped_column(ForeignKey("participants.id"))
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"))
    home_score: Mapped[int] = mapped_column(Integer)
    away_score: Mapped[int] = mapped_column(Integer)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    participant: Mapped["Participant"] = relationship(back_populates="predictions")
    match: Mapped["Match"] = relationship(back_populates="predictions")
