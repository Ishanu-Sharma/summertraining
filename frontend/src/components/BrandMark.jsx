/**
 * The Quad's wordmark glyph: a class ring (the site's signature motif) set with
 * a quadrangle of four blocks. Replaces the emoji that used to sit here, so the
 * mark renders identically on every OS instead of inheriting a system font.
 *
 * `tone="light"` is for the dark surfaces (app sidebar, footer, auth panel).
 */
export default function BrandMark({ tone = "dark", className = "" }) {
  const ring = tone === "light" ? "#1CAB98" : "#0E6E64";
  const block = tone === "light" ? "#FBF6EE" : "#0B4F49";

  return (
    <svg
      className={"logo-mark " + className}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="23.5" fill="none" stroke={ring} strokeWidth="5" />
      <rect x="21" y="21" width="9.5" height="9.5" rx="1.5" fill={block} />
      <rect x="33.5" y="21" width="9.5" height="9.5" rx="1.5" fill="#F2622E" />
      <rect x="21" y="33.5" width="9.5" height="9.5" rx="1.5" fill={block} />
      <rect x="33.5" y="33.5" width="9.5" height="9.5" rx="1.5" fill={block} />
    </svg>
  );
}
