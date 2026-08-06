import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <section className="hero">
        <div className="container">
          <div className="animate-in" style={{ maxWidth: 700 }}>
            <p className="eyebrow">Assam Downtown University · Est. 2010</p>
            <h1>Every class ring tells a story. <em>Yours is still being written.</em></h1>
            <p className="lede">The Quad keeps AdtU graduates connected across three decades — swap career advice, land your next referral, and finally show up for the reunion you keep meaning to attend.</p>
            <div className="hero__actions">
              <Link to="/register" className="btn btn-primary btn-lg">Join the Network</Link>
              <Link to="/directory" className="btn btn-secondary btn-lg">Browse the Directory</Link>
            </div>
            <div className="hero__proof">
              <div className="avatar-stack">
                <img src="https://i.pravatar.cc/80?img=12" alt="" />
                <img src="https://i.pravatar.cc/80?img=32" alt="" />
                <img src="https://i.pravatar.cc/80?img=47" alt="" />
                <span className="more">+</span>
              </div>
              <p className="meta"><strong>Real alumni</strong> reconnecting on The Quad — from the Class of 2010 onward.</p>
            </div>
          </div>

          <div className="hero__panel animate-in delay-2" style={{ marginTop: 56 }}>
            <p className="eyebrow">The Thread</p>
            <h3>Three decades, one network</h3>
            <p className="text-soft" style={{ marginBottom: 8 }}>Tap into any graduating class — the thread never really breaks.</p>
            <div className="ring-timeline" style={{ marginTop: 20 }}>
              {["'10", "'14", "'18", "'22", "'26"].map(g => (
                <div className="ring-timeline__node" key={g}>
                  <div className="class-ring"><div className="class-ring__gem">{g}</div></div>
                  <div className="ring-timeline__label"><strong>Class of 20{g.slice(1)}</strong></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head center">
            <p className="eyebrow" style={{ justifyContent: "center" }}>What's inside</p>
            <h2>What you can do on The Quad</h2>
            <p className="lede">One home for everything that used to happen over a dozen scattered group chats.</p>
          </div>
          <div className="grid-3">
            <div className="card feature-card">
              <i className="fa-solid fa-magnifying-glass"></i>
              <h3>Find your people</h3>
              <p>Search the full graduating class by batch, department, city, or company — and pick up the conversation right where you left off.</p>
            </div>
            <div className="card feature-card">
              <i className="fa-solid fa-handshake-angle"></i>
              <h3>Mentor, or get mentored</h3>
              <p>Offer twenty minutes of career advice to a sophomore, or ask a senior alum how they actually broke into product management.</p>
            </div>
            <div className="card feature-card">
              <i className="fa-solid fa-briefcase"></i>
              <h3>Jobs, straight from alumni</h3>
              <p>Skip the black-hole application. Browse roles posted by graduates who are hiring, and ask them for the inside scoop first.</p>
            </div>
            <div className="card feature-card">
              <i className="fa-solid fa-calendar-days"></i>
              <h3>Show up for reunions</h3>
              <p>RSVP to homecoming, department meetups, and city chapter dinners — and see who else from your batch is going before you commit.</p>
            </div>
            <div className="card feature-card">
              <i className="fa-solid fa-hand-holding-heart"></i>
              <h3>Give back to AdtU</h3>
              <p>Fund a scholarship, guest-lecture a class, or just answer the occasional nervous email from a fresher who found your profile.</p>
            </div>
            <div className="card feature-card">
              <i className="fa-solid fa-comments"></i>
              <h3>Stay in the loop</h3>
              <p>One feed for department news, placement stats, and the quiet achievements of people you graduated with.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="cta-banner">
            <h2>Your batch is still out there.</h2>
            <p>Come find out what everyone's up to — and finally reply to that reunion invite.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Create Your Profile</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
