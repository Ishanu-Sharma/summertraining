import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";
import { SkeletonCards } from "../components/Loading";
import { api } from "../api/client";
import { useDocumentTitle } from "../utils/useDocumentTitle";

/**
 * Alumni stories, the long-form version of what the network is actually for.
 *
 * Nothing on this page is seeded or illustrative. Every story is written by the
 * Alumni Relations Office in the admin panel about a real graduate, and until
 * one exists the page says so plainly rather than filling the grid with
 * invented profiles.
 */
export default function Stories() {
  useDocumentTitle(
    "Alumni Stories",
    "What Assam down town University graduates did next, in their own words: careers, mentorship, and the people who helped."
  );

  const [stories, setStories] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get("/stories")
      .then((data) => { if (!cancelled) setStories(data.stories || []); })
      .catch((err) => { if (!cancelled) { setError(err.message); setStories([]); } });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="section-sm">
          <div className="container">
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Alumni Stories" }]} />

            <div className="section-head">
              <p className="eyebrow">Alumni Stories</p>
              <h1>What happened next</h1>
              <p className="lede">
                Graduates of Assam down town University, and the turn their career
                actually took. Written up by the Alumni Relations Office, with the
                graduate&rsquo;s permission.
              </p>
            </div>

            {stories === null && <SkeletonCards count={3} />}

            {error && (
              <div className="notice-banner">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                {error}
              </div>
            )}

            {stories !== null && stories.length === 0 && !error && (
              <div className="empty-state empty-state--panel">
                <i className="fa-solid fa-feather" aria-hidden="true"></i>
                <h4>No stories published yet</h4>
                <p>
                  The Alumni Relations Office is collecting the first set now. If you
                  would like your own story told here, or you know a classmate whose
                  story deserves telling, <Link to="/contact">get in touch</Link>.
                </p>
              </div>
            )}

            {!!stories?.length && (
              <div className="story-grid">
                {stories.map((story) => (
                  <article className="card story-card" key={story.id}>
                    <div className="story-card__meta">
                      {story.gradYear && <span className="tag">Class of {story.gradYear}</span>}
                      {story.department && <span className="tag tag--soft">{story.department}</span>}
                    </div>
                    <h2>
                      <Link to={"/stories/" + story.slug}>{story.title}</Link>
                    </h2>
                    <p className="story-card__who">
                      {story.subjectName}
                      {story.subjectRole ? ", " + story.subjectRole : ""}
                    </p>
                    <p className="text-soft">{story.summary}</p>
                    {story.outcome && (
                      <p className="story-card__outcome">
                        <i className="fa-solid fa-arrow-trend-up" aria-hidden="true"></i>
                        {story.outcome}
                      </p>
                    )}
                    <Link to={"/stories/" + story.slug} className="link-arrow">
                      Read the full story
                      <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            <div className="related-links">
              <h3>Where to go next</h3>
              <ul>
                <li><Link to="/directory">Browse the alumni directory</Link></li>
                <li><Link to="/events">See what reunions are coming up</Link></li>
                <li><Link to="/jobs">Find a role posted by an alum</Link></li>
                <li><Link to="/faq">Read the frequently asked questions</Link></li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
