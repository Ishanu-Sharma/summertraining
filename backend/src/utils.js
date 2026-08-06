const { v4: uuidv4 } = require("uuid");

/** Neutral default avatar (no random per-user images). Same idea as WhatsApp's grey silhouette. */
const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
    `<rect width="200" height="200" fill="#CBD1D8"/>` +
    `<circle cx="100" cy="80" r="38" fill="#F3F5F7"/>` +
    `<path d="M28 190c6-56 40-88 72-88s66 32 72 88" fill="#F3F5F7"/>` +
    `</svg>`
  );

function newId(prefix) {
  return (prefix ? prefix + "_" : "") + uuidv4();
}

function randomAvatar() {
  return DEFAULT_AVATAR;
}

/** Strip sensitive fields and parse JSON columns for a user row. */
function serializeUser(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return {
    id: rest.id,
    fullName: rest.full_name,
    email: rest.email,
    role: rest.role,
    verified: !!rest.verified,
    deactivated: !!rest.deactivated,
    gradYear: rest.grad_year,
    department: rest.department,
    industry: rest.industry,
    location: rest.location,
    headline: rest.headline,
    bio: rest.bio,
    company: rest.company,
    jobTitle: rest.job_title,
    linkedin: rest.linkedin,
    website: rest.website,
    avatar: rest.avatar,
    skills: parseJsonSafe(rest.skills, []),
    privacy: parseJsonSafe(rest.privacy, { showEmail: true, showInDirectory: true, allowStudentMessages: false }),
    notifications: parseJsonSafe(rest.notifications, { messages: true, events: true, jobs: true }),
    createdAt: rest.created_at
  };
}

function parseJsonSafe(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function serializeEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    time: row.time,
    location: row.location,
    type: row.type,
    cohort: row.cohort,
    featured: !!row.featured,
    createdBy: row.created_by,
    createdAt: row.created_at
  };
}

function serializeJob(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    type: row.type,
    experience: row.experience,
    salary: row.salary,
    description: row.description,
    applyLink: row.apply_link,
    referralNote: row.referral_note,
    postedBy: row.posted_by,
    status: row.status,
    postedAt: row.posted_at
  };
}

function serializePost(row) {
  if (!row) return null;
  return {
    id: row.id,
    authorId: row.author_id,
    text: row.text,
    tag: row.tag,
    createdAt: row.created_at
  };
}

module.exports = { newId, randomAvatar, serializeUser, serializeEvent, serializeJob, serializePost, parseJsonSafe, DEFAULT_AVATAR };
