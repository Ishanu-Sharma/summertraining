import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Breadcrumbs from "../components/Breadcrumbs";
import { useDocumentTitle } from "../utils/useDocumentTitle";

/**
 * Privacy policy. Every data category listed here maps to a real column in
 * backend/src/schema.sql, and the third parties named are the ones the app
 * actually talks to. If you add a table, an upload target, or an external
 * script, update this page in the same commit.
 *
 * Reviewed against the schema on 2026-10-04. Have the Alumni Relations Office
 * confirm the contact addresses and retention periods before launch.
 */
export default function Privacy() {
  useDocumentTitle(
    "Privacy Policy",
    "How The Quad collects, uses, stores, and shares personal data belonging to Assam down town University alumni and students."
  );

  return (
    <>
      <SiteHeader />

      <main id="main" tabIndex={-1}>
      <section className="section-sm">
        <div className="container">
          <div className="legal-page">
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Privacy Policy" }]} />
            <header className="legal-page__head">
              <h1>Privacy Policy</h1>
              <p className="legal-page__meta">Last updated 4 October 2026</p>
              <p className="lede">
                This policy explains what The Quad collects, why we hold it, who can see
                it, and how you get it changed or removed.
              </p>
            </header>

            <h2>Who runs The Quad</h2>
            <p>
              The Quad is the alumni network of Assam down town University (AdtU), a state
              private university established under the Assam Down Town University Act,
              2010, at Sankar Madhab Path, Gandhi Nagar, Panikhaiti, Guwahati, Assam
              781026, India. The platform is operated by the university's Alumni Relations
              Office, which is the data fiduciary for the information described below.
            </p>
            <p>
              For any question about this policy, or to exercise the rights in the
              &ldquo;Your choices&rdquo; section, write to the Alumni Relations Office
              through our <Link to="/contact">contact form</Link>. Matters that need a
              university officer can go to the Registrar at{" "}
              <a href="mailto:registrar@adtu.in">registrar@adtu.in</a>, and student
              grievances to{" "}
              <a href="mailto:student.grievance@adtu.in">student.grievance@adtu.in</a>.
            </p>

            <h2>What we collect</h2>
            <p>
              We only hold what you type into The Quad or what the platform needs to run.
              There is no tracking pixel, no advertising network, and no data broker
              involved at any point.
            </p>

            <h3>Account details</h3>
            <p>
              Your full name, email address, and a one-way hashed version of your password.
              We never store the password itself and cannot read it. We also record whether
              your account is a student, alumni, or administrator account, and whether the
              Alumni Relations Office has verified it.
            </p>

            <h3>Profile information</h3>
            <p>
              Everything you choose to add to your profile: graduation year, department,
              industry, location, headline, biography, current company, job title, LinkedIn
              and website links, skills, profile photo, and any work experience or education
              entries you list. All of this is optional apart from your name and email. If
              you leave a field empty, we store nothing for it.
            </p>

            <h3>Things you do on the platform</h3>
            <p>
              Posts and replies you write, likes you give, connections you make, event RSVPs
              and event comments, jobs you post, save, or mark as applied, and the private
              messages you exchange with other members. Messages are stored so that both
              sides of a conversation can read their history. They are not encrypted
              end-to-end, which means a database administrator could technically read them.
              Treat The Quad like a work email account, not a secure channel.
            </p>

            <h3>Contact form submissions</h3>
            <p>
              The name, email address, subject, and message you send through the contact
              form are written to our application logs so the Alumni Relations Office can
              respond. They are not added to any marketing list.
            </p>

            <h3>Technical information</h3>
            <p>
              Our server records standard request information, including IP addresses, for
              security and rate limiting. When you log in, we place a session token in your
              browser's local storage under the key <code>quad_token</code>. That token is
              how the site knows it is you on your next visit, and it is strictly necessary:
              the site cannot keep you logged in without it.
            </p>
            <p>
              We also store two small preferences in your browser, both first-party and
              neither shared with anyone: <code>quad_theme</code>, which remembers whether
              you chose light or dark mode, and <code>quad_consent</code>, which remembers
              your answer to the analytics question below so we stop asking.
            </p>

            <h3>Analytics, and the choice you are given</h3>
            <p>
              The Quad can use Google Analytics to count which pages get used and which
              forms get abandoned. It is off until you accept it. When you first visit, a
              banner asks; if you decline, no analytics script is loaded and no analytics
              cookie is set, and the site works exactly the same. You can change your mind
              by clearing this site's data in your browser, which makes the banner appear
              again.
            </p>
            <p>
              If you accept, Google receives the pages you view on The Quad, with IP
              anonymisation enabled. We do not send Google your name, your email address,
              or anything from your profile or messages. Google's handling of that data is
              governed by{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer noopener">
                Google's own privacy policy
              </a>.
            </p>

            <h3>Campaign attribution</h3>
            <p>
              If you arrive from a link that carries campaign tags in its address (the
              <code>utm_source</code> family of parameters, or a <code>gclid</code>), we
              store those tags once in your browser under <code>quad_attribution</code>, so
              that if you later send us a message we can tell which announcement or poster
              brought you here. It holds nothing about you personally, it is never shared,
              and it is only ever read when you submit the contact form.
            </p>

            <h2>Who can see your information</h2>
            <p>
              Your profile is visible to other signed-in members of The Quad. It is not
              published to the open web, and the member directory is behind a login. You
              control parts of this from your{" "}
              <Link to="/settings">profile settings</Link>, where you can choose what appears
              to other members.
            </p>
            <p>
              Private messages are visible only to you and the person you are writing to.
              Administrators from the Alumni Relations Office can see account details,
              verification status, and content that has been reported, because they are
              responsible for moderating the platform and verifying that members really are
              AdtU graduates or students.
            </p>
            <p>
              We do not sell your personal data, and we do not share it with recruiters,
              advertisers, or any other third party for their own purposes.
            </p>

            <h2>Services we rely on</h2>
            <p>
              Running the platform means a small number of providers necessarily handle some
              data on our behalf:
            </p>
            <ul className="legal-list">
              <li>
                <strong>Render</strong> hosts the website and the application server, and
                therefore processes all traffic to the site.
              </li>
              <li>
                <strong>Our managed database provider</strong> stores everything described
                above, encrypted in transit.
              </li>
              <li>
                <strong>Google Fonts and Cloudflare (cdnjs)</strong> serve the typefaces and
                icons used across the site. Because your browser fetches those files
                directly, both providers can see your IP address when a page loads.
              </li>
              <li>
                <strong>Our email provider</strong> delivers password reset messages. It
                receives your email address only when you ask to reset a password.
              </li>
              <li>
                <strong>Object storage</strong> holds profile photos when the deployment is
                configured to use it, rather than keeping them on the application server.
              </li>
            </ul>

            <h2>How long we keep it</h2>
            <p>
              Your account and profile stay until you ask us to deactivate or delete them. A
              deactivated account is hidden from the directory but retained, so you can come
              back without losing your history. A deleted account removes your profile,
              posts, replies, and connections. Messages you sent may remain visible in the
              other person's conversation history, because they are that person's record of
              the exchange too.
            </p>
            <p>
              Password reset tokens are stored as hashes and expire automatically. Server
              logs, including contact form submissions and IP addresses, are kept only as
              long as our hosting provider retains them for operational and security
              purposes.
            </p>

            <h2>Your choices</h2>
            <ul className="legal-list">
              <li>
                <strong>See and correct your data.</strong> Your profile page shows almost
                everything we hold about you, and you can edit it yourself at any time.
              </li>
              <li>
                <strong>Deactivate or delete your account.</strong> Ask the Alumni Relations
                Office through the contact form and we will action it.
              </li>
              <li>
                <strong>Get a copy.</strong> Ask us and we will send you the data associated
                with your account.
              </li>
              <li>
                <strong>Complain.</strong> If you think we have handled your data badly,
                tell the Registrar. Indian law, including the Digital Personal Data
                Protection Act, 2023, sets out your rights and the remedies available to
                you.
              </li>
            </ul>

            <h2>Security</h2>
            <p>
              Passwords are hashed with bcrypt. Traffic to the site uses HTTPS. Access to
              the administration area is restricted to Alumni Relations Office staff, and
              the API applies rate limits to slow down abuse. No system is perfectly secure,
              so please use a password you do not reuse elsewhere, and tell us immediately if
              you think your account has been accessed by someone else.
            </p>

            <h2>Students and younger members</h2>
            <p>
              The Quad is for AdtU students, graduates, and staff. If you are under 18, use
              it only with the consent of a parent or guardian. If we learn that we hold data
              about a child without that consent, we will remove it.
            </p>

            <h2>Changes to this policy</h2>
            <p>
              If we change how the platform handles your data, we will update this page and
              move the date at the top. Material changes will be announced on the platform
              itself rather than quietly edited in.
            </p>

            <p className="legal-page__footnote">
              See also our <Link to="/terms">Terms and Conditions</Link>.
            </p>
          </div>
        </div>
      </section>
      </main>

      <SiteFooter />
    </>
  );
}
