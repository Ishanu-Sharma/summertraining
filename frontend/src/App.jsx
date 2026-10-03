import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute, GuestOnlyRoute } from "./components/ProtectedRoute";

import SkipLink from "./components/SkipLink";
import ScrollProgress from "./components/ScrollProgress";
import BackToTop from "./components/BackToTop";
import CookieBanner from "./components/CookieBanner";
import UpdatePrompt from "./components/UpdatePrompt";
import FloatingContact from "./components/FloatingContact";
import StickyMobileCTA from "./components/StickyMobileCTA";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Faq from "./pages/Faq";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import SearchResults from "./pages/SearchResults";
import ThankYou from "./pages/ThankYou";
import Dashboard from "./pages/Dashboard";
import Directory from "./pages/Directory";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

import { initAnalytics, trackPageView } from "./utils/analytics";

/** Routes that render their own full-screen layout with no public chrome. */
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

/** Routes that run inside the signed-in app shell rather than the public site. */
const APP_ROUTES = [
  "/dashboard", "/directory", "/events", "/jobs",
  "/messages", "/profile", "/settings", "/admin"
];

/**
 * Per-navigation side effects for a single-page app, which a browser would do
 * for free on a full page load but React Router does not:
 *
 *   - send the analytics pageview (no-op without consent)
 *   - scroll back to the top, unless the visitor asked for an anchor
 *   - move focus to <main>, so a screen reader announces the new page instead
 *     of leaving focus on the link that was just clicked
 *
 * The title is set by each page's own useDocumentTitle, so the pageview is
 * sent on a microtask to let that effect run first. Otherwise every pageview
 * would be logged under the previous page's title.
 */
function RouteEffects() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 0);

    if (!location.hash) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "instant" });
    }

    const main = document.getElementById("main");
    if (main) main.focus({ preventScroll: true });

    return () => clearTimeout(timer);
  }, [location.pathname, location.search, location.hash]);

  return null;
}

export default function App() {
  const location = useLocation();
  const isAuthScreen = AUTH_ROUTES.includes(location.pathname);
  const isAppScreen = APP_ROUTES.some(
    (path) => location.pathname === path || location.pathname.startsWith(path + "/")
  );
  const isPublicSite = !isAuthScreen && !isAppScreen;

  return (
    <>
      <SkipLink />
      <ScrollProgress />
      <RouteEffects />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:slug" element={<StoryDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
        <Route path="/register" element={<GuestOnlyRoute><Register /></GuestOnlyRoute>} />
        <Route path="/forgot-password" element={<GuestOnlyRoute><ForgotPassword /></GuestOnlyRoute>} />
        <Route path="/reset-password" element={<GuestOnlyRoute><ResetPassword /></GuestOnlyRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/jobs/new" element={<ProtectedRoute blockRoles={["student"]}><PostJob /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* The floating contact button and the sticky phone CTA belong to the
          marketing site. Inside the app shell they would sit on top of the
          message composer and duplicate navigation the sidebar already has. */}
      {isPublicSite && <FloatingContact />}
      {isPublicSite && <StickyMobileCTA />}
      {!isAuthScreen && <BackToTop />}

      <CookieBanner />
      <UpdatePrompt />
    </>
  );
}
