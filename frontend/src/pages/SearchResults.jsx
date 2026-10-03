import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";
import SiteSearch from "../components/SiteSearch";
import { LoadingBlock } from "../components/Loading";
import { api, getToken } from "../api/client";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { trackEvent } from "../utils/analytics";

const GROUPS = [
  { kind: "person", label: "Alumni", icon: "fa-user" },
  { kind: "story", label: "Alumni stories", icon: "fa-bookmark" },
  { kind: "event", label: "Events", icon: "fa-calendar-days" },
  { kind: "job", label: "Jobs", icon: "fa-briefcase" },
  { kind: "page", label: "Pages", icon: "fa-file-lines" }
];

/**
 * The full results page behind the search box, reachable at /search?q=.
 *
 * Having a real URL for a query matters for more than tidiness: it is what
 * makes a result set shareable, bookmarkable, and countable in analytics. The
 * query lives in the URL, not in component state, so the back button moves
 * between searches the way a visitor expects.
 */
export default function SearchResults() {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();

  useDocumentTitle(
    query ? `Search: ${query}` : "Search",
    query ? `Results across The Quad for ${query}.` : "Search alumni, events, jobs, and stories across The Quad."
  );

  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setResults(null);
    setError("");

    api.search(query, controller.signal)
      .then((data) => {
        setResults(data.results || []);
        trackEvent("search", { search_term: query, result_count: (data.results || []).length });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setResults([]);
      });

    return () => controller.abort();
  }, [query]);

  const grouped = GROUPS
    .map((group) => ({ ...group, items: (results || []).filter((r) => r.kind === group.kind) }))
    .filter((group) => group.items.length);

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="section-sm">
          <div className="container">
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Search" }]} />

            <div className="section-head" style={{ marginBottom: 32 }}>
              <p className="eyebrow">Search</p>
              <h1>{query ? <>Results for &ldquo;{query}&rdquo;</> : "Search The Quad"}</h1>
            </div>

            <div className="search-page__box">
              <SiteSearch placeholder="Search alumni, events, jobs, stories" />
            </div>

            {!getToken() && (
              <div className="notice-banner info">
                <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
                You are searching the public pages. <Link to="/login">Log in</Link> to
                search alumni, events, and the jobs board too.
              </div>
            )}

            {query.length < 2 && (
              <p className="text-soft">Type at least two characters to search.</p>
            )}

            {error && (
              <div className="notice-banner">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                {error}
              </div>
            )}

            {query.length >= 2 && results === null && <LoadingBlock message="Searching" />}

            {query.length >= 2 && results !== null && !results.length && !error && (
              <div className="empty-state empty-state--panel">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <h4>Nothing matched &ldquo;{query}&rdquo;</h4>
                <p>
                  Try a shorter term, a department, a company, or a graduating year.
                  You can also <Link to="/directory">browse the directory</Link> or{" "}
                  <Link to="/contact">ask us directly</Link>.
                </p>
              </div>
            )}

            {grouped.map((group) => (
              <section className="search-group" key={group.kind}>
                <h2>
                  <i className={"fa-solid " + group.icon} aria-hidden="true"></i>
                  {group.label}
                  <span className="text-faint">{group.items.length}</span>
                </h2>
                <ul className="search-results">
                  {group.items.map((item, index) => (
                    <li key={item.path + index}>
                      <Link to={item.path}>
                        <strong>{item.title}</strong>
                        {item.subtitle && <span className="text-soft">{item.subtitle}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
