import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUsers } from "../context/UsersContext";
import { api } from "../api/client";
import { resolveAvatar } from "../utils/format";

const YEARS = Array.from({ length: 20 }, (_, i) => 2026 - i);
const DEPARTMENTS = ["Computer Science & Engineering", "Electronics & Communication", "Mechanical Engineering", "Business Administration", "Design", "Economics", "Other"];
const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Design & Creative", "Marketing", "Other"];

export default function EditProfile() {
  const { user, updateLocalUser, logout } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const { refresh: refreshUsers } = useUsers();

  const [form, setForm] = useState({
    fullName: user.fullName || "", headline: user.headline || "", location: user.location || "", bio: user.bio || "",
    gradYear: user.gradYear || "", department: user.department || "", company: user.company || "", jobTitle: user.jobTitle || "",
    industry: user.industry || "", linkedin: user.linkedin || "", website: user.website || ""
  });
  const [privacy, setPrivacy] = useState(user.privacy || { showEmail: true, showInDirectory: true, allowStudentMessages: false });
  const [notifications, setNotifications] = useState(user.notifications || { messages: true, events: true, jobs: true });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  async function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { showToast("Please choose an image under 3MB.", "error"); e.target.value = ""; return; }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { user: updated } = await api.upload(`/users/${user.id}/avatar`, formData);
      setAvatar(updated.avatar);
      updateLocalUser({ avatar: updated.avatar });
      refreshUsers();
      showToast("Photo updated!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function removePhoto() {
    setUploadingPhoto(true);
    try {
      const { user: updated } = await api.del(`/users/${user.id}/avatar`);
      setAvatar(updated.avatar);
      updateLocalUser({ avatar: updated.avatar });
      refreshUsers();
      showToast("Photo removed.", "info");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploadingPhoto(false);
    }
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Your name can't be empty.";
    if (form.bio.length > 500) e.bio = "Keep your bio under 500 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const patch = {
        fullName: form.fullName.trim(), headline: form.headline.trim(), location: form.location.trim(), bio: form.bio.trim(),
        gradYear: form.gradYear ? parseInt(form.gradYear, 10) : null, department: form.department, company: form.company.trim(),
        jobTitle: form.jobTitle.trim(), industry: form.industry, linkedin: form.linkedin.trim(), website: form.website.trim(),
        privacy, notifications
      };
      const { user: updated } = await api.patch(`/users/${user.id}`, patch);
      updateLocalUser(updated);
      refreshUsers();
      showToast("Profile updated!", "success");
      setTimeout(() => navigate("/profile"), 500);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function deactivate() {
    const sure = window.confirm("Deactivate your profile? You can reactivate anytime by logging back in.");
    if (!sure) return;
    await api.patch(`/users/${user.id}`, { privacy: { ...privacy, showInDirectory: false }, deactivated: true });
    showToast("Your profile has been deactivated.", "info");
    logout();
    navigate("/login");
  }

  return (
    <AppShell>
      <div className="page-head">
        <h2>Settings</h2>
        <p className="text-soft">Keep your profile current — it's how the rest of your batch finds you.</p>
      </div>

      <div className="profile-layout">
        <form onSubmit={handleSubmit}>
          <div className="card card--pad-lg" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 20 }}>Profile Photo</h4>
            <div className="flex gap-md" style={{ alignItems: "center" }}>
              <img src={resolveAvatar(avatar)} alt="Current profile photo" style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", opacity: uploadingPhoto ? 0.5 : 1 }} />
              <div className="flex gap-sm flex-wrap">
                <label className="btn btn-secondary btn-sm" style={{ cursor: uploadingPhoto ? "default" : "pointer" }}>
                  {uploadingPhoto ? "Uploading..." : "Upload New Photo"}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }} onChange={handlePhoto} disabled={uploadingPhoto} />
                </label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={removePhoto} disabled={uploadingPhoto}>Remove</button>
              </div>
            </div>
            <span className="hint" style={{ display: "block", marginTop: 10 }}>JPEG, PNG, WEBP, or GIF — up to 3MB. Saved immediately.</span>
          </div>

          <div className="card card--pad-lg" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 20 }}>Basic Information</h4>
            <div className="field-row">
              <div className={"field" + (errors.fullName ? " has-error" : "")}>
                <label htmlFor="editName">Full name</label>
                <input type="text" id="editName" value={form.fullName} onChange={e => set("fullName", e.target.value)} />
                {errors.fullName && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.fullName}</span>}
              </div>
              <div className="field">
                <label htmlFor="editHeadline">Headline</label>
                <input type="text" id="editHeadline" value={form.headline} onChange={e => set("headline", e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="editLocation">Location</label>
              <input type="text" id="editLocation" value={form.location} onChange={e => set("location", e.target.value)} />
            </div>
            <div className={"field" + (errors.bio ? " has-error" : "")}>
              <label htmlFor="editBio">Bio</label>
              <textarea id="editBio" value={form.bio} onChange={e => set("bio", e.target.value)}></textarea>
              {errors.bio ? <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.bio}</span>
                : <span className="hint">Shown on your public profile. Keep it under 400 characters.</span>}
            </div>
          </div>

          <div className="card card--pad-lg" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 20 }}>Education</h4>
            <div className="field-row">
              <div className="field">
                <label htmlFor="editYear">Graduation year</label>
                <select id="editYear" value={form.gradYear} onChange={e => set("gradYear", e.target.value)}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="editDept">Department</label>
                <select id="editDept" value={form.department} onChange={e => set("department", e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card card--pad-lg" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 20 }}>Current Role</h4>
            <div className="field-row">
              <div className="field">
                <label htmlFor="editCompany">Company</label>
                <input type="text" id="editCompany" value={form.company} onChange={e => set("company", e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="editTitle">Job title</label>
                <input type="text" id="editTitle" value={form.jobTitle} onChange={e => set("jobTitle", e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="editIndustry">Industry</label>
              <select id="editIndustry" value={form.industry} onChange={e => set("industry", e.target.value)}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div className="card card--pad-lg" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 20 }}>Social Links</h4>
            <div className="field">
              <label htmlFor="editLinkedin">LinkedIn</label>
              <div className="input-icon"><i className="fa-brands fa-linkedin-in"></i><input type="url" id="editLinkedin" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} /></div>
            </div>
            <div className="field">
              <label htmlFor="editWebsite">Portfolio / Website</label>
              <div className="input-icon"><i className="fa-solid fa-globe"></i><input type="url" id="editWebsite" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://" /></div>
            </div>
          </div>

          <div className="card card--pad-lg" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 6 }}>Privacy</h4>
            <p className="text-faint" style={{ fontSize: ".85rem", marginBottom: 18 }}>Control what other alumni can see.</p>
            <label className="checkbox-row" style={{ marginBottom: 14 }}><input type="checkbox" checked={privacy.showEmail} onChange={e => setPrivacy(p => ({ ...p, showEmail: e.target.checked }))} /> Show my email on my public profile</label>
            <label className="checkbox-row" style={{ marginBottom: 14 }}><input type="checkbox" checked={privacy.showInDirectory} onChange={e => setPrivacy(p => ({ ...p, showInDirectory: e.target.checked }))} /> Show my profile in directory search</label>
            <label className="checkbox-row"><input type="checkbox" checked={privacy.allowStudentMessages} onChange={e => setPrivacy(p => ({ ...p, allowStudentMessages: e.target.checked }))} /> Allow messages from current students</label>
          </div>

          <div className="card card--pad-lg" style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 6 }}>Notification Preferences</h4>
            <p className="text-faint" style={{ fontSize: ".85rem", marginBottom: 18 }}>Choose what lands in your inbox.</p>
            <label className="checkbox-row" style={{ marginBottom: 14 }}><input type="checkbox" checked={notifications.messages} onChange={e => setNotifications(n => ({ ...n, messages: e.target.checked }))} /> New messages</label>
            <label className="checkbox-row" style={{ marginBottom: 14 }}><input type="checkbox" checked={notifications.events} onChange={e => setNotifications(n => ({ ...n, events: e.target.checked }))} /> Upcoming events near me</label>
            <label className="checkbox-row"><input type="checkbox" checked={notifications.jobs} onChange={e => setNotifications(n => ({ ...n, jobs: e.target.checked }))} /> Job matches from my network</label>
          </div>

          <div className="flex gap-sm">
            <button type="submit" className={"btn btn-primary btn-lg" + (saving ? " is-loading" : "")} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            <Link to="/profile" className="btn btn-ghost btn-lg">Cancel</Link>
          </div>
        </form>

        <div>
          <div className="widget" style={{ borderColor: "var(--peach-300)" }}>
            <h4 style={{ color: "var(--orange-700)" }}>Danger Zone</h4>
            <p className="text-faint" style={{ fontSize: ".84rem", marginBottom: 16 }}>Deactivating hides your profile from the directory. You can reactivate anytime by logging back in.</p>
            <button type="button" className="btn btn-secondary btn-sm btn-block" style={{ borderColor: "var(--orange-500)", color: "var(--orange-700)" }} onClick={deactivate}>Deactivate Account</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
