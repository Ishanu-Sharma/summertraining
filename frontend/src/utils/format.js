export function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + "d ago";
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks + "w ago";
  const months = Math.floor(days / 30);
  if (months < 12) return months + "mo ago";
  return Math.floor(days / 365) + "y ago";
}

export function formatEventDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return { mon: d.toLocaleDateString("en-US", { month: "short" }), day: d.toLocaleDateString("en-US", { day: "2-digit" }) };
}

export function formatFullDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function initials(name) {
  return (name || "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

const API_URL = import.meta.env.VITE_API_URL || "";

/** Neutral default avatar (no random per-user images) — mirrors backend/src/utils.js's DEFAULT_AVATAR. */
export const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
    `<rect width="200" height="200" fill="#CBD1D8"/>` +
    `<circle cx="100" cy="80" r="38" fill="#F3F5F7"/>` +
    `<path d="M28 190c6-56 40-88 72-88s66 32 72 88" fill="#F3F5F7"/>` +
    `</svg>`
  );

/** Locally-uploaded avatars are stored as relative paths ("/uploads/avatars/x.jpg") and
 *  need the API origin prefixed. External URLs or data URIs pass through unchanged. */
export function resolveAvatar(avatar) {
  if (!avatar) return DEFAULT_AVATAR;
  if (avatar.startsWith("/uploads/")) return API_URL + avatar;
  return avatar;
}

export function buildUsersMap(users) {
  const map = {};
  (users || []).forEach(u => { map[u.id] = u; });
  return map;
}
