/**
 * Consent-gated Google Analytics, plus first-touch UTM attribution.
 *
 * Nothing here runs until the visitor accepts in the cookie banner, and
 * nothing here runs at all unless VITE_GA_ID is set in the environment. That
 * is why the measurement ID is not committed: a build without the env var
 * ships no analytics script and no analytics cookies, which keeps the privacy
 * policy true by default rather than by promise.
 */

const GA_ID = import.meta.env.VITE_GA_ID || "";
const CONSENT_KEY = "quad_consent";
const ATTRIBUTION_KEY = "quad_attribution";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

let loaded = false;

/** localStorage throws in Safari private mode, so every access is guarded. */
function readStore(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function writeStore(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}

export function hasAnalytics() {
  return !!GA_ID;
}

/** "granted" | "denied" | null (never asked). */
export function getConsent() {
  const value = readStore(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function setConsent(value) {
  writeStore(CONSENT_KEY, value);
  if (value === "granted") loadAnalytics();
  else if (window.gtag) window.gtag("consent", "update", { analytics_storage: "denied" });
}

/**
 * Injects gtag.js once. `anonymize_ip` and the manual send_page_view:false are
 * both deliberate: this is a single-page app, so GA's automatic pageview would
 * only ever fire for the landing route.
 */
function loadAnalytics() {
  if (loaded || !GA_ID) return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("consent", "default", { analytics_storage: "granted" });
  window.gtag("config", GA_ID, {
    anonymize_ip: true,
    send_page_view: false
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);

  // The first pageview is sent here rather than on mount, because consent can
  // be granted several routes into a visit.
  trackPageView(window.location.pathname + window.location.search, document.title);
}

/** Called once at startup: resumes analytics for a visitor who already said yes. */
export function initAnalytics() {
  captureAttribution();
  if (getConsent() === "granted") loadAnalytics();
}

export function trackPageView(path, title) {
  if (!window.gtag || getConsent() !== "granted") return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
    ...getAttribution()
  });
}

/**
 * Named events. The form ones (form_submit / form_error) are what make a form
 * success rate measurable in GA: success divided by success plus error, split
 * by the form_id parameter.
 */
export function trackEvent(name, params = {}) {
  if (!window.gtag || getConsent() !== "granted") return;
  window.gtag("event", name, params);
}

export function trackFormSuccess(formId, params = {}) {
  trackEvent("form_submit", { form_id: formId, outcome: "success", ...params });
}

export function trackFormError(formId, reason, params = {}) {
  trackEvent("form_error", { form_id: formId, outcome: "error", reason: String(reason).slice(0, 100), ...params });
}

/**
 * First-touch attribution. Written once per browser and never overwritten, so
 * a visitor who arrives from a campaign and comes back directly a week later
 * is still credited to the campaign. Stored first-party only; it is read back
 * when a contact form is submitted, and disclosed on the privacy page.
 */
export function captureAttribution() {
  if (readStore(ATTRIBUTION_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const found = {};
  for (const key of UTM_PARAMS) {
    const value = params.get(key);
    if (value) found[key] = value.slice(0, 120);
  }
  const gclid = params.get("gclid");
  if (gclid) found.gclid = gclid.slice(0, 120);

  if (!Object.keys(found).length) return;

  found.landing_path = window.location.pathname;
  found.first_seen = new Date().toISOString();
  writeStore(ATTRIBUTION_KEY, JSON.stringify(found));
}

export function getAttribution() {
  const raw = readStore(ATTRIBUTION_KEY);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

/** Flat string form, for sending alongside a contact form submission. */
export function attributionString() {
  const data = getAttribution();
  const keys = Object.keys(data);
  if (!keys.length) return null;
  return keys.map(key => `${key}=${data[key]}`).join("; ");
}
