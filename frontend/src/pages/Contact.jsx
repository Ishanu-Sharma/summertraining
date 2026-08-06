import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api/client";

const SUBJECTS = ["General Inquiry", "Report an Issue", "Event Idea or Proposal", "Partnership / Sponsorship", "Profile Verification Help"];

export default function Contact() {
  const { user } = useAuth();
  const showToast = useToast();
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
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/contact", form, { auth: false });
      setSent(true);
      setForm({ name: user?.fullName || "", email: user?.email || "", subject: "", message: "" });
      showToast("Thanks — the Alumni Office will get back to you within 2 business days.", "success");
      setTimeout(() => setSent(false), 2500);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <section className="section-sm">
        <div className="container">
          <div className="section-head" style={{ marginBottom: 60 }}>
            <p className="eyebrow">Get in touch</p>
            <h1>About &amp; Contact</h1>
            <p className="lede">The Quad is built and maintained by the Assam Downtown University Alumni Relations Office. Questions, feedback, or a reunion idea? You'll reach a real team here, not a ticket queue.</p>
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
                <div><h4 style={{ fontSize: "1rem" }}>Call Us</h4><p className="text-soft">+91 361 234 5678</p></div>
              </div>
              <div className="contact-info-card">
                <i className="fa-solid fa-envelope"></i>
                <div><h4 style={{ fontSize: "1rem" }}>Email Us</h4><p className="text-soft">alumni@adtu.in</p></div>
              </div>
              <div className="contact-info-card">
                <i className="fa-solid fa-clock"></i>
                <div><h4 style={{ fontSize: "1rem" }}>Office Hours</h4><p className="text-soft">Monday – Friday, 10:00 AM – 6:00 PM IST</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
