import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api/client";
import { formatEventDate, formatFullDate } from "../utils/format";

export default function Events() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const showToast = useToast();
  const [events, setEvents] = useState([]);
  const [rsvpByEvent, setRsvpByEvent] = useState({});
  const [tab, setTab] = useState("upcoming");

  async function loadEvents() {
    const { events } = await api.get("/events");
    setEvents(events);
    const map = {};
    events.forEach(e => {
      const mine = e.attendeeIds?.includes(user.id);
      if (mine) map[e.id] = "going";
    });
    // fetch interested separately per event is heavy; rely on attendee list for "going" and query personal RSVP lazily on details page
    setRsvpByEvent(map);
  }

  useEffect(() => { loadEvents(); }, []);

  useEffect(() => {
    if (!socket) return;
    function refresh() { loadEvents(); }
    socket.on("event:new", refresh);
    socket.on("event:deleted", refresh);
    socket.on("event:rsvp-updated", refresh);
    return () => {
      socket.off("event:new", refresh);
      socket.off("event:deleted", refresh);
      socket.off("event:rsvp-updated", refresh);
    };
  }, [socket]);

  const now = new Date();
  const upcoming = useMemo(() => events.filter(e => new Date(e.date + "T23:59:59") >= now).sort((a, b) => new Date(a.date) - new Date(b.date)), [events]);
  const past = useMemo(() => events.filter(e => new Date(e.date + "T23:59:59") < now).sort((a, b) => new Date(b.date) - new Date(a.date)), [events]);
  const mine = useMemo(() => events.filter(e => rsvpByEvent[e.id]), [events, rsvpByEvent]);
  const featured = events.find(e => e.featured) || upcoming[0];

  function EventCard({ e, mode }) {
    const d = formatEventDate(e.date);
    if (mode === "past") {
      return (
        <div className="card event-card" style={{ opacity: .85 }}>
          <div className="event-card__banner" style={{ background: "linear-gradient(135deg, var(--ink-faint), var(--ink-soft))" }}>
            <div className="event-card__date"><div className="mon">{d.mon}</div><div className="day">{d.day}</div></div>
          </div>
          <div className="event-card__body">
            <span className="tag tag-outline" style={{ marginBottom: 10 }}>Ended</span>
            <h4>{e.title}</h4>
            <p className="text-faint" style={{ fontSize: ".85rem", margin: "8px 0 16px" }}>{(e.attendeeIds || []).length} alumni attended</p>
            <Link to={`/events/${e.id}`} className="btn btn-secondary btn-block btn-sm">View Recap</Link>
          </div>
        </div>
      );
    }
    const typeTag = e.featured
      ? <span className="tag tag-orange" style={{ marginBottom: 10 }}>Featured</span>
      : <span className="tag" style={{ marginBottom: 10 }}>{e.type === "online" ? "Online" : "In-person"}</span>;
    const locIcon = e.type === "online" ? "fa-video" : "fa-location-dot";
    const btnClass = e.featured ? "btn btn-primary btn-block btn-sm" : "btn btn-secondary btn-block btn-sm";
    return (
      <div className="card event-card">
        <div className="event-card__banner"><div className="event-card__date"><div className="mon">{d.mon}</div><div className="day">{d.day}</div></div></div>
        <div className="event-card__body">
          {typeTag}
          <h4>{e.title}</h4>
          <p className="text-faint" style={{ fontSize: ".85rem", margin: "8px 0 16px" }}><i className={"fa-solid " + locIcon}></i> {e.location}</p>
          <Link to={`/events/${e.id}`} className={btnClass}>{rsvpByEvent[e.id] ? "Update RSVP" : "RSVP"}</Link>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="page-head">
        <h2>Events &amp; Reunions</h2>
        <p className="text-soft">Homecomings, chapter dinners, and the occasional webinar you'll actually attend.</p>
      </div>

      {featured && (
        <div className="featured-event-banner" style={{ marginBottom: 44 }}>
          <div className="featured-event-banner__visual">
            <p className="eyebrow" style={{ color: "var(--peach-300)" }}>Featured</p>
            <h3 style={{ color: "#fff" }}>{featured.title}</h3>
            <p style={{ color: "rgba(251,246,238,.8)" }}>{featured.cohort || "All batches"} · {featured.location}</p>
          </div>
          <div className="featured-event-banner__body">
            <span className="tag tag-orange" style={{ marginBottom: 14 }}><i className="fa-solid fa-calendar-day"></i> {formatFullDate(featured.date)} · {featured.time}</span>
            <h3>Save your spot</h3>
            <p className="text-soft" style={{ margin: "14px 0 24px" }}>{featured.description}</p>
            <div className="flex gap-md flex-wrap">
              <Link to={`/events/${featured.id}`} className="btn btn-primary">View Details &amp; RSVP</Link>
            </div>
          </div>
        </div>
      )}

      <div className="tabs" style={{ marginBottom: 0 }}>
        <div className="tab-labels" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["upcoming", "Upcoming"], ["past", "Past"], ["rsvp", "My RSVPs"]].map(([key, label]) => (
            <label key={key} onClick={() => setTab(key)} style={{ cursor: "pointer", padding: "8px 16px", borderRadius: 999, background: tab === key ? "var(--teal-700)" : "transparent", color: tab === key ? "#fff" : "inherit", fontWeight: 600 }}>
              {label}
            </label>
          ))}
        </div>

        <div className="tab-content">
          {tab === "upcoming" && (
            <div className="grid-3">
              {upcoming.map(e => <EventCard key={e.id} e={e} mode="upcoming" />)}
              {!upcoming.length && <div className="empty-state" style={{ gridColumn: "1/-1" }}><i className="fa-solid fa-calendar-xmark"></i><h4>Nothing here yet</h4><p>Check back soon for what's next.</p></div>}
            </div>
          )}
          {tab === "past" && (
            <div className="grid-3">
              {past.map(e => <EventCard key={e.id} e={e} mode="past" />)}
              {!past.length && <div className="empty-state" style={{ gridColumn: "1/-1" }}><i className="fa-solid fa-calendar-xmark"></i><h4>Nothing here yet</h4><p>Past events will show up here.</p></div>}
            </div>
          )}
          {tab === "rsvp" && (
            <div className="grid-3">
              {mine.map(e => <EventCard key={e.id} e={e} mode="upcoming" />)}
              {!mine.length && <div className="empty-state" style={{ gridColumn: "1/-1" }}><i className="fa-solid fa-calendar-xmark"></i><h4>Nothing here yet</h4><p>RSVP to an event and it'll show up here.</p></div>}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
