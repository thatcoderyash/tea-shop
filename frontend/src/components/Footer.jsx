function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-main">
        <div className="footer-brand">
          <img src="/images/logo.png" alt="Mistvale Tea Co." />

          <p>
            Thoughtfully sourced teas for quiet mornings, warm conversations,
            and everyday rituals.
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Instagram">
              Instagram
            </a>

            <a href="#" aria-label="Facebook">
              Facebook
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>SHOP</h3>

          <a href="#shop">All Teas</a>
          <a href="#shop">Black Tea</a>
          <a href="#shop">Green Tea</a>
          <a href="#shop">Herbal Tea</a>
          <a href="#shop">Gift Boxes</a>
        </div>

        <div className="footer-column">
          <h3>HELP</h3>

          <a href="#faq">FAQs</a>
          <a href="#contact">Contact Us</a>
          <a href="#contact">Shipping</a>
          <a href="#contact">Returns</a>
        </div>

        <div className="footer-column">
          <h3>CONTACT</h3>

          <p>hello@mistvaletea.com</p>
          <p>Mon – Sat, 10 AM – 6 PM</p>
          <p>India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Mistvale Tea Co. All rights reserved.</p>

        <div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
