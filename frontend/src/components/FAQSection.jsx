import { useState } from "react";

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How should I store my tea?",
      answer:
        "Keep your tea sealed in an airtight container away from sunlight, moisture and strong aromas. A cool, dry cupboard is ideal.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Orders are usually delivered within 3 to 7 business days depending on your location.",
    },
    {
      question: "Do you offer free shipping?",
      answer:
        "Yes. We offer free shipping on orders above ₹999. Orders below that amount have a flat ₹99 shipping fee.",
    },
    {
      question: "Can I return or exchange my order?",
      answer:
        "If your order arrives damaged or incorrect, please contact us with your order details and we'll help resolve the issue.",
    },
    {
      question: "How can I contact Mistvale?",
      answer:
        "You can reach us through the contact details provided in the footer. We're happy to help with orders, products and brewing questions.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="faq-section" id="faq">
      <div className="faq-layout">
        <div className="faq-intro">
          <p className="faq-eyebrow">NEED TO KNOW</p>

          <h2>
            Frequently Asked
            <br />
            Questions
          </h2>

          <p>Everything you need to know before your next cup of tea.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                className={`faq-item ${isOpen ? "open" : ""}`}
                key={faq.question}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>

                  <span className="faq-icon">{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
