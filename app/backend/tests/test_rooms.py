def test_create_room(client):
    res = client.post("/api/v1/rooms", json={"host_name": "철수", "bet_amount": 5000})
    assert res.status_code == 201
    data = res.json()
    assert len(data["code"]) == 6
    assert data["host_name"] == "철수"
    assert data["bet_amount"] == 5000
    assert data["participant_count"] == 1
    assert data["total_prize"] == 5000


def test_get_room(client):
    code = client.post("/api/v1/rooms", json={"host_name": "철수"}).json()["code"]
    res = client.get(f"/api/v1/rooms/{code}")
    assert res.status_code == 200
    assert res.json()["code"] == code


def test_get_room_not_found(client):
    res = client.get("/api/v1/rooms/ZZZZZZ")
    assert res.status_code == 404


def test_join_room(client):
    code = client.post("/api/v1/rooms", json={"host_name": "철수"}).json()["code"]
    res = client.post(f"/api/v1/rooms/{code}/join", json={"name": "영희"})
    assert res.status_code == 201
    assert res.json()["name"] == "영희"
    assert res.json()["is_host"] is False


def test_join_room_same_name_returns_existing(client):
    code = client.post("/api/v1/rooms", json={"host_name": "철수"}).json()["code"]
    r1 = client.post(f"/api/v1/rooms/{code}/join", json={"name": "영희"})
    r2 = client.post(f"/api/v1/rooms/{code}/join", json={"name": "영희"})
    assert r1.json()["id"] == r2.json()["id"]  # 동일 참가자


def test_total_prize_updates_with_participants(client):
    code = client.post("/api/v1/rooms", json={"host_name": "철수", "bet_amount": 3000}).json()["code"]
    client.post(f"/api/v1/rooms/{code}/join", json={"name": "영희"})
    client.post(f"/api/v1/rooms/{code}/join", json={"name": "민준"})
    room = client.get(f"/api/v1/rooms/{code}").json()
    assert room["participant_count"] == 3
    assert room["total_prize"] == 9000
