import { useSEO, SITE_URL, SITE_NAME } from '../utils/seo';

const CONTACT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Contact — ${SITE_NAME}`,
  url: `${SITE_URL}/contact/`,
  isPartOf: { '@type': 'WebSite', url: `${SITE_URL}/` },
};

export default function Contact() {
  useSEO({
    title: `Contact Us — ${SITE_NAME}`,
    description: `Get in touch with the Google Doodle Games team. Report a broken game, suggest a missing Doodle, or just say hello.`,
    canonical: `${SITE_URL}/contact/`,
    schema: CONTACT_SCHEMA,
  });

  function handleSubmit(e) {
    e.preventDefault();
    const data     = new FormData(e.target);
    const subject  = encodeURIComponent(`Google Doodle Games: ${data.get('subject') || 'Message'}`);
    const body     = encodeURIComponent(
      `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`
    );
    window.location.href = `mailto:hello@googledoodlegames.org?subject=${subject}&body=${body}`;
  }

  return (
    <div className="inner-page">
      <div className="inner-page__header">
        <h1>Contact Us</h1>
        <p>Questions, bug reports, or just want to say hi? We'd love to hear from you.</p>
      </div>

      <div className="inner-page__body">
        <div className="contact-info">
          <div className="contact-info__card">
            <span className="contact-info__icon">📧</span>
            <div>
              <div className="contact-info__label">Email</div>
              <div className="contact-info__value">
                <a href="mailto:hello@googledoodlegames.org">hello@googledoodlegames.org</a>
              </div>
            </div>
          </div>
          <div className="contact-info__card">
            <span className="contact-info__icon">⏱️</span>
            <div>
              <div className="contact-info__label">Response Time</div>
              <div className="contact-info__value">Usually within 2 business days</div>
            </div>
          </div>
        </div>

        <h2>Send a Message</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form__row">
            <div className="contact-form__field">
              <label className="contact-form__label" htmlFor="cf-name">Your Name</label>
              <input className="contact-form__input" id="cf-name" name="name" type="text" placeholder="Jane Smith" required />
            </div>
            <div className="contact-form__field">
              <label className="contact-form__label" htmlFor="cf-email">Email Address</label>
              <input className="contact-form__input" id="cf-email" name="email" type="email" placeholder="jane@example.com" required />
            </div>
          </div>
          <div className="contact-form__field">
            <label className="contact-form__label" htmlFor="cf-subject">Subject</label>
            <input className="contact-form__input" id="cf-subject" name="subject" type="text" placeholder="Broken game, missing Doodle, feedback…" />
          </div>
          <div className="contact-form__field">
            <label className="contact-form__label" htmlFor="cf-message">Message</label>
            <textarea className="contact-form__textarea" id="cf-message" name="message" placeholder="Tell us what's on your mind…" required />
          </div>
          <button type="submit" className="contact-form__submit">Send Message →</button>
        </form>

        <h2>Common Questions</h2>
        <p><strong>A game isn't loading.</strong> Try refreshing the page or switching browsers. Some games work best in Chrome or Firefox on desktop. If the problem persists, let us know and we'll investigate.</p>
        <p><strong>Can you add a missing game?</strong> Yes! If you know of a Google Doodle game that isn't in our collection, send us the details and we'll do our best to add it.</p>
        <p><strong>Is this site affiliated with Google?</strong> No — we’re an independent fan site. All games are the intellectual property of Google LLC, loaded directly from Google’s servers.</p>
        <p><strong>Are the games really free?</strong> Completely. There's no login, no subscription, no catch. Every game is playable instantly at zero cost.</p>
      </div>
    </div>
  );
}
