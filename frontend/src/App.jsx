import { useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductSection from "./components/ProductSection";
import CartDrawer from "./components/CartDrawer";
import Checkout from "./components/Checkout";

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

          <ProductSection />

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
