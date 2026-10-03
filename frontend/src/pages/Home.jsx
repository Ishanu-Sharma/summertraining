import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Accordion from "../components/Accordion";
import HeroBoundary from "../components/HeroFallback";
import { useDocumentTitle } from "../utils/useDocumentTitle";

// three.js is the largest single dependency and nothing above the fold depends
// on it, so the hero scene loads in its own chunk after the copy has painted.
const HeroScene = lazy(() => import("../components/HeroScene"));

const FEATURES = [
  {
    icon: "fa-magnifying-glass",
    title: "Find your people",
    body: "Search the full graduating class by batch, department, city, or company, then pick up the conversation right where you left off.",
    to: "/directory",
    cta: "Open the directory",
    wide: true
  },
  {
    icon: "fa-handshake-angle",
    title: "Mentor, or get mentored",
    body: "Offer twenty minutes of career advice to a sophomore, or ask a senior alum how they actually broke into product management.",
    to: "/stories",
    cta: "Read alumni stories"
  },
  {
    icon: "fa-briefcase",
    title: "Jobs, straight from alumni",
    body: "Skip the black-hole application. Browse roles posted by graduates who are hiring, and ask them for the inside scoop first.",
    to: "/jobs",
    cta: "See the jobs board"
  },
  {
    icon: "fa-calendar-days",
    title: "Show up for reunions",
    body: "RSVP to homecoming, department meetups, and city chapter dinners. See who else from your batch is going before you commit.",
    to: "/events",
    cta: "Browse events",
    wide: true
  },
  {
    icon: "fa-hand-holding-heart",
    title: "Give back to AdtU",
    body: "Fund a scholarship, guest-lecture a class, or just answer the occasional nervous email from a fresher who found your profile.",
    to: "/contact",
    cta: "Talk to the Alumni Office",
    wide: true
  },
  {
    icon: "fa-comments",
    title: "Stay in the loop",
    body: "One feed for department news, placement updates, and the quiet achievements of people you graduated with.",
    to: "/register",
    cta: "Create your profile"
  }
];

const CLASS_YEARS = ["'10", "'14", "'18", "'22", "'26"];

// The three questions the Alumni Office gets most. The full set lives on /faq.
const HOME_FAQS = [
  {
    q: "Who can join The Quad?",
    a: (
      <p>
        Any graduate of Assam down town University, from any batch, plus current
        students. Accounts are free. <Link to="/faq">See the full FAQ</Link>.
      </p>
    )
  },
  {
    q: "How long does verification take?",
    a: (
      <p>
        You can use the site immediately. The Alumni Relations Office checks your
        details against the university records and marks the account verified,
        usually within a working day.
      </p>
    )
  },
  {
    q: "Can I keep my profile private?",
    a: (
      <p>
        Yes. Settings has separate switches for appearing in the directory and for
        showing your email address, and either can be turned off at any time. The{" "}
        <Link to="/privacy">Privacy Policy</Link> sets out the rest.
      </p>
    )
  }
];

export default function Home() {
  useDocumentTitle(
    null,
    "The Quad connects Assam down town University alumni for mentorship, hiring, reunions, and giving back."
  );

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="hero">
          <div className="container">
            <div className="hero__inner">
              <div className="hero__copy animate-in">
                <p className="eyebrow">Assam down town University · Est. 2010</p>
                <h1>
                  Every class ring tells a story. <em>Yours is still being written.</em>
                </h1>
                <p className="lede">
                  Find your batch, trade referrals, and show up for the reunion you keep
                  meaning to attend.
                </p>
                {/* Both calls to action sit above the fold, next to the copy,
                    rather than below the 3D scene. */}
                <div className="hero__actions">
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Join the Network
                  </Link>
                  <Link to="/directory" className="btn btn-secondary btn-lg">
                    Browse the Directory
                  </Link>
                </div>
                <p className="hero__note">
                  Free for every AdtU graduate. Already a member?{" "}
                  <Link to="/login">Log in</Link>.
                </p>
              </div>

              <HeroBoundary>
                <Suspense fallback={<div className="hero__scene is-loading" aria-hidden="true" />}>
                  <HeroScene />
                </Suspense>
              </HeroBoundary>
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
                  <i className={"fa-solid " + feature.icon} aria-hidden="true"></i>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                  <Link to={feature.to} className="link-arrow">
                    {feature.cta}
                    <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="home-faq">
              <div className="section-head" style={{ marginBottom: 28 }}>
                <p className="eyebrow">Before you join</p>
                <h2>The questions we get asked</h2>
              </div>
              <Accordion items={HOME_FAQS} />
              <Link to="/faq" className="link-arrow">
                Read all the frequently asked questions
                <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </Link>
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
      </main>
      <SiteFooter />
    </>
  );
}
