import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../context/UsersContext";
import { api } from "../api/client";

const PAGE_SIZE = 6;

export default function Directory() {
  const { user } = useAuth();
  const showToast = useToast();
  const { users } = useUsers();

  const [connections, setConnections] = useState([]);
  const [filters, setFilters] = useState({ name: "", year: "", department: "", industry: "", location: "" });
  const [sort, setSort] = useState("relevant");
  const [page, setPage] = useState(1);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    (async () => {
      const { settings } = await api.get("/settings");
      setSettings(settings);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const connRes = await api.get(`/users/${user.id}/connections`);
      setConnections(connRes.ids);
    })();
  }, []);

  const alumni = useMemo(
    () => users.filter(u => u.role === "alumni" && u.privacy?.showInDirectory && !u.deactivated),
    [users]
  );

  const years = useMemo(() => [...new Set(alumni.map(u => u.gradYear).filter(Boolean))].sort((a, b) => b - a), [alumni]);
  const departments = useMemo(() => [...new Set(alumni.map(u => u.department).filter(Boolean))].sort(), [alumni]);
  const industries = useMemo(() => [...new Set(alumni.map(u => u.industry).filter(Boolean))].sort(), [alumni]);
  const locations = useMemo(() => [...new Set(alumni.map(u => (u.location || "").split(",")[0].split("·")[0].trim()).filter(Boolean))].sort(), [alumni]);

  const filtered = useMemo(() => {
    let list = alumni.filter(u => {
      if (filters.name && !u.fullName.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.year && String(u.gradYear) !== filters.year) return false;
      if (filters.department && u.department !== filters.department) return false;
      if (filters.industry && u.industry !== filters.industry) return false;
      if (filters.location && (u.location || "").split(",")[0].split("·")[0].trim() !== filters.location) return false;
      return true;
    });
    if (sort === "recent") list = list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === "year") list = list.slice().sort((a, b) => (b.gradYear || 0) - (a.gradYear || 0));
    else list = list.slice().sort((a, b) => a.fullName.localeCompare(b.fullName));
    return list;
  }, [alumni, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateFilter(key, value) { setFilters(prev => ({ ...prev, [key]: value })); setPage(1); }
  function clearFilters() { setFilters({ name: "", year: "", department: "", industry: "", location: "" }); setPage(1); }

  async function connectWith(id) {
    try {
      await api.post(`/users/${user.id}/connect`, { targetId: id });
      setConnections(prev => [...prev, id]);
      showToast("You're now connected!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  if (user.role === "student" && settings && !settings.allowStudentDirectoryView) {
    return (
      <AppShell>
        <div className="empty-state">
          <i className="fa-solid fa-lock"></i>
          <h4>Directory access is limited right now</h4>
          <p>The Alumni Office currently restricts directory browsing to alumni accounts. Check back later, or reach out via <Link to="/contact">Contact</Link> if you think this is a mistake.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-head">
        <div className="flex-between">
          <div>
            <h2>Alumni Directory</h2>
            <p className="text-soft">{alumni.length} graduates on The Quad — find someone worth reconnecting with.</p>
          </div>
        </div>
      </div>

      <div className="directory-layout">
        <aside className="filter-panel">
          <h4>Filter Results</h4>
          <p className="text-faint" style={{ fontSize: ".82rem", marginBottom: 18 }}>Narrow down by year, field, or location.</p>
          <form onSubmit={e => e.preventDefault()}>
            <div className="field">
              <label htmlFor="fName">Name</label>
              <div className="input-icon">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" id="fName" value={filters.name} onChange={e => updateFilter("name", e.target.value)} placeholder="Search by name" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="fYear">Graduation year</label>
              <select id="fYear" value={filters.year} onChange={e => updateFilter("year", e.target.value)}>
                <option value="">Any year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="fDept">Department</label>
              <select id="fDept" value={filters.department} onChange={e => updateFilter("department", e.target.value)}>
                <option value="">Any department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="fIndustry">Industry</label>
              <select id="fIndustry" value={filters.industry} onChange={e => updateFilter("industry", e.target.value)}>
                <option value="">Any industry</option>
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="fLocation">Location</label>
              <select id="fLocation" value={filters.location} onChange={e => updateFilter("location", e.target.value)}>
                <option value="">Anywhere</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button type="button" className="btn btn-ghost btn-block btn-sm" onClick={clearFilters}>Clear all</button>
          </form>
        </aside>

        <div>
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <span className="result-count">Showing {pageItems.length} of {filtered.length} alumni</span>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ width: "auto", padding: "10px 36px 10px 14px" }}>
              <option value="relevant">Sort: Most Relevant</option>
              <option value="recent">Sort: Recently Joined</option>
              <option value="year">Sort: Graduation Year</option>
            </select>
          </div>

          <div className="grid-3">
            {pageItems.map(u => {
              const yearShort = u.gradYear ? "'" + String(u.gradYear).slice(-2) : "•";
              const connected = connections.includes(u.id);
              return (
                <div className="card alumni-card" key={u.id}>
                  <div className="class-ring"><div className="class-ring__gem">{yearShort}</div></div>
                  <h4>{u.fullName}</h4>
                  <div className="role">{u.jobTitle || ""}{u.company ? ", " + u.company : ""}</div>
                  <div className="loc"><i className="fa-solid fa-location-dot"></i> {u.location || "—"}</div>
                  <div className="actions">
                    <Link to={`/profile/${u.id}`} className="btn btn-secondary btn-sm">View Profile</Link>
                    {connected
                      ? <Link to={`/messages?with=${u.id}`} className="btn btn-primary btn-sm">Message</Link>
                      : <button type="button" className="btn btn-primary btn-sm" onClick={() => connectWith(u.id)}>Connect</button>}
                  </div>
                </div>
              );
            })}
            {!pageItems.length && (
              <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <h4>No alumni match those filters</h4>
                <p>Try widening your search.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                p === currentPage
                  ? <span className="current" key={p}>{p}</span>
                  : <a href="#" key={p} onClick={e => { e.preventDefault(); setPage(p); }}>{p}</a>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
