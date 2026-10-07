function TrustStrip() {
  const benefits = [
    {
      icon: "🌿",
      title: "Fresh & Thoughtful",
      text: "Carefully sourced teas",
    },
    {
      icon: "🚚",
      title: "Free Shipping",
      text: "On orders above ₹999",
    },
    {
      icon: "🍵",
      title: "Made for Rituals",
      text: "Tea worth slowing down for",
    },
    {
      icon: "🔒",
      title: "Secure Checkout",
      text: "Safe and simple shopping",
    },
  ];

  return (
    <section className="trust-strip">
      <div className="trust-grid">
        {benefits.map((benefit) => (
          <div className="trust-item" key={benefit.title}>
            <div className="trust-icon">{benefit.icon}</div>

            <div>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustStrip;
