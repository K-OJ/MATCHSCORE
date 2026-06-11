import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import rooms, matches, predictions, results

# DB 테이블 생성
os.makedirs("data", exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MatchScore API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms.router)
app.include_router(matches.router)
app.include_router(predictions.router)
app.include_router(results.router)


@app.get("/health")
def health():
    return {"status": "ok"}
