/**
 * First focusable element on every page. Off-screen until focused, then it
 * drops into view. Targets #main, which every layout renders with tabIndex={-1}
 * so the jump actually moves focus and not just the scroll position.
 */
export default function SkipLink() {
  return (
    <a href="#main" className="skip-link">Skip to main content</a>
  );
}
