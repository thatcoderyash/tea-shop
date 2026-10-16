import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductSection from "./components/ProductSection";
import CartDrawer from "./components/CartDrawer";
import Checkout from "./components/Checkout";
import TrustStrip from "./components/TrustStrip";
import PromoStrip from "./components/PromoStrip";
import AboutSection from "./components/AboutSection";
import ReviewsSection from "./components/ReviewsSection";
import FAQSection from "./components/FAQSection";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import OrderLookup from "./components/OrderLookup";
import AdminDashboard from "./components/AdminDashboard";

const isAdminPath = (pathname) => pathname.replace(/\/+$/, "") === "/admin";

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminRoute, setAdminRoute] = useState(() =>
    isAdminPath(window.location.pathname),
  );

  useEffect(() => {
    const syncRoute = () =>
      setAdminRoute(isAdminPath(window.location.pathname));
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    const isAdmin = location.pathname === "/admin";

    document.body.style.paddingTop = isAdmin ? "0" : "";

    return () => {
      document.body.style.paddingTop = "";
    };
  }, [location.pathname]);

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setAdminRoute(isAdminPath(window.location.pathname));
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const openCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const closeCheckout = () => setCheckoutOpen(false);

  // The admin dashboard is available only at /admin, not through the storefront UI.
  if (adminRoute) {
    return <AdminDashboard onLogout={() => navigate("/")} />;
  }

  return (
    <>
      <Navbar
        onCartClick={() => setCartOpen(true)}
        checkoutOpen={checkoutOpen}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {!checkoutOpen ? (
        <>
          <Hero />
          <TrustStrip />
          <PromoStrip />
          <ProductSection searchTerm={searchTerm} />
          <AboutSection />
          <ReviewsSection />
          <FAQSection />
          <Newsletter />
          <OrderLookup />
          <Footer />
          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            onCheckout={openCheckout}
          />
        </>
      ) : (
        <Checkout onClose={closeCheckout} />
      )}
    </>
  );
}

export default App;
