function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="about-grid">
        <div className="about-image">
          <img src="/images/hero-banner.png" alt="Mistvale Tea" />
        </div>

        <div className="about-content">
          <p className="about-eyebrow">OUR STORY</p>

          <h2>
            Tea is more than a drink.
            <br />
            It's a moment.
          </h2>

          <p>
            At Mistvale Tea Co., we believe good tea deserves a little patience.
            We source thoughtfully from India's finest tea-growing regions and
            choose blends that are meant to be enjoyed slowly.
          </p>

          <p>
            From the first cup of the morning to long conversations in the
            evening, our teas are made for the small rituals that make ordinary
            days feel special.
          </p>

          <a href="#shop" className="about-btn">
            EXPLORE OUR TEAS
          </a>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
