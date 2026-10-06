import React from "react";

const Hero = () => {
  return (
    <section aria-labelledby="hero-title" className="hero" id="home">
      <div className="hero-content">
        <div className="hero-eyebrow">MISTVALE TEA CO.</div>

        <h1 className="hero-title" id="hero-title">
          Tea worth slowing down for.
        </h1>

        <p className="hero-copy">
          Thoughtfully sourced teas from India's finest growing regions, crafted
          for quiet mornings, warm conversations, and everyday rituals.
        </p>

        <div className="hero-actions">
          <a className="btn primary-btn" href="#shop">
            SHOP THE TEAS
          </a>

          <a className="hero-secondary" href="#about">
            Explore our story
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
