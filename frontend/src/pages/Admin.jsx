import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../context/UsersContext";
import { api } from "../api/client";
import { formatFullDate, timeAgo, resolveAvatar } from "../utils/format";

const TABS = [["overview", "Overview"], ["alumni", "Manage Alumni"], ["students", "Manage Students"], ["events", "Manage Events"], ["jobs", "Manage Jobs"], ["settings", "Settings"]];

export default function Admin() {
  const { socket } = useSocket();
  const showToast = useToast();
  const navigate = useNavigate();
  const { users, refresh: refreshUsers } = useUsers();

  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [tab, setTab] = useState("overview");
  const [alumniSearch, setAlumniSearch] = useState("");
  const [alumniStatus, setAlumniStatus] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatus, setStudentStatus] = useState("");
  const [studentBatch, setStudentBatch] = useState("");

  const usersById = useMemo(() => { const m = {}; users.forEach(u => m[u.id] = u); return m; }, [users]);
  const alumni = users.filter(u => u.role === "alumni");
  const students = users.filter(u => u.role === "student");
  const studentBatches = useMemo(
    () => Array.from(new Set(students.map(s => s.gradYear).filter(Boolean))).sort((a, b) => a - b),
    [students]
  );

  async function loadAll() {
    const [eventsRes, jobsRes, settingsRes] = await Promise.all([
      api.get("/events"), api.get("/jobs"), api.get("/settings")
    ]);
    setEvents(eventsRes.events);
    setJobs(jobsRes.jobs);
    setSettings(settingsRes.settings);
  }

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (!socket) return;
    function refresh() { loadAll(); }
    function refreshUsersAndAll() { refreshUsers(); loadAll(); }
    socket.on("admin:new-signup", refreshUsersAndAll);
    socket.on("admin:user-updated", refreshUsersAndAll);
    socket.on("admin:user-deleted", refreshUsersAndAll);
    socket.on("admin:job-posted", refresh);
    socket.on("event:new", refresh);
    socket.on("event:deleted", refresh);
    socket.on("job:new", refresh);
    socket.on("job:deleted", refresh);
    return () => {
      socket.off("admin:new-signup", refreshUsersAndAll);
      socket.off("admin:user-updated", refreshUsersAndAll);
      socket.off("admin:user-deleted", refreshUsersAndAll);
      socket.off("admin:job-posted", refresh);
      socket.off("event:new", refresh);
      socket.off("event:deleted", refresh);
      socket.off("job:new", refresh);
      socket.off("job:deleted", refresh);
    };
  }, [socket]);

  const now = new Date();
  const activeEvents = events.filter(e => new Date(e.date + "T23:59:59") >= now).length;
  const pendingVerifications = alumni.filter(u => !u.verified).length;

  async function approveUser(id) {
    await api.patch(`/users/${id}`, { verified: true });
    showToast("Alumni verified!", "success");
    refreshUsers();
  }

  async function deleteEvent(id) {
    if (!window.confirm("Delete this event? This can't be undone.")) return;
    await api.del(`/events/${id}`);
    showToast("Event deleted.", "success");
    loadAll();
  }

  async function approveJob(id) {
    await api.patch(`/jobs/${id}/status`, { status: "approved" });
    showToast("Job approved and now live on the board!", "success");
    loadAll();
  }

  async function removeJob(id) {
    if (!window.confirm("Remove this job posting?")) return;
    await api.del(`/jobs/${id}`);
    showToast("Job removed.", "success");
    loadAll();
  }

  async function toggleDeactivate(u) {
    const next = !u.deactivated;
    if (!window.confirm(next ? `Deactivate ${u.fullName}'s account? They won't be able to log in.` : `Reactivate ${u.fullName}'s account?`)) return;
    await api.patch(`/users/${u.id}`, { deactivated: next });
    showToast(next ? "Account deactivated." : "Account reactivated.", "success");
    refreshUsers();
  }

  async function deleteUser(u) {
    if (!window.confirm(`Permanently delete ${u.fullName}'s account? This can't be undone.`)) return;
    await api.del(`/users/${u.id}`);
    showToast("Account deleted.", "success");
    refreshUsers();
  }

  async function saveSettings(patch) {
    const { settings } = await api.patch("/settings", patch);
    setSettings(settings);
    showToast("Settings saved!", "success");
  }

  const filteredAlumni = alumni.filter(u => {
    if (alumniSearch && !(u.fullName.toLowerCase().includes(alumniSearch.toLowerCase()) || u.email.toLowerCase().includes(alumniSearch.toLowerCase()))) return false;
    if (alumniStatus === "verified" && !u.verified) return false;
    if (alumniStatus === "pending" && u.verified) return false;
    if (alumniStatus === "deactivated" && !u.deactivated) return false;
    return true;
  });

  const filteredStudents = students.filter(u => {
    if (studentSearch && !(u.fullName.toLowerCase().includes(studentSearch.toLowerCase()) || u.email.toLowerCase().includes(studentSearch.toLowerCase()))) return false;
    if (studentStatus === "active" && u.deactivated) return false;
    if (studentStatus === "deactivated" && !u.deactivated) return false;
    if (studentBatch && String(u.gradYear) !== String(studentBatch)) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const recentSignups = alumni.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  if (!settings) return <AppShell><p className="text-faint">Loading…</p></AppShell>;

  return (
    <AppShell>
      <div className="page-head">
        <h2>Admin Panel</h2>
        <p className="text-soft">Manage alumni verification, events, and job listings across The Quad.</p>
      </div>

      <div className="admin-stat-row">
        <div className="card admin-stat-card"><i className="fa-solid fa-users"></i><div><div className="stat-card"><span className="num" style={{ fontSize: "1.5rem" }}>{alumni.length}</span><span className="label">Total Alumni</span></div></div></div>
        <div className="card admin-stat-card"><i className="fa-solid fa-user-graduate"></i><div><div className="stat-card"><span className="num" style={{ fontSize: "1.5rem" }}>{students.length}</span><span className="label">Total Students</span></div></div></div>
        <div className="card admin-stat-card"><i className="fa-solid fa-user-clock"></i><div><div className="stat-card"><span className="num" style={{ fontSize: "1.5rem" }}>{pendingVerifications}</span><span className="label">Pending Verifications</span></div></div></div>
        <div className="card admin-stat-card"><i className="fa-solid fa-calendar-check"></i><div><div className="stat-card"><span className="num" style={{ fontSize: "1.5rem" }}>{activeEvents}</span><span className="label">Active Events</span></div></div></div>
        <div className="card admin-stat-card"><i className="fa-solid fa-briefcase"></i><div><div className="stat-card"><span className="num" style={{ fontSize: "1.5rem" }}>{jobs.length}</span><span className="label">Job Postings</span></div></div></div>
      </div>

      <div className="tab-labels" style={{ display: "flex", gap: 8, margin: "24px 0 20px", flexWrap: "wrap" }}>
        {TABS.map(([key, label]) => (
          <label key={key} onClick={() => setTab(key)} style={{ cursor: "pointer", padding: "8px 16px", borderRadius: 999, background: tab === key ? "var(--teal-700)" : "transparent", color: tab === key ? "#fff" : "inherit", fontWeight: 600 }}>
            {label}
          </label>
        ))}
      </div>

      <div className="tab-content">
        {tab === "overview" && (
          <div className="card card--pad-lg">
            <h4 style={{ marginBottom: 18 }}>Recent Signups</h4>
            <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Batch</th><th>Department</th><th>Joined</th><th>Status</th></tr></thead>
              <tbody>
                {recentSignups.map(u => (
                  <tr key={u.id}>
                    <td className="cell-user"><img src={resolveAvatar(u.avatar)} alt="" /> {u.fullName}</td>
                    <td>{u.gradYear || "—"}</td><td>{u.department || "—"}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td><span className={"status-pill " + (u.verified ? "approved" : "pending")}>{u.verified ? "Verified" : "Pending"}</span></td>
                  </tr>
                ))}
                {!recentSignups.length && <tr><td colSpan={5}><p className="text-faint" style={{ padding: "20px 0" }}>No alumni yet.</p></td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {tab === "alumni" && (
          <div className="card card--pad-lg">
            <div className="flex-between" style={{ marginBottom: 18 }}>
              <div className="input-icon" style={{ maxWidth: 320 }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" value={alumniSearch} onChange={e => setAlumniSearch(e.target.value)} placeholder="Search alumni by name or email" />
              </div>
              <select value={alumniStatus} onChange={e => setAlumniStatus(e.target.value)} style={{ width: "auto", padding: "10px 36px 10px 14px" }}>
                <option value="">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
            <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Batch</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredAlumni.map(u => (
                  <tr key={u.id}>
                    <td className="cell-user"><img src={resolveAvatar(u.avatar)} alt="" /> {u.fullName}</td>
                    <td>{u.gradYear || "—"}</td><td>{u.email}</td>
                    <td><span className={"status-pill " + (u.deactivated ? "pending" : (u.verified ? "approved" : "pending"))}>{u.deactivated ? "Deactivated" : (u.verified ? "Verified" : "Pending")}</span></td>
                    <td className="table-actions">
                      {!u.verified && <button type="button" title="Approve" onClick={() => approveUser(u.id)}><i className="fa-solid fa-check"></i></button>}
                      <button type="button" title="View" onClick={() => navigate(`/profile/${u.id}`)}><i className="fa-solid fa-eye"></i></button>
                      <button type="button" title={u.deactivated ? "Reactivate" : "Deactivate"} onClick={() => toggleDeactivate(u)}>
                        <i className={"fa-solid " + (u.deactivated ? "fa-user-check" : "fa-user-slash")}></i>
                      </button>
                      <button type="button" title="Delete" onClick={() => deleteUser(u)}><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {!filteredAlumni.length && <tr><td colSpan={5}><p className="text-faint" style={{ padding: "20px 0" }}>No alumni match your search.</p></td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {tab === "students" && (
          <div className="card card--pad-lg">
            <div className="flex-between" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <div className="input-icon" style={{ maxWidth: 320 }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Search students by name or email" />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <select value={studentBatch} onChange={e => setStudentBatch(e.target.value)} style={{ width: "auto", padding: "10px 36px 10px 14px" }}>
                  <option value="">All Batches</option>
                  {studentBatches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={studentStatus} onChange={e => setStudentStatus(e.target.value)} style={{ width: "auto", padding: "10px 36px 10px 14px" }}>
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
            </div>
            <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Batch</th><th>Department</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredStudents.map(u => (
                  <tr key={u.id}>
                    <td className="cell-user"><img src={resolveAvatar(u.avatar)} alt="" /> {u.fullName}</td>
                    <td>{u.gradYear || "—"}</td>
                    <td>{u.department || "—"}</td>
                    <td>{u.email}</td>
                    <td><span className={"status-pill " + (u.deactivated ? "pending" : "approved")}>{u.deactivated ? "Deactivated" : "Active"}</span></td>
                    <td className="table-actions">
                      <button type="button" title="View" onClick={() => navigate(`/profile/${u.id}`)}><i className="fa-solid fa-eye"></i></button>
                      <button type="button" title={u.deactivated ? "Reactivate" : "Deactivate"} onClick={() => toggleDeactivate(u)}>
                        <i className={"fa-solid " + (u.deactivated ? "fa-user-check" : "fa-user-slash")}></i>
                      </button>
                      <button type="button" title="Delete" onClick={() => deleteUser(u)}><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {!filteredStudents.length && <tr><td colSpan={6}><p className="text-faint" style={{ padding: "20px 0" }}>No students match your search.</p></td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {tab === "events" && (
          <div className="card card--pad-lg">
            <div className="flex-between" style={{ marginBottom: 18 }}>
              <h4>All Events</h4>
              <Link to="/events" className="btn btn-primary btn-sm"><i className="fa-solid fa-plus"></i> Create Event</Link>
            </div>
            <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Event</th><th>Date</th><th>RSVPs</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id}>
                    <td>{e.title}</td><td>{formatFullDate(e.date)}</td><td>{(e.attendeeIds || []).length}</td>
                    <td><span className="status-pill approved">Published</span></td>
                    <td className="table-actions">
                      <button type="button" title="View" onClick={() => navigate(`/events/${e.id}`)}><i className="fa-solid fa-eye"></i></button>
                      <button type="button" title="Delete" onClick={() => deleteEvent(e.id)}><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {!events.length && <tr><td colSpan={5}><p className="text-faint" style={{ padding: "20px 0" }}>No events yet.</p></td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {tab === "jobs" && (
          <div className="card card--pad-lg">
            <h4 style={{ marginBottom: 18 }}>Job Postings</h4>
            <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Title</th><th>Company</th><th>Posted By</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {jobs.map(j => {
                  const poster = usersById[j.postedBy];
                  return (
                    <tr key={j.id}>
                      <td>{j.title}</td><td>{j.company}</td><td>{poster ? poster.fullName : "—"}</td>
                      <td><span className={"status-pill " + (j.status === "approved" ? "approved" : "pending")}>{j.status === "approved" ? "Approved" : "Pending Review"}</span></td>
                      <td className="table-actions">
                        {j.status !== "approved" && <button type="button" title="Approve" onClick={() => approveJob(j.id)}><i className="fa-solid fa-check"></i></button>}
                        <button type="button" title="Remove" onClick={() => removeJob(j.id)}><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  );
                })}
                {!jobs.length && <tr><td colSpan={5}><p className="text-faint" style={{ padding: "20px 0" }}>No jobs yet.</p></td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <SettingsPanel settings={settings} onSave={saveSettings} />
        )}
      </div>
    </AppShell>
  );
}

function SettingsPanel({ settings, onSave }) {
  const [form, setForm] = useState(settings);
  useEffect(() => setForm(settings), [settings]);

  return (
    <div className="card card--pad-lg">
      <h4 style={{ marginBottom: 20 }}>Platform Settings</h4>
      <div className="field-row">
        <div className="field">
          <label>Platform name</label>
          <input type="text" value={form.platformName} onChange={e => setForm(f => ({ ...f, platformName: e.target.value }))} />
        </div>
        <div className="field">
          <label>Support email</label>
          <input type="email" value={form.supportEmail} onChange={e => setForm(f => ({ ...f, supportEmail: e.target.value }))} />
        </div>
      </div>
      <label className="checkbox-row" style={{ marginBottom: 14 }}>
        <input type="checkbox" checked={form.requireUniversityEmail} onChange={e => setForm(f => ({ ...f, requireUniversityEmail: e.target.checked }))} /> Require university email for verification
      </label>
      <label className="checkbox-row" style={{ marginBottom: 14 }}>
        <input type="checkbox" checked={form.autoApproveJobs} onChange={e => setForm(f => ({ ...f, autoApproveJobs: e.target.checked }))} /> Auto-approve job postings from verified alumni
      </label>
      <label className="checkbox-row" style={{ marginBottom: 26 }}>
        <input type="checkbox" checked={form.allowStudentDirectoryView} onChange={e => setForm(f => ({ ...f, allowStudentDirectoryView: e.target.checked }))} /> Allow students to view (but not message) the directory
      </label>
      <button type="button" className="btn btn-primary" onClick={() => onSave(form)}>Save Settings</button>
    </div>
  );
}
