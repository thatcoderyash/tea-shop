import { useState } from "react";
import { useCart } from "../context/CartContext";

const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeMessage, setPincodeMessage] = useState("");

  const {
    cart,
    cartCount,
    cartTotal,
    shippingCost,
    coupon,
    discount,
    finalTotal,
    applyCoupon,
    removeCoupon,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  if (!isOpen) {
    return null;
  }

  const checkPincode = () => {
    const trimmedPincode = pincode.trim();

    if (!/^\d{6}$/.test(trimmedPincode)) {
      setPincodeMessage("Please enter a valid 6-digit pincode.");
      return;
    }

    const serviceablePincodes = [
      "110001",
      "110002",
      "122001",
      "160001",
      "201301",
      "302001",
      "400001",
      "411001",
      "500001",
      "560001",
      "600001",
      "700001",
    ];

    if (serviceablePincodes.includes(trimmedPincode)) {
      setPincodeMessage("Delivery is available to this pincode.");
    } else {
      setPincodeMessage("Sorry, we don't deliver to this pincode yet.");
    }
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <aside
        className="cart-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-header">
          <div>
            <p className="cart-eyebrow">YOUR BAG</p>
            <h2>Shopping Cart</h2>
          </div>

          <button
            className="cart-close"
            onClick={onClose}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <h3>Your cart is empty</h3>

            <p>Add some beautiful tea and come back here.</p>

            <button className="continue-shopping-btn" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>

                    <p>₹{item.price}</p>

                    <div className="quantity-controls">
                      <button onClick={() => decreaseQuantity(item.id)}>
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button onClick={() => increaseQuantity(item.id)}>
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="remove-item"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>

              <div>
                <span>Shipping</span>
                <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
              </div>

              <div className="pincode-section">
                <h3>Check delivery</h3>

                <div className="pincode-input">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(event) => {
                      setPincode(event.target.value);
                      setPincodeMessage("");
                    }}
                  />

                  <button onClick={checkPincode}>Check</button>
                </div>

                {pincodeMessage && (
                  <p className="pincode-message">{pincodeMessage}</p>
                )}
              </div>

              <div className="coupon-section">
                <h3>Have a coupon?</h3>

                {!coupon ? (
                  <>
                    <div className="coupon-input">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                      />

                      <button
                        onClick={() => {
                          const result = applyCoupon(couponCode);

                          setCouponMessage(result.message);

                          if (result.success) {
                            setCouponCode("");
                          }
                        }}
                      >
                        Apply
                      </button>
                    </div>

                    {couponMessage && (
                      <p className="coupon-message">{couponMessage}</p>
                    )}
                  </>
                ) : (
                  <div className="applied-coupon">
                    <span>{coupon.code} applied</span>

                    <button onClick={removeCoupon}>Remove</button>
                  </div>
                )}
              </div>

              {discount > 0 && (
                <div>
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="cart-total">
                <strong>Total</strong>
                <strong>₹{finalTotal}</strong>
              </div>

              <button className="checkout-btn" onClick={onCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
