function ReviewsSection() {
  const reviews = [
    {
      rating: 5,
      text: "The Masala Chai Blend has become my everyday morning tea. Rich, fragrant and exactly what I was looking for.",
      name: "Priya S.",
      tea: "Masala Chai Blend",
    },
    {
      rating: 5,
      text: "The Darjeeling First Flush is incredibly delicate and floral. Definitely one of the nicest teas I've tried.",
      name: "Rahul M.",
      tea: "Darjeeling First Flush",
    },
    {
      rating: 5,
      text: "I bought the sampler as a gift and ended up wanting one for myself. Beautiful presentation and lovely teas.",
      name: "Ananya K.",
      tea: "Tea Lover's Sampler",
    },
  ];

  return (
    <section className="reviews-section">
      <div className="section-header reviews-header">
        <p>FROM OUR TEA TABLE</p>

        <h2>Loved by Tea Drinkers</h2>

        <p>
          A few words from people who have made Mistvale part of their daily
          ritual.
        </p>
      </div>

      <div className="reviews-grid">
        {reviews.map((review) => (
          <article className="review-card" key={review.name}>
            <div className="review-stars">{"★".repeat(review.rating)}</div>

            <p className="review-text">“{review.text}”</p>

            <div className="review-author">
              <strong>{review.name}</strong>
              <span>{review.tea}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ReviewsSection;
