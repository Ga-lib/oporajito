import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from starlette.testclient import TestClient
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
async def test_chat_rest_and_conversations(client: AsyncClient):
    # 1. Setup User A
    auth_a = await client.post("/api/v1/auth/verify", json={"id_token": "dev-token-+8801733333333"})
    token_a = auth_a.json()["token"]
    user_a_id = auth_a.json()["user"]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    await client.put("/api/v1/users/me", headers=headers_a, json={
        "name": "Tanvir Hasan",
        "district": "Dhaka",
        "area": "Mirpur 10",
        "avatar": "🧑🏽‍🏫",
        "bio": "Math tutor eager to learn cooking",
        "teaches": ["Math", "Physics"],
        "wants": ["Bengali Cooking"]
    })

    # 2. Setup User B
    auth_b = await client.post("/api/v1/auth/verify", json={"id_token": "dev-token-+8801744444444"})
    token_b = auth_b.json()["token"]
    user_b_id = auth_b.json()["user"]["id"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    await client.put("/api/v1/users/me", headers=headers_b, json={
        "name": "Farhana Sultana",
        "district": "Dhaka",
        "area": "Mirpur 2",
        "avatar": "👩🏽‍🍳",
        "bio": "Home chef wanting help with Calculus",
        "teaches": ["Bengali Cooking"],
        "wants": ["Math"]
    })

    # 3. User A sends swap request to User B
    req_res = await client.post("/api/v1/requests", headers=headers_a, json={
        "to_user_id": user_b_id,
        "skill": "Bengali Cooking",
        "offered_skill": "Math",
        "message": "Let us swap Math for Cooking lessons!"
    })
    assert req_res.status_code == 201
    req_id = req_res.json()["id"]

    # 4. User B accepts the request -> creates conversation thread in MongoDB
    accept_res = await client.patch(f"/api/v1/requests/{req_id}", headers=headers_b, json={"status": "accepted"})
    assert accept_res.status_code == 200

    # 5. User A checks their conversations
    convos_res = await client.get("/api/v1/conversations", headers=headers_a)
    assert convos_res.status_code == 200
    convos_data = convos_res.json()
    assert convos_data["total"] >= 1
    convo = convos_data["conversations"][0]
    convo_id = convo["id"]
    assert convo["name"] == "Farhana Sultana"
    assert "Bengali Cooking" in convo["skill_topic"]

    # 6. User A sends message via REST
    msg_res = await client.post(
        f"/api/v1/conversations/{convo_id}/messages",
        headers=headers_a,
        json={"text": "Hello Farhana! Excited to start our cooking and math exchange."}
    )
    assert msg_res.status_code == 201
    assert msg_res.json()["text"] == "Hello Farhana! Excited to start our cooking and math exchange."

    # 7. User B reads messages
    history_res = await client.get(f"/api/v1/conversations/{convo_id}/messages", headers=headers_b)
    assert history_res.status_code == 200
    msgs = history_res.json()["messages"]
    assert len(msgs) >= 1
    assert any("Excited to start" in m["text"] for m in msgs)

def test_chat_websocket_exchange():
    # Synchronous Starlette TestClient for WebSocket testing
    with TestClient(app) as test_client:
        # Pre-verify dev token for User A
        auth_a = test_client.post("/api/v1/auth/verify", json={"id_token": "dev-token-+8801755555555"})
        token_a = auth_a.json()["token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Setup User B
        auth_b = test_client.post("/api/v1/auth/verify", json={"id_token": "dev-token-+8801766666666"})
        user_b_id = auth_b.json()["user"]["id"]
        token_b = auth_b.json()["token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User A sends request to User B
        req = test_client.post(
            "/api/v1/requests",
            headers=headers_a,
            json={"to_user_id": user_b_id, "skill": "Guitar", "message": "Hi!"}
        )
        assert req.status_code == 201
        req_id = req.json()["id"]

        # User B accepts request -> provisions conversation thread
        accept_res = test_client.patch(f"/api/v1/requests/{req_id}", headers=headers_b, json={"status": "accepted"})
        assert accept_res.status_code == 200

        # Retrieve conversation ID
        convos = test_client.get("/api/v1/conversations", headers=headers_a).json()
        assert len(convos["conversations"]) > 0
        convo_id = convos["conversations"][0]["id"]

        # Connect WebSocket with token and conversation_id
        with test_client.websocket_connect(f"/api/v1/ws/chat?token={token_a}&conversation_id={convo_id}") as websocket:
            # Send message over WebSocket
            websocket.send_json({"text": "Hello via real-time WebSocket!"})
            data = websocket.receive_json()
            assert data["text"] == "Hello via real-time WebSocket!"
            assert data["conversation_id"] == convo_id
            assert data["sender_id"] == auth_a.json()["user"]["id"]
