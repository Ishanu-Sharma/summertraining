import { Link } from "react-router-dom";

/**
 * Breadcrumb trail. Takes an array of { label, to }; the last entry is the
 * current page and is rendered as plain text with aria-current, not as a link
 * to itself.
 *
 * Also emits BreadcrumbList JSON-LD, which is what gets a search result to show
 * "Home > Alumni Stories > ..." instead of a bare URL.
 */
export default function Breadcrumbs({ items = [] }) {
  if (items.length < 2) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.to ? { item: "https://the-quad-web.onrender.com" + item.to } : {})
    }))
  };

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label + index}>
              {isLast || !item.to ? (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              ) : (
                <Link to={item.to}>{item.label}</Link>
              )}
              {!isLast && <i className="fa-solid fa-angle-right" aria-hidden="true"></i>}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </nav>
  );
}
