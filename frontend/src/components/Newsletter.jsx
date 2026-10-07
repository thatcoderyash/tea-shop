import { useState } from "react";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <p className="newsletter-eyebrow">STAY IN THE LOOP</p>

        <h2>Good tea. Good things.</h2>

        <p className="newsletter-description">
          Join our tea table for new blends, brewing tips, special offers and
          occasional notes from Mistvale.
        </p>

        {!submitted ? (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <button type="submit">SUBSCRIBE</button>
          </form>
        ) : (
          <p className="newsletter-success">
            ✓ You're on the list. Welcome to Mistvale.
          </p>
        )}

        <p className="newsletter-note">No spam. Just tea.</p>
      </div>
    </section>
  );
}

export default Newsletter;
