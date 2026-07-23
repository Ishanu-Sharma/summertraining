/*
   THE QUAD — db.js
*/

const Store = {
  key(table) { return "quad_db_" + table; },
  get(table) {
    const raw = localStorage.getItem(this.key(table));
    return raw ? JSON.parse(raw) : [];
  },
  set(table, arr) {
    localStorage.setItem(this.key(table), JSON.stringify(arr));
  },
  getObj(key, fallback) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  },
  setObj(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  }
};

function newId(prefix) {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function delayResolve(value, ms) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms === undefined ? 130 : ms));
}

function daysAgoToISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
function hoursAgoToISO(hours) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}
function minutesAgoToISO(mins) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - mins);
  return d.toISOString();
}

/* ---------- SEEDING (runs once per browser) ---------- */
function seedDatabaseIfNeeded() {
  if (localStorage.getItem("quad_seeded_v1")) return;

  const users = SEED.users.map(u => ({
    ...u,
    createdAt: daysAgoToISO(u.createdAtDaysAgo || 0)
  }));
  Store.set("users", users);

  Store.set("connections", SEED.connections);

  Store.set("events", SEED.events.map(e => ({
    ...e,
    comments: (e.comments || []).map(c => ({ ...c, id: newId("cm"), createdAt: daysAgoToISO(c.daysAgo || 0) }))
  })));

  Store.set("eventRsvps", SEED.eventRsvps);

  Store.set("jobs", SEED.jobs.map(j => ({
    ...j,
    postedAt: daysAgoToISO(j.postedDaysAgo || 0)
  })));

  Store.set("savedJobs", SEED.savedJobs);
  Store.set("appliedJobs", SEED.appliedJobs.map(a => ({ ...a, appliedAt: daysAgoToISO(a.appliedDaysAgo || 0) })));

  Store.set("posts", SEED.posts.map(p => ({
    ...p,
    createdAt: hoursAgoToISO(p.hoursAgo || 0)
  })));

  const conversations = SEED.conversations.map(c => ({
    ...c,
    messages: c.messages.map(m => ({ ...m, id: newId("msg"), createdAt: minutesAgoToISO(m.minutesAgo || 0) })),
    lastReadAt: { ...c.lastReadAt }
  }));
  Store.set("conversations", conversations);

  Store.setObj("quad_settings", SEED.settings);

  localStorage.setItem("quad_seeded_v1", "1");
}
seedDatabaseIfNeeded();

/* ---------- DB API ---------- */
const DB = {

  /* ---- USERS ---- */
  getUsers() { return delayResolve(Store.get("users")); },
  getUser(id) { return delayResolve(Store.get("users").find(u => u.id === id) || null); },
  getUserByEmail(email) {
    const e = (email || "").trim().toLowerCase();
    return delayResolve(Store.get("users").find(u => u.email.toLowerCase() === e) || null);
  },
  createUser(data) {
    const users = Store.get("users");
    const user = {
      id: newId("u"),
      role: "alumni",
      verified: false,
      skills: [], experience: [], education: [],
      privacy: { showEmail: true, showInDirectory: true, allowStudentMessages: false },
      notifications: { messages: true, events: true, jobs: true },
      avatar: "https://i.pravatar.cc/200?img=" + (10 + Math.floor(Math.random() * 60)),
      createdAt: new Date().toISOString(),
      ...data
    };
    users.push(user);
    Store.set("users", users);
    return delayResolve(user);
  },
  updateUser(id, patch) {
    const users = Store.get("users");
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return delayResolve(null);
    users[idx] = { ...users[idx], ...patch };
    Store.set("users", users);
    return delayResolve(users[idx]);
  },

  /* ---- CONNECTIONS ---- */
  getConnectionsFor(userId) {
    const pairs = Store.get("connections");
    const ids = pairs.filter(p => p.includes(userId)).map(p => p[0] === userId ? p[1] : p[0]);
    return delayResolve(ids);
  },
  isConnected(a, b) {
    const pairs = Store.get("connections");
    const found = pairs.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));
    return delayResolve(found);
  },
  connectUsers(a, b) {
    const pairs = Store.get("connections");
    const exists = pairs.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));
    if (!exists) { pairs.push([a, b]); Store.set("connections", pairs); }
    return delayResolve(true);
  },

  /* ---- EVENTS ---- */
  getEvents() { return delayResolve(Store.get("events")); },
  getEvent(id) { return delayResolve(Store.get("events").find(e => e.id === id) || null); },
  deleteEvent(id) {
    Store.set("events", Store.get("events").filter(e => e.id !== id));
    return delayResolve(true);
  },
  addEventComment(eventId, userId, text) {
    const events = Store.get("events");
    const ev = events.find(e => e.id === eventId);
    if (!ev) return delayResolve(null);
    const comment = { id: newId("cm"), userId, text, createdAt: new Date().toISOString() };
    ev.comments = ev.comments || [];
    ev.comments.push(comment);
    Store.set("events", events);
    return delayResolve(comment);
  },
  getRsvp(userId, eventId) {
    const r = Store.get("eventRsvps").find(x => x.userId === userId && x.eventId === eventId);
    return delayResolve(r ? r.status : null);
  },
  getRsvpsForUser(userId) {
    return delayResolve(Store.get("eventRsvps").filter(r => r.userId === userId));
  },
  setRsvp(userId, eventId, status) {
    const rsvps = Store.get("eventRsvps");
    const existing = rsvps.find(r => r.userId === userId && r.eventId === eventId);
    const events = Store.get("events");
    const ev = events.find(e => e.id === eventId);

    if (existing) {
      const wasGoing = existing.status === "going";
      existing.status = status;
      if (ev) {
        const nowGoing = status === "going";
        if (wasGoing && !nowGoing) ev.attendeeIds = (ev.attendeeIds || []).filter(id => id !== userId);
        if (!wasGoing && nowGoing && !ev.attendeeIds.includes(userId)) ev.attendeeIds.push(userId);
      }
    } else {
      rsvps.push({ userId, eventId, status });
      if (ev && status === "going" && !ev.attendeeIds.includes(userId)) ev.attendeeIds.push(userId);
    }
    Store.set("eventRsvps", rsvps);
    Store.set("events", events);
    return delayResolve(true);
  },

  /* ---- JOBS ---- */
  getJobs() { return delayResolve(Store.get("jobs")); },
  getJob(id) { return delayResolve(Store.get("jobs").find(j => j.id === id) || null); },
  createJob(data) {
    const jobs = Store.get("jobs");
    const job = { id: newId("j"), status: "pending", postedAt: new Date().toISOString(), ...data };
    jobs.unshift(job);
    Store.set("jobs", jobs);
    return delayResolve(job);
  },
  updateJobStatus(id, status) {
    const jobs = Store.get("jobs");
    const j = jobs.find(x => x.id === id);
    if (j) { j.status = status; Store.set("jobs", jobs); }
    return delayResolve(j || null);
  },
  deleteJob(id) {
    Store.set("jobs", Store.get("jobs").filter(j => j.id !== id));
    return delayResolve(true);
  },
  getSavedJobIds(userId) {
    return delayResolve(Store.get("savedJobs").filter(s => s.userId === userId).map(s => s.jobId));
  },
  toggleSaveJob(userId, jobId) {
    let saved = Store.get("savedJobs");
    const exists = saved.some(s => s.userId === userId && s.jobId === jobId);
    if (exists) saved = saved.filter(s => !(s.userId === userId && s.jobId === jobId));
    else saved.push({ userId, jobId });
    Store.set("savedJobs", saved);
    return delayResolve(!exists);
  },
  getAppliedJobIds(userId) {
    return delayResolve(Store.get("appliedJobs").filter(a => a.userId === userId).map(a => a.jobId));
  },
  applyToJob(userId, jobId) {
    const applied = Store.get("appliedJobs");
    if (!applied.some(a => a.userId === userId && a.jobId === jobId)) {
      applied.push({ userId, jobId, appliedAt: new Date().toISOString() });
      Store.set("appliedJobs", applied);
    }
    return delayResolve(true);
  },

  /* ---- POSTS (dashboard feed) ---- */
  getPosts() { return delayResolve(Store.get("posts").sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); },
  getPostsByAuthor(userId) {
    return delayResolve(Store.get("posts").filter(p => p.authorId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  },
  createPost(authorId, text, tag) {
    const posts = Store.get("posts");
    const post = { id: newId("p"), authorId, text, tag: tag || "", likedBy: [], replies: [], createdAt: new Date().toISOString() };
    posts.unshift(post);
    Store.set("posts", posts);
    return delayResolve(post);
  },
  toggleLike(postId, userId) {
    const posts = Store.get("posts");
    const post = posts.find(p => p.id === postId);
    if (!post) return delayResolve(null);
    post.likedBy = post.likedBy || [];
    const liked = post.likedBy.includes(userId);
    post.likedBy = liked ? post.likedBy.filter(id => id !== userId) : [...post.likedBy, userId];
    Store.set("posts", posts);
    return delayResolve({ liked: !liked, count: post.likedBy.length });
  },
  addReply(postId, userId, text) {
    const posts = Store.get("posts");
    const post = posts.find(p => p.id === postId);
    if (!post) return delayResolve(null);
    post.replies = post.replies || [];
    const reply = { id: newId("rp"), userId, text, createdAt: new Date().toISOString() };
    post.replies.push(reply);
    Store.set("posts", posts);
    return delayResolve(reply);
  },

  /* ---- CONVERSATIONS / MESSAGES ---- */
  getConversationsFor(userId) {
    const convs = Store.get("conversations").filter(c => c.participantIds.includes(userId));
    convs.sort((a, b) => {
      const at = a.messages.length ? new Date(a.messages[a.messages.length - 1].createdAt) : 0;
      const bt = b.messages.length ? new Date(b.messages[b.messages.length - 1].createdAt) : 0;
      return bt - at;
    });
    return delayResolve(convs);
  },
  getConversation(id) { return delayResolve(Store.get("conversations").find(c => c.id === id) || null); },
  getOrCreateConversation(userA, userB) {
    const convs = Store.get("conversations");
    let conv = convs.find(c => c.participantIds.includes(userA) && c.participantIds.includes(userB));
    if (!conv) {
      conv = { id: newId("c"), participantIds: [userA, userB], messages: [], lastReadAt: {} };
      convs.push(conv);
      Store.set("conversations", convs);
    }
    return delayResolve(conv);
  },
  sendMessage(convId, senderId, text) {
    const convs = Store.get("conversations");
    const conv = convs.find(c => c.id === convId);
    if (!conv) return delayResolve(null);
    const msg = { id: newId("msg"), senderId, text, createdAt: new Date().toISOString() };
    conv.messages.push(msg);
    conv.lastReadAt = conv.lastReadAt || {};
    conv.lastReadAt[senderId] = Date.now();
    Store.set("conversations", convs);
    return delayResolve(msg);
  },
  markConversationRead(convId, userId) {
    const convs = Store.get("conversations");
    const conv = convs.find(c => c.id === convId);
    if (!conv) return delayResolve(false);
    conv.lastReadAt = conv.lastReadAt || {};
    conv.lastReadAt[userId] = Date.now();
    Store.set("conversations", convs);
    return delayResolve(true);
  },
  getUnreadCount(userId) {
    const convs = Store.get("conversations").filter(c => c.participantIds.includes(userId));
    let count = 0;
    convs.forEach(c => {
      const lastRead = (c.lastReadAt && c.lastReadAt[userId]) || 0;
      count += c.messages.filter(m => m.senderId !== userId && new Date(m.createdAt).getTime() > lastRead).length;
    });
    return delayResolve(count);
  },

  /* ---- SETTINGS ---- */
  getSettings() { return delayResolve(Store.getObj("quad_settings", SEED.settings)); },
  updateSettings(patch) {
    const current = Store.getObj("quad_settings", SEED.settings);
    const next = { ...current, ...patch };
    Store.setObj("quad_settings", next);
    return delayResolve(next);
  }
};