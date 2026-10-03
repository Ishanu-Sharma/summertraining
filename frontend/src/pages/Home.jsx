import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

// three.js is ~600KB of the bundle, and nothing above the fold depends on it,
// so the hero scene loads in its own chunk after the copy has painted.
const HeroScene = lazy(() => import("../components/HeroScene"));

const FEATURES = [
  {
    icon: "fa-magnifying-glass",
    title: "Find your people",
    body: "Search the full graduating class by batch, department, city, or company, then pick up the conversation right where you left off.",
    wide: true,
  },
  {
    icon: "fa-handshake-angle",
    title: "Mentor, or get mentored",
    body: "Offer twenty minutes of career advice to a sophomore, or ask a senior alum how they actually broke into product management.",
  },
  {
    icon: "fa-briefcase",
    title: "Jobs, straight from alumni",
    body: "Skip the black-hole application. Browse roles posted by graduates who are hiring, and ask them for the inside scoop first.",
  },
  {
    icon: "fa-calendar-days",
    title: "Show up for reunions",
    body: "RSVP to homecoming, department meetups, and city chapter dinners. See who else from your batch is going before you commit.",
    wide: true,
  },
  {
    icon: "fa-hand-holding-heart",
    title: "Give back to AdtU",
    body: "Fund a scholarship, guest-lecture a class, or just answer the occasional nervous email from a fresher who found your profile.",
    wide: true,
  },
  {
    icon: "fa-comments",
    title: "Stay in the loop",
    body: "One feed for department news, placement updates, and the quiet achievements of people you graduated with.",
  },
];

const CLASS_YEARS = ["'10", "'14", "'18", "'22", "'26"];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <section className="hero">
        <div className="container">
          <div className="hero__inner">
            <div className="hero__copy animate-in">
              <p className="eyebrow">Assam Downtown University · Est. 2010</p>
              <h1>
                Every class ring tells a story. <em>Yours is still being written.</em>
              </h1>
              <p className="lede">
                Find your batch, trade referrals, and show up for the reunion you keep
                meaning to attend.
              </p>
              <div className="hero__actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Join the Network
                </Link>
                <Link to="/directory" className="btn btn-secondary btn-lg">
                  Browse the Directory
                </Link>
              </div>
            </div>

            <Suspense fallback={<div className="hero__scene" aria-hidden="true" />}>
              <HeroScene />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="section-sm thread-band">
        <div className="container">
          <div className="thread-band__inner">
            <div className="thread-band__copy">
              <p className="eyebrow">The Thread</p>
              <h2>Three decades, one network</h2>
              <p className="text-soft">
                Tap into any graduating class. The thread never really breaks.
              </p>
            </div>
            <div className="ring-timeline">
              {CLASS_YEARS.map(year => (
                <div className="ring-timeline__node" key={year}>
                  <div className="class-ring">
                    <div className="class-ring__gem">{year}</div>
                  </div>
                  <div className="ring-timeline__label">
                    <strong>Class of 20{year.slice(1)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>What you can do on The Quad</h2>
            <p className="lede">
              One home for everything that used to happen over a dozen scattered group
              chats.
            </p>
          </div>
          <div className="feature-grid">
            {FEATURES.map(feature => (
              <div
                className={"card feature-card" + (feature.wide ? " feature-card--wide" : "")}
                key={feature.title}
              >
                <i className={"fa-solid " + feature.icon}></i>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="cta-banner">
            <h2>Your batch is still out there.</h2>
            <p>
              Come find out what everyone is up to, and finally reply to that reunion
              invite.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Your Profile
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
