import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../context/UsersContext";
import { api } from "../api/client";
import { buildUsersMap, formatFullDate, resolveAvatar, DEFAULT_AVATAR } from "../utils/format";
import { useDocumentTitle } from "../utils/useDocumentTitle";

export default function EventDetails() {
  useDocumentTitle("Event Details");
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const showToast = useToast();
  const { users } = useUsers();

  const [event, setEvent] = useState(null);
  const [myStatus, setMyStatus] = useState(null);
  const [selected, setSelected] = useState("");
  const [commentText, setCommentText] = useState("");
  const [notFound, setNotFound] = useState(false);

  const usersById = useMemo(() => buildUsersMap(users), [users]);

  async function load() {
    try {
      const [{ event }, { status }] = await Promise.all([
        api.get(`/events/${id}`), api.get(`/events/${id}/rsvp/me`)
      ]);
      setEvent(event);
      setMyStatus(status);
      setSelected(status || "");
    } catch {
      setNotFound(true);
    }
  }

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (!socket) return;
    function onComment(payload) {
      if (payload.eventId !== id) return;
      setEvent(prev => prev ? { ...prev, comments: [...prev.comments, payload.comment] } : prev);
    }
    function onRsvp(payload) {
      if (payload.eventId !== id) return;
      setEvent(prev => prev ? { ...prev, attendeeIds: payload.attendeeIds } : prev);
    }
    socket.on("event:comment-new", onComment);
    socket.on("event:rsvp-updated", onRsvp);
    return () => {
      socket.off("event:comment-new", onComment);
      socket.off("event:rsvp-updated", onRsvp);
    };
  }, [socket, id]);

  if (notFound) {
    return (
      <AppShell>
        <div className="empty-state"><i className="fa-solid fa-calendar-xmark"></i><h4>Event not found</h4><p>It may have been removed.</p></div>
      </AppShell>
    );
  }
  if (!event) return <AppShell><p className="text-faint">Loading…</p></AppShell>;

  const count = (event.attendeeIds || []).length;
  const shownAttendees = (event.attendeeIds || []).slice(0, 4).map(uid => usersById[uid]).filter(Boolean);
  const remaining = Math.max(0, count - shownAttendees.length);

  async function confirmRsvp() {
    if (!selected) { showToast("Choose an option first.", "error"); return; }
    await api.post(`/events/${id}/rsvp`, { status: selected });
    setMyStatus(selected);
    const msg = selected === "going" ? "You're going! See you there."
      : selected === "interested" ? "Marked as interested." : "No worries — maybe next time.";
    showToast(msg, "success");
  }

  async function submitComment(e) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    const { comment } = await api.post(`/events/${id}/comments`, { text });
    setEvent(prev => ({ ...prev, comments: [...prev.comments, comment] }));
    setCommentText("");
  }

  return (
    <AppShell>
      <Link to="/events" className="text-soft" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: ".88rem", fontWeight: 600 }}>
        <i className="fa-solid fa-arrow-left"></i> Back to Events
      </Link>

      <div className="event-detail-hero">
        <span className="tag tag-orange"><i className="fa-solid fa-calendar-day"></i> {event.type === "online" ? "Online" : "In-person"}</span>
        <h1>{event.title}</h1>
        <p style={{ color: "rgba(251,246,238,.85)", maxWidth: 560 }}>{event.description}</p>
        <div className="event-detail-hero__meta">
          <div><i className="fa-solid fa-calendar-day"></i> {formatFullDate(event.date)} · {event.time}</div>
          <div><i className="fa-solid fa-location-dot"></i> {event.location}</div>
          <div><i className="fa-solid fa-users"></i> {count} alumni going</div>
        </div>
      </div>

      <div className="profile-layout">
        <div>
          <div className="card card--pad-lg" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 14 }}>About this event</h4>
            <p className="text-soft">{event.description}</p>
          </div>

          <div className="card card--pad-lg" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 14 }}>Agenda</h4>
            {(event.agenda || []).map((a, i) => (
              <div className="agenda-item" key={i}>
                <div className="time">{a.time}</div>
                <div><h4 style={{ fontSize: "1rem" }}>{a.title}</h4>{a.note && <p className="text-faint" style={{ fontSize: ".85rem" }}>{a.note}</p>}</div>
              </div>
            ))}
            {!(event.agenda || []).length && <p className="text-faint">Agenda hasn't been published yet.</p>}
          </div>

          <div className="card card--pad-lg" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 16 }}>Hosted By</h4>
            <div className="flex gap-md flex-wrap">
              {(event.hosts || []).map((h, i) => {
                const u = usersById[h.userId];
                if (!u) return null;
                return (
                  <div className="widget-list-item" style={{ border: "none", flex: 1 }} key={i}>
                    <img src={resolveAvatar(u.avatar)} alt="" />
                    <div className="info"><div className="name">{u.fullName}</div><div className="sub">{h.label}</div></div>
                  </div>
                );
              })}
              {!(event.hosts || []).length && <p className="text-faint">No hosts listed.</p>}
            </div>
          </div>

          <div className="card card--pad-lg">
            <h4 style={{ marginBottom: 20 }}>Discussion <span className="text-faint" style={{ fontWeight: 400, fontSize: ".85rem" }}>· {(event.comments || []).length} comments</span></h4>
            <div>
              {(event.comments || []).map(c => {
                const u = usersById[c.userId] || { fullName: "Someone", avatar: DEFAULT_AVATAR };
                return (
                  <div className="comment" key={c.id}>
                    <img src={resolveAvatar(u.avatar)} alt="" />
                    <div className="comment__bubble"><div className="name">{u.fullName}</div>{c.text}</div>
                  </div>
                );
              })}
              {!(event.comments || []).length && <p className="text-faint" style={{ marginBottom: 16 }}>No comments yet — be the first.</p>}
            </div>
            <form style={{ display: "flex", gap: 12, marginTop: 20 }} onSubmit={submitComment}>
              <img src={resolveAvatar(user.avatar)} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
              <input type="text" placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">Post</button>
            </form>
          </div>
        </div>

        <div className="rsvp-panel">
          <div className="card card--pad-lg">
            <h4 style={{ marginBottom: 6 }}>Will you be there?</h4>
            <p className="text-faint" style={{ fontSize: ".85rem" }}>Let your batch know before you book the flight.</p>
            <div className="rsvp-options">
              {[["going", "Going"], ["interested", "Interested"], ["not-going", "Can't make it"]].map(([val, label]) => (
                <label className="radio-row" key={val}>
                  <input type="radio" name="rsvp" value={val} checked={selected === val} onChange={() => setSelected(val)} /> {label}
                </label>
              ))}
            </div>
            <button type="button" className="btn btn-primary btn-block" style={{ marginBottom: 10 }} onClick={confirmRsvp}>Confirm RSVP</button>

            <div style={{ marginTop: 26, paddingTop: 20, borderTop: "1px solid var(--line-soft)" }}>
              <p className="text-faint" style={{ fontSize: ".82rem", marginBottom: 10 }}>{count} alumni going</p>
              <div className="avatar-stack">
                {shownAttendees.map(u => <img key={u.id} src={resolveAvatar(u.avatar)} alt={u.fullName} />)}
                {remaining > 0 && <span className="more">{remaining}+</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
