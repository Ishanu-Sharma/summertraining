/*
   THE QUAD — Seed Data
*/

const SEED = {

  settings: {
    platformName: "The Quad",
    supportEmail: "alumni@adtu.in",
    requireUniversityEmail: true,
    autoApproveJobs: false,
    allowStudentDirectoryView: true
  },

  users: [
    {
      id: "u1", role: "alumni", fullName: "Ishanu Sharma",
      email: "ishanu.sharma@adtu.in", password: "password123",
      gradYear: 2024, department: "Design",
      jobTitle: "UX Researcher", company: "Nimbus Health", industry: "Healthcare",
      location: "Pune, India", avatar: "https://i.pravatar.cc/200?img=53",
      bio: "UX Researcher who joined Nimbus Health straight out of AdtU. Still building out a proper research toolkit one project at a time — always happy to talk about qualitative methods, or about AdtU's design club, which I'm fairly sure no longer exists.",
      skills: ["UX Research", "Figma", "User Interviews", "Prototyping"],
      linkedin: "https://linkedin.com/in/ishanusharma-ux", website: "",
      experience: [
        { title: "UX Researcher", company: "Nimbus Health", period: "2024 — Present", location: "Pune", desc: "Runs user interviews for the patient-facing mobile app and is building out the team's first research playbook." },
        { title: "Design Intern", company: "AdtU Design Lab", period: "Summer 2023", location: "Campus", desc: "First real design job — a campus wayfinding app that a few people still use." }
      ],
      education: [
        { degree: "B.Des, Design", school: "Assam downtown University", period: "2020 — 2024" }
      ],
      verified: true,
      privacy: { showEmail: true, showInDirectory: true, allowStudentMessages: false },
      notifications: { messages: true, events: true, jobs: true },
      createdAtDaysAgo: 400
    },
    {
      id: "u2", role: "alumni", fullName: "Rohan Bhatt",
      email: "rohan.bhatt@adtu.in", password: "password123",
      gradYear: 2011, department: "Computer Science & Engineering",
      jobTitle: "Engineering Manager", company: "Corda Systems", industry: "Technology",
      location: "Bangalore, India", avatar: "https://i.pravatar.cc/200?img=33",
      bio: "Engineering manager who still remembers debugging his first C program in the AdtU computer lab at 2 AM. Now leads the payments platform team at Corda Systems.",
      skills: ["Backend Systems", "Team Leadership", "System Design", "Payments", "Mentoring"],
      linkedin: "https://linkedin.com/in/rohanbhatt", website: "",
      experience: [
        { title: "Engineering Manager", company: "Corda Systems", period: "2019 — Present", location: "Bangalore", desc: "Leads a team of 8 building the core payments platform." },
        { title: "Senior Software Engineer", company: "Quantify Labs", period: "2014 — 2019", location: "Bangalore", desc: "Built distributed systems for fraud detection." }
      ],
      education: [{ degree: "B.Tech, Computer Science & Engineering", school: "Assam Downtown University", period: "2007 — 2011" }],
      verified: true,
      privacy: { showEmail: true, showInDirectory: true, allowStudentMessages: true },
      notifications: { messages: true, events: true, jobs: true },
      createdAtDaysAgo: 620
    },
    {
      id: "u3", role: "alumni", fullName: "Meera Nair",
      email: "meera.nair@adtu.in", password: "password123",
      gradYear: 2015, department: "Business Administration",
      jobTitle: "Product Lead", company: "Finlytics", industry: "Finance",
      location: "Mumbai, India", avatar: "https://i.pravatar.cc/200?img=47",
      bio: "Product leader obsessed with building fintech for people who've never opened a spreadsheet. Previously took two products from zero to launch.",
      skills: ["Product Strategy", "Fintech", "0-to-1 Products", "User Research", "Roadmapping"],
      linkedin: "https://linkedin.com/in/meeranair", website: "",
      experience: [
        { title: "Product Lead", company: "Finlytics", period: "2022 — Present", location: "Mumbai", desc: "Owns the consumer lending product line." },
        { title: "Senior Product Manager", company: "Rupeeflow", period: "2018 — 2022", location: "Mumbai", desc: "Shipped the first version of instant micro-loans." }
      ],
      education: [{ degree: "B.Tech, Information Technology", school: "Assam Downtown University", period: "2011 — 2015" }],
      verified: true,
      privacy: { showEmail: true, showInDirectory: true, allowStudentMessages: false },
      notifications: { messages: true, events: false, jobs: true },
      createdAtDaysAgo: 500
    },
    {
      id: "u4", role: "alumni", fullName: "Priya Menon",
      email: "priya.menon@adtu.in", password: "password123",
      gradYear: 2016, department: "Computer Science & Engineering",
      jobTitle: "Senior Data Scientist", company: "Klaro", industry: "Technology",
      location: "Hyderabad, India", avatar: "https://i.pravatar.cc/200?img=45",
      bio: "Data scientist who fell in love with messy datasets. Currently building the recommendation engine at Klaro.",
      skills: ["Machine Learning", "Python", "A/B Testing", "Recommendation Systems", "SQL"],
      linkedin: "https://linkedin.com/in/priyamenon", website: "",
      experience: [
        { title: "Senior Data Scientist", company: "Klaro", period: "2023 — Present", location: "Hyderabad", desc: "Leads the personalization and recommendations team." },
        { title: "Data Scientist", company: "Klaro", period: "2016 — 2023", location: "Hyderabad", desc: "Built the company's first churn-prediction model." }
      ],
      education: [{ degree: "B.Tech, Computer Science & Engineering", school: "Assam Downtown University", period: "2012 — 2016" }],
      verified: true,
      privacy: { showEmail: true, showInDirectory: true, allowStudentMessages: true },
      notifications: { messages: true, events: true, jobs: false },
      createdAtDaysAgo: 460
    },
    {
      id: "u5", role: "alumni", fullName: "Karan Verma",
      email: "karan.verma@adtu.in", password: "password123",
      gradYear: 2013, department: "Computer Science & Engineering",
      jobTitle: "Data Lead", company: "Verto Analytics", industry: "Technology",
      location: "Delhi NCR, India", avatar: "https://i.pravatar.cc/200?img=19",
      bio: "Data lead who thinks every good decision starts with a boring dashboard nobody wanted to build.",
      skills: ["Data Engineering", "Analytics", "dbt", "Leadership", "SQL"],
      linkedin: "https://linkedin.com/in/karanverma", website: "",
      experience: [{ title: "Data Lead", company: "Verto Analytics", period: "2021 — Present", location: "Delhi NCR", desc: "Runs the analytics platform team." }],
      education: [{ degree: "B.Tech, Computer Science & Engineering", school: "Assam Downtown University", period: "2009 — 2013" }],
      verified: true,
      privacy: { showEmail: false, showInDirectory: true, allowStudentMessages: false },
      notifications: { messages: true, events: true, jobs: true },
      createdAtDaysAgo: 700
    },
    {
      id: "u6", role: "alumni", fullName: "Simran Kaur",
      email: "simran.kaur@adtu.in", password: "password123",
      gradYear: 2020, department: "Computer Science & Engineering",
      jobTitle: "Backend Engineer", company: "Northloop", industry: "Technology",
      location: "Bangalore, India", avatar: "https://i.pravatar.cc/200?img=9",
      bio: "Backend engineer who joined Northloop right out of college and hasn't looked back.",
      skills: ["Node.js", "Distributed Systems", "APIs", "Databases"],
      linkedin: "https://linkedin.com/in/simrankaur", website: "",
      experience: [{ title: "Backend Engineer", company: "Northloop", period: "2020 — Present", location: "Bangalore", desc: "Builds the core API platform." }],
      education: [{ degree: "B.Tech, Computer Science & Engineering", school: "Assam Downtown University", period: "2016 — 2020" }],
      verified: true,
      privacy: { showEmail: true, showInDirectory: true, allowStudentMessages: true },
      notifications: { messages: true, events: true, jobs: true },
      createdAtDaysAgo: 6
    },
    {
      id: "u7", role: "alumni", fullName: "Nikhil Desai",
      email: "nikhil.desai@adtu.in", password: "password123",
      gradYear: 2018, department: "Design",
      jobTitle: "Design Lead", company: "Studio Arc", industry: "Design & Creative",
      location: "Ahmedabad, India", avatar: "https://i.pravatar.cc/200?img=21",
      bio: "Design lead who still sketches on paper before opening Figma. Runs the design team at Studio Arc.",
      skills: ["Design Leadership", "Branding", "Design Systems", "Figma"],
      linkedin: "https://linkedin.com/in/nikhildesai", website: "",
      experience: [{ title: "Design Lead", company: "Studio Arc", period: "2022 — Present", location: "Ahmedabad", desc: "Leads a team of 5 designers across client projects." }],
      education: [{ degree: "B.Des, Design", school: "Assam Downtown University", period: "2014 — 2018" }],
      verified: true,
      privacy: { showEmail: true, showInDirectory: true, allowStudentMessages: false },
      notifications: { messages: true, events: true, jobs: true },
      createdAtDaysAgo: 4
    },
    {
      id: "u8", role: "alumni", fullName: "Fatima Sheikh",
      email: "fatima.sheikh@adtu.in", password: "password123",
      gradYear: 2019, department: "Business Administration",
      jobTitle: "Marketing Manager", company: "Bloom & Co.", industry: "Marketing",
      location: "Mumbai, India", avatar: "https://i.pravatar.cc/200?img=39",
      bio: "Marketing manager who believes the best campaigns start with a good story, not a good budget.",
      skills: ["Brand Marketing", "Content Strategy", "Campaigns"],
      linkedin: "https://linkedin.com/in/fatimasheikh", website: "",
      experience: [{ title: "Marketing Manager", company: "Bloom & Co.", period: "2023 — Present", location: "Mumbai", desc: "Leads brand campaigns for the D2C portfolio." }],
      education: [{ degree: "BBA", school: "Assam Downtown University", period: "2015 — 2019" }],
      verified: false,
      privacy: { showEmail: true, showInDirectory: true, allowStudentMessages: false },
      notifications: { messages: true, events: true, jobs: true },
      createdAtDaysAgo: 3
    },
    {
      id: "u9", role: "alumni", fullName: "Arjun Pillai",
      email: "arjun.pillai@adtu.in", password: "password123",
      gradYear: 2017, department: "Business Administration",
      jobTitle: "Finance Analyst", company: "Meridian Capital", industry: "Finance",
      location: "Chennai, India", avatar: "https://i.pravatar.cc/200?img=14",
      bio: "Finance analyst who reads annual reports for fun, unfortunately.",
      skills: ["Financial Modeling", "Equity Research", "Excel"],
      linkedin: "https://linkedin.com/in/arjunpillai", website: "",
      experience: [{ title: "Finance Analyst", company: "Meridian Capital", period: "2021 — Present", location: "Chennai", desc: "Covers mid-cap industrials for the research desk." }],
      education: [{ degree: "BBA", school: "Assam Downtown University", period: "2013 — 2017" }],
      verified: false,
      privacy: { showEmail: true, showInDirectory: true, allowStudentMessages: false },
      notifications: { messages: true, events: false, jobs: true },
      createdAtDaysAgo: 5
    },
    {
      id: "u10", role: "alumni", fullName: "Vikram Rathore",
      email: "vikram.rathore@adtu.in", password: "password123",
      gradYear: 2010, department: "Computer Science & Engineering",
      jobTitle: "VP Engineering", company: "Solace Cloud", industry: "Technology",
      location: "Remote · Singapore", avatar: "https://i.pravatar.cc/200?img=58",
      bio: "VP Engineering who's been writing production code, on and off, since he was part of AdtU's very first graduating batch.",
      skills: ["Engineering Leadership", "Cloud Infrastructure", "Scaling Teams"],
      linkedin: "https://linkedin.com/in/vikramrathore", website: "",
      experience: [
        { title: "VP Engineering", company: "Solace Cloud", period: "2020 — Present", location: "Singapore", desc: "Oversees infrastructure and platform engineering." },
        { title: "Director of Engineering", company: "Corda Systems", period: "2015 — 2020", location: "Bangalore", desc: "Scaled the engineering org from 12 to 90." }
      ],
      education: [{ degree: "B.Tech, Computer Science & Engineering", school: "Assam Downtown University", period: "2006 — 2010" }],
      verified: true,
      privacy: { showEmail: false, showInDirectory: true, allowStudentMessages: false },
      notifications: { messages: true, events: true, jobs: true },
      createdAtDaysAgo: 800
    },
    {
      id: "u11", role: "alumni", fullName: "Neha Joshi",
      email: "neha.joshi@adtu.in", password: "password123",
      gradYear: 2019, department: "Computer Science & Engineering",
      jobTitle: "Product Manager", company: "Klaro", industry: "Technology",
      location: "Bangalore, India", avatar: "https://i.pravatar.cc/200?img=57",
      bio: "Product manager who moved from data science into product because she wanted to ship the thing, not just measure it.",
      skills: ["Product Management", "Analytics", "Roadmapping"],
      linkedin: "https://linkedin.com/in/nehajoshi", website: "",
      experience: [{ title: "Product Manager", company: "Klaro", period: "2022 — Present", location: "Bangalore", desc: "Owns the search & discovery roadmap." }],
      education: [{ degree: "B.Tech, Computer Science & Engineering", school: "Assam Downtown University", period: "2015 — 2019" }],
      verified: true,
      privacy: { showEmail: true, showInDirectory: true, allowStudentMessages: true },
      notifications: { messages: true, events: true, jobs: true },
      createdAtDaysAgo: 300
    },
    {
      id: "u12", role: "alumni", fullName: "Vivaan Kapoor",
      email: "vivaan.kapoor@adtu.in", password: "password123",
      gradYear: 2019, department: "Business Administration",
      jobTitle: "Finance Associate", company: "Solace Cloud", industry: "Finance",
      location: "Mumbai, India", avatar: "https://i.pravatar.cc/200?img=26",
      bio: "Finance associate who still owes half his batch a homecoming t-shirt design fee.",
      skills: ["Corporate Finance", "FP&A"],
      linkedin: "https://linkedin.com/in/vivaankapoor", website: "",
      experience: [{ title: "Finance Associate", company: "Solace Cloud", period: "2022 — Present", location: "Mumbai", desc: "" }],
      education: [{ degree: "BBA", school: "Assam Downtown University", period: "2015 — 2019" }],
      verified: true,
      privacy: { showEmail: true, showInDirectory: true, allowStudentMessages: false },
      notifications: { messages: true, events: true, jobs: true },
      createdAtDaysAgo: 280
    },
    {
      id: "admin1", role: "admin", fullName: "AdtU Alumni Office",
      email: "admin@adtu.in", password: "admin123",
      gradYear: null, department: null,
      jobTitle: "Administrator", company: "Assam Downtown University", industry: "",
      location: "AdtU Campus", avatar: "https://i.pravatar.cc/200?img=68",
      bio: "Official account for the Assam Downtown University Alumni Relations Office.",
      skills: [], linkedin: "", website: "",
      experience: [], education: [],
      verified: true,
      privacy: { showEmail: true, showInDirectory: false, allowStudentMessages: true },
      notifications: { messages: true, events: true, jobs: true },
      createdAtDaysAgo: 1200
    }
  ],

  /* symmetric connections — presence of a pair means "connected" */
  connections: [
    ["u1", "u2"], ["u1", "u3"], ["u1", "u4"], ["u1", "u5"], ["u1", "u7"], ["u1", "admin1"],
    ["u2", "u10"], ["u3", "u4"], ["u6", "u2"]
  ],

  events: [
    {
      id: "e1", title: "Homecoming Reunion 2026", featured: true,
      date: "2026-10-17", time: "5:00 PM – 11:00 PM",
      location: "Amphitheatre, AdtU Campus", type: "in-person", status: "published",
      description: "Three graduating classes, one lawn, and a night that always somehow runs two hours longer than planned. Expect live music from The Campus Collective, a food truck line-up curated by the Class of 2018 hospitality crowd, and the Dean's now-infamous karaoke hour.",
      cohort: "Classes of 2016, 2018 & 2020",
      agenda: [
        { time: "5:00 PM", title: "Check-in & Welcome Drinks", note: "Amphitheatre entrance" },
        { time: "5:45 PM", title: "Dean's Address & Class Shoutouts", note: "" },
        { time: "6:30 PM", title: "Food Trucks Open", note: "" },
        { time: "7:30 PM", title: "Live Music — The Campus Collective", note: "" },
        { time: "9:00 PM", title: "The Dean's Karaoke Hour", note: "Bring earplugs, or better — bring backup singers" },
        { time: "10:30 PM", title: "Wrap-up", note: "" }
      ],
      hosts: [{ userId: "admin1", label: "Official host" }, { userId: "u4", label: "Class of 2018 Reunion Committee" }],
      attendeeIds: ["u1", "u2", "u3", "u4", "u5"],
      comments: [
        { userId: "u2", text: "Is parking available on the Amphitheatre side, or should we park at the main gate?", daysAgo: 4 },
        { userId: "admin1", text: "Amphitheatre parking opens at 4:30 PM. Overflow parking is available at the Sports Complex lot, a 5-minute walk away.", daysAgo: 4 },
        { userId: "u4", text: "Bringing my 2018 batch crew — we're doing the matching t-shirts again, don't say we didn't warn you.", daysAgo: 3 }
      ]
    },
    {
      id: "e2", title: "Bangalore Chapter Dinner",
      date: "2026-08-02", time: "7:30 PM",
      location: "Koramangala, Bangalore", type: "in-person", status: "published",
      description: "A relaxed dinner meetup for every AdtU alum currently in Bangalore. No agenda, no karaoke — just good food and better conversation.",
      cohort: "All batches",
      agenda: [{ time: "7:30 PM", title: "Dinner & Drinks", note: "" }],
      hosts: [{ userId: "u2", label: "Bangalore Chapter Lead" }],
      attendeeIds: ["u2", "u6", "u10"],
      comments: []
    },
    {
      id: "e3", title: "Careers in AI — CS Dept Webinar",
      date: "2026-07-22", time: "7:00 PM IST",
      location: "Online · Zoom", type: "online", status: "published",
      description: "A panel of AdtU CS alumni working in AI/ML talk about how they broke in, what they'd do differently, and what to actually study.",
      cohort: "CSE alumni & students",
      agenda: [
        { time: "7:00 PM", title: "Panel Discussion", note: "" },
        { time: "7:45 PM", title: "Live Q&A", note: "" }
      ],
      hosts: [{ userId: "admin1", label: "CS Department" }],
      attendeeIds: ["u1", "u4", "u6"],
      comments: []
    },
    {
      id: "e4", title: "Design Alumni Meetup",
      date: "2026-09-05", time: "6:00 PM",
      location: "Mumbai", type: "in-person", status: "published",
      description: "Design-batch alumni catching up over coffee and a portfolio show-and-tell.",
      cohort: "Design alumni",
      agenda: [{ time: "6:00 PM", title: "Coffee & Portfolio Show-and-Tell", note: "" }],
      hosts: [{ userId: "u7", label: "Design Alumni Group" }],
      attendeeIds: ["u7"],
      comments: []
    },
    {
      id: "e5", title: "Annual Giving Town Hall",
      date: "2026-11-12", time: "6:30 PM IST",
      location: "Online · Zoom", type: "online", status: "published",
      description: "An update from the Alumni Office on where last year's scholarship fund went, and how to get involved this year.",
      cohort: "All batches",
      agenda: [{ time: "6:30 PM", title: "Town Hall & Q&A", note: "" }],
      hosts: [{ userId: "admin1", label: "Alumni Relations Office" }],
      attendeeIds: [],
      comments: []
    },
    {
      id: "e6", title: "Women in Tech Panel",
      date: "2026-08-20", time: "5:00 PM",
      location: "Delhi NCR", type: "in-person", status: "published",
      description: "AdtU women in engineering and product share what changed (and what didn't) across their first ten years of work.",
      cohort: "All batches",
      agenda: [{ time: "5:00 PM", title: "Panel & Networking", note: "" }],
      hosts: [{ userId: "u5", label: "Delhi NCR Chapter" }],
      attendeeIds: ["u5"],
      comments: []
    },
    {
      id: "e7", title: "Founders' Day Gala 2025",
      date: "2025-03-03", time: "6:00 PM",
      location: "AdtU Campus", type: "in-person", status: "published",
      description: "The university's annual founders' day celebration, open to all alumni.",
      cohort: "All batches",
      agenda: [], hosts: [{ userId: "admin1", label: "Official host" }],
      attendeeIds: ["u1", "u2", "u3", "u4", "u5", "u10"],
      comments: []
    },
    {
      id: "e8", title: "Silicon Valley Chapter Mixer",
      date: "2025-01-18", time: "6:00 PM",
      location: "San Francisco, USA", type: "in-person", status: "published",
      description: "A mixer for AdtU alumni in the Bay Area.",
      cohort: "All batches",
      agenda: [], hosts: [{ userId: "u10", label: "Silicon Valley Chapter" }],
      attendeeIds: ["u10"],
      comments: []
    },
    {
      id: "e9", title: "Class of 2015 — 10 Year Reunion",
      date: "2025-12-06", time: "5:00 PM",
      location: "AdtU Campus", type: "in-person", status: "published",
      description: "The Class of 2015 marks ten years since graduation.",
      cohort: "Class of 2015",
      agenda: [], hosts: [{ userId: "u3", label: "Class of 2015 Committee" }],
      attendeeIds: ["u3"],
      comments: []
    }
  ],

  /* one rsvp per (userId, eventId): status = "going" | "interested" | "not-going" */
  eventRsvps: [
    { userId: "u1", eventId: "e1", status: "going" },
    { userId: "u1", eventId: "e3", status: "interested" }
  ],

  jobs: [
    {
      id: "j1", title: "Product Designer", company: "Nimbus Health", location: "Remote",
      type: "Full-time", experience: "3–6 years", salary: "",
      description: "Own end-to-end design for our patient-facing mobile app, from research through to shipped feature.",
      applyLink: "careers@nimbushealth.example", referralNote: "Happy to refer directly — message me first.",
      postedBy: "u1", status: "approved", postedDaysAgo: 2
    },
    {
      id: "j2", title: "Backend Engineer", company: "Corda Systems", location: "Bangalore",
      type: "Full-time", experience: "1–3 years", salary: "₹18–26 LPA",
      description: "Join the payments platform team building high-throughput transaction systems.",
      applyLink: "https://cordasystems.example/careers/backend-engineer", referralNote: "Referral available for strong CSE candidates.",
      postedBy: "u2", status: "approved", postedDaysAgo: 3
    },
    {
      id: "j3", title: "Growth Marketer", company: "Finlytics", location: "Mumbai",
      type: "Full-time", experience: "3–6 years", salary: "",
      description: "Lead acquisition campaigns across paid and lifecycle channels for our consumer lending product.",
      applyLink: "careers@finlytics.example", referralNote: "",
      postedBy: "u3", status: "pending", postedDaysAgo: 5
    },
    {
      id: "j4", title: "Data Analytics Intern", company: "Klaro", location: "Hyderabad",
      type: "Internship", experience: "Entry-level / Fresher", salary: "",
      description: "A 6-month internship on the personalization team, working directly with the data science org.",
      applyLink: "https://klaro.example/careers/data-intern", referralNote: "Great fit for an AdtU CSE final-year student.",
      postedBy: "u4", status: "approved", postedDaysAgo: 7
    },
    {
      id: "j5", title: "Frontend Engineer", company: "Northloop", location: "Bangalore",
      type: "Full-time", experience: "1–3 years", salary: "₹16–22 LPA",
      description: "Build the core dashboard product used by our enterprise customers.",
      applyLink: "https://northloop.example/careers", referralNote: "",
      postedBy: "u6", status: "approved", postedDaysAgo: 7
    },
    {
      id: "j6", title: "Finance Associate", company: "Meridian Capital", location: "Chennai",
      type: "Contract", experience: "1–3 years", salary: "",
      description: "Support the research desk with financial modeling and sector analysis.",
      applyLink: "careers@meridiancapital.example", referralNote: "",
      postedBy: "u9", status: "approved", postedDaysAgo: 14
    }
  ],

  savedJobs: [],
  appliedJobs: [{ userId: "u1", jobId: "j6", appliedDaysAgo: 6 }],

  posts: [
    { id: "p1", authorId: "u2", text: "Corda Systems is hiring two backend engineers in Bangalore — happy to refer anyone from AdtU CSE. Drop me a message if that's you.", tag: "Jobs", likedBy: ["u1", "u4", "u5"], hoursAgo: 2, replies: [] },
    { id: "p2", authorId: "u4", text: "Small win — just got promoted to Senior Data Scientist at Klaro. Thank you to everyone here who mentored me through the first two brutal years. This place matters more than I let on back then.", tag: "", likedBy: ["u1", "u2", "u3"], hoursAgo: 5, replies: [] },
    { id: "p3", authorId: "admin1", text: "Reminder: Homecoming RSVPs close this Friday. 209 alumni going so far from the classes of 2016, 2018 & 2020 — see the full lineup and grab your spot.", tag: "Event", likedBy: ["u1", "u5"], hoursAgo: 24, replies: [] },
    { id: "p4", authorId: "u1", text: "Running a free 30-minute \"how to break into UX research\" session for any AdtU batch. Comment or message me if you want a slot.", tag: "", likedBy: ["u2", "u3", "u7"], hoursAgo: 72, replies: [] },
    { id: "p5", authorId: "u1", text: "Homecoming planning committee, assemble. Who's helping with the design-batch reunion booth this year?", tag: "", likedBy: ["u7"], hoursAgo: 720, replies: [] }
  ],

  /* each conversation is between exactly two users for this build */
  conversations: [
    {
      id: "c1", participantIds: ["u1", "u2"],
      messages: [
        { senderId: "u2", text: "Hey Ishanu! Saw your post about the free UX research sessions — nice initiative.", minutesAgo: 146 },
        { senderId: "u1", text: "Hi Rohan! Thank you, happy to help if anyone from your team wants to chat.", minutesAgo: 142 },
        { senderId: "u2", text: "Actually — we're hiring two backend engineers on my team. Know anyone from your batch who might be interested?", minutesAgo: 133 },
        { senderId: "u1", text: "I might! Let me ask around and get back to you.", minutesAgo: 129 },
        { senderId: "u2", text: "Perfect. Sure, send me your resume and I'll pass it to HR directly if you know someone good.", minutesAgo: 120 }
      ],
      lastReadAt: { u1: null, u2: null }
    },
    {
      id: "c2", participantIds: ["u1", "u3"],
      messages: [{ senderId: "u3", text: "Let's catch up properly at homecoming!", minutesAgo: 1500 }],
      lastReadAt: { u1: Date.now(), u3: null }
    },
    {
      id: "c3", participantIds: ["u1", "u4"],
      messages: [{ senderId: "u4", text: "Congrats again on the promotion news 🎉", minutesAgo: 1600 }],
      lastReadAt: { u1: Date.now(), u4: null }
    },
    {
      id: "c4", participantIds: ["u1", "admin1"],
      messages: [{ senderId: "admin1", text: "Your RSVP for Homecoming Reunion 2026 is confirmed.", minutesAgo: 4000 }],
      lastReadAt: { u1: Date.now(), admin1: null }
    },
    {
      id: "c5", participantIds: ["u1", "u7"],
      messages: [{ senderId: "u7", text: "Thanks for connecting! Would love your take on our onboarding flow sometime.", minutesAgo: 8000 }],
      lastReadAt: { u1: Date.now(), u7: null }
    },
    {
      id: "c6", participantIds: ["u1", "u5"],
      messages: [{ senderId: "u5", text: "Long time! How's Pune treating you?", minutesAgo: 12000 }],
      lastReadAt: { u1: Date.now(), u5: null }
    }
  ]
};

/* Canned auto-replies used only to make the Messages demo feel alive — purely cosmetic, no real recipient. */
const AUTO_REPLIES = [
  "Got it, thanks for the update!",
  "Sounds good — talk soon.",
  "Appreciate you reaching out!",
  "Noted, will get back to you shortly.",
  "Haha, fair enough. Let's catch up properly soon."
];