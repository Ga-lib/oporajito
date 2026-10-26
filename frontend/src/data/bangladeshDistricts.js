// All 64 Districts of Bangladesh grouped by 8 Divisions

export const bangladeshDivisions = [
  {
    name: "Dhaka",
    districts: [
      "Dhaka", "Gazipur", "Narayanganj", "Tangail", "Kishoreganj",
      "Manikganj", "Munshiganj", "Narsingdi", "Faridpur", "Gopalganj",
      "Madaripur", "Rajbari", "Shariatpur"
    ]
  },
  {
    name: "Chattogram",
    districts: [
      "Chattogram", "Cox's Bazar", "Cumilla", "Feni", "Brahmanbaria",
      "Rangamati", "Noakhali", "Chandpur", "Lakshmipur", "Khagrachhari", "Bandarban"
    ]
  },
  {
    name: "Rajshahi",
    districts: [
      "Rajshahi", "Bogura", "Pabna", "Sirajganj", "Naogaon",
      "Natore", "Chapainawabganj", "Joypurhat"
    ]
  },
  {
    name: "Khulna",
    districts: [
      "Khulna", "Jashore", "Kushtia", "Satkhira", "Bagerhat",
      "Jhenaidah", "Chuadanga", "Meherpur", "Narail", "Magura"
    ]
  },
  {
    name: "Barishal",
    districts: [
      "Barishal", "Patuakhali", "Bhola", "Pirojpur", "Barguna", "Jhalokati"
    ]
  },
  {
    name: "Sylhet",
    districts: [
      "Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"
    ]
  },
  {
    name: "Rangpur",
    districts: [
      "Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat",
      "Nilphamari", "Panchagarh", "Thakurgaon"
    ]
  },
  {
    name: "Mymensingh",
    districts: [
      "Mymensingh", "Jamalpur", "Netrokona", "Sherpur"
    ]
  }
];

// Flat list of all 64 districts sorted alphabetically
export const all64Districts = bangladeshDivisions
  .flatMap((div) => div.districts)
  .sort((a, b) => a.localeCompare(b));

// Popular skills across Bangladeshi neighborhoods
export const popularSkillTags = [
  "Spoken English",
  "Coding & Web Dev",
  "Graphic Design",
  "Acoustic Guitar",
  "Excel & Accounts",
  "IELTS Prep",
  "Bengali Calligraphy",
  "Home Baking",
  "HSC Math & Physics",
  "Mobile Photography",
  "Freelancing & Upwork",
  "Tailoring & Sewing",
  "Video Editing",
  "Urban Gardening"
];

// Cultural Avatar options
export const avatarOptions = [
  { emoji: "🧑🏽‍💻", label: "Developer / Student" },
  { emoji: "👩🏽‍🏫", label: "Teacher / Mentor" },
  { emoji: "🧑🏽‍🎨", label: "Artist / Designer" },
  { emoji: "👩🏽‍🍳", label: "Baker / Chef" },
  { emoji: "🧑🏽‍🔬", label: "Scientist / Tutor" },
  { emoji: "👩🏽‍💻", label: "Tech Specialist" },
  { emoji: "🧑🏽‍🌾", label: "Urban Gardener" },
  { emoji: "🎸", label: "Musician" },
  { emoji: "📚", label: "Book Lover" },
  { emoji: "🧕🏽", label: "Artisan / Crafter" }
];
