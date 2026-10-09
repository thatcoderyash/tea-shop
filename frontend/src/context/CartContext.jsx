import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

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
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
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
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const applyCoupon = (code) => {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode === "MISTVALE10") {
      setCoupon({
        code: normalizedCode,
        type: "percentage",
        value: 10,
      });

      return {
        success: true,
        message: "10% discount applied!",
      };
    }

    if (normalizedCode === "TEA50") {
      setCoupon({
        code: normalizedCode,
        type: "fixed",
        value: 50,
      });

      return {
        success: true,
        message: "₹50 discount applied!",
      };
    }

    return {
      success: false,
      message: "Invalid coupon code.",
    };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  let discount = 0;

  if (coupon) {
    if (coupon.type === "percentage") {
      discount = Math.round((cartTotal * coupon.value) / 100);
    }

    if (coupon.type === "fixed") {
      discount = Math.min(coupon.value, cartTotal);
    }
  }

  const shippingCost = cartTotal === 0 ? 0 : cartTotal >= 999 ? 0 : 99;

  const finalTotal = cartTotal + shippingCost - discount;

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
