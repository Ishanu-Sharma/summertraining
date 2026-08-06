import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../context/UsersContext";
import { api } from "../api/client";
import { buildUsersMap, initials, timeAgo, resolveAvatar } from "../utils/format";

const JOB_TYPES = ["Full-time", "Internship", "Contract", "Part-time"];

export default function Jobs() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const showToast = useToast();
  const { users } = useUsers();

  const [jobs, setJobs] = useState([]);
  const [saved, setSaved] = useState(new Set());
  const [applied, setApplied] = useState(new Set());
  const [tab, setTab] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [activeTypes, setActiveTypes] = useState([]);
  const [openDetails, setOpenDetails] = useState(new Set());

  const usersById = useMemo(() => buildUsersMap(users), [users]);

  async function loadAll() {
    const [jobsRes, savedRes, appliedRes] = await Promise.all([
      api.get("/jobs"), api.get("/jobs/me/saved"), api.get("/jobs/me/applied")
    ]);
    setJobs(jobsRes.jobs);
    setSaved(new Set(savedRes.jobIds));
    setApplied(new Set(appliedRes.jobIds));
  }

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (!socket) return;
    function onNewJob(job) { setJobs(prev => (prev.some(j => j.id === job.id) ? prev : [job, ...prev])); }
    socket.on("job:new", onNewJob);
    return () => socket.off("job:new", onNewJob);
  }, [socket]);

  const approvedJobs = jobs.filter(j => j.status === "approved");
  const locations = useMemo(() => [...new Set(approvedJobs.map(j => j.location))].sort(), [approvedJobs]);

  const filtered = approvedJobs.filter(j => {
    if (keyword && !(j.title.toLowerCase().includes(keyword.toLowerCase()) || j.company.toLowerCase().includes(keyword.toLowerCase()))) return false;
    if (location && j.location !== location) return false;
    if (activeTypes.length && !activeTypes.includes(j.type)) return false;
    return true;
  });

  function toggleType(t) {
    setActiveTypes(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  }

  async function toggleSave(jobId) {
    const { saved: nowSaved } = await api.post(`/jobs/${jobId}/save`);
    setSaved(prev => {
      const next = new Set(prev);
      if (nowSaved) next.add(jobId); else next.delete(jobId);
      return next;
    });
    showToast(nowSaved ? "Job saved!" : "Removed from saved jobs.", "success");
  }

  async function apply(jobId) {
    await api.post(`/jobs/${jobId}/apply`);
    setApplied(prev => new Set(prev).add(jobId));
    showToast("Application sent! The referrer has been notified.", "success");
  }

  function toggleDetails(jobId) {
    setOpenDetails(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
      return next;
    });
  }

  function JobCard({ job, mode }) {
    const referrer = usersById[job.postedBy];
    const isSaved = saved.has(job.id);
    const isApplied = applied.has(job.id);
    const detailsOpen = openDetails.has(job.id);
    return (
      <div className="card job-card">
        <div className="job-card__logo">{initials(job.company)}</div>
        <div style={{ flex: 1 }}>
          <div className="flex-between">
            <div>
              <h4>{job.title}</h4>
              <p className="text-soft" style={{ fontSize: ".9rem" }}>{job.company}</p>
            </div>
            {mode === "applied"
              ? <span className="status-pill approved">Applied</span>
              : <button type="button" className="icon-btn" aria-label="Save job" onClick={() => toggleSave(job.id)}>
                  <i className={"fa-" + (isSaved ? "solid" : "regular") + " fa-bookmark"}></i>
                </button>}
          </div>
          <div className="job-card__meta">
            <span><i className="fa-solid fa-location-dot"></i> {job.location}</span>
            <span><i className="fa-solid fa-briefcase"></i> {job.type}</span>
            <span><i className="fa-solid fa-clock"></i> Posted {timeAgo(job.postedAt)}</span>
          </div>
          <div className="flex gap-sm">
            {isApplied
              ? <button type="button" className="btn btn-secondary btn-sm" disabled>Applied ✓</button>
              : <button type="button" className="btn btn-primary btn-sm" onClick={() => apply(job.id)}>Apply Now</button>}
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => toggleDetails(job.id)}>
              {detailsOpen ? "Hide Details" : "View Details"}
            </button>
          </div>
          {detailsOpen && (
            <p className="text-soft" style={{ marginTop: 14, fontSize: ".88rem" }}>
              {job.description}{job.referralNote ? " · " + job.referralNote : ""}
            </p>
          )}
          {referrer && (
            <div className="job-card__referrer">
              <img src={resolveAvatar(referrer.avatar)} alt="" /> Referred by {referrer.fullName}, Class of {referrer.gradYear}
            </div>
          )}
        </div>
      </div>
    );
  }

  const savedArr = jobs.filter(j => saved.has(j.id));
  const appliedArr = jobs.filter(j => applied.has(j.id));

  return (
    <AppShell>
      <div className="page-head">
        <div className="flex-between">
          <div>
            <h2>Jobs Board</h2>
            <p className="text-soft">Roles posted by alumni who are hiring — and happy to be asked about it.</p>
          </div>
          {user.role !== "student" && (
            <Link to="/jobs/new" className="btn btn-primary"><i className="fa-solid fa-plus"></i> Post a Job</Link>
          )}
        </div>
      </div>

      <div className="jobs-layout" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>
        <aside className="filter-panel">
          <h4>Filter Jobs</h4>
          <div className="field">
            <label htmlFor="jSearch">Search</label>
            <div className="input-icon">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="jSearch" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Title or company" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="jLocation">Location</label>
            <select id="jLocation" value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">Any location</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Job type</label>
            {JOB_TYPES.map(t => (
              <label className="checkbox-row" key={t} style={{ marginBottom: 8 }}>
                <input type="checkbox" checked={activeTypes.includes(t)} onChange={() => toggleType(t)} /> {t}
              </label>
            ))}
          </div>
        </aside>

        <div>
          <div className="tab-labels" style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[["all", "All Jobs"], ["saved", "Saved"], ["applied", "Applied"]].map(([key, label]) => (
              <label key={key} onClick={() => setTab(key)} style={{ cursor: "pointer", padding: "8px 16px", borderRadius: 999, background: tab === key ? "var(--teal-700)" : "transparent", color: tab === key ? "#fff" : "inherit", fontWeight: 600 }}>
                {label}
              </label>
            ))}
          </div>

          {tab === "all" && (
            <div>
              {filtered.map(j => <JobCard key={j.id} job={j} mode="all" />)}
              {!filtered.length && <div className="empty-state"><i className="fa-solid fa-briefcase"></i><h4>Nothing here</h4><p>Try adjusting your filters.</p></div>}
            </div>
          )}
          {tab === "saved" && (
            <div>
              {savedArr.map(j => <JobCard key={j.id} job={j} mode="saved" />)}
              {!savedArr.length && <div className="card" style={{ textAlign: "center", padding: "60px 30px" }}>
                <i className="fa-regular fa-bookmark" style={{ fontSize: "2rem", color: "var(--ink-faint)", marginBottom: 16 }}></i>
                <h4>No saved jobs yet</h4><p className="text-faint" style={{ marginTop: 8 }}>Tap the bookmark icon on any listing to save it here for later.</p>
              </div>}
            </div>
          )}
          {tab === "applied" && (
            <div>
              {appliedArr.map(j => <JobCard key={j.id} job={j} mode="applied" />)}
              {!appliedArr.length && <div className="empty-state"><i className="fa-solid fa-briefcase"></i><h4>Nothing here</h4><p>You haven't applied to anything yet.</p></div>}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
