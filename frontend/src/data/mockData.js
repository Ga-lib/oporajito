// Initial Mock Data for Oporajito Skill Sharing App
// Realistic Bangladeshi neighborhood data

export const currentUser = {
  id: "user-current",
  name: "Rafiq Islam",
  phone: "+8801712345678",
  district: "Dhaka",
  area: "Mirpur 10",
  bio: "3rd year CSE student at BUET. Passionate about teaching Python & basic web dev. Looking for someone nearby to teach me acoustic guitar and graphic design!",
  avatar: "🧑🏽‍💻",
  rating_avg: 4.8,
  rating_count: 12,
  teaches: ["Coding & Web Dev", "Spoken English", "Excel & Accounts"],
  wants: ["Acoustic Guitar", "Graphic Design", "Mobile Photography"],
  created_at: "2026-08-15T10:00:00Z",
  last_active: "Just now"
};

export const neighbors = [
  {
    id: "user-1",
    name: "Shirin Akter",
    phone: "+8801811223344",
    district: "Dhaka",
    area: "Mirpur 2",
    avatar: "👩🏽‍🏫",
    rating_avg: 4.9,
    rating_count: 21,
    teaches: ["Spoken English", "IELTS Prep", "Bengali Calligraphy"],
    wants: ["Coding & Web Dev", "Excel & Accounts"],
    distanceKm: 0.8,
    bio: "Lecturer & language enthusiast. I have helped 40+ neighborhood kids and undergrads ace their IELTS speaking. Would love to learn practical web coding!",
    reviews: [
      {
        id: "rev-1",
        reviewer_name: "Rafiq Islam",
        reviewer_avatar: "🧑🏽‍💻",
        rating: 5,
        comment: "Apu is so patient! In just two weekend sessions, my IELTS cue card confidence improved tremendously.",
        created_at: "2 days ago"
      },
      {
        id: "rev-2",
        reviewer_name: "Tanvir Ahmed",
        reviewer_avatar: "🧑🏽‍🎨",
        rating: 5,
        comment: "Excellent teacher with clear pronunciation exercises.",
        created_at: "1 week ago"
      }
    ]
  },
  {
    id: "user-2",
    name: "Tanvir Ahmed",
    phone: "+8801911998877",
    district: "Dhaka",
    area: "Kazipara",
    avatar: "🧑🏽‍🎨",
    rating_avg: 4.7,
    rating_count: 9,
    teaches: ["Graphic Design", "Photoshop", "Mobile Photography"],
    wants: ["Spoken English", "Acoustic Guitar"],
    distanceKm: 1.2,
    bio: "Freelance brand designer based in Kazipara. Happy to teach Figma, Adobe Illustrator, and visual identity principles in exchange for conversational English.",
    reviews: [
      {
        id: "rev-3",
        reviewer_name: "Farzana Rahman",
        reviewer_avatar: "👩🏽‍🍳",
        rating: 4.5,
        comment: "Designed my bakery logo together and taught me how to edit photos for Instagram!",
        created_at: "3 weeks ago"
      }
    ]
  },
  {
    id: "user-3",
    name: "Nusrat Jahan",
    phone: "+8801722334455",
    district: "Dhaka",
    area: "Mirpur 10",
    avatar: "👩🏽‍💼",
    rating_avg: 5.0,
    rating_count: 15,
    teaches: ["Excel & Accounts", "Freelancing & Upwork", "Tax Basics"],
    wants: ["Coding & Web Dev", "Home Baking"],
    distanceKm: 0.4,
    bio: "Financial analyst at a local firm. I love demystifying Excel spreadsheets, VLOOKUPs, pivot tables, and Upwork profile setups for beginners.",
    reviews: [
      {
        id: "rev-4",
        reviewer_name: "Rafiq Islam",
        reviewer_avatar: "🧑🏽‍💻",
        rating: 5,
        comment: "Nusrat explained Excel pivot tables and formulas so clearly. Great first session!",
        created_at: "5 days ago"
      }
    ]
  },
  {
    id: "user-4",
    name: "Imran Kabir",
    phone: "+8801611778899",
    district: "Dhaka",
    area: "Agargaon",
    avatar: "🎸",
    rating_avg: 4.6,
    rating_count: 7,
    teaches: ["Acoustic Guitar", "Music Theory", "Vocal Warmups"],
    wants: ["Coding & Web Dev", "Spoken English"],
    distanceKm: 2.1,
    bio: "Guitarist in an indie rock band. I teach fingerstyle, basic chords, and rhythm strumming in neighborhood parks and quiet cafes.",
    reviews: [
      {
        id: "rev-5",
        reviewer_name: "Mahmud Hasan",
        reviewer_avatar: "🧑🏽‍🔬",
        rating: 4.5,
        comment: "Super chill vibe. Broke down fingerpicking step by step.",
        created_at: "2 weeks ago"
      }
    ]
  },
  {
    id: "user-5",
    name: "Farzana Rahman",
    phone: "+8801511443322",
    district: "Dhaka",
    area: "Shewrapara",
    avatar: "👩🏽‍🍳",
    rating_avg: 4.8,
    rating_count: 18,
    teaches: ["Home Baking", "Bengali Calligraphy", "Dessert Styling"],
    wants: ["Graphic Design", "Excel & Accounts"],
    distanceKm: 1.6,
    bio: "Home baker who loves baking sourdough, cakes, and cookies. I also practice traditional Bengali cursive calligraphy. Looking to learn bookkeeping for my home kitchen.",
    reviews: [
      {
        id: "rev-6",
        reviewer_name: "Nusrat Jahan",
        reviewer_avatar: "👩🏽‍💼",
        rating: 5,
        comment: "Baked our first lemon drizzle cake together! Wonderful neighbor.",
        created_at: "1 month ago"
      }
    ]
  },
  {
    id: "user-6",
    name: "Sabbir Hossain",
    phone: "+8801799887766",
    district: "Chattogram",
    area: "GEC Circle",
    avatar: "🧑🏽‍🔬",
    rating_avg: 4.9,
    rating_count: 14,
    teaches: ["HSC Math & Physics", "Python Basics"],
    wants: ["Spoken English", "Mobile Photography"],
    distanceKm: 220,
    bio: "Physics tutor at GEC Circle. I make complex calculus and mechanics intuitive and fun through real-world experiments.",
    reviews: []
  },
  {
    id: "user-7",
    name: "Mehnaz Chowdhury",
    phone: "+8801833445566",
    district: "Sylhet",
    area: "Zindabazar",
    avatar: "🧕🏽",
    rating_avg: 5.0,
    rating_count: 8,
    teaches: ["Tailoring & Sewing", "Traditional Nakshi Kantha"],
    wants: ["Freelancing & Upwork", "Spoken English"],
    distanceKm: 240,
    bio: "Master artisan of Nakshi Kantha hand-embroidery. Preserving our folk stitch traditions while learning digital freelancing.",
    reviews: []
  }
];

export const initialRequests = [
  {
    id: "req-101",
    from_user_id: "user-3",
    from_user_name: "Nusrat Jahan",
    from_user_avatar: "👩🏽‍💼",
    from_user_area: "Mirpur 10, Dhaka",
    to_user_id: "user-current",
    skill: "Coding & Web Dev",
    offered_skill: "Excel & Accounts",
    message: "Assalamu Alaikum Rafiq! I saw your profile and would love to learn HTML/CSS basics for a portfolio site. I can teach you advanced Excel or accounting in return!",
    status: "accepted",
    created_at: "Yesterday at 4:30 PM"
  },
  {
    id: "req-102",
    from_user_id: "user-4",
    from_user_name: "Imran Kabir",
    from_user_avatar: "🎸",
    from_user_area: "Agargaon, Dhaka",
    to_user_id: "user-current",
    skill: "Coding & Web Dev",
    offered_skill: "Acoustic Guitar",
    message: "Hey brother, saw you want to learn guitar! Ready to trade guitar chords for Python coding tips?",
    status: "pending",
    created_at: "2 hours ago"
  },
  {
    id: "req-103",
    from_user_id: "user-current",
    from_user_name: "Rafiq Islam",
    from_user_avatar: "🧑🏽‍💻",
    to_user_id: "user-1",
    to_user_name: "Shirin Akter",
    to_user_avatar: "👩🏽‍🏫",
    to_user_area: "Mirpur 2, Dhaka",
    skill: "IELTS Prep",
    offered_skill: "Spoken English",
    message: "Apu, I am preparing for my IELTS exam next month. Would love to practice speaking cue cards with you!",
    status: "completed",
    created_at: "3 days ago"
  },
  {
    id: "req-104",
    from_user_id: "user-current",
    from_user_name: "Rafiq Islam",
    from_user_avatar: "🧑🏽‍💻",
    to_user_id: "user-2",
    to_user_name: "Tanvir Ahmed",
    to_user_avatar: "🧑🏽‍🎨",
    to_user_area: "Kazipara, Dhaka",
    skill: "Graphic Design",
    offered_skill: "Coding & Web Dev",
    message: "Hi Tanvir, I want to learn the basics of Figma to design my personal web app. Happy to help you with web coding!",
    status: "pending",
    created_at: "Yesterday"
  }
];

export const initialConversations = [
  {
    id: "convo-1",
    participant_id: "user-3",
    name: "Nusrat Jahan",
    avatar: "👩🏽‍💼",
    area: "Mirpur 10, Dhaka",
    skill_topic: "Excel & Web Dev Swap",
    lastMessage: "Sure, Saturday 5pm works for me!",
    last_message_at: "2m ago",
    unread: 1,
    messages: [
      { id: "m-1", sender_id: "user-3", text: "Hi Rafiq! I saw your request and would love to do the skill swap.", created_at: "10:14 AM" },
      { id: "m-2", sender_id: "user-current", text: "Assalamu Alaikum Nusrat! That sounds fantastic. I can teach you frontend basics from scratch.", created_at: "10:16 AM" },
      { id: "m-3", sender_id: "user-3", text: "That sounds great. When are you free this week?", created_at: "10:20 AM" },
      { id: "m-4", sender_id: "user-current", text: "Saturday afternoon works for me, around 5pm? We can meet at the public library or coffee corner in Mirpur 10.", created_at: "10:22 AM" },
      { id: "m-5", sender_id: "user-3", text: "Sure, Saturday 5pm works for me!", created_at: "10:25 AM" }
    ]
  },
  {
    id: "convo-2",
    participant_id: "user-4",
    name: "Imran Kabir",
    avatar: "🎸",
    area: "Agargaon, Dhaka",
    skill_topic: "Guitar for Coding",
    lastMessage: "Bring your guitar to Mirpur park?",
    last_message_at: "1h ago",
    unread: 0,
    messages: [
      { id: "m-201", sender_id: "user-4", text: "Hey Rafiq! Ready for your first acoustic guitar lesson?", created_at: "Yesterday" },
      { id: "m-202", sender_id: "user-current", text: "Yes, very excited! I'll prepare a beginner roadmap for Python too.", created_at: "Yesterday" },
      { id: "m-203", sender_id: "user-4", text: "Bring your guitar to Mirpur park?", created_at: "1h ago" }
    ]
  },
  {
    id: "convo-3",
    participant_id: "user-1",
    name: "Shirin Akter",
    avatar: "👩🏽‍🏫",
    area: "Mirpur 2, Dhaka",
    skill_topic: "IELTS Speaking Prep",
    lastMessage: "Thank you for the review! Keep practicing daily 🌸",
    last_message_at: "1d ago",
    unread: 0,
    messages: [
      { id: "m-301", sender_id: "user-1", text: "You did great on the cue card questions today Rafiq!", created_at: "2 days ago" },
      { id: "m-302", sender_id: "user-current", text: "Thank you so much Apu! I left you a 5-star review.", created_at: "1 day ago" },
      { id: "m-303", sender_id: "user-1", text: "Thank you for the review! Keep practicing daily 🌸", created_at: "1 day ago" }
    ]
  }
];

export const initialNotifications = [
  {
    id: "notif-1",
    type: "request_received",
    title: "New Swap Request",
    message: "Imran Kabir wants to learn Coding & Web Dev from you in exchange for Acoustic Guitar.",
    created_at: "2 hours ago",
    read: false,
    link: "/requests"
  },
  {
    id: "notif-2",
    type: "request_accepted",
    title: "Request Accepted!",
    message: "Nusrat Jahan accepted your skill swap request. Chat is now open!",
    created_at: "Yesterday",
    read: false,
    link: "/chat/convo-1"
  },
  {
    id: "notif-3",
    type: "new_message",
    title: "New Message",
    message: "Nusrat Jahan: 'Sure, Saturday 5pm works for me!'",
    created_at: "2m ago",
    read: false,
    link: "/chat/convo-1"
  },
  {
    id: "notif-4",
    type: "review_received",
    title: "Review Received",
    message: "Shirin Akter left you a 5-star review for Spoken English practice.",
    created_at: "2 days ago",
    read: true,
    link: "/profile"
  }
];
