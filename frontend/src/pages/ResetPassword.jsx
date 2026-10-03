import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BrandMark from "../components/BrandMark";
import PasswordField from "../components/PasswordField";
import { api } from "../api/client";
import { useDocumentTitle } from "../utils/useDocumentTitle";

export default function ResetPassword() {
  useDocumentTitle("Set a New Password", "Choose a new password for your account on The Quad.");
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
          <div className="class-ring class-ring--lg" style={{ top: "40%", left: "58%" }}><div className="class-ring__gem">'14</div></div>
          <div className="class-ring" style={{ top: "63%", left: "20%" }}><div className="class-ring__gem">'19</div></div>
          <div className="class-ring class-ring--sm" style={{ top: "80%", left: "68%" }}><div className="class-ring__gem">'22</div></div>
        </div>
        <div className="auth-visual__content">
          <Link to="/" className="logo" style={{ color: "#fff", marginBottom: 60, display: "inline-flex" }}>
            <BrandMark tone="light" /> The Quad
          </Link>
          <p className="auth-visual__pitch">Choose a new password and you are back in.</p>
        </div>
        <p style={{ position: "relative", zIndex: 1, color: "rgba(251,246,238,.6)", fontSize: ".85rem" }}>Assam down town University Alumni Relations Office</p>
      </div>

      <main className="auth-form-side" id="main" tabIndex={-1}>
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
                <PasswordField
                  id="password"
                  label="New password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                />
                <PasswordField
                  id="confirm"
                  label="Confirm new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  icon="fa-lock-open"
                  required
                  error={error}
                />
                <button type="submit" className={"btn btn-primary btn-block btn-lg" + (loading ? " is-loading" : "")} disabled={loading}>
                  {loading ? "Saving..." : "Reset password"}
                </button>
              </form>

              <p className="auth-footer-link"><Link to="/login">Back to login</Link></p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
