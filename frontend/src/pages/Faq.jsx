import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";
import Accordion from "../components/Accordion";
import { useDocumentTitle } from "../utils/useDocumentTitle";

/**
 * Answers to what the Alumni Office actually gets asked. Every answer here is
 * checked against how the application really behaves (the verification rule,
 * the directory privacy toggle, the jobs approval queue), not aspirational.
 *
 * LAST_UPDATED has to be bumped by hand when an answer changes. An automatic
 * build date would claim the page was reviewed on every deploy, which would
 * be a lie the first time a stylesheet changed.
 */
const LAST_UPDATED = "4 October 2026";

const FAQS = [
  {
    q: "Who can join The Quad?",
    a: (
      <>
        <p>
          Anyone who studied at Assam down town University: graduates of any batch,
          and current students. Students get a slightly narrower account, described
          below.
        </p>
        <p>
          Accounts are free, and the Alumni Relations Office does not charge for
          anything on this site.
        </p>
      </>
    )
  },
  {
    q: "How does verification work, and why is my account not verified yet?",
    a: (
      <>
        <p>
          New accounts start unverified. The Alumni Relations Office checks the name
          and graduating year you gave against the university&rsquo;s records and
          marks the account verified from the admin panel. You can use the site
          while you wait.
        </p>
        <p>
          If your record is under a different name, for example a name you have
          since changed, <Link to="/contact">tell us</Link> and we will match it
          manually instead of rejecting it.
        </p>
      </>
    )
  },
  {
    q: "Can current students see the alumni directory?",
    a: (
      <p>
        Usually yes, but it is a setting the Alumni Office controls. When directory
        browsing is restricted to alumni accounts, a student account sees a message
        saying so rather than an empty list. Students can always use the events and
        jobs pages.
      </p>
    )
  },
  {
    q: "How do I keep myself out of the directory?",
    a: (
      <>
        <p>
          Go to <Link to="/settings">Settings</Link> and turn off &ldquo;show me in
          the directory&rdquo;. That hides your profile from directory browsing and
          from site search straight away.
        </p>
        <p>
          There is a separate switch for your email address, so you can stay listed
          and still keep your address private.
        </p>
      </>
    )
  },
  {
    q: "Why has my job posting not appeared yet?",
    a: (
      <p>
        Job posts go into an approval queue by default, so the board does not get
        used for spam. An administrator approves them, usually within a working day.
        If the Alumni Office has switched auto-approval on, posts appear
        immediately. Students cannot post jobs; alumni and administrators can.
      </p>
    )
  },
  {
    q: "Can I use The Quad on my phone like an app?",
    a: (
      <>
        <p>
          Yes. Open the site in your phone&rsquo;s browser and choose &ldquo;Add to
          Home Screen&rdquo; (iPhone) or &ldquo;Install app&rdquo; (Android). It
          then opens in its own window with no browser bar.
        </p>
        <p>
          Installed copies update themselves. When we deploy a new version you get
          an &ldquo;Update now&rdquo; prompt inside the app, so you never need to
          delete and reinstall it.
        </p>
      </>
    )
  },
  {
    q: "I forgot my password.",
    a: (
      <p>
        Use <Link to="/forgot-password">the reset link</Link> on the login page. The
        reset email is valid for a limited time; if it expires, just request another
        one. If no email arrives, check that the address matches the one on your
        account and <Link to="/contact">contact us</Link> if it does not.
      </p>
    )
  },
  {
    q: "How do I delete my account?",
    a: (
      <>
        <p>
          <Link to="/settings">Settings</Link> has both options. Deactivating hides
          your profile and blocks login, and you can undo it by logging back in.
          Deleting is permanent and removes your profile, posts, and messages.
        </p>
        <p>
          What happens to your data either way is set out in the{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </>
    )
  },
  {
    q: "Who runs this site?",
    a: (
      <p>
        The Alumni Relations Office of Assam down town University, Sankar Madhab
        Path, Gandhi Nagar, Panikhaiti, Guwahati, Assam 781026. Reach them at{" "}
        <a href="mailto:alumni@adtu.in">alumni@adtu.in</a>, or through the{" "}
        <Link to="/contact">contact form</Link>.
      </p>
    )
  }
];

export default function Faq() {
  useDocumentTitle(
    "Frequently Asked Questions",
    "Accounts, verification, directory privacy, the jobs board, and installing The Quad on your phone."
  );

  // FAQPage structured data, so these can surface directly in search results.
  // Only the plain-text questions go in; the answers are JSX here, so a short
  // text summary is kept alongside rather than stringifying React elements.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.q }
    }))
  };

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="section-sm">
          <div className="container">
            <div className="legal-page">
              <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "FAQ" }]} />

              <header className="legal-page__head">
                <p className="eyebrow">Help</p>
                <h1>Frequently asked questions</h1>
                <p className="legal-page__meta">Last updated {LAST_UPDATED}</p>
                <p className="lede">
                  If your question is not here, the Alumni Relations Office answers
                  the <Link to="/contact">contact form</Link> within two business
                  days.
                </p>
              </header>

              <Accordion items={FAQS} />

              <div className="related-links">
                <h3>Related pages</h3>
                <ul>
                  <li><Link to="/privacy">Privacy Policy</Link></li>
                  <li><Link to="/terms">Terms and Conditions</Link></li>
                  <li><Link to="/contact">Contact the Alumni Office</Link></li>
                  <li><Link to="/stories">Alumni stories</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </>
  );
}
