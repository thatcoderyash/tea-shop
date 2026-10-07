import { useState } from "react";

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

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const openCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
  };

  return (
    <>
      <Navbar onCartClick={() => setCartOpen(true)} />

      {!checkoutOpen ? (
        <>
          <Hero />

          <TrustStrip />

          <PromoStrip />

          <ProductSection />

          <AboutSection />

          <ReviewsSection />

          <FAQSection />

          <Newsletter />

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
