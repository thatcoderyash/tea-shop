import { useCallback, useEffect, useState } from "react";
import "../admin.css";

const API_URL = "http://localhost:8080/api/admin/orders";

const STATUSES = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

function formatStatus(status) {
  return status.replaceAll("_", " ");
}

const AdminDashboard = ({ onLogout }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = useCallback(
    async (url, options = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Basic ${btoa(
            `${credentials.username}:${credentials.password}`,
          )}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          response.status === 401
            ? "Admin credentials are invalid. Please log in again."
            : "You do not have permission to perform this action.",
        );
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Request failed.");
      }

      return data;
    },
    [credentials],
  );

  const loadOrders = useCallback(async () => {
    if (!credentials) return;

    setLoading(true);
    setError("");

    try {
      const data = await request(API_URL);
      setOrders(data);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("credentials are invalid")) {
        setCredentials(null);
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [credentials, request]);

  useEffect(() => {
    if (credentials) loadOrders();
  }, [credentials, loadOrders]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const candidate = { username: username.trim(), password };

    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Basic ${btoa(
            `${candidate.username}:${candidate.password}`,
          )}`,
        },
      });

      if (response.status === 401) {
        throw new Error("Incorrect username or password.");
      }

      if (response.status === 403) {
        throw new Error("This account does not have admin permission.");
      }

      if (!response.ok) {
        throw new Error("Could not connect to the admin API.");
      }

      const data = await response.json();
      setOrders(data);
      setCredentials(candidate);
      setPassword("");
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot reach the backend. Make sure Spring Boot is running."
          : err.message,
      );
    }
  };

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    setError("");
    setNotice("");

    try {
      const updatedOrder = await request(`${API_URL}/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setOrders((current) =>
        current.map((order) => (order.id === orderId ? updatedOrder : order)),
      );

      setNotice(`Order #${orderId} updated to ${formatStatus(status)}.`);
    } catch (err) {
      setError(err.message);
      await loadOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    setCredentials(null);
    setOrders([]);
    setPassword("");
    setUsername("");
    setError("");
    setNotice("");
    onLogout?.();
  };

  const filteredOrders =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.status === filter);

  const totalRevenue = orders.reduce(
    (sum, order) => (order.status === "CANCELLED" ? sum : sum + order.total),
    0,
  );

  const pendingOrders = orders.filter((order) =>
    ["PLACED", "PROCESSING"].includes(order.status),
  ).length;

  if (!credentials) {
    return (
      <main className="admin-page">
        <form className="admin-login" onSubmit={handleLogin}>
          <div className="admin-brand">M</div>
          <p className="admin-eyebrow">MISTVALE TEA CO.</p>
          <h1>Admin Portal</h1>
          <p className="admin-muted">
            Sign in to manage orders and fulfilment.
          </p>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <label htmlFor="admin-username">Username</label>
          <input
            id="admin-username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button className="admin-primary" type="submit">
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">MISTVALE TEA CO.</p>
          <h1>Order Dashboard</h1>
          <p className="admin-muted">
            Your orders, from first sip to final delivery.
          </p>
        </div>
        <button className="admin-secondary" onClick={handleLogout}>
          Log out
        </button>
      </header>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      )}

      <section className="admin-stats">
        <article className="admin-stat">
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </article>
        <article className="admin-stat">
          <span>Revenue, excluding cancelled</span>
          <strong>{formatCurrency(totalRevenue)}</strong>
        </article>
        <article className="admin-stat">
          <span>Pending fulfilment</span>
          <strong>{pendingOrders}</strong>
        </article>
      </section>

      <section className="admin-orders">
        <div className="admin-orders-heading">
          <div>
            <h2>Orders</h2>
            <p className="admin-muted">
              Review purchases and update their progress.
            </p>
          </div>
          <button
            className="admin-secondary"
            onClick={loadOrders}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="admin-filters">
          {["ALL", ...STATUSES].map((status) => (
            <button
              key={status}
              className={filter === status ? "active" : ""}
              onClick={() => setFilter(status)}
            >
              {status === "ALL" ? "All orders" : formatStatus(status)}
            </button>
          ))}
        </div>

        {loading && orders.length === 0 ? (
          <p className="admin-empty">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="admin-empty">No orders found in this filter.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const terminal = ["DELIVERED", "CANCELLED"].includes(
                    order.status,
                  );

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                        <small>{order.items.length} line items</small>
                      </td>
                      <td>
                        <strong>{order.customerName}</strong>
                        <small>{order.email}</small>
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>
                        <span
                          className={`admin-status status-${order.status.toLowerCase()}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td>
                        <select
                          aria-label={`Update status for order ${order.id}`}
                          value={order.status}
                          disabled={terminal || updatingId === order.id}
                          onChange={(event) =>
                            handleStatusChange(order.id, event.target.value)
                          }
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {formatStatus(status)}
                            </option>
                          ))}
                        </select>
                        {terminal && <small>Final status</small>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminDashboard;
