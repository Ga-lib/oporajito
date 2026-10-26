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
async def test_reviews_ratings_and_safety(client: AsyncClient):
    # 1. Setup User A (Reviewer)
    auth_a = await client.post("/api/v1/auth/verify", json={"id_token": "dev-token-+8801777777777"})
    token_a = auth_a.json()["token"]
    user_a_id = auth_a.json()["user"]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    await client.put("/api/v1/users/me", headers=headers_a, json={
        "name": "Sabir Chowdhury",
        "district": "Sylhet",
        "area": "Zindabazar",
        "avatar": "🧑🏽‍🎨",
        "bio": "Calligraphy artist",
        "teaches": ["Arabic Calligraphy"],
        "wants": ["Spoken English"]
    })

    # 2. Setup User B (Instructor being reviewed)
    auth_b = await client.post("/api/v1/auth/verify", json={"id_token": "dev-token-+8801788888888"})
    token_b = auth_b.json()["token"]
    user_b_id = auth_b.json()["user"]["id"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    await client.put("/api/v1/users/me", headers=headers_b, json={
        "name": "Ayesha Siddiqua",
        "district": "Sylhet",
        "area": "Kumarpara",
        "avatar": "👩🏽‍🏫",
        "bio": "IELTS coach and Spoken English mentor",
        "teaches": ["Spoken English"],
        "wants": ["Arabic Calligraphy"]
    })

    # Clean up prior test reviews for user_b if any
    db = get_database()
    from bson import ObjectId
    await db["reviews"].delete_many({"reviewee_id": user_b_id})
    await db["users"].update_one(
        {"_id": ObjectId(user_b_id)},
        {"$set": {"rating_avg": 5.0, "rating_count": 0, "blocked_users": []}}
    )

    # 3. Test self-review prevention
    self_rev = await client.post(
        "/api/v1/reviews",
        headers=headers_b,
        json={
            "reviewee_id": user_b_id,
            "rating": 5,
            "comment": "I am the best teacher!"
        }
    )
    assert self_rev.status_code == 400

    # 4. User A submits 5-star review for User B
    rev1 = await client.post(
        "/api/v1/reviews",
        headers=headers_a,
        json={
            "reviewee_id": user_b_id,
            "rating": 5,
            "comment": "Ayesha apa was wonderful! Patient and helped my spoken fluency so much in exchange for calligraphy."
        }
    )
    assert rev1.status_code == 201
    assert rev1.json()["rating"] == 5
    assert rev1.json()["reviewer_name"] == "Sabir Chowdhury"

    # Verify User B profile updated
    profile_b = await client.get(f"/api/v1/users/{user_b_id}")
    assert profile_b.status_code == 200
    assert profile_b.json()["rating_avg"] == 5.0
    assert profile_b.json()["rating_count"] == 1

    # 5. User C submits 4-star review for User B -> rating becomes 4.5
    auth_c = await client.post("/api/v1/auth/verify", json={"id_token": "dev-token-+8801799999999"})
    headers_c = {"Authorization": f"Bearer {auth_c.json()['token']}"}
    await client.put("/api/v1/users/me", headers=headers_c, json={
        "name": "Kamal Hossain",
        "district": "Sylhet",
        "area": "Shibganj",
        "avatar": "🧑🏽‍🔬",
        "bio": "Chemistry student",
        "teaches": ["Chemistry"],
        "wants": ["Spoken English"]
    })

    rev2 = await client.post(
        "/api/v1/reviews",
        headers=headers_c,
        json={
            "reviewee_id": user_b_id,
            "rating": 4,
            "comment": "Great conversational practice session."
        }
    )
    assert rev2.status_code == 201

    # Check reviews list endpoint
    reviews_list = await client.get(f"/api/v1/users/{user_b_id}/reviews")
    assert reviews_list.status_code == 200
    revs_data = reviews_list.json()
    assert revs_data["rating_count"] == 2
    assert revs_data["rating_avg"] == 4.5
    assert len(revs_data["reviews"]) == 2

    # 6. Test User A blocking User B
    block_res = await client.post(f"/api/v1/users/{user_b_id}/block", headers=headers_a)
    assert block_res.status_code == 200

    # User A searches users in Sylhet -> User B must be excluded
    search_res = await client.get("/api/v1/users?district=Sylhet", headers=headers_a)
    assert search_res.status_code == 200
    sylhet_users = [u["id"] for u in search_res.json()["users"]]
    assert user_b_id not in sylhet_users

    # 7. User A reports User B
    report_res = await client.post(
        f"/api/v1/users/{user_b_id}/report",
        headers=headers_a,
        json={
            "reason": "Inappropriate Behavior",
            "details": "Sent unsolicited promotional messages."
        }
    )
    assert report_res.status_code == 200
    assert "submitted" in report_res.json()["message"]
