import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useToast } from "../context/ToastContext";
import { api } from "../api/client";

export default function PostJob() {
  const showToast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", company: "", location: "", type: "", experience: "Entry-level / Fresher",
    salary: "", description: "", applyLink: "", referralNote: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Enter a job title.";
    if (!form.company.trim()) e.company = "Enter a company name.";
    if (!form.location.trim()) e.location = "Enter a location.";
    if (!form.type) e.type = "Select a job type.";
    if (form.description.trim().length < 20) e.description = "Add a bit more detail (20+ characters).";
    if (!form.applyLink.trim()) e.applyLink = "Add an application link or email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { job } = await api.post("/jobs", form);
      showToast(job.status === "approved" ? "Job posted!" : "Job submitted for review by the Alumni Office.", "success");
      navigate("/jobs");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <Link to="/jobs" className="text-soft" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: ".88rem", fontWeight: 600 }}>
        <i className="fa-solid fa-arrow-left"></i> Back to Jobs Board
      </Link>

      <div className="page-head">
        <h2>Post a Job</h2>
        <p className="text-soft">Hiring, or know someone who is? A referral from an alum carries real weight.</p>
      </div>

      <div className="post-job-layout">
        <form onSubmit={handleSubmit} noValidate>
          <div className="card card--pad-lg">
            <div className="field-row">
              <div className={"field" + (errors.title ? " has-error" : "")}>
                <label htmlFor="pjTitle">Job title</label>
                <input type="text" id="pjTitle" value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Product Designer" />
                {errors.title && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.title}</span>}
              </div>
              <div className={"field" + (errors.company ? " has-error" : "")}>
                <label htmlFor="pjCompany">Company</label>
                <input type="text" id="pjCompany" value={form.company} onChange={e => set("company", e.target.value)} placeholder="e.g. Nimbus Health" />
                {errors.company && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.company}</span>}
              </div>
            </div>

            <div className="field-row">
              <div className={"field" + (errors.location ? " has-error" : "")}>
                <label htmlFor="pjLocation">Location</label>
                <input type="text" id="pjLocation" value={form.location} onChange={e => set("location", e.target.value)} placeholder="City, or Remote" />
                {errors.location && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.location}</span>}
              </div>
              <div className={"field" + (errors.type ? " has-error" : "")}>
                <label htmlFor="pjType">Job type</label>
                <select id="pjType" value={form.type} onChange={e => set("type", e.target.value)}>
                  <option value="" disabled>Select type</option>
                  <option>Full-time</option><option>Internship</option><option>Contract</option><option>Part-time</option>
                </select>
                {errors.type && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.type}</span>}
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="pjExperience">Experience level</label>
                <select id="pjExperience" value={form.experience} onChange={e => set("experience", e.target.value)}>
                  <option>Entry-level / Fresher</option><option>1–3 years</option><option>3–6 years</option><option>6+ years</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="pjSalary">Salary range <span className="text-faint" style={{ fontWeight: 400 }}>(optional)</span></label>
                <input type="text" id="pjSalary" value={form.salary} onChange={e => set("salary", e.target.value)} placeholder="e.g. ₹12–18 LPA" />
              </div>
            </div>

            <div className={"field" + (errors.description ? " has-error" : "")}>
              <label htmlFor="pjDescription">Job description</label>
              <textarea id="pjDescription" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Responsibilities, requirements, and what makes this role worth a referral..."></textarea>
              {errors.description && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.description}</span>}
            </div>

            <div className={"field" + (errors.applyLink ? " has-error" : "")}>
              <label htmlFor="pjLink">Application link or email</label>
              <div className="input-icon">
                <i className="fa-solid fa-link"></i>
                <input type="text" id="pjLink" value={form.applyLink} onChange={e => set("applyLink", e.target.value)} placeholder="https:// or careers@company.com" />
              </div>
              {errors.applyLink && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.applyLink}</span>}
            </div>

            <div className="field">
              <label htmlFor="pjNote">A note from you <span className="text-faint" style={{ fontWeight: 400 }}>(optional)</span></label>
              <textarea id="pjNote" value={form.referralNote} onChange={e => set("referralNote", e.target.value)} placeholder="e.g. Happy to refer directly — just message me first."></textarea>
            </div>

            <div className="flex gap-sm">
              <button type="submit" className={"btn btn-primary btn-lg" + (loading ? " is-loading" : "")} disabled={loading}>
                {loading ? "Posting..." : "Post Job"}
              </button>
              <Link to="/jobs" className="btn btn-ghost btn-lg">Cancel</Link>
            </div>
          </div>
        </form>

        <div className="widget">
          <h4>Tips for a Great Job Post</h4>
          <ul className="tips-list">
            <li><i className="fa-solid fa-circle-check"></i> Be specific about the role — "Backend Engineer, Payments team" beats "Engineer wanted."</li>
            <li><i className="fa-solid fa-circle-check"></i> Mention if you can personally refer applicants.</li>
            <li><i className="fa-solid fa-circle-check"></i> Include a real application link or email, not just "DM me."</li>
            <li><i className="fa-solid fa-circle-check"></i> Add the expected experience level to save everyone's time.</li>
            <li><i className="fa-solid fa-circle-check"></i> Listings are reviewed by the Alumni Office before they go live.</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
