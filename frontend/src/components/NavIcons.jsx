/**
 * The menu and close glyphs, drawn inline rather than pulled from the Font
 * Awesome stylesheet on cdnjs like every other icon on the site.
 *
 * The reason is specific to these two: if that CDN is slow, blocked, or
 * firewalled, an <i class="fa-bars"> renders as nothing and the button
 * becomes an invisible square. For a decorative icon that is a cosmetic
 * problem; for the only control that opens navigation on a phone, it strands
 * the visitor on whatever page they are on, intermittently and with no
 * pattern they could describe.
 *
 * Inline SVG costs a few hundred bytes and cannot fail independently of the
 * page it is part of.
 */

const BASE = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  "aria-hidden": "true",
  focusable: "false"
};

export function MenuIcon() {
  return (
    <svg {...BASE}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg {...BASE}>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}
