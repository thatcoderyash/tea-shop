import { useEffect, useState } from "react";

function CustomerAccount() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("customer-token");

    window.dispatchEvent(new Event("customer-auth-change"));

    window.location.href = "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("customer-token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchAccount = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, ordersResponse] = await Promise.all([
          fetch("http://localhost:8080/api/customer/profile", {
            headers,
          }),
          fetch("http://localhost:8080/api/customer/orders", {
            headers,
          }),
        ]);

        if (
          profileResponse.status === 401 ||
          profileResponse.status === 403 ||
          ordersResponse.status === 401 ||
          ordersResponse.status === 403
        ) {
          localStorage.removeItem("customer-token");
          window.location.href = "/login";
          return;
        }

        if (!profileResponse.ok || !ordersResponse.ok) {
          throw new Error("Could not load your account.");
        }

        const profileData = await profileResponse.json();
        const ordersData = await ordersResponse.json();

        setProfile(profileData);
        setOrders(ordersData);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, []);

  if (loading) {
    return <p>Loading your account...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main className="customer-account-page">
      <h1>My Account</h1>

      <button onClick={handleLogout}>Logout</button>

      {profile && (
        <section>
          <h2>Profile</h2>
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
        </section>
      )}

      <section>
        <h2>My Orders</h2>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <h3>Your tea journey starts here.</h3>
            <p>
              You haven't placed any orders yet. Explore our collection and find
              your next favorite cup.
            </p>
            <a href="/#shop" className="browse-teas-button">
              Browse Teas
            </a>
          </div>
        ) : (
          orders.map((order) => (
            <article key={order.id}>
              <h3>Order #{order.id}</h3>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              {order.status === "CANCELLED" ? (
                <p className="order-status-row">
                  Status:{" "}
                  <span className="order-status-badge cancelled">
                    CANCELLED
                  </span>
                </p>
              ) : (
                <>
                  <p className="order-status-row">
                    Status:{" "}
                    <span
                      className={`order-status-badge ${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </p>

                  <div className="order-timeline">
                    {["PLACED", "PROCESSING", "SHIPPED", "DELIVERED"].map(
                      (stage, index) => {
                        const currentIndex = [
                          "PLACED",
                          "PROCESSING",
                          "SHIPPED",
                          "DELIVERED",
                        ].indexOf(order.status);

                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                          <div
                            key={stage}
                            className={`order-timeline-step ${
                              isCompleted ? "completed" : ""
                            } ${isCurrent ? "current" : ""}`}
                          >
                            <span className="order-timeline-dot">
                              {isCompleted ? "✓" : index + 1}
                            </span>

                            <span className="order-timeline-label">
                              {stage.charAt(0) + stage.slice(1).toLowerCase()}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </>
              )}
              <p>Total: ₹{order.total}</p>

              <ul>
                {order.items.map((item, index) => (
                  <li key={`${item.productId}-${index}`}>
                    {item.productName} × {item.quantity}
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default CustomerAccount;
