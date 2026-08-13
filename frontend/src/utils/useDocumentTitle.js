import { useEffect } from "react";

const SITE_NAME = "The Quad";
const DEFAULT_DESCRIPTION = "The Quad connects Assam Downtown University alumni for mentorship, hiring, reunions, and giving back.";

/**
 * Sets document.title and the meta description for the current page.
 * Restores the previous values on unmount so navigating away (e.g. via the
 * browser back button before this effect's cleanup fires) doesn't leave a
 * stale title behind.
 *
 * Note: this only helps clients that execute JavaScript (browsers, and
 * crawlers like Googlebot that render JS). It does NOT produce per-route
 * Open Graph tags for link-preview unfurlers (Slack, iMessage, Twitter/X),
 * since those fetch raw HTML without running JS — true per-page social
 * previews would require server-side rendering or prerendering.
 */
export function useDocumentTitle(title, description) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} — ${SITE_NAME}` : SITE_NAME;

    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta ? meta.getAttribute("content") : null;
    if (meta) meta.setAttribute("content", description || DEFAULT_DESCRIPTION);

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription != null) meta.setAttribute("content", previousDescription);
    };
  }, [title, description]);
}
