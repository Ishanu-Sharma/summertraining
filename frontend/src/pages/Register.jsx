import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const YEARS_PAST = Array.from({ length: 20 }, (_, i) => 2026 - i);
const YEARS_FUTURE = Array.from({ length: 6 }, (_, i) => 2026 + i);
const DEPARTMENTS = [
  "Computer Science & Engineering", "Electronics & Communication", "Mechanical Engineering",
  "Business Administration", "Economics", "Design", "Other"
];

export default function Register() {
  const { register } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState("alumni");
  const [form, setForm] = useState({ fullName: "", gradYear: "", email: "", department: "", password: "", confirmPassword: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const years = role === "student" ? YEARS_FUTURE : YEARS_PAST;

  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Enter your full name.";
    if (!form.gradYear) e.gradYear = "Select your graduation year.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (!form.department) e.department = "Select your department.";
    if (form.password.length < 6) e.password = "Use at least 6 characters.";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords don't match.";
    if (!terms) { showToast("Please accept the Terms of Service to continue.", "error"); e.terms = true; }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        gradYear: parseInt(form.gradYear, 10),
        department: form.department,
        password: form.password,
        role
      });
      showToast(role === "student" ? "Welcome to The Quad!" : "Welcome to The Quad! Your profile is pending verification.", "success");
      navigate("/dashboard");
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="rings-deco">
          <div className="class-ring class-ring--lg" style={{ top: "12%", left: "18%" }}><div className="class-ring__gem">'21</div></div>
          <div className="class-ring" style={{ top: "60%", left: "70%" }}><div className="class-ring__gem">'09</div></div>
          <div className="class-ring class-ring--sm" style={{ top: "78%", left: "26%" }}><div className="class-ring__gem">'17</div></div>
        </div>
        <div className="auth-visual__content">
          <Link to="/" className="logo" style={{ color: "#fff", marginBottom: 60, display: "inline-flex" }}>
            <span className="logo-mark"><span>🎓</span></span> The Quad
          </Link>
          <blockquote>&ldquo;Setting up my profile took four minutes. Getting a referral out of it took four days.&rdquo;</blockquote>
          <p className="attribution">— An AdtU alum, Class of 2020</p>
        </div>
        <p style={{ position: "relative", zIndex: 1, color: "rgba(251,246,238,.6)", fontSize: ".85rem" }}>Assam Downtown University Alumni Relations Office</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card animate-in" style={{ maxWidth: 460 }}>
          <h1>Create your profile</h1>
          <p className="lede">Free for every AdtU graduate. Takes about four minutes.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>I am a</label>
              <div className="flex gap-sm" style={{ marginTop: 6 }}>
                <label className="radio-row" style={{ flex: 1, border: "1px solid var(--line-soft)", borderRadius: 10, padding: "10px 14px" }}>
                  <input type="radio" name="role" checked={role === "alumni"} onChange={() => { setRole("alumni"); set("gradYear", ""); }} /> Alumni graduate
                </label>
                <label className="radio-row" style={{ flex: 1, border: "1px solid var(--line-soft)", borderRadius: 10, padding: "10px 14px" }}>
                  <input type="radio" name="role" checked={role === "student"} onChange={() => { setRole("student"); set("gradYear", ""); }} /> Current student
                </label>
              </div>
            </div>
            <div className="field-row">
              <div className={"field" + (errors.fullName ? " has-error" : "")}>
                <label htmlFor="fullName">Full name</label>
                <input type="text" id="fullName" value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Your name" />
                {errors.fullName && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.fullName}</span>}
              </div>
              <div className={"field" + (errors.gradYear ? " has-error" : "")}>
                <label htmlFor="gradYear">{role === "student" ? "Expected graduation year" : "Graduation year"}</label>
                <select id="gradYear" value={form.gradYear} onChange={e => set("gradYear", e.target.value)}>
                  <option value="" disabled>Select year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.gradYear && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.gradYear}</span>}
              </div>
            </div>

            <div className={"field" + (errors.email ? " has-error" : "")}>
              <label htmlFor="regEmail">Email address</label>
              <div className="input-icon">
                <i className="fa-solid fa-envelope"></i>
                <input type="email" id="regEmail" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@adtu.in" />
              </div>
              {errors.email ? <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.email}</span>
                : <span className="hint">Use your AdtU email if you have it — it speeds up verification.</span>}
            </div>

            <div className={"field" + (errors.department ? " has-error" : "")}>
              <label htmlFor="department">Department / Major</label>
              <select id="department" value={form.department} onChange={e => set("department", e.target.value)}>
                <option value="" disabled>Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.department}</span>}
            </div>

            <div className="field-row">
              <div className={"field" + (errors.password ? " has-error" : "")}>
                <label htmlFor="regPassword">Password</label>
                <input type="password" id="regPassword" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Create a password" />
                {errors.password && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.password}</span>}
              </div>
              <div className={"field" + (errors.confirmPassword ? " has-error" : "")}>
                <label htmlFor="confirmPassword">Confirm password</label>
                <input type="password" id="confirmPassword" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="Re-enter password" />
                {errors.confirmPassword && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.confirmPassword}</span>}
              </div>
            </div>

            <label className="checkbox-row" style={{ marginBottom: 26 }}>
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
              I agree to the <a href="#" style={{ color: "var(--teal-700)", fontWeight: 600 }}>Terms of Service</a> and <a href="#" style={{ color: "var(--teal-700)", fontWeight: 600 }}>Privacy Policy</a>
            </label>

            <button type="submit" className={"btn btn-primary btn-block btn-lg" + (loading ? " is-loading" : "")} disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer-link">Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
