function PromoStrip() {
  return (
    <section className="promo-strip">
      <div className="promo-content">
        <div>
          <p className="promo-eyebrow">LIMITED TIME OFFER</p>

          <h2>Save 10% on your first order</h2>

          <p className="promo-text">
            Use code <strong>MISTVALE10</strong> at checkout.
          </p>
        </div>

        <a href="#shop" className="promo-btn">
          SHOP NOW
        </a>
      </div>
    </section>
  );
}

export default PromoStrip;
