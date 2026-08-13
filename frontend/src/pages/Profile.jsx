import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import FeedCard from "../components/FeedCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../context/UsersContext";
import { api } from "../api/client";
import { buildUsersMap, resolveAvatar } from "../utils/format";
import { useDocumentTitle } from "../utils/useDocumentTitle";

const TABS = [["about", "About"], ["experience", "Experience"], ["education", "Education"], ["posts", "Posts"]];

export default function Profile() {
  useDocumentTitle("Profile");
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const { users: allUsers } = useUsers();

  const viewedId = id || currentUser.id;
  const isOwn = viewedId === currentUser.id;

  const [viewedUser, setViewedUser] = useState(null);
  const [myConnections, setMyConnections] = useState([]);
  const [theirConnections, setTheirConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("about");
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const usersById = useMemo(() => buildUsersMap(allUsers), [allUsers]);

  async function load() {
    try {
      const [{ user: viewedUser }, { ids: myConnections }, { posts }] = await Promise.all([
        api.get(`/users/${viewedId}`), api.get(`/users/${currentUser.id}/connections`), api.get(`/posts?authorId=${viewedId}`)
      ]);
      setViewedUser(viewedUser);
      setMyConnections(myConnections);
      setPosts(posts);
      if (!isOwn) {
        const { ids } = await api.get(`/users/${viewedId}/connections`);
        setTheirConnections(ids);
      }
    } catch {
      setNotFound(true);
    }
  }

  useEffect(() => { load(); }, [viewedId]);

  if (notFound) {
    return <AppShell><div className="empty-state"><i className="fa-solid fa-user-slash"></i><h4>Profile not found</h4><p>This alumni profile doesn't exist.</p></div></AppShell>;
  }
  if (!viewedUser) return <AppShell><p className="text-faint">Loading…</p></AppShell>;

  const alreadyConnected = myConnections.includes(viewedId);

  async function connect() {
    try {
      await api.post(`/users/${currentUser.id}/connect`, { targetId: viewedId });
      setMyConnections(prev => [...prev, viewedId]);
      showToast(`You're now connected with ${viewedUser.fullName.split(" ")[0]}!`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function shareProfile() {
    const url = window.location.origin + "/profile/" + viewedId;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  }

  const batchmates = allUsers.filter(u => u.id !== viewedId && u.role === "alumni" && u.gradYear === viewedUser.gradYear).slice(0, 4);
  const mutualIds = !isOwn ? myConnections.filter(mid => theirConnections.includes(mid) && mid !== currentUser.id && mid !== viewedId) : [];
  const mutualUsers = mutualIds.map(mid => usersById[mid]).filter(Boolean);

  return (
    <AppShell>
      <div className="profile-banner">
        <div className="profile-banner__cover"></div>
        <div className="profile-banner__body">
          <div className="profile-banner__head">
            <div className="flex gap-md" style={{ alignItems: "flex-end" }}>
              <img className="profile-banner__avatar" src={resolveAvatar(viewedUser.avatar)} alt="" />
              <div>
                <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span>{viewedUser.fullName}</span>
                  <span className="class-ring class-ring--sm"><span className="class-ring__gem">{viewedUser.gradYear ? "'" + String(viewedUser.gradYear).slice(-2) : "•"}</span></span>
                </h2>
                <p className="text-soft">{viewedUser.headline || (viewedUser.role === "admin" ? "Assam Downtown University Alumni Relations Office" : [viewedUser.jobTitle, viewedUser.company && "at " + viewedUser.company].filter(Boolean).join(" "))}</p>
              </div>
            </div>
            <div className="profile-banner__actions">
              {isOwn ? (
                <Link to="/settings" className="btn btn-secondary"><i className="fa-solid fa-pen"></i> Edit Profile</Link>
              ) : (
                alreadyConnected
                  ? <Link to={`/messages?with=${viewedId}`} className="btn btn-secondary"><i className="fa-solid fa-comment"></i> Message</Link>
                  : <button type="button" className="btn btn-secondary" onClick={connect}><i className="fa-solid fa-user-plus"></i> Connect</button>
              )}
              <button type="button" className="btn btn-primary" onClick={shareProfile}><i className="fa-solid fa-share-nodes"></i> {copied ? "Copied!" : "Share Profile"}</button>
            </div>
          </div>
          <div className="profile-banner__meta">
            <span><i className="fa-solid fa-location-dot"></i> {viewedUser.location || "—"}</span>
            <span><i className="fa-solid fa-graduation-cap"></i> {viewedUser.role === "admin" ? "University Administration" : `${viewedUser.department || "—"}, Class of ${viewedUser.gradYear || "—"}`}</span>
            <span><i className="fa-solid fa-briefcase"></i> {viewedUser.company || "—"}</span>
            <span><i className="fa-solid fa-calendar-plus"></i> Joined The Quad in {new Date(viewedUser.createdAt).getFullYear()}</span>
          </div>
          <div className="skill-tag-row">
            {(viewedUser.skills || []).length
              ? viewedUser.skills.map(s => <span className="tag" key={s}>{s}</span>)
              : <span className="text-faint" style={{ fontSize: ".85rem" }}>No skills listed yet.</span>}
          </div>
        </div>
      </div>

      <div className="profile-layout">
        <div className="tabs">
          <div className="tab-labels" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {TABS.map(([key, label]) => (
              <label key={key} onClick={() => setTab(key)} style={{ cursor: "pointer", padding: "8px 16px", borderRadius: 999, background: tab === key ? "var(--teal-700)" : "transparent", color: tab === key ? "#fff" : "inherit", fontWeight: 600 }}>
                {label}
              </label>
            ))}
          </div>

          <div className="tab-content">
            {tab === "about" && (
              <div className="card card--pad-lg">
                <h4 style={{ marginBottom: 14 }}>About</h4>
                <p className="text-soft" style={{ marginBottom: 24 }}>{viewedUser.bio || "This alum hasn't written a bio yet."}</p>
                <div className="grid-2" style={{ gap: 16 }}>
                  {(isOwn || viewedUser.privacy?.showEmail) && (
                    <div className="contact-info-card" style={{ border: "none", padding: 0 }}>
                      <i className="fa-solid fa-envelope"></i>
                      <div><div className="text-faint" style={{ fontSize: ".78rem" }}>Email</div><div>{viewedUser.email}</div></div>
                    </div>
                  )}
                  {viewedUser.linkedin && (
                    <div className="contact-info-card" style={{ border: "none", padding: 0 }}>
                      <i className="fa-brands fa-linkedin-in"></i>
                      <div><div className="text-faint" style={{ fontSize: ".78rem" }}>LinkedIn</div><div>{viewedUser.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com/, "")}</div></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "experience" && (
              <div className="card card--pad-lg">
                <h4 style={{ marginBottom: 24 }}>Experience</h4>
                <div className="thread">
                  {(viewedUser.experience || []).map(x => (
                    <div className="thread-item" key={x.id}>
                      <h4>{x.title}</h4>
                      <p className="text-soft">{x.company} · {x.period}{x.location ? " · " + x.location : ""}</p>
                      {x.desc && <p style={{ marginTop: 8 }}>{x.desc}</p>}
                    </div>
                  ))}
                  {!(viewedUser.experience || []).length && <p className="text-faint">No experience listed yet.</p>}
                </div>
              </div>
            )}

            {tab === "education" && (
              <div className="card card--pad-lg">
                <h4 style={{ marginBottom: 24 }}>Education</h4>
                <div className="thread">
                  {(viewedUser.education || []).map(x => (
                    <div className="thread-item" key={x.id}>
                      <h4>{x.degree}</h4>
                      <p className="text-soft">{x.school} · {x.period}</p>
                    </div>
                  ))}
                  {!(viewedUser.education || []).length && <p className="text-faint">No education listed yet.</p>}
                </div>
              </div>
            )}

            {tab === "posts" && (
              <div>
                {posts.map(p => <FeedCard key={p.id} post={p} usersById={usersById} />)}
                {!posts.length && <div className="empty-state"><i className="fa-regular fa-comment-dots"></i><h4>No posts yet</h4><p>Updates this alum shares will show up here.</p></div>}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="widget">
            <h4>Batchmates · Class of {viewedUser.gradYear || "—"}</h4>
            {batchmates.map(u => (
              <Link key={u.id} to={`/profile/${u.id}`} className="widget-list-item" style={{ textDecoration: "none" }}>
                <img src={resolveAvatar(u.avatar)} alt="" />
                <div className="info"><div className="name">{u.fullName}</div><div className="sub">{u.department || ""}{u.company ? ", " + u.company : ""}</div></div>
              </Link>
            ))}
            {!batchmates.length && <p className="text-faint" style={{ fontSize: ".85rem" }}>No other batchmates on The Quad yet.</p>}
          </div>
          <div className="widget">
            <h4>{isOwn ? "Your Connections" : "Mutual Connections"}</h4>
            <div className="avatar-stack" style={{ marginBottom: 10 }}>
              {(isOwn ? myConnections.map(mid => usersById[mid]).filter(Boolean) : mutualUsers).slice(0, 4).map(u => (
                <img key={u.id} src={resolveAvatar(u.avatar)} alt={u.fullName} />
              ))}
            </div>
            <p className="text-faint" style={{ fontSize: ".82rem" }}>
              {isOwn
                ? (myConnections.length ? `Connected with ${myConnections.length} alum${myConnections.length === 1 ? "" : "i"}.` : "You haven't connected with anyone yet — try the Directory.")
                : (mutualUsers.length ? `Including ${mutualUsers.slice(0, 2).map(u => u.fullName).join(" and ")}${mutualUsers.length > 2 ? `, and ${mutualUsers.length - 2} more` : ""}.` : "No mutual connections yet.")}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
