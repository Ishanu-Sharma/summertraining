/**
 * The three loading shapes used across the app. All of them reserve the space
 * the real content will take, because a spinner that collapses to nothing when
 * the data lands is what causes the page to jump.
 *
 * The shimmer and the spin are both disabled under prefers-reduced-motion in
 * the stylesheet; the shapes stay, so the state still reads as "loading".
 */

/** Inline spinner, for inside a button or next to a line of text. */
export function Spinner({ label = "Loading" }) {
  return (
    <span className="spinner" role="status" aria-label={label}>
      <span className="spinner__ring" aria-hidden="true"></span>
    </span>
  );
}

/** A block of grey lines standing in for text that has not arrived. */
export function SkeletonText({ lines = 3, width = "100%" }) {
  return (
    <div className="skeleton-text" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          className="skeleton"
          key={i}
          style={{ width: i === lines - 1 ? "62%" : width, height: 12 }}
        />
      ))}
    </div>
  );
}

/** Card-shaped placeholder, for a grid that is still fetching. */
export function SkeletonCards({ count = 3, className = "grid-3" }) {
  return (
    <div className={className} aria-busy="true" aria-label="Loading results">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card skeleton-card" key={i}>
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%" }} />
          <div className="skeleton" style={{ width: "70%", height: 14, marginTop: 18 }} />
          <div className="skeleton" style={{ width: "45%", height: 12, marginTop: 10 }} />
          <div className="skeleton" style={{ width: "100%", height: 12, marginTop: 18 }} />
          <div className="skeleton" style={{ width: "85%", height: 12, marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

/** Full-section state, for a route that has nothing to show yet. */
export function LoadingBlock({ message = "Loading" }) {
  return (
    <div className="loading-block" role="status">
      <Spinner label={message} />
      <span>{message}</span>
    </div>
  );
}
