import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

function Navbar({ onCartClick, checkoutOpen, searchTerm, onSearchChange }) {
  const { cartCount } = useCart();
  const [activeSection, setActiveSection] = useState("home");
  const [customerLoggedIn, setCustomerLoggedIn] = useState(() =>
    Boolean(localStorage.getItem("customer-token")),
  );

  useEffect(() => {
    // Storefront sections are unmounted during checkout.
    // Wait until they are mounted again before observing them.
    if (checkoutOpen) return;

    const sections = [
      document.getElementById("home"),
      document.getElementById("shop"),
      document.getElementById("about"),
      document.getElementById("contact"),
    ].filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.4, 0.6],
        rootMargin: "-90px 0px -35% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [checkoutOpen]);

  useEffect(() => {
    const updateCustomerAuth = () => {
      setCustomerLoggedIn(Boolean(localStorage.getItem("customer-token")));
    };

    window.addEventListener("customer-auth-change", updateCustomerAuth);

    return () => {
      window.removeEventListener("customer-auth-change", updateCustomerAuth);
    };
  }, []);

  const navItems = [
    {
      label: "HOME",
      target: "home",
    },
    {
      label: "SHOP",
      target: "shop",
    },
    {
      label: "ABOUT",
      target: "about",
    },
    {
      label: "CONTACT",
      target: "contact",
    },
  ];

  const handleNavigation = (event, target) => {
    event.preventDefault();

    const section = document.getElementById(target);

    if (!section) {
      return;
    }

    setActiveSection(target);

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <header className="header">
      <div className="wrapper">
        <a className="brand" href="#home">
          <img src="/images/logo.png" alt="Mistvale Tea Co." />
        </a>

        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.target}
              href={`#${item.target}`}
              className={activeSection === item.target ? "active" : ""}
              onClick={(event) => handleNavigation(event, item.target)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <form
            className="search-form"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              document.getElementById("shop")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <input
              className="search"
              type="search"
              placeholder="Search teas..."
              aria-label="Search teas"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </form>

          <button
            className="cart-icon"
            onClick={onCartClick}
            aria-label="Open shopping cart"
          >
            🛒
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
          {customerLoggedIn ? (
            <a className="account-link" href="/account">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
              </svg>
            </a>
          ) : (
            <div className="auth-nav-links">
              <a href="/login">Sign In</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
