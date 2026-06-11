def _setup(client):
    code = client.post("/api/v1/rooms", json={"host_name": "철수", "bet_amount": 5000}).json()["code"]
    client.post(f"/api/v1/rooms/{code}/join", json={"name": "영희"})
    client.post(f"/api/v1/rooms/{code}/join", json={"name": "민준"})
    match_id = client.get(f"/api/v1/rooms/{code}/matches").json()[0]["id"]
    return code, match_id


def test_winner_takes_all(client):
    code, match_id = _setup(client)
    # 영희만 정답
    client.post(f"/api/v1/rooms/{code}/predictions", json={
        "participant_name": "영희", "match_id": match_id, "home_score": 2, "away_score": 1,
    })
    client.post(f"/api/v1/rooms/{code}/predictions", json={
        "participant_name": "민준", "match_id": match_id, "home_score": 0, "away_score": 0,
    })
    res = client.post(f"/api/v1/rooms/{code}/matches/{match_id}/result", json={
        "home_score": 2, "away_score": 1, "host_name": "철수",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["winners"] == ["영희"]
    assert data["prize_per_winner"] == 15000  # 3명 * 5000
    assert data["is_rollover"] is False


def test_split_prize(client):
    code, match_id = _setup(client)
    for name in ["영희", "민준"]:
        client.post(f"/api/v1/rooms/{code}/predictions", json={
            "participant_name": name, "match_id": match_id, "home_score": 1, "away_score": 1,
        })
    res = client.post(f"/api/v1/rooms/{code}/matches/{match_id}/result", json={
        "home_score": 1, "away_score": 1, "host_name": "철수",
    })
    data = res.json()
    assert len(data["winners"]) == 2
    assert data["prize_per_winner"] == 7500  # 15000 / 2


def test_rollover_when_no_winner(client):
    code, match_id = _setup(client)
    client.post(f"/api/v1/rooms/{code}/predictions", json={
        "participant_name": "영희", "match_id": match_id, "home_score": 0, "away_score": 0,
    })
    res = client.post(f"/api/v1/rooms/{code}/matches/{match_id}/result", json={
        "home_score": 2, "away_score": 1, "host_name": "철수",
    })
    data = res.json()
    assert data["winners"] == []
    assert data["is_rollover"] is True
    assert data["cumulative_prize"] == 15000


def test_only_host_can_submit_result(client):
    code, match_id = _setup(client)
    res = client.post(f"/api/v1/rooms/{code}/matches/{match_id}/result", json={
        "home_score": 1, "away_score": 0, "host_name": "영희",
    })
    assert res.status_code == 403


def test_board_response(client):
    code, match_id = _setup(client)
    res = client.get(f"/api/v1/rooms/{code}/board")
    assert res.status_code == 200
    data = res.json()
    assert data["participant_count"] == 3
    assert data["total_prize"] == 15000
    assert len(data["matches"]) == 3  # 조별리그 3경기
