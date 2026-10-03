import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";
import CopyButton from "../components/CopyButton";
import { LoadingBlock } from "../components/Loading";
import { api } from "../api/client";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { formatDate } from "../utils/format";

export default function StoryDetail() {
  const { slug } = useParams();
  const [story, setStory] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useDocumentTitle(
    story ? story.title : "Alumni Story",
    story ? story.summary : undefined
  );

  useEffect(() => {
    let cancelled = false;
    setStory(null);
    setNotFound(false);
    api.get("/stories/" + encodeURIComponent(slug))
      .then((data) => { if (!cancelled) setStory(data.story); })
      .catch(() => { if (!cancelled) setNotFound(true); });
    return () => { cancelled = true; };
  }, [slug]);

  if (notFound) {
    return (
      <>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          <section className="section">
            <div className="container">
              <div className="empty-state empty-state--panel">
                <i className="fa-solid fa-book-open" aria-hidden="true"></i>
                <h4>That story is not here</h4>
                <p>
                  It may have been unpublished. <Link to="/stories">See all alumni stories</Link>.
                </p>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="section-sm">
          <div className="container">
            {!story && <LoadingBlock message="Loading the story" />}

            {story && (
              <article className="legal-page story-detail">
                <Breadcrumbs
                  items={[
                    { label: "Home", to: "/" },
                    { label: "Alumni Stories", to: "/stories" },
                    { label: story.title }
                  ]}
                />

                <header className="legal-page__head">
                  {!story.published && (
                    <div className="notice-banner">
                      <i className="fa-solid fa-eye-slash" aria-hidden="true"></i>
                      This story is a draft. Only administrators can see it.
                    </div>
                  )}
                  <p className="eyebrow">Alumni Story</p>
                  <h1>{story.title}</h1>
                  <p className="lede">{story.summary}</p>

                  <div className="story-detail__byline">
                    <div>
                      <strong>{story.subjectName}</strong>
                      {story.subjectRole && <span className="text-soft">{story.subjectRole}</span>}
                      <span className="text-faint">
                        {[
                          story.gradYear && "Class of " + story.gradYear,
                          story.department
                        ].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    {story.subjectUserId && (
                      <Link to={"/profile/" + story.subjectUserId} className="btn btn-secondary btn-sm">
                        View profile
                      </Link>
                    )}
                  </div>

                  {story.publishedAt && (
                    <p className="legal-page__meta">
                      Published {formatDate(story.publishedAt)}
                      {story.updatedAt && story.updatedAt !== story.publishedAt && (
                        <> · Last updated {formatDate(story.updatedAt)}</>
                      )}
                    </p>
                  )}
                </header>

                {story.outcome && (
                  <p className="story-detail__outcome">
                    <i className="fa-solid fa-arrow-trend-up" aria-hidden="true"></i>
                    {story.outcome}
                  </p>
                )}

                {/* Stored as plain text, so paragraphs are split on blank lines
                    rather than rendered as HTML. Nothing an admin types can
                    inject markup into the page. */}
                {story.body.split(/\n\s*\n/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}

                <div className="story-detail__share">
                  <CopyButton
                    value={typeof window !== "undefined" ? window.location.href : ""}
                    label="Copy link to this story"
                    copiedLabel="Link copied"
                  />
                </div>

                <div className="related-links">
                  <h3>Keep reading</h3>
                  <ul>
                    <li><Link to="/stories">All alumni stories</Link></li>
                    <li><Link to="/directory">Find this person&rsquo;s batch in the directory</Link></li>
                    <li><Link to="/register">Join The Quad and add your own</Link></li>
                    <li><Link to="/contact">Suggest a story to the Alumni Office</Link></li>
                  </ul>
                </div>
              </article>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
