import { Link } from 'react-router-dom';
import { useSEO, SITE_URL, SITE_NAME } from '../utils/seo';

const PRIVACY_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `Privacy Policy — ${SITE_NAME}`,
  url: `${SITE_URL}/privacy/`,
  isPartOf: { '@type': 'WebSite', url: `${SITE_URL}/` },
};

export default function Privacy() {
  useSEO({
    title: `Privacy Policy — ${SITE_NAME}`,
    description: `Read the DoodleArcade privacy policy. We do not collect personal data, use tracking cookies, or share your information with third parties.`,
    canonical: `${SITE_URL}/privacy/`,
    schema: PRIVACY_SCHEMA,
  });

  return (
    <div className="inner-page">
      <div className="inner-page__header">
        <h1>Privacy Policy</h1>
        <p>Last updated: March 2026</p>
      </div>

      <div className="inner-page__body">
        <h2>Overview</h2>
        <p>
          DoodleArcade is a static website that hosts playable Google Doodle games for entertainment.
          We are committed to your privacy: we do not collect personal information, we do not use
          tracking cookies, and we do not sell or share any data with third parties.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We do not collect any personally identifiable information. We do not operate user accounts,
          comment sections, or any form that stores data on our servers. Standard web server logs
          (IP address, browser type, pages visited) may be retained by our hosting provider for
          security and operational purposes — this data is never used for advertising or tracking.
        </p>

        <h2>Cookies</h2>
        <p>
          DoodleArcade does not set any cookies of its own. No tracking pixels, no analytics cookies,
          no advertising cookies. Your browser settings remain fully in your control.
        </p>

        <h2>Third-Party Game Content</h2>
        <p>
          Games on this site are loaded via iframes directly from Google's servers. We have no control
          over the data practices of these third-party servers. Google LLC may collect data in
          connection with gameplay. Please refer to{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            Google's Privacy Policy
          </a>{' '}
          for details.
        </p>

        <h2>Local Storage</h2>
        <p>
          Some games may use your browser's local storage to save game progress or settings. This data
          is stored entirely on your own device and is never transmitted to DoodleArcade or any
          third-party server.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          DoodleArcade does not knowingly collect any information from children under 13. If you
          believe a child has provided us personal information, please contact us so we can address it.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Any changes will be reflected on this
          page with an updated date at the top.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? <Link to="/contact/" style={{ color: 'var(--accent)' }}>Get in touch →</Link>
        </p>
      </div>
    </div>
  );
}
