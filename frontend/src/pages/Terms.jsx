import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { useDocumentTitle } from "../utils/useDocumentTitle";

/**
 * Terms and conditions. Keep the rules here in step with what the code actually
 * enforces: the role checks in backend/src/middleware/auth.js, the job approval
 * flow in backend/src/routes/jobs.js, and the upload limits in
 * backend/src/middleware/upload.js.
 *
 * Have the Alumni Relations Office confirm the governing-law clause before launch.
 */
export default function Terms() {
  useDocumentTitle(
    "Terms and Conditions",
    "The rules for using The Quad, the alumni network of Assam Downtown University."
  );

  return (
    <>
      <SiteHeader />

      <section className="section-sm">
        <div className="container">
          <div className="legal-page">
            <header className="legal-page__head">
              <h1>Terms and Conditions</h1>
              <p className="legal-page__meta">Last updated 4 October 2026</p>
              <p className="lede">
                These terms govern your use of The Quad. By creating an account you agree
                to them, so it is worth the five minutes.
              </p>
            </header>

            <h2>1. Who we are</h2>
            <p>
              The Quad is operated by the Alumni Relations Office of Assam down town
              University (AdtU), Sankar Madhab Path, Gandhi Nagar, Panikhaiti, Guwahati,
              Assam 781026, India. In these terms, &ldquo;we&rdquo; and &ldquo;us&rdquo;
              mean that office, and &ldquo;you&rdquo; means the person using the platform.
            </p>

            <h2>2. Who may join</h2>
            <p>
              Accounts are for students, graduates, and staff of AdtU. Registering with an
              AdtU email address speeds up verification, but any address works if you can
              show your connection to the university another way. We may ask for proof, and
              we may decline or remove an account where we cannot establish that
              connection.
            </p>
            <p>
              One person, one account. Do not register on someone else's behalf or claim a
              degree, employer, or role that is not yours. Members rely on this directory to
              decide who to refer and who to hire, so accuracy is the whole point.
            </p>

            <h2>3. Your account</h2>
            <p>
              You are responsible for what happens under your account and for keeping your
              password private. Tell us promptly if you think someone else has access to
              it. We may suspend an account where there is a credible security concern, and
              we will tell you why when we do.
            </p>

            <h2>4. What you post</h2>
            <p>
              You keep ownership of everything you write and upload. By posting it on The
              Quad you give us permission to display and store it on the platform so other
              members can see it, and to keep backups. That permission ends when you delete
              the content, apart from copies in routine backups and messages already
              delivered to another member.
            </p>
            <p>Do not post anything that:</p>
            <ul className="legal-list">
              <li>is unlawful, defamatory, obscene, or incites violence or hatred</li>
              <li>harasses, bullies, impersonates, or threatens another person</li>
              <li>
                infringes someone's copyright, trademark, or confidentiality, including your
                employer's
              </li>
              <li>
                shares another member's contact details, photographs, or private messages
                without their agreement
              </li>
              <li>
                is spam, chain messaging, a multi-level marketing pitch, a crypto promotion,
                or an unpaid-internship-as-opportunity listing
              </li>
              <li>
                contains malware, or attempts to probe, scrape, or overload the platform
              </li>
            </ul>
            <p>
              Profile photos must be of you, and must be a JPEG, PNG, WEBP, or GIF of up to
              3MB.
            </p>

            <h2>5. Jobs and referrals</h2>
            <p>
              Alumni and administrators can post roles. Students cannot. Every posting is
              reviewed by the Alumni Relations Office before it appears on the jobs board,
              and we will reject anything that looks like a scam, asks candidates for money,
              or hides the identity of the employer.
            </p>
            <p>
              A posting on The Quad is an introduction, nothing more. We do not verify
              salaries, employment terms, or whether a role still exists, we are not party
              to any hiring decision, and we cannot promise that a referral request will be
              answered. Do your own checks before accepting an offer or sharing personal
              documents with an employer.
            </p>

            <h2>6. Events</h2>
            <p>
              RSVPs help hosts plan, so please keep yours current. Events organised by the
              university are subject to the university's own rules on campus conduct. Where
              an event is organised by a member rather than by us, we are not the organiser
              and are not responsible for it.
            </p>

            <h2>7. Messaging other members</h2>
            <p>
              Direct messaging exists for mentorship, referrals, and reconnecting. It is not
              a sales channel. Do not use the directory to build a mailing list, and do not
              keep messaging someone who has not replied. Members who do this lose access to
              messaging first and the platform second.
            </p>

            <h2>8. Moderation</h2>
            <p>
              We can remove content, reject a job posting, deactivate an account, or delete
              an account that breaks these terms. For anything other than a clear-cut case
              of abuse or fraud we will tell you what the problem is and give you a chance
              to respond. If you think we got it wrong, write to the Registrar at{" "}
              <a href="mailto:registrar@adtu.in">registrar@adtu.in</a>. Students may also
              use the grievance channel at{" "}
              <a href="mailto:student.grievance@adtu.in">student.grievance@adtu.in</a>.
            </p>

            <h2>9. Availability</h2>
            <p>
              The Quad is provided as it is. We do not promise it will be available without
              interruption, and we may take it offline for maintenance or change how
              features work. We are not liable for indirect or consequential loss, for a
              missed opportunity, or for anything a member does with information they found
              here. Nothing in these terms limits liability that cannot lawfully be limited.
            </p>

            <h2>10. Closing your account</h2>
            <p>
              You can ask us to deactivate or delete your account at any time through the{" "}
              <Link to="/contact">contact form</Link>. Deactivation hides your profile and
              keeps your history. Deletion removes your profile, posts, replies, and
              connections. Messages you already sent may stay in the other member's
              conversation history.
            </p>

            <h2>11. Changes to these terms</h2>
            <p>
              We will update this page when the rules change and move the date at the top.
              If a change materially affects your rights, we will announce it on the
              platform rather than rely on you noticing. Continuing to use The Quad after a
              change means you accept the updated terms.
            </p>

            <h2>12. Governing law</h2>
            <p>
              These terms are governed by the laws of India, and the courts at Guwahati,
              Assam have jurisdiction over any dispute arising from them.
            </p>

            <p className="legal-page__footnote">
              See also our <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
