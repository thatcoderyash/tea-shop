import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

const FREE_SHIPPING_THRESHOLD = 599;
const SHIPPING_FEE = 49;
const COUPON_MIN_SUBTOTAL = 399;
const COUPON_MAX_DISCOUNT = 150;

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("mistvale-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem("mistvale-cart", JSON.stringify(cart));
  }, [cart]);

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    localStorage.removeItem("mistvale-cart");
  };

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id,
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId),
    );
  };

  const increaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // Gift products do not qualify for the coupon discount.
  const eligibleSubtotal = cart.reduce(
    (total, item) =>
      item.category === "Gifts" ? total : total + item.price * item.quantity,
    0,
  );

  const applyCoupon = (code) => {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode !== "WELCOME10") {
      return {
        success: false,
        message: "Invalid coupon code.",
      };
    }

    if (eligibleSubtotal < COUPON_MIN_SUBTOTAL) {
      return {
        success: false,
        message:
          "Add at least ₹399 in eligible tea products to use this coupon.",
      };
    }

    setCoupon({ code: normalizedCode });

    return {
      success: true,
      message: "WELCOME10 applied! You saved 10% on eligible products.",
    };
  };

  const removeCoupon = () => setCoupon(null);

  let discount = 0;

  if (coupon?.code === "WELCOME10" && eligibleSubtotal >= COUPON_MIN_SUBTOTAL) {
    discount = Math.min(
      Math.round(eligibleSubtotal * 0.1 * 100) / 100,
      COUPON_MAX_DISCOUNT,
    );
  }

  const discountedSubtotal = cartTotal - discount;

  const shippingCost =
    cartTotal === 0
      ? 0
      : discountedSubtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : SHIPPING_FEE;

  const finalTotal = discountedSubtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        cartCount,
        cartTotal,
        eligibleSubtotal,
        discountedSubtotal,
        shippingCost,
        coupon,
        discount,
        finalTotal,
        applyCoupon,
        removeCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
