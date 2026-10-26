import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

@pytest_asyncio.fixture(scope="function")
async def client():
    await connect_to_mongo()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    await close_mongo_connection()

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "Oporajito"

@pytest.mark.asyncio
async def test_auth_verify_and_onboarding(client: AsyncClient):
    test_phone = "+8801799112233"
    token = f"dev-token-{test_phone}"

    # 1. First time verification -> should be marked as new user
    auth_res = await client.post(
        "/api/v1/auth/verify",
        json={"id_token": token, "phone": test_phone}
    )
    assert auth_res.status_code == 200
    auth_data = auth_res.json()
    assert auth_data["user"]["phone"] == test_phone
    user_id = auth_data["user"]["id"]

    # 2. Update profile (Onboarding)
    headers = {"Authorization": f"Bearer {token}"}
    profile_payload = {
        "name": "Nafis Mahmud",
        "district": "Dhaka",
        "area": "Dhanmondi 27",
        "avatar": "🧑🏽‍💻",
        "bio": "Web enthusiast eager to learn classical violin",
        "teaches": ["React Basics", "Python"],
        "wants": ["Violin", "Photography"]
    }
    update_res = await client.put(
        "/api/v1/users/me",
        json=profile_payload,
        headers=headers
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["name"] == "Nafis Mahmud"
    assert updated_data["district"] == "Dhaka"
    assert "React Basics" in updated_data["teaches"]

    # 3. Check /users/me returns private data including phone
    me_res = await client.get("/api/v1/users/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["phone"] == test_phone
    assert me_data["name"] == "Nafis Mahmud"

    # 4. CRITICAL PRIVACY TEST: Check /users/{id} strictly OMITS phone number!
    public_res = await client.get(f"/api/v1/users/{user_id}")
    assert public_res.status_code == 200
    public_data = public_res.json()
    assert public_data["name"] == "Nafis Mahmud"
    assert "phone" not in public_data, "SECURITY VIOLATION: Phone number was exposed in public API!"
    assert "firebase_uid" not in public_data, "SECURITY VIOLATION: Firebase UID was exposed in public API!"

    # 5. Search for the user
    search_res = await client.get("/api/v1/users?q=Nafis&district=Dhaka")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert any(u["id"] == user_id for u in search_data["users"])
    # Verify no phone in search list
    for user in search_data["users"]:
        assert "phone" not in user, "SECURITY VIOLATION: Phone number found in search results!"

    # 6. Test block user
    block_res = await client.post(f"/api/v1/users/{user_id}/block", headers=headers)
    assert block_res.status_code == 400  # Cannot block oneself
