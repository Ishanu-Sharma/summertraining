import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    if (!password) { setError("Enter your password."); return; }

    setLoading(true);
    try {
      await login(email, password);
      showToast("Welcome back!", "success");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="rings-deco">
          <div className="class-ring class-ring--lg" style={{ top: "8%", left: "12%" }}><div className="class-ring__gem">'14</div></div>
          <div className="class-ring" style={{ top: "55%", left: "65%" }}><div className="class-ring__gem">'19</div></div>
          <div className="class-ring class-ring--sm" style={{ top: "75%", left: "20%" }}><div className="class-ring__gem">'22</div></div>
        </div>
        <div className="auth-visual__content">
          <Link to="/" className="logo" style={{ color: "#fff", marginBottom: 60, display: "inline-flex" }}>
            <span className="logo-mark"><span>🎓</span></span> The Quad
          </Link>
          <blockquote>&ldquo;Came back for one reunion RSVP and ended up finding my current job.&rdquo;</blockquote>
          <p className="attribution">— An AdtU alum, on reconnecting through The Quad</p>
        </div>
        <p style={{ position: "relative", zIndex: 1, color: "rgba(251,246,238,.6)", fontSize: ".85rem" }}>Assam Downtown University Alumni Relations Office</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card animate-in">
          <h1>Welcome back</h1>
          <p className="lede">Log in to catch up on your feed, your messages, and whoever's hiring this week.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={"field" + (error ? " has-error" : "")}>
              <label htmlFor="email">Email address</label>
              <div className="input-icon">
                <i className="fa-solid fa-envelope"></i>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@adtu.in" required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-icon">
                <i className="fa-solid fa-lock"></i>
                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
              </div>
              {error && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</span>}
            </div>
            <div className="flex-between" style={{ marginBottom: 26 }}>
              <label className="checkbox-row"><input type="checkbox" /> Remember me</label>
              <a href="#" style={{ fontSize: ".88rem", fontWeight: 600, color: "var(--teal-700)" }}>Forgot password?</a>
            </div>
            <button type="submit" className={"btn btn-primary btn-block btn-lg" + (loading ? " is-loading" : "")} disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="auth-footer-link">New to The Quad? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
