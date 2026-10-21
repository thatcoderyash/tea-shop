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
import CustomerLogin from "./components/CustomerLogin";
import CustomerRegister from "./components/CustomerRegister";
import CustomerAccount from "./components/CustomerAccount";

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

  // Admin dashboard
  if (adminRoute) {
    return <AdminDashboard onLogout={() => navigate("/")} />;
  }

  // Customer login page
  if (window.location.pathname === "/login") {
    return <CustomerLogin />;
  }

  if (window.location.pathname === "/register") {
    return <CustomerRegister />;
  }

  if (window.location.pathname === "/account") {
    return <CustomerAccount />;
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
