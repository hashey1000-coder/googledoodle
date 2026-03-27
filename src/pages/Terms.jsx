import { Link } from 'react-router-dom';
import { useSEO, SITE_URL, SITE_NAME } from '../utils/seo';

const TERMS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `Terms of Service — ${SITE_NAME}`,
  url: `${SITE_URL}/terms/`,
  isPartOf: { '@type': 'WebSite', url: `${SITE_URL}/` },
};

export default function Terms() {
  useSEO({
    title: `Terms of Service — ${SITE_NAME}`,
    description: `Read the Google Doodle Games terms of service. Understand the rules, disclaimers, and intellectual-property notices that govern the use of this site.`,
    canonical: `${SITE_URL}/terms/`,
    schema: TERMS_SCHEMA,
  });

  return (
    <div className="inner-page">
      <div className="inner-page__header">
        <h1>Terms of Service</h1>
        <p>Last updated: March 2026</p>
      </div>

      <div className="inner-page__body">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Google Doodle Games (&quot;the Site&quot;), you agree to be bound by these Terms
          of Service. If you do not agree with any part of these terms, please do not use the Site.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Google Doodle Games is an independent fan site that curates playable Google Doodle
          mini-games in one convenient location. Games are loaded via iframe embeds directly from
          Google&apos;s own servers. We do not host, modify, or redistribute any game content.
        </p>

        <h2>3. Intellectual Property</h2>
        <p>
          All games accessible on this site are the intellectual property of Google LLC. The Google
          name, logo, and Doodle branding are trademarks of Google LLC. Google Doodle Games makes no
          claim of ownership over any game content. Our original site design, text, and curation are
          &copy; {new Date().getFullYear()} Google Doodle Games.
        </p>

        <h2>4. Third-Party Content</h2>
        <p>
          Games are served via third-party iframes. We have no control over the availability,
          performance, or data practices of these third-party servers. Use of embedded game content
          is also subject to Google&apos;s own{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
            Terms of Service
          </a>.
        </p>

        <h2>5. Disclaimer of Warranties</h2>
        <p>
          The Site is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether
          express or implied. We do not guarantee that games will always be available, error-free,
          or compatible with every device or browser. Game availability depends on Google&apos;s servers
          and may change without notice.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          In no event shall Google Doodle Games, its operators, or contributors be liable for any
          indirect, incidental, special, or consequential damages arising from your use of, or
          inability to use, the Site or any game content.
        </p>

        <h2>7. User Conduct</h2>
        <p>
          You agree not to misuse the Site — including but not limited to attempting to scrape content,
          reverse-engineer embedded games, distribute malware, or engage in any activity that disrupts
          the normal operation of the Site.
        </p>

        <h2>8. Links to Other Sites</h2>
        <p>
          The Site may contain links to external websites. We are not responsible for the content or
          privacy practices of those sites. Following any external link is at your own risk.
        </p>

        <h2>9. Changes to These Terms</h2>
        <p>
          We reserve the right to update these Terms of Service at any time. Changes will be posted
          on this page with an updated &quot;Last updated&quot; date. Continued use of the Site after changes
          constitutes acceptance of the revised terms.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions about these terms?{' '}
          <Link to="/contact/" style={{ color: 'var(--accent)' }}>Get in touch →</Link>
        </p>
      </div>
    </div>
  );
}
