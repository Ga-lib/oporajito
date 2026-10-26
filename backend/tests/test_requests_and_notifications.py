import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

@pytest_asyncio.fixture(scope="function")
async def client():
    await connect_to_mongo()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    await close_mongo_connection()

@pytest.mark.asyncio
async def test_requests_workflow_and_notifications(client: AsyncClient):
    # 1. Authenticate Requester (User A - Nafis in Dhanmondi)
    auth_a = await client.post(
        "/api/v1/auth/verify",
        json={"id_token": "dev-token-+8801711111111"}
    )
    assert auth_a.status_code == 200
    token_a = auth_a.json()["token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Setup User A profile
    await client.put(
        "/api/v1/users/me",
        headers=headers_a,
        json={
            "name": "Nafis Mahmud",
            "district": "Dhaka",
            "area": "Dhanmondi",
            "avatar": "🧑🏽‍💻",
            "bio": "Software developer eager to learn violin",
            "teaches": ["Python", "React Basics"],
            "wants": ["Violin", "Classical Music"]
        }
    )

    # 2. Authenticate Recipient (User B - Sumaiya in Dhanmondi)
    auth_b = await client.post(
        "/api/v1/auth/verify",
        json={"id_token": "dev-token-+8801722222222"}
    )
    assert auth_b.status_code == 200
    token_b = auth_b.json()["token"]
    user_b_id = auth_b.json()["user"]["id"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Setup User B profile (teaches Violin, wants Python -> Perfect Mutual Match!)
    await client.put(
        "/api/v1/users/me",
        headers=headers_b,
        json={
            "name": "Sumaiya Akhter",
            "district": "Dhaka",
            "area": "Dhanmondi",
            "avatar": "🎻",
            "bio": "Music instructor eager to learn coding",
            "teaches": ["Violin", "Classical Music"],
            "wants": ["Python", "Web Design"]
        }
    )

    # 3. Test Skill Matching Algorithm: User A queries matches
    matches_res = await client.get("/api/v1/users/matches", headers=headers_a)
    assert matches_res.status_code == 200
    matches = matches_res.json()
    assert len(matches) > 0
    # User B should be at or near top of matches because of reciprocal skills
    matched_ids = [m["id"] for m in matches]
    assert user_b_id in matched_ids

    # 4. User A sends swap request to User B
    req_res = await client.post(
        "/api/v1/requests",
        headers=headers_a,
        json={
            "to_user_id": user_b_id,
            "skill": "Violin",
            "offered_skill": "Python",
            "message": "Hi Sumaiya, I would love to learn Violin from you in exchange for Python lessons!"
        }
    )
    assert req_res.status_code == 201
    req_data = req_res.json()
    req_id = req_data["id"]
    assert req_data["status"] == "pending"
    assert req_data["skill"] == "Violin"

    # 5. Check duplicate pending request is blocked (409 Conflict)
    dup_res = await client.post(
        "/api/v1/requests",
        headers=headers_a,
        json={
            "to_user_id": user_b_id,
            "skill": "Violin",
            "offered_skill": "Python",
            "message": "Duplicate request attempt"
        }
    )
    assert dup_res.status_code == 409

    # 6. User B checks notifications & incoming requests
    notifs_b = await client.get("/api/v1/notifications", headers=headers_b)
    assert notifs_b.status_code == 200
    notifs_data = notifs_b.json()
    assert notifs_data["unread_count"] >= 1
    assert any(n["type"] == "request_received" for n in notifs_data["notifications"])

    incoming_b = await client.get("/api/v1/requests?box=incoming", headers=headers_b)
    assert incoming_b.status_code == 200
    incoming_items = incoming_b.json()["requests"]
    assert any(r["id"] == req_id for r in incoming_items)

    # 7. User B accepts the swap request
    accept_res = await client.patch(
        f"/api/v1/requests/{req_id}",
        headers=headers_b,
        json={"status": "accepted"}
    )
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "accepted"

    # 8. Verify User A received an acceptance notification
    notifs_a = await client.get("/api/v1/notifications", headers=headers_a)
    assert notifs_a.status_code == 200
    assert any(n["type"] == "request_accepted" for n in notifs_a.json()["notifications"])

    # 9. Mark request completed
    complete_res = await client.patch(
        f"/api/v1/requests/{req_id}",
        headers=headers_a,
        json={"status": "completed"}
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "completed"

    # 10. Test Notifications Read and Read-All
    first_notif_id = notifs_a.json()["notifications"][0]["id"]
    read_one = await client.patch(f"/api/v1/notifications/{first_notif_id}/read", headers=headers_a)
    assert read_one.status_code == 200
    assert read_one.json()["read"] is True

    read_all = await client.patch("/api/v1/notifications/read-all", headers=headers_a)
    assert read_all.status_code == 200
    assert read_all.json()["message"] == "All notifications marked as read"
