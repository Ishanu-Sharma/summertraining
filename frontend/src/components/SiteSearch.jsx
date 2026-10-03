import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getToken } from "../api/client";

const KIND_META = {
  page: { icon: "fa-file-lines", label: "Page" },
  story: { icon: "fa-bookmark", label: "Story" },
  person: { icon: "fa-user", label: "Alumni" },
  event: { icon: "fa-calendar-days", label: "Event" },
  job: { icon: "fa-briefcase", label: "Job" }
};

/**
 * Site-wide search. One box, backed by GET /api/search, which widens its own
 * results when the caller is signed in (pages and stories for everyone; alumni,
 * events, and jobs on top of that for members).
 *
 * Behaviour worth knowing about:
 *  - 250ms debounce, and every in-flight request is aborted when the query
 *    changes, so a fast typist cannot have an older response overwrite a newer
 *    one (the classic out-of-order autocomplete bug).
 *  - Arrow keys move through results, Enter opens the highlighted one, Enter
 *    with nothing highlighted goes to the full results page, Escape closes.
 *  - Marked up as a combobox with aria-activedescendant, so the highlighted
 *    row is announced instead of silently changing colour.
 */
export default function SiteSearch({ placeholder = "Search The Quad", className = "" }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await api.search(term, controller.signal);
        setResults(data.results || []);
        setActive(-1);
      } catch (err) {
        if (err.name !== "AbortError") setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function go(result) {
    setOpen(false);
    setQuery("");
    navigate(result.path);
  }

  function onKeyDown(event) {
    if (event.key === "Escape") { setOpen(false); return; }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (results.length ? (i + 1) % results.length : -1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (results.length ? (i <= 0 ? results.length - 1 : i - 1) : -1));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0 && results[active]) go(results[active]);
      else if (query.trim().length >= 2) {
        setOpen(false);
        navigate("/search?q=" + encodeURIComponent(query.trim()));
      }
    }
  }

  const showPanel = open && query.trim().length >= 2;

  return (
    <div className={"site-search " + className} ref={wrapRef}>
      <div className="input-icon">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <input
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          aria-label={placeholder}
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>

      {showPanel && (
        <div className="site-search__panel">
          {loading && !results.length && (
            <div className="site-search__status">Searching</div>
          )}
          {!loading && !results.length && (
            <div className="site-search__status">
              Nothing matched &ldquo;{query.trim()}&rdquo;.
              {!getToken() && <> Alumni, events, and jobs are searchable once you log in.</>}
            </div>
          )}
          {!!results.length && (
            <ul id={listId} role="listbox" aria-label="Search results">
              {results.map((result, index) => {
                const meta = KIND_META[result.kind] || KIND_META.page;
                return (
                  <li
                    key={result.kind + result.path + index}
                    id={`${listId}-opt-${index}`}
                    role="option"
                    aria-selected={index === active}
                    className={index === active ? "is-active" : ""}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={(e) => { e.preventDefault(); go(result); }}
                  >
                    <i className={"fa-solid " + meta.icon} aria-hidden="true"></i>
                    <span className="site-search__text">
                      <strong>{result.title}</strong>
                      {result.subtitle && <small>{result.subtitle}</small>}
                    </span>
                    <span className="site-search__kind">{meta.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
          {query.trim().length >= 2 && (
            <button
              type="button"
              className="site-search__all"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                navigate("/search?q=" + encodeURIComponent(query.trim()));
              }}
            >
              See all results for &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
