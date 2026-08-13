import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!token || !id) { setError("This reset link is missing information. Please request a new one."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { id, token, password }, { auth: false });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
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
          {done ? (
            <>
              <h1>Password updated</h1>
              <p className="lede">You can now log in with your new password. Redirecting you to login…</p>
            </>
          ) : (
            <>
              <h1>Set a new password</h1>
              <p className="lede">Choose a new password for your account.</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className={"field" + (error ? " has-error" : "")}>
                  <label htmlFor="password">New password</label>
                  <div className="input-icon">
                    <i className="fa-solid fa-lock"></i>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required />
                  </div>
                </div>
                <div className={"field" + (error ? " has-error" : "")}>
                  <label htmlFor="confirm">Confirm new password</label>
                  <div className="input-icon">
                    <i className="fa-solid fa-lock"></i>
                    <input type="password" id="confirm" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter your password" required />
                  </div>
                  {error && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</span>}
                </div>
                <button type="submit" className={"btn btn-primary btn-block btn-lg" + (loading ? " is-loading" : "")} disabled={loading}>
                  {loading ? "Saving..." : "Reset password"}
                </button>
              </form>

              <p className="auth-footer-link"><Link to="/login">Back to login</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
