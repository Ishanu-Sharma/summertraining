import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email }, { auth: false });
      setSent(true);
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
          {sent ? (
            <>
              <h1>Check your email</h1>
              <p className="lede">If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. It expires in an hour.</p>
              <p className="auth-footer-link"><Link to="/login">Back to login</Link></p>
            </>
          ) : (
            <>
              <h1>Forgot your password?</h1>
              <p className="lede">Enter the email you registered with and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className={"field" + (error ? " has-error" : "")}>
                  <label htmlFor="email">Email address</label>
                  <div className="input-icon">
                    <i className="fa-solid fa-envelope"></i>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@adtu.in" required />
                  </div>
                  {error && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</span>}
                </div>
                <button type="submit" className={"btn btn-primary btn-block btn-lg" + (loading ? " is-loading" : "")} disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
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
