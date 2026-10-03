import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";
import CopyButton from "../components/CopyButton";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api/client";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { attributionString, trackFormError, trackFormSuccess } from "../utils/analytics";

const SUBJECTS = ["General Inquiry", "Report an Issue", "Event Idea or Proposal", "Partnership / Sponsorship", "Profile Verification Help"];

export default function Contact() {
  useDocumentTitle(
    "About and Contact",
    "Reach the Alumni Relations Office of Assam down town University. The team replies within two business days."
  );
  const { user } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: f.name || user.fullName, email: f.email || user.email }));
  }, [user]);

  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (!form.subject) e.subject = "Select a topic.";
    if (form.message.trim().length < 10) e.message = "Tell us a little more (10+ characters).";
    setErrors(e);
    const ok = Object.keys(e).length === 0;
    // Recorded so the proportion of attempts that fail validation, and on
    // which field, is visible instead of guessed at.
    if (!ok) trackFormError("contact", Object.keys(e)[0]);
    return ok;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // `source` is the first-touch UTM attribution captured when this visitor
      // first landed, so a campaign can be credited with the enquiry it
      // actually produced.
      await api.post("/contact", { ...form, source: attributionString() }, { auth: false });
      setSent(true);
      setForm({ name: user?.fullName || "", email: user?.email || "", subject: "", message: "" });
      trackFormSuccess("contact", { subject: form.subject });
      navigate("/thank-you?from=contact");
    } catch (err) {
      trackFormError("contact", err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
      <section className="section-sm">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About & Contact" }]} />
          <div className="section-head" style={{ marginBottom: 60 }}>
            <p className="eyebrow">Get in touch</p>
            <h1>About &amp; Contact</h1>
            <p className="lede">The Quad is built and maintained by the Assam down town University Alumni Relations Office. Questions, feedback, or a reunion idea? You'll reach a real team here, not a ticket queue.</p>
          </div>

          <div className="contact-layout">
            <div>
              <h3 style={{ marginBottom: 20 }}>Send us a message</h3>
              <form onSubmit={handleSubmit} noValidate>
                <div className="field-row">
                  <div className={"field" + (errors.name ? " has-error" : "")}>
                    <label htmlFor="cName">Full name</label>
                    <input type="text" id="cName" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" />
                    {errors.name && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.name}</span>}
                  </div>
                  <div className={"field" + (errors.email ? " has-error" : "")}>
                    <label htmlFor="cEmail">Email address</label>
                    <input type="email" id="cEmail" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
                    {errors.email && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.email}</span>}
                  </div>
                </div>
                <div className={"field" + (errors.subject ? " has-error" : "")}>
                  <label htmlFor="cSubject">Subject</label>
                  <select id="cSubject" value={form.subject} onChange={e => set("subject", e.target.value)}>
                    <option value="" disabled>Select a topic</option>
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {errors.subject && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.subject}</span>}
                </div>
                <div className={"field" + (errors.message ? " has-error" : "")}>
                  <label htmlFor="cMessage">Message</label>
                  <textarea id="cMessage" value={form.message} onChange={e => set("message", e.target.value)} placeholder="Tell us what's on your mind..."></textarea>
                  {errors.message && <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.message}</span>}
                </div>
                <button type="submit" className={"btn btn-primary btn-lg" + (loading ? " is-loading" : "")} disabled={loading}>
                  {sent ? "Message Sent ✓" : loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            <div>
              <h3 style={{ marginBottom: 20 }}>Reach us directly</h3>
              <div className="contact-info-card">
                <i className="fa-solid fa-location-dot"></i>
                <div><h4 style={{ fontSize: "1rem" }}>Visit Us</h4><p className="text-soft">Alumni Relations Office, Assam down town University, Panikhaiti, Guwahati, Assam 781026</p></div>
              </div>
              <div className="contact-info-card">
                <i className="fa-solid fa-phone"></i>
                <div>
                  <h4 style={{ fontSize: "1rem" }}>Call Us</h4>
                  <p className="text-soft"><a href="tel:+913612345678">+91 361 234 5678</a></p>
                  <CopyButton value="+91 361 234 5678" label="Copy number" copiedLabel="Number copied" />
                </div>
              </div>
              <div className="contact-info-card">
                <i className="fa-solid fa-envelope"></i>
                <div>
                  <h4 style={{ fontSize: "1rem" }}>Email Us</h4>
                  <p className="text-soft"><a href="mailto:alumni@adtu.in">alumni@adtu.in</a></p>
                  <CopyButton value="alumni@adtu.in" label="Copy address" copiedLabel="Address copied" />
                </div>
              </div>
              <div className="contact-info-card">
                <i className="fa-solid fa-clock"></i>
                <div><h4 style={{ fontSize: "1rem" }}>Office Hours</h4><p className="text-soft">Monday to Friday, 10:00 AM to 6:00 PM IST</p></div>
              </div>

              <div className="related-links">
                <h3>Might save you the message</h3>
                <ul>
                  <li><Link to="/faq">How verification works, and how long it takes</Link></li>
                  <li><Link to="/faq">Keeping your profile out of the directory</Link></li>
                  <li><Link to="/privacy">What data we hold about you</Link></li>
                  <li><Link to="/stories">Suggest an alumni story</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>
      <SiteFooter />
    </>
  );
}
