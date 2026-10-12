import { useState } from "react";
import { useCart } from "../context/CartContext";

function Checkout({ onClose }) {
  const {
    cart,
    cartCount,
    cartTotal,
    shippingCost,
    discount,
    finalTotal,
    clearCart,
  } = useCart();

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
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      setError("Your cart is empty. Please add some tea first.");
      return;
    }

    setSubmitting(true);
    setError("");

    const orderRequest = {
      customerName: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),

      // The backend validates the coupon and calculates the final total.
      couponCode: discount > 0 ? "WELCOME10" : null,

      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequest),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Please try again.",
        );
      }

      if (!response.ok) {
        if (data.details) {
          const fieldNameMap = {
            customerName: "name",
            email: "email",
            phone: "phone",
            address: "address",
            city: "city",
            state: "state",
            pincode: "pincode",
          };

          const mappedErrors = {};

          Object.entries(data.details).forEach(([field, message]) => {
            const inputName = fieldNameMap[field];

            if (inputName) {
              mappedErrors[inputName] = message;
            }
          });

          setFieldErrors(mappedErrors);

          if (Object.keys(mappedErrors).length > 0) {
            setError("Please correct the highlighted fields.");
            return;
          }
        }

        throw new Error(
          data.message || "Unable to place your order. Please try again.",
        );
      }

      setOrderDetails(data);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while placing your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <div className="success-icon">✓</div>

          <h1>Order Placed!</h1>
          <p>Thank you for shopping with Mistvale Tea Co.</p>
          <p>Your tea journey is officially brewing. 🌿</p>

          {orderDetails && (
            <div className="order-confirmation">
              <h2>Order #{orderDetails.id}</h2>

              {orderDetails?.trackingToken && (
                <div>
                  <p>
                    Tracking token:{" "}
                    <strong>{orderDetails.trackingToken}</strong>
                  </p>
                  <p>Save this token to look up your order later.</p>
                </div>
              )}

              {orderDetails.createdAt && (
                <p>
                  Placed on:{" "}
                  {new Date(orderDetails.createdAt).toLocaleString("en-IN")}
                </p>
              )}

              <div className="confirmation-items">
                {orderDetails.items?.map((item) => (
                  <div className="confirmation-item" key={item.productId}>
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="confirmation-totals">
                <div>
                  <span>Subtotal</span>
                  <span>₹{orderDetails.subtotal.toFixed(2)}</span>
                </div>

                <div>
                  <span>Discount</span>
                  <span>-₹{orderDetails.discount.toFixed(2)}</span>
                </div>

                <div>
                  <span>Shipping</span>
                  <span>₹{orderDetails.shipping.toFixed(2)}</span>
                </div>

                <div className="confirmation-total">
                  <strong>Total Paid</strong>
                  <strong>₹{orderDetails.total.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}

          <button className="continue-shopping-btn" onClick={onClose}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button type="button" onClick={onClose}>
          ← Back to Cart
        </button>

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
                maxLength={100}
                value={formData.name}
                onChange={handleChange}
                required
              />
              {fieldErrors.name && (
                <p className="field-error" role="alert">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={150}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.email && (
                  <p className="field-error" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={20}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.phone && (
                  <p className="field-error" role="alert">
                    {fieldErrors.phone}
                  </p>
                )}
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
                maxLength={300}
                value={formData.address}
                onChange={handleChange}
                rows="3"
                required
              />
              {fieldErrors.address && (
                <p className="field-error" role="alert">
                  {fieldErrors.address}
                </p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  maxLength={100}
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.city && (
                  <p className="field-error" role="alert">
                    {fieldErrors.city}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  maxLength={100}
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.state && (
                  <p className="field-error" role="alert">
                    {fieldErrors.state}
                  </p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                required
              />
              {fieldErrors.pincode && (
                <p className="field-error" role="alert">
                  {fieldErrors.pincode}
                </p>
              )}
            </div>
          </section>

          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="place-order-btn"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Placing Order..." : "Place Order"}
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
