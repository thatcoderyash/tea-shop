import { useState } from "react";
import API_BASE_URL from "../api";

function OrderLookup() {
  const [orderId, setOrderId] = useState("");
  const [token, setToken] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}?token=${encodeURIComponent(token)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to find this order.");
      }

      setOrder(data);
    } catch (err) {
      setError(
        err.message || "Unable to contact the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="order-lookup">
      <h2>Track Your Order</h2>
      <p>Enter your order number and tracking token.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="lookup-order-id">Order Number</label>
        <input
          id="lookup-order-id"
          type="number"
          min="1"
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
          required
        />

        <label htmlFor="lookup-token">Tracking Token</label>
        <input
          id="lookup-token"
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find Order"}
        </button>
      </form>

      {error && (
        <p className="checkout-error" role="alert">
          {error}
        </p>
      )}

      {order && (
        <div className="lookup-result">
          <h3>Order #{order.id}</h3>
          <p className={`order-status status-${order.status.toLowerCase()}`}>
            Status: {order.status.replaceAll("_", " ")}
          </p>
          <p>Placed: {new Date(order.createdAt).toLocaleString("en-IN")}</p>

          {order.items.map((item, index) => (
            <div
              className="confirmation-item"
              key={`${item.productId}-${index}`}
            >
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="confirmation-totals">
            <div>
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span>Discount</span>
              <span>-₹{order.discount.toFixed(2)}</span>
            </div>
            <div>
              <span>Shipping</span>
              <span>₹{order.shipping.toFixed(2)}</span>
            </div>
            <div className="confirmation-total">
              <strong>Total</strong>
              <strong>₹{order.total.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OrderLookup;
