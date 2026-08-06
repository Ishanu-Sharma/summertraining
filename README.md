# The Quad — Alumni Network (Full-Stack, Real-Time)

A complete rebuild of "The Quad" as a real, production-shaped web app:

- **Backend:** Node.js + Express REST API, JWT auth, bcrypt password hashing, Socket.io for real-time events
- **Database:** MariaDB / MySQL (via `mysql2`) — no seed data, no localStorage. Everything is persisted server-side.
- **Frontend:** React 18 (Vite) + React Router, talks to the API over HTTPS and to Socket.io over WebSocket
- **Deployment target:** Render (or any Node host) for the API, static hosting for the built frontend, and any managed MySQL/MariaDB instance

Everything that used to live in `db.js` / `seed-data.js` / `localStorage` has been removed. There is no demo data baked into the app — the first thing that exists is whoever registers first.

---

## 1. Project layout

```
quad-app/
  backend/            Express API + Socket.io server
    src/
      schema.sql       Full MariaDB/MySQL schema
      migrate.js        Applies schema.sql to your database
      createAdmin.js     CLI helper to promote a user to admin
      server.js          Entry point
      routes/            REST endpoints (auth, users, events, jobs, posts, conversations, settings, contact)
      sockets/           Socket.io auth + room wiring
  frontend/            React (Vite) single-page app
    src/
      pages/             One component per route (mirrors the old .html pages)
      components/        AppShell (sidebar/topbar), FeedCard, route guards
      context/           Auth, Socket.io, Toast providers
  render.yaml          Render Blueprint (API + static site)
```

---

## 2. Local setup

### Prerequisites
- Node.js 18+
- A running MySQL or MariaDB server (local install, Docker, or a free cloud instance)

### Database

```sql
CREATE DATABASE quad_db CHARACTER SET utf8mb4;
CREATE USER 'quad_user'@'%' IDENTIFIED BY 'quad_password';
GRANT ALL PRIVILEGES ON quad_db.* TO 'quad_user'@'%';
FLUSH PRIVILEGES;
```

### Backend

```bash
cd backend
cp .env.example .env      # fill in DB_HOST / DB_USER / DB_PASSWORD / DB_NAME / JWT_SECRET
npm install
npm run migrate           # creates all tables from schema.sql
npm run dev                # starts the API on http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:4000
npm install
npm run dev                 # starts Vite on http://localhost:5173
```

Open http://localhost:5173, click **Join the Network**, and register the first account. That account is a normal `alumni` — see the next section for how to make it an admin.

### Creating the first admin

Registration always creates an `alumni` or `student` account (there's no seeded admin, on purpose — nothing is hardcoded). Once you've registered normally, promote yourself:

```bash
cd backend
node src/createAdmin.js you@adtu.in
```

This flips your `role` to `admin` and marks you verified. Log out and back in (or just refresh — the JWT is re-issued on next login) to see the Admin Panel in the sidebar.

> **If you ran `npm run migrate` before this update:** the `users.role` column needs widening to include `'student'`. Either drop and recreate your local database (see §2) and re-run `npm run migrate`, or run this once against your existing database:
> ```sql
> ALTER TABLE users MODIFY role ENUM('student','alumni','admin') NOT NULL DEFAULT 'alumni';
> ```

---

## 3. Real-time features (Socket.io)

The client opens one authenticated Socket.io connection per session (`SocketContext`). The server puts each socket in a `user:{id}` room, plus an `admins` room for admin accounts. Events currently wired end-to-end:

| Event | Trigger | Who receives it |
|---|---|---|
| `post:new` | Someone posts to the feed | Everyone (dashboard feed updates live) |
| `post:like`, `post:reply` | Like/comment on a post | Everyone viewing that post |
| `message:new` | New chat message | Both participants of the conversation |
| `conversation:read` | Messages marked read | The reader (clears unread badge) |
| `event:new`, `event:deleted`, `event:rsvp-updated`, `event:comment-new` | Event CRUD / RSVP / comments | Everyone (Events & Event Details pages refresh) |
| `job:new`, `job:deleted`, `job:status-changed` | Job posted / approved / removed | Everyone / the job's poster |
| `admin:new-signup`, `admin:user-updated`, `admin:job-posted` | Any of the above admin-relevant actions | Admins only (Admin Panel refreshes live) |
| `account:verified` | Admin verifies an alumni | That specific user |

---

## 4. Deploying to Render

Render's native managed databases are Postgres/Redis — for MySQL/MariaDB, provision one externally (e.g. a small MySQL instance on Railway, PlanetScale, Aiven, or your own VPS/Docker host) and point the API's `DB_*` env vars at it. Enable SSL (`DB_SSL=true`) if your provider requires it.

1. Push this repo to GitHub.
2. In Render, create a **Blueprint** from `render.yaml` (or create the two services manually):
   - **the-quad-api** — Node web service, root `backend/`, build `npm install`, start `npm run migrate && npm start`.
   - **the-quad-web** — Static site, root `frontend/`, build `npm install && npm run build`, publish dir `dist`, with a catch-all rewrite to `index.html` (already in `render.yaml`) so client-side routing works.
3. Set the backend env vars: `JWT_SECRET` (Render can auto-generate), `CLIENT_ORIGIN` (your static site's URL), `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`.
4. Set the frontend env var `VITE_API_URL` to your deployed API's URL.
5. Deploy the API first (the migrate step creates the schema), then the frontend.
6. Once live, register your first account on the deployed site, then run `node src/createAdmin.js you@adtu.in` from a Render shell (or locally against the same DB) to get admin access.

---

## 5. Profile photo uploads

Avatars are real file uploads now, not a `pravatar.cc` placeholder baked into every account:

- `POST /api/users/:id/avatar` (multipart `avatar` field) — validated to JPEG/PNG/WEBP/GIF, 3MB max, saved to `backend/uploads/avatars/`, served back at `/uploads/avatars/<file>`. The previous file is deleted when a new one is uploaded.
- `DELETE /api/users/:id/avatar` — removes the uploaded file and falls back to a random `pravatar.cc` placeholder (only used until someone uploads their own photo).
- New registrations still get a `pravatar.cc` placeholder by default (nobody has uploaded a photo yet) — this is cosmetic only and isn't stored as "seed data," it's just a sensible default image.
- The frontend's `resolveAvatar()` helper (`src/utils/format.js`) prefixes locally-uploaded paths with `VITE_API_URL` and leaves external URLs untouched.

**Render disk caveat:** Render's free/standard web services use an ephemeral filesystem — anything written to `backend/uploads/` is lost on redeploy or restart. This is fine for local dev and demos. For production durability, either:
- attach a [Render Disk](https://render.com/docs/disks) to the API service and point `AVATAR_DIR` (in `backend/src/middleware/upload.js`) at the mounted path, or
- swap the `multer.diskStorage` in `middleware/upload.js` for an S3-compatible bucket (e.g. `multer-s3` against AWS S3, Cloudflare R2, or Backblaze B2).

Both are a small, contained change to that one file — the route/DB logic doesn't need to change either way.

## 6. What changed from the static prototype

- All `localStorage`-based session/auth (`quad_session_user_id`) replaced with JWT issued by the API and verified on every request and every Socket.io connection.
- All `Store` / `db.js` localStorage tables replaced with MySQL tables (`schema.sql`).
- `seed-data.js` and every hardcoded array of fake alumni/events/jobs/posts/conversations has been deleted — the app starts empty and is populated entirely by real user actions.
- Plaintext password comparison replaced with `bcryptjs` hashing.
- Demo credentials banner and fake "Login with Google/LinkedIn" buttons removed.
- Static marketing stats ("12,400+ alumni", named testimonial people, fixed attendee counts) removed from the homepage — anything shown is computed from real data or omitted.
- Simulated auto-reply chat bot in Messages removed; messaging is now real two-way chat over Socket.io.
- Profile photos are real uploads (`multer`, validated, size-limited, served statically) instead of base64 data URLs stuffed into localStorage.
