def _setup(client):
    code = client.post("/api/v1/rooms", json={"host_name": "철수", "bet_amount": 5000}).json()["code"]
    client.post(f"/api/v1/rooms/{code}/join", json={"name": "영희"})
    match_id = client.get(f"/api/v1/rooms/{code}/matches").json()[0]["id"]
    return code, match_id


def test_submit_prediction(client):
    code, match_id = _setup(client)
    res = client.post(f"/api/v1/rooms/{code}/predictions", json={
        "participant_name": "영희", "match_id": match_id,
        "home_score": 2, "away_score": 1,
    })
    assert res.status_code == 201
    assert res.json()["home_score"] == 2


def test_update_prediction(client):
    code, match_id = _setup(client)
    client.post(f"/api/v1/rooms/{code}/predictions", json={
        "participant_name": "영희", "match_id": match_id,
        "home_score": 2, "away_score": 1,
    })
    res = client.post(f"/api/v1/rooms/{code}/predictions", json={
        "participant_name": "영희", "match_id": match_id,
        "home_score": 3, "away_score": 0,
    })
    assert res.json()["home_score"] == 3


def test_list_predictions(client):
    code, match_id = _setup(client)
    client.post(f"/api/v1/rooms/{code}/predictions", json={
        "participant_name": "영희", "match_id": match_id,
        "home_score": 1, "away_score": 0,
    })
    preds = client.get(f"/api/v1/rooms/{code}/predictions").json()
    assert len(preds) == 1


def test_prediction_unknown_participant(client):
    code, match_id = _setup(client)
    res = client.post(f"/api/v1/rooms/{code}/predictions", json={
        "participant_name": "모르는사람", "match_id": match_id,
        "home_score": 1, "away_score": 0,
    })
    assert res.status_code == 404
