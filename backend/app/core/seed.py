import asyncio
import logging
from datetime import datetime, timezone
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

logger = logging.getLogger("oporajito.seed")

# 16 Realistic Neighbors across all 8 Divisions of Bangladesh
REALISTIC_NEIGHBORS = [
    # Dhaka Division
    {
        "firebase_uid": "uid-01811223344",
        "phone": "+8801811223344",
        "name": "Shirin Akter",
        "district": "Dhaka",
        "area": "Mirpur 2",
        "avatar": "👩🏽‍🏫",
        "rating_avg": 4.9,
        "rating_count": 21,
        "teaches": ["Spoken English", "IELTS Prep", "Bengali Calligraphy"],
        "wants": ["Coding & Web Dev", "Excel & Accounts"],
        "bio": "Lecturer & language enthusiast. I have helped 40+ neighborhood students ace their IELTS speaking. Would love to learn practical web coding!",
        "blocked_users": [],
        "created_at": "2026-09-01T10:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },
    {
        "firebase_uid": "uid-01911998877",
        "phone": "+8801911998877",
        "name": "Tanvir Ahmed",
        "district": "Dhaka",
        "area": "Kazipara",
        "avatar": "🧑🏽‍🎨",
        "rating_avg": 4.8,
        "rating_count": 9,
        "teaches": ["Graphic Design", "Photoshop", "Mobile Photography"],
        "wants": ["Spoken English", "Acoustic Guitar"],
        "bio": "Freelance brand designer based in Kazipara. Happy to teach Figma, Adobe Illustrator, and visual identity principles in exchange for conversational English.",
        "blocked_users": [],
        "created_at": "2026-09-05T11:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },
    {
        "firebase_uid": "uid-01722334455",
        "phone": "+8801722334455",
        "name": "Nusrat Jahan",
        "district": "Dhaka",
        "area": "Mirpur 10",
        "avatar": "👩🏽‍💼",
        "rating_avg": 5.0,
        "rating_count": 15,
        "teaches": ["Excel & Accounts", "Freelancing & Upwork", "Tax Basics"],
        "wants": ["Coding & Web Dev", "Home Baking"],
        "bio": "Financial analyst at a local firm. I love demystifying Excel spreadsheets, VLOOKUPs, pivot tables, and Upwork profile setups for beginners.",
        "blocked_users": [],
        "created_at": "2026-09-10T12:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },
    {
        "firebase_uid": "uid-01611778899",
        "phone": "+8801611778899",
        "name": "Imran Kabir",
        "district": "Dhaka",
        "area": "Agargaon",
        "avatar": "🎸",
        "rating_avg": 4.7,
        "rating_count": 7,
        "teaches": ["Acoustic Guitar", "Music Theory", "Vocal Warmups"],
        "wants": ["Coding & Web Dev", "Spoken English"],
        "bio": "Guitarist in an indie rock band. I teach fingerstyle, basic chords, and rhythm strumming in neighborhood parks and quiet cafes.",
        "blocked_users": [],
        "created_at": "2026-09-12T14:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },
    {
        "firebase_uid": "uid-01511443322",
        "phone": "+8801511443322",
        "name": "Farzana Rahman",
        "district": "Dhaka",
        "area": "Shewrapara",
        "avatar": "👩🏽‍🍳",
        "rating_avg": 4.8,
        "rating_count": 18,
        "teaches": ["Home Baking", "Bengali Calligraphy", "Dessert Styling"],
        "wants": ["Graphic Design", "Excel & Accounts"],
        "bio": "Home baker who loves baking sourdough, cakes, and cookies. I also practice traditional Bengali cursive calligraphy. Looking to learn bookkeeping for my kitchen.",
        "blocked_users": [],
        "created_at": "2026-09-15T16:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },
    {
        "firebase_uid": "uid-01712001122",
        "phone": "+8801712001122",
        "name": "Nafis Mahmud",
        "district": "Dhaka",
        "area": "Dhanmondi 27",
        "avatar": "🧑🏽‍💻",
        "rating_avg": 4.9,
        "rating_count": 12,
        "teaches": ["Coding & Web Dev", "Python", "React Basics"],
        "wants": ["Acoustic Guitar", "Violin"],
        "bio": "Frontend developer by day, curious learner by evening. Eager to swap React/JavaScript fundamentals for music lessons.",
        "blocked_users": [],
        "created_at": "2026-09-20T09:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },

    # Chattogram Division
    {
        "firebase_uid": "uid-01799887766",
        "phone": "+8801799887766",
        "name": "Sabbir Hossain",
        "district": "Chattogram",
        "area": "GEC Circle",
        "avatar": "🧑🏽‍🔬",
        "rating_avg": 4.9,
        "rating_count": 14,
        "teaches": ["HSC Math & Physics", "Python Basics"],
        "wants": ["Spoken English", "Mobile Photography"],
        "bio": "Physics mentor at GEC Circle. I make complex calculus and mechanics intuitive and fun through real-world experiments.",
        "blocked_users": [],
        "created_at": "2026-09-22T15:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },
    {
        "firebase_uid": "uid-01822556677",
        "phone": "+8801822556677",
        "name": "Ananya Barua",
        "district": "Chattogram",
        "area": "Agrabad",
        "avatar": "🎻",
        "rating_avg": 5.0,
        "rating_count": 8,
        "teaches": ["Classical Violin", "Rabindra Sangeet"],
        "wants": ["Graphic Design", "Python Basics"],
        "bio": "Violin practitioner for over 10 years. Teaching posture, bow control, and Bengali melodies to beginners.",
        "blocked_users": [],
        "created_at": "2026-09-25T11:30:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },

    # Sylhet Division
    {
        "firebase_uid": "uid-01833445566",
        "phone": "+8801833445566",
        "name": "Mehnaz Chowdhury",
        "district": "Sylhet",
        "area": "Zindabazar",
        "avatar": "🧕🏽",
        "rating_avg": 5.0,
        "rating_count": 10,
        "teaches": ["Tailoring & Sewing", "Traditional Nakshi Kantha"],
        "wants": ["Freelancing & Upwork", "Spoken English"],
        "bio": "Master artisan of Nakshi Kantha hand-embroidery. Preserving our folk stitch traditions while learning digital freelancing.",
        "blocked_users": [],
        "created_at": "2026-09-28T14:15:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },
    {
        "firebase_uid": "uid-01744889900",
        "phone": "+8801744889900",
        "name": "Tahsin Alam",
        "district": "Sylhet",
        "area": "Amberkhana",
        "avatar": "🧑🏽‍🏫",
        "rating_avg": 4.8,
        "rating_count": 6,
        "teaches": ["Spoken English", "Creative Writing", "Debate"],
        "wants": ["Coding & Web Dev", "Traditional Nakshi Kantha"],
        "bio": "Debate club coach and literature buff. Passionate about helping people build confidence expressing themselves.",
        "blocked_users": [],
        "created_at": "2026-10-01T10:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },

    # Rajshahi Division
    {
        "firebase_uid": "uid-01755112233",
        "phone": "+8801755112233",
        "name": "Dr. Mizanur Rahman",
        "district": "Rajshahi",
        "area": "Kazla",
        "avatar": "👨🏽‍🌾",
        "rating_avg": 4.9,
        "rating_count": 16,
        "teaches": ["Rooftop Gardening", "Bonsai Making", "Organic Compost"],
        "wants": ["Mobile Photography", "Basic Computer Literacy"],
        "bio": "Botanist and rooftop green living advocate. Have grown 50+ varieties of fruits and vegetables on my roof in Kazla.",
        "blocked_users": [],
        "created_at": "2026-10-03T08:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },
    {
        "firebase_uid": "uid-01866334455",
        "phone": "+8801866334455",
        "name": "Fahmida Hasan",
        "district": "Rajshahi",
        "area": "Shaheb Bazar",
        "avatar": "👩🏽‍🎤",
        "rating_avg": 5.0,
        "rating_count": 11,
        "teaches": ["Classical Sitar", "Nazrul Geeti"],
        "wants": ["Rooftop Gardening", "Video Editing"],
        "bio": "Classical music performer. Teaching ragas, finger technique, and expression on Sitar.",
        "blocked_users": [],
        "created_at": "2026-10-05T13:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },

    # Khulna Division
    {
        "firebase_uid": "uid-01977223344",
        "phone": "+8801977223344",
        "name": "Ashraful Islam",
        "district": "Khulna",
        "area": "Sonadanga",
        "avatar": "🧑🏽‍💻",
        "rating_avg": 4.8,
        "rating_count": 8,
        "teaches": ["Flutter & Mobile Apps", "Firebase Basics"],
        "wants": ["Traditional Pitha & Sweets", "HSC Math & Physics"],
        "bio": "Mobile app engineer in Sonadanga. Passionate about building cross-platform applications with Flutter.",
        "blocked_users": [],
        "created_at": "2026-10-08T09:30:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },
    {
        "firebase_uid": "uid-01788334455",
        "phone": "+8801788334455",
        "name": "Ruma Parveen",
        "district": "Khulna",
        "area": "Boyra",
        "avatar": "👩🏽‍🍳",
        "rating_avg": 5.0,
        "rating_count": 13,
        "teaches": ["Traditional Pitha & Sweets", "Fish Curry Recipes"],
        "wants": ["Flutter & Mobile Apps", "Excel & Accounts"],
        "bio": "Culinary heritage lover. I teach Patishapta, Chitoi, Bhapa, and authentic Sundarbans honey recipes.",
        "blocked_users": [],
        "created_at": "2026-10-10T12:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },

    # Barishal Division
    {
        "firebase_uid": "uid-01699445566",
        "phone": "+8801699445566",
        "name": "Biplob Roy",
        "district": "Barishal",
        "area": "Sadatganj",
        "avatar": "🪵",
        "rating_avg": 4.7,
        "rating_count": 5,
        "teaches": ["Woodworking & Joinery", "Chess Tactics"],
        "wants": ["Mobile Photography", "Spoken English"],
        "bio": "Carpenter and district chess competitor. Teaching hand plane tuning, dovetail joints, and endgame chess strategies.",
        "blocked_users": [],
        "created_at": "2026-10-12T15:45:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    },

    # Mymensingh Division
    {
        "firebase_uid": "uid-01588667788",
        "phone": "+8801588667788",
        "name": "Tanzila Khatun",
        "district": "Mymensingh",
        "area": "Town Hall",
        "avatar": "👩🏽‍🏫",
        "rating_avg": 4.9,
        "rating_count": 14,
        "teaches": ["Mymensingh Geetika & Folk Tales", "Spoken Bengali"],
        "wants": ["Graphic Design", "Rooftop Gardening"],
        "bio": "Folklorist and teacher passionate about Bengal's oral traditions, storytelling, and local cultural history.",
        "blocked_users": [],
        "created_at": "2026-10-14T11:00:00Z",
        "last_active": datetime.now(timezone.utc).isoformat()
    }
]

SAMPLE_REVIEWS = [
    {
        "rating": 5,
        "comment": "Shirin apa is an extraordinary mentor! Patient, encouraging, and helped me boost my IELTS speaking score from 6.0 to 7.5.",
        "reviewer_name": "Nafis Mahmud",
        "reviewer_avatar": "🧑🏽‍💻",
        "target_uid": "uid-01811223344"
    },
    {
        "rating": 5,
        "comment": "Tanvir taught me logo design and Illustrator shortcuts. My freelance gig profile looks 10x more professional now!",
        "reviewer_name": "Imran Kabir",
        "reviewer_avatar": "🎸",
        "target_uid": "uid-01911998877"
    },
    {
        "rating": 5,
        "comment": "Nusrat apa's Excel class made financial formulas super easy to grasp. We swapped Excel for Sourdough baking techniques.",
        "reviewer_name": "Farzana Rahman",
        "reviewer_avatar": "👩🏽‍🍳",
        "target_uid": "uid-01722334455"
    },
    {
        "rating": 5,
        "comment": "Amazing violin teacher! Ananya patiently taught me finger positions and bow angle. Wonderful neighborly spirit.",
        "reviewer_name": "Sabbir Hossain",
        "reviewer_avatar": "🧑🏽‍🔬",
        "target_uid": "uid-01822556677"
    },
    {
        "rating": 5,
        "comment": "Mehnaz apa's Nakshi Kantha workshop was unforgettable. Holding our traditional folk stitches in hands is pure joy.",
        "reviewer_name": "Ayesha Siddiqua",
        "reviewer_avatar": "👩🏽‍🏫",
        "target_uid": "uid-01833445566"
    },
    {
        "rating": 5,
        "comment": "Dr. Mizanur's rooftop composting system cut our household waste in half. His lemon bonsai trees are incredible!",
        "reviewer_name": "Fahmida Hasan",
        "reviewer_avatar": "👩🏽‍🎤",
        "target_uid": "uid-01755112233"
    }
]

async def seed_data():
    await connect_to_mongo()
    db = get_database()
    users_col = db["users"]
    reviews_col = db["reviews"]

    inserted_users = 0
    uid_to_id = {}

    for neighbor in REALISTIC_NEIGHBORS:
        existing = await users_col.find_one({"firebase_uid": neighbor["firebase_uid"]})
        if not existing:
            res = await users_col.insert_one(neighbor)
            uid_to_id[neighbor["firebase_uid"]] = str(res.inserted_id)
            inserted_users += 1
        else:
            uid_to_id[neighbor["firebase_uid"]] = str(existing["_id"])

    # Seed reviews
    inserted_reviews = 0
    for rev in SAMPLE_REVIEWS:
        target_id = uid_to_id.get(rev["target_uid"])
        if target_id:
            existing_rev = await reviews_col.find_one({
                "reviewee_id": target_id,
                "reviewer_name": rev["reviewer_name"]
            })
            if not existing_rev:
                review_doc = {
                    "reviewee_id": target_id,
                    "reviewer_id": "seed-reviewer-id",
                    "reviewer_name": rev["reviewer_name"],
                    "reviewer_avatar": rev["reviewer_avatar"],
                    "rating": rev["rating"],
                    "comment": rev["comment"],
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await reviews_col.insert_one(review_doc)
                inserted_reviews += 1

    print(f"Seeding completed successfully!")
    print(f"Neighbors: {inserted_users} new neighbors inserted (Total: {len(REALISTIC_NEIGHBORS)}).")
    print(f"Reviews: {inserted_reviews} authentic community reviews inserted.")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(seed_data())
