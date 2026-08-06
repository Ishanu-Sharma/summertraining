import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import FeedCard from "../components/FeedCard";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../context/UsersContext";
import { api } from "../api/client";
import { buildUsersMap, formatEventDate, initials, resolveAvatar } from "../utils/format";

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const showToast = useToast();
  const { users } = useUsers();

  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [connections, setConnections] = useState([]);
  const [composerText, setComposerText] = useState("");
  const [posting, setPosting] = useState(false);

  const usersById = useMemo(() => buildUsersMap(users), [users]);

  async function loadAll() {
    const [postsRes, eventsRes, jobsRes, connRes] = await Promise.all([
      api.get("/posts"), api.get("/events"), api.get("/jobs"), api.get(`/users/${user.id}/connections`)
    ]);
    setPosts(postsRes.posts);
    setEvents(eventsRes.events);
    setJobs(jobsRes.jobs);
    setConnections(connRes.ids);
  }

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (!socket) return;
    function onNewPost(post) {
      setPosts(prev => (prev.some(p => p.id === post.id) ? prev : [post, ...prev]));
    }
    socket.on("post:new", onNewPost);
    return () => socket.off("post:new", onNewPost);
  }, [socket]);

  async function handlePost() {
    const text = composerText.trim();
    if (!text) { showToast("Write something before posting.", "error"); return; }
    setPosting(true);
    try {
      await api.post("/posts", { text });
      setComposerText("");
      showToast("Posted to your network!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setPosting(false);
    }
  }

  async function connectWith(id) {
    await api.post(`/users/${user.id}/connect`, { targetId: id });
    setConnections(prev => [...prev, id]);
    showToast("You're now connected!", "success");
  }

  const now = new Date();
  const upcoming = events
    .filter(e => new Date(e.date + "T23:59:59") >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const notConnected = users.filter(u => u.role === "alumni" && u.id !== user.id && !connections.includes(u.id));
  const suggestions = useMemo(() => shuffle(notConnected).slice(0, 3), [users.length, connections.length]);

  const approvedJobs = jobs.filter(j => j.status === "approved")
    .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt)).slice(0, 3);

  return (
    <AppShell>
      <div className="welcome-banner animate-in">
        <div>
          <h2>Welcome back, {user.fullName.split(" ")[0]} 👋</h2>
          <p>Here's what's happening across your network today.</p>
        </div>
      </div>

      {!user.verified && (
        <div className="notice-banner">
          <i className="fa-solid fa-hourglass-half"></i>
          <div>Your profile is pending verification by the Alumni Office. You can still use The Quad while you wait.</div>
        </div>
      )}

      <div className="dash-grid">
        <div>
          <div className="card" style={{ marginBottom: 22 }}>
            <div className="composer">
              <img src={resolveAvatar(user.avatar)} alt="" />
              <div style={{ flex: 1 }}>
                <textarea
                  placeholder="Share an update with your network — a new role, a milestone, a question..."
                  value={composerText}
                  onChange={e => setComposerText(e.target.value)}
                ></textarea>
                <div className="composer-actions">
                  <div className="composer-icons">
                    <button type="button" title="Add photo"><i className="fa-solid fa-image"></i></button>
                    <button type="button" title="Tag event"><i className="fa-solid fa-calendar-days"></i></button>
                    <button type="button" title="Add link"><i className="fa-solid fa-link"></i></button>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handlePost} disabled={posting}>
                    {posting ? "Posting..." : "Post Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div id="feedList">
            {posts.map(p => <FeedCard key={p.id} post={p} usersById={usersById} />)}
            {!posts.length && <p className="text-faint">Nothing in the feed yet — be the first to post.</p>}
          </div>
        </div>

        <div>
          <div className="widget">
            <h4>Upcoming Events</h4>
            <div>
              {upcoming.map(e => {
                const d = formatEventDate(e.date);
                return (
                  <Link key={e.id} to={`/events/${e.id}`} className="widget-list-item" style={{ textDecoration: "none" }}>
                    <div className="class-ring class-ring--sm"><div className="class-ring__gem">{d.day}</div></div>
                    <div className="info"><div className="name">{e.title}</div><div className="sub">{d.mon} {d.day} · {e.location}</div></div>
                  </Link>
                );
              })}
              {!upcoming.length && <p className="text-faint" style={{ fontSize: ".85rem" }}>No upcoming events right now.</p>}
            </div>
            <Link to="/events" className="btn btn-ghost btn-sm" style={{ marginTop: 12, paddingLeft: 0 }}>See all events →</Link>
          </div>

          <div className="widget">
            <h4>People You May Know</h4>
            <div>
              {suggestions.map(u => (
                <div className="widget-list-item" key={u.id}>
                  <img src={resolveAvatar(u.avatar)} alt="" />
                  <div className="info"><div className="name">{u.fullName}</div><div className="sub">Class of {u.gradYear} · {u.department || ""}</div></div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => connectWith(u.id)}>Connect</button>
                </div>
              ))}
              {!suggestions.length && <p className="text-faint" style={{ fontSize: ".85rem" }}>You're connected with everyone so far!</p>}
            </div>
          </div>

          <div className="widget">
            <h4>Trending Jobs</h4>
            <div>
              {approvedJobs.map(j => (
                <Link key={j.id} to="/jobs" className="widget-list-item" style={{ textDecoration: "none" }}>
                  <div className="job-card__logo" style={{ width: 40, height: 40, fontSize: ".9rem" }}>{initials(j.company)}</div>
                  <div className="info"><div className="name">{j.title}</div><div className="sub">{j.company} · {j.location}</div></div>
                </Link>
              ))}
              {!approvedJobs.length && <p className="text-faint" style={{ fontSize: ".85rem" }}>No job postings yet.</p>}
            </div>
            <Link to="/jobs" className="btn btn-ghost btn-sm" style={{ marginTop: 12, paddingLeft: 0 }}>See all jobs →</Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
