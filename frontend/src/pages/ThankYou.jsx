import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { trackEvent } from "../utils/analytics";

/**
 * The page a completed form lands on.
 *
 * A separate route rather than an inline success message, because a
 * conversion needs its own URL: that is what makes it countable in analytics
 * and linkable from a confirmation email. ?from= names which form, so one page
 * serves all of them without pretending a contact message and a new account
 * are the same event.
 */
const VARIANTS = {
  contact: {
    eyebrow: "Message sent",
    title: "Thanks, we have your message",
    body: "The Alumni Relations Office reads every one of these. You will get a reply within two business days, at the address you gave us.",
    next: [
      { to: "/stories", label: "Read what other graduates did next" },
      { to: "/events", label: "See which reunions are coming up" },
      { to: "/register", label: "Create your profile while you wait" }
    ]
  },
  register: {
    eyebrow: "Welcome to The Quad",
    title: "Your account is created",
    body: "You can use the site straight away. The Alumni Office will check your details against the university records and mark your account verified, usually within a working day.",
    next: [
      { to: "/settings", label: "Fill in your profile so people can find you" },
      { to: "/directory", label: "Find your batch in the directory" },
      { to: "/faq", label: "Read how verification works" }
    ]
  },
  job: {
    eyebrow: "Posting received",
    title: "Your job posting is in the queue",
    body: "An administrator reviews new postings before they go on the board, usually within a working day. You will see it on the jobs board once it is approved.",
    next: [
      { to: "/jobs", label: "Back to the jobs board" },
      { to: "/directory", label: "Tell your batch about the role" },
      { to: "/faq", label: "Why postings are reviewed" }
    ]
  },
  default: {
    eyebrow: "All done",
    title: "Thanks, that went through",
    body: "There is nothing else you need to do.",
    next: [
      { to: "/", label: "Back to the home page" },
      { to: "/contact", label: "Contact the Alumni Office" }
    ]
  }
};

export default function ThankYou() {
  const [params] = useSearchParams();
  const from = params.get("from") || "default";
  const variant = VARIANTS[from] || VARIANTS.default;

  useDocumentTitle(variant.title, variant.body);

  useEffect(() => {
    // The conversion itself. Fires once per landing, and does nothing at all
    // unless the visitor accepted analytics.
    trackEvent("conversion", { form_id: from });
  }, [from]);

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="section">
          <div className="container">
            <div className="thank-you">
              <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Thank you" }]} />

              <div className="thank-you__mark" aria-hidden="true">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <p className="eyebrow">{variant.eyebrow}</p>
              <h1>{variant.title}</h1>
              <p className="lede">{variant.body}</p>

              <div className="related-links related-links--center">
                <h3>While you are here</h3>
                <ul>
                  {variant.next.map((item) => (
                    <li key={item.to}><Link to={item.to}>{item.label}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
