import { useState } from "react";
import { useCart } from "../context/CartContext";

function Checkout({ onClose }) {
  const { cart, cartCount, cartTotal, shippingCost, discount, finalTotal } =
    useCart();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <div className="success-icon">✓</div>

          <h1>Order Placed!</h1>

          <p>Thank you for shopping with Mistvale Tea Co.</p>

          <p>Your order has been received successfully.</p>

          <button onClick={onClose}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button onClick={onClose}>← Back to Cart</button>

        <h1>Checkout</h1>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="checkout-section">
            <h2>Contact Information</h2>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h2>Delivery Address</h2>

            <div className="form-group">
              <label htmlFor="address">Address</label>

              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>

              <input
                id="pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                maxLength="6"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          <button className="place-order-btn" type="submit">
            Place Order
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="checkout-items">
            {cart.map((item) => (
              <div className="checkout-item" key={item.id}>
                <img src={item.image} alt={item.name} />

                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.quantity} × ₹{item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div>
              <span>Items</span>
              <span>{cartCount}</span>
            </div>

            <div>
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>

            <div>
              <span>Shipping</span>
              <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
            </div>

            {discount > 0 && (
              <div>
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div className="checkout-total">
              <strong>Total</strong>
              <strong>₹{finalTotal}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
