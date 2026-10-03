import { Component } from "react";

/**
 * The hero's static stand-in, and the error boundary that shows it.
 *
 * Two different failures land here, and both used to leave an empty tinted
 * rectangle where the hero should be:
 *
 *   1. The lazily-loaded three.js chunk fails to arrive. This is most likely
 *      right after a deploy, when a browser holding a cached index.html asks
 *      for an asset hash that no longer exists, and it explains a hero that
 *      works on a phone but not on a desktop that has been sitting on the
 *      page: the two devices have different cache states, not different
 *      graphics support.
 *   2. The scene itself throws while setting up.
 *
 * React.lazy rejections surface as render errors, so only a class component
 * can catch them. That is the one reason this is not a hook.
 */

export function HeroMark() {
  return (
    <div className="hero__scene hero__scene--fallback" aria-hidden="true">
      <svg className="hero__fallback-mark" viewBox="0 0 220 220" focusable="false">
        <defs>
          <linearGradient id="quadRingFallback" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4FD8C2" />
            <stop offset="55%" stopColor="#1CAB98" />
            <stop offset="100%" stopColor="#0B4F49" />
          </linearGradient>
        </defs>
        <circle cx="110" cy="110" r="82" fill="none" stroke="url(#quadRingFallback)" strokeWidth="22" />
        <circle cx="110" cy="110" r="66" fill="none" stroke="#0B4F49" strokeWidth="3" opacity=".55" />
        <rect x="76" y="76" width="30" height="30" rx="5" fill="#FBF6EE" />
        <rect x="114" y="76" width="30" height="30" rx="5" fill="#F2622E" />
        <rect x="76" y="114" width="30" height="30" rx="5" fill="#FBF6EE" />
        <rect x="114" y="114" width="30" height="30" rx="5" fill="#FBF6EE" />
      </svg>
    </div>
  );
}

export default class HeroBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Left in deliberately. A hero that renders on one device and not another
    // is otherwise impossible for the person reporting it to describe.
    console.warn(
      "[The Quad] The 3D hero failed to load, so the static mark is showing instead. " +
      "If this followed a deploy, a hard reload (Ctrl+Shift+R) should clear it.",
      error
    );
  }

  render() {
    if (this.state.failed) return <HeroMark />;
    return this.props.children;
  }
}
