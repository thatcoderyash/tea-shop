import { useCallback, useEffect, useRef, useState } from "react";
import "../admin.css";
import "../admin-sidebar.css";

const API_BASE = "http://localhost:8080";
const AUTH_API = `${API_BASE}/api/auth/login`;
const ORDERS_API = `${API_BASE}/api/admin/orders`;
const PRODUCTS_API = `${API_BASE}/api/products`;
const STATUSES = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const LOW_STOCK_THRESHOLD = 5;
const EMPTY_PRODUCT = {
  name: "",
  category: "Black",
  price: "",
  stock: "",
  image: "/images/p101.png",
  description: "",
  rating: "",
  reviews: "",
};

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
function errorMessage(data) {
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;
  if (data?.errors) return Object.values(data.errors).join(" ");
  return "Request failed.";
}

function AdminDashboard({ onLogout }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState({ ...EMPTY_PRODUCT });
  const productFormRef = useRef(null);
  const productNameRef = useRef(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = useCallback(
    async (url, options = {}) => {
      if (!credentials?.accessToken) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        setCredentials(null);
        setOrders([]);
        setProducts([]);
        const authError = new Error(
          "Your admin session has expired. Please sign in again.",
        );
        authError.status = 401;
        throw authError;
      }

      if (response.status === 403) {
        const permissionError = new Error(
          "You do not have permission to perform this action.",
        );
        permissionError.status = 403;
        throw permissionError;
      }

      if (!response.ok) throw new Error(errorMessage(data));
      return data;
    },
    [credentials],
  );

  const loadOrders = useCallback(async () => {
    if (!credentials) return;
    setLoadingOrders(true);
    try {
      setOrders(await request(ORDERS_API));
    } catch (err) {
      setError(err.message);
      if (err.message.includes("credentials are invalid")) {
        setCredentials(null);
        setOrders([]);
        setProducts([]);
      }
    } finally {
      setLoadingOrders(false);
    }
  }, [credentials, request]);

  const loadProducts = useCallback(async () => {
    if (!credentials) return;
    setLoadingProducts(true);
    try {
      const data = await request(PRODUCTS_API);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("credentials are invalid")) {
        setCredentials(null);
        setOrders([]);
        setProducts([]);
      }
    } finally {
      setLoadingProducts(false);
    }
  }, [credentials, request]);

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await request(`${PRODUCTS_API}/${product.id}`, {
        method: "DELETE",
      });

      setProducts((currentProducts) =>
        currentProducts.filter((item) => item.id !== product.id),
      );

      alert(`"${product.name}" deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Could not delete the product. Please try again.");
    }
  }

  useEffect(() => {
    if (credentials) {
      loadOrders();
      loadProducts();
    }
  }, [credentials, loadOrders, loadProducts]);

  useEffect(() => {
    if (formOpen) {
      productFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      productNameRef.current?.focus({ preventScroll: true });
    }
  }, [formOpen, editingId]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoggingIn(true);

    try {
      const response = await fetch(AUTH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        throw new Error("Incorrect username or password.");
      }
      if (response.status === 403) {
        throw new Error("This account does not have admin permission.");
      }
      if (!response.ok) {
        throw new Error(errorMessage(data) || "Could not sign in.");
      }
      if (!data?.accessToken) {
        throw new Error(
          "Login succeeded but the server did not return an access token.",
        );
      }

      // Keep the JWT in React memory only. It is not written to localStorage.
      setCredentials({
        accessToken: data.accessToken,
        username: data.username ?? username.trim(),
      });
      setPassword("");
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot reach the backend. Make sure Spring Boot is running."
          : err.message,
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    setError("");
    setNotice("");
    try {
      const updated = await request(`${ORDERS_API}/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? updated : order)),
      );
      setNotice(`Order #${orderId} updated to ${formatStatus(status)}.`);
    } catch (err) {
      setError(err.message);
      await loadOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const startAddProduct = () => {
    setEditingId(null);
    setProductForm({ ...EMPTY_PRODUCT });
    setFormOpen(true);
    setError("");
    setNotice("");
  };
  const startEditProduct = (product) => {
    setEditingId(product.id);
    setProductForm({
      name: product.name ?? "",
      category: product.category ?? "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      image: product.image ?? "",
      description: product.description ?? "",
      rating: product.rating == null ? "" : String(product.rating),
      reviews: product.reviews == null ? "" : String(product.reviews),
    });
    setFormOpen(true);
    setError("");
    setNotice("");
  };
  const closeProductForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setProductForm({ ...EMPTY_PRODUCT });
  };
  const changeProductField = (event) => {
    setProductForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setSavingProduct(true);
    setError("");
    setNotice("");
    const payload = {
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      image: productForm.image.trim(),
      description: productForm.description.trim(),
      rating: productForm.rating === "" ? null : Number(productForm.rating),
      reviews: productForm.reviews === "" ? null : Number(productForm.reviews),
    };
    try {
      const editing = editingId !== null;
      const saved = await request(
        editing ? `${PRODUCTS_API}/${editingId}` : PRODUCTS_API,
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      setProducts((current) =>
        editing
          ? current.map((product) =>
              product.id === editingId ? saved : product,
            )
          : [...current, saved],
      );
      setNotice(
        `“${saved.name}” ${editing ? "updated" : "added"} successfully.`,
      );
      closeProductForm();
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Could not reach the backend. Check Spring Boot and allow PUT in CORS settings."
          : err.message,
      );
    } finally {
      setSavingProduct(false);
    }
  };

  const handleLogout = () => {
    setActiveSection("overview");
    setCredentials(null);
    setOrders([]);
    setProducts([]);
    setSelectedOrderId(null);
    setPassword("");
    setUsername("");
    setError("");
    setNotice("");
    closeProductForm();
    onLogout?.();
  };

  const filteredOrders =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.status === filter);
  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;
  const query = productSearch.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    [product.name, product.category, String(product.id)]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
  const totalRevenue = orders.reduce(
    (sum, order) => (order.status === "CANCELLED" ? sum : sum + order.total),
    0,
  );
  const pendingOrders = orders.filter((order) =>
    ["PLACED", "PROCESSING"].includes(order.status),
  ).length;

  if (!credentials)
    return (
      <main className="admin-page">
        <form className="admin-login" onSubmit={handleLogin}>
          <div className="admin-brand">M</div>
          <p className="admin-eyebrow">MISTVALE TEA CO.</p>
          <h1>Admin Portal</h1>
          <p className="admin-muted">
            A quiet corner for managing your tea store.
          </p>
          <div className="admin-login-divider" aria-hidden="true" />
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
          <button className="admin-primary" type="submit" disabled={loggingIn}>
            {loggingIn ? "Signing in..." : "Sign in securely"}
          </button>
          <a className="admin-storefront-link" href="/">
            ← Return to the storefront
          </a>
        </form>
      </main>
    );

  const lowStockProducts = products.filter(
    (product) => Number(product.stock) <= LOW_STOCK_THRESHOLD,
  );

  const navigateTo = (section) => {
    setActiveSection(section);
    if (section !== "orders") setSelectedOrderId(null);
    setError("");
    setNotice("");
  };

  return (
    <main className="admin-page admin-page-layout">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar-brand">
          <div className="admin-brand">M</div>
          <div>
            <strong>MISTVALE</strong>
            <span>TEA CO. / ADMIN</span>
          </div>
        </div>

        <p className="admin-sidebar-label">WORKSPACE</p>
        <nav className="admin-sidebar-nav">
          <button
            type="button"
            className={activeSection === "overview" ? "active" : ""}
            onClick={() => navigateTo("overview")}
            aria-current={activeSection === "overview" ? "page" : undefined}
          >
            <span className="admin-nav-icon" aria-hidden="true">
              ▦
            </span>{" "}
            Overview
          </button>
          <button
            type="button"
            className={activeSection === "orders" ? "active" : ""}
            onClick={() => navigateTo("orders")}
            aria-current={activeSection === "orders" ? "page" : undefined}
          >
            <span className="admin-nav-icon" aria-hidden="true">
              ↗
            </span>{" "}
            Orders
            <span className="admin-nav-count">{pendingOrders}</span>
          </button>
          <button
            type="button"
            className={activeSection === "products" ? "active" : ""}
            onClick={() => navigateTo("products")}
            aria-current={activeSection === "products" ? "page" : undefined}
          >
            <span className="admin-nav-icon" aria-hidden="true">
              ▤
            </span>{" "}
            Products
            <span className="admin-nav-count">{products.length}</span>
          </button>
          <button
            type="button"
            className={activeSection === "inventory" ? "active" : ""}
            onClick={() => navigateTo("inventory")}
            aria-current={activeSection === "inventory" ? "page" : undefined}
          >
            <span className="admin-nav-icon" aria-hidden="true">
              ◉
            </span>{" "}
            Inventory
            <span
              className={`admin-nav-count ${lowStockProducts.length ? "attention" : ""}`}
            >
              {lowStockProducts.length}
            </span>
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <a href="/" className="admin-sidebar-store-link">
            <span aria-hidden="true">↖</span> View storefront
          </a>
          <div className="admin-sidebar-user">
            <span className="admin-sidebar-avatar" aria-hidden="true">
              {(credentials.username || "A").slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{credentials.username}</strong>
              <small>Administrator</small>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">MISTVALE TEA CO.</p>
            <h1>Store Dashboard</h1>
            <p className="admin-muted">
              Manage products and guide orders to their destination.
            </p>
          </div>
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

        {activeSection === "overview" && (
          <>
            <section className="admin-section-intro">
              <p className="admin-eyebrow">OVERVIEW</p>
              <h2>Your store at a glance</h2>
              <p className="admin-muted">
                A quick look at orders, sales and tea stock.
              </p>
            </section>
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
              <article className="admin-stat">
                <span>Products in catalogue</span>
                <strong>{products.length}</strong>
              </article>
              <div className="admin-stat-card">
                <span className="admin-stat-label">Inventory Alerts</span>
                <strong>
                  {
                    products.filter(
                      (product) => Number(product.stock) <= LOW_STOCK_THRESHOLD,
                    ).length
                  }
                </strong>
                <span className="admin-stat-note">
                  Products with 5 or fewer items
                </span>
              </div>
            </section>
            <section className="admin-orders admin-overview-panel">
              <div className="admin-orders-heading">
                <div>
                  <h2>Needs attention</h2>
                  <p className="admin-muted">
                    Keep an eye on low-stock products and pending orders.
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-secondary"
                  onClick={() => navigateTo("inventory")}
                >
                  Review inventory
                </button>
              </div>
              <div className="admin-overview-shortcuts">
                <button type="button" onClick={() => navigateTo("orders")}>
                  <span className="admin-shortcut-icon">↗</span>
                  <span>
                    <strong>{pendingOrders} pending orders</strong>
                    <small>Review and update fulfilment</small>
                  </span>
                  <span className="admin-shortcut-arrow">→</span>
                </button>
                <button type="button" onClick={() => navigateTo("products")}>
                  <span className="admin-shortcut-icon">▤</span>
                  <span>
                    <strong>{products.length} products listed</strong>
                    <small>Edit prices, details and stock</small>
                  </span>
                  <span className="admin-shortcut-arrow">→</span>
                </button>
                <button type="button" onClick={() => navigateTo("inventory")}>
                  <span className="admin-shortcut-icon">◉</span>
                  <span>
                    <strong>{lowStockProducts.length} inventory alerts</strong>
                    <small>
                      {lowStockProducts.length
                        ? "Some products need restocking"
                        : "Stock levels look healthy"}
                    </small>
                  </span>
                  <span className="admin-shortcut-arrow">→</span>
                </button>
              </div>
            </section>
          </>
        )}

        {activeSection === "orders" && (
          <section className="admin-orders admin-orders-section">
            {selectedOrder ? (
              <div className="admin-order-detail-view">
                <div className="admin-orders-heading admin-detail-heading">
                  <div>
                    <button
                      type="button"
                      className="admin-back-button"
                      onClick={() => setSelectedOrderId(null)}
                    >
                      <span aria-hidden="true">←</span> Back to all orders
                    </button>
                    <p className="admin-eyebrow">ORDER DETAILS</p>
                    <h2>Order #{selectedOrder.id}</h2>
                    <p className="admin-muted">
                      Placed{" "}
                      {selectedOrder.createdAt
                        ? new Date(selectedOrder.createdAt).toLocaleString(
                            "en-IN",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )
                        : "Date unavailable"}
                    </p>
                  </div>
                  <span
                    className={`admin-status status-${String(selectedOrder.status).toLowerCase()}`}
                  >
                    {formatStatus(selectedOrder.status)}
                  </span>
                </div>

                <div className="admin-detail-grid">
                  <section className="admin-detail-card">
                    <div className="admin-detail-card-heading">
                      <span className="admin-detail-icon" aria-hidden="true">
                        ♙
                      </span>
                      <div>
                        <h3>Customer information</h3>
                        <p>Contact details for this order</p>
                      </div>
                    </div>
                    <dl className="admin-detail-list">
                      <div>
                        <dt>Full name</dt>
                        <dd>{selectedOrder.customerName || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Email</dt>
                        <dd>{selectedOrder.email || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Phone</dt>
                        <dd>{selectedOrder.phone || "Not provided"}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="admin-detail-card">
                    <div className="admin-detail-card-heading">
                      <span className="admin-detail-icon" aria-hidden="true">
                        ⌖
                      </span>
                      <div>
                        <h3>Delivery address</h3>
                        <p>Shipping destination</p>
                      </div>
                    </div>
                    <address className="admin-detail-address">
                      {selectedOrder.address || "Address not provided"}
                      {(selectedOrder.city || selectedOrder.state) && (
                        <>
                          <br />
                          {[selectedOrder.city, selectedOrder.state]
                            .filter(Boolean)
                            .join(", ")}
                        </>
                      )}
                      {selectedOrder.pincode && (
                        <>
                          <br />
                          PIN: {selectedOrder.pincode}
                        </>
                      )}
                    </address>
                  </section>
                </div>

                <section className="admin-detail-card admin-detail-items-card">
                  <div className="admin-detail-card-heading">
                    <span className="admin-detail-icon" aria-hidden="true">
                      ▤
                    </span>
                    <div>
                      <h3>Items ordered</h3>
                      <p>{selectedOrder.items?.length ?? 0} line items</p>
                    </div>
                  </div>
                  {selectedOrder.items?.length ? (
                    <div className="admin-detail-items-wrap">
                      <table className="admin-table admin-detail-items-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Unit price</th>
                            <th>Quantity</th>
                            <th>Line total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, index) => {
                            const itemName =
                              item.productName ??
                              item.name ??
                              `Product #${item.productId ?? "unknown"}`;
                            const unitPrice = Number(
                              item.price ?? item.unitPrice ?? 0,
                            );
                            const quantity = Number(
                              item.quantity ?? item.qty ?? 1,
                            );
                            return (
                              <tr
                                key={
                                  item.id ??
                                  `${item.productId ?? itemName}-${index}`
                                }
                              >
                                <td>
                                  <strong>{itemName}</strong>
                                  {item.productId != null && (
                                    <small>Product ID #{item.productId}</small>
                                  )}
                                </td>
                                <td>{formatCurrency(unitPrice)}</td>
                                <td>
                                  <span className="admin-quantity-pill">
                                    × {quantity}
                                  </span>
                                </td>
                                <td>
                                  <strong>
                                    {formatCurrency(unitPrice * quantity)}
                                  </strong>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="admin-empty">
                      No item details are available for this order.
                    </p>
                  )}
                </section>

                <div className="admin-detail-bottom-grid">
                  <section className="admin-detail-card admin-status-management">
                    <div className="admin-detail-card-heading">
                      <span className="admin-detail-icon" aria-hidden="true">
                        ↗
                      </span>
                      <div>
                        <h3>Order fulfilment</h3>
                        <p>Update the order as it moves through the store</p>
                      </div>
                    </div>
                    {(() => {
                      const terminal = ["DELIVERED", "CANCELLED"].includes(
                        selectedOrder.status,
                      );
                      return (
                        <>
                          <label htmlFor={`detail-status-${selectedOrder.id}`}>
                            Order status
                          </label>
                          <select
                            id={`detail-status-${selectedOrder.id}`}
                            value={selectedOrder.status}
                            disabled={
                              terminal || updatingId === selectedOrder.id
                            }
                            onChange={(event) =>
                              handleStatusChange(
                                selectedOrder.id,
                                event.target.value,
                              )
                            }
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {formatStatus(status)}
                              </option>
                            ))}
                          </select>
                          <p className="admin-detail-helper">
                            {terminal
                              ? "This order has reached a final status and can no longer be changed."
                              : updatingId === selectedOrder.id
                                ? "Saving status..."
                                : "Choose the next status available for this order."}
                          </p>
                        </>
                      );
                    })()}
                  </section>

                  <section className="admin-detail-card admin-order-total-card">
                    <div className="admin-detail-card-heading">
                      <span className="admin-detail-icon" aria-hidden="true">
                        ₹
                      </span>
                      <div>
                        <h3>Order summary</h3>
                        <p>Price breakdown</p>
                      </div>
                    </div>
                    <dl className="admin-total-list">
                      <div>
                        <dt>Subtotal</dt>
                        <dd>{formatCurrency(selectedOrder.subtotal)}</dd>
                      </div>
                      <div>
                        <dt>Discount</dt>
                        <dd className="admin-discount-value">
                          − {formatCurrency(selectedOrder.discount)}
                        </dd>
                      </div>
                      <div>
                        <dt>Shipping</dt>
                        <dd>{formatCurrency(selectedOrder.shipping)}</dd>
                      </div>
                      <div className="admin-total-grand">
                        <dt>Total</dt>
                        <dd>{formatCurrency(selectedOrder.total)}</dd>
                      </div>
                    </dl>
                  </section>
                </div>
              </div>
            ) : (
              <>
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
                    disabled={loadingOrders}
                  >
                    {loadingOrders ? "Refreshing..." : "Refresh orders"}
                  </button>
                </div>
                <div className="admin-filters">
                  {["ALL", ...STATUSES].map((status) => (
                    <button
                      type="button"
                      key={status}
                      className={filter === status ? "active" : ""}
                      onClick={() => setFilter(status)}
                    >
                      {status === "ALL" ? "All orders" : formatStatus(status)}
                    </button>
                  ))}
                </div>
                {loadingOrders && orders.length === 0 ? (
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
                          <th>Details</th>
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
                                <small>
                                  {order.items?.length ?? 0} line items
                                </small>
                              </td>
                              <td>
                                <strong>{order.customerName}</strong>
                                <small>{order.email}</small>
                              </td>
                              <td>
                                {order.createdAt
                                  ? new Date(
                                      order.createdAt,
                                    ).toLocaleDateString("en-IN")
                                  : "Not available"}
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
                                    handleStatusChange(
                                      order.id,
                                      event.target.value,
                                    )
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
                              <td>
                                <button
                                  type="button"
                                  className="admin-view-button"
                                  onClick={() => setSelectedOrderId(order.id)}
                                >
                                  View details <span aria-hidden="true">→</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {activeSection === "products" && (
          <section className="admin-orders admin-products">
            <div className="admin-orders-heading">
              <div>
                <h2>Products</h2>
                <p className="admin-muted">
                  Add teas, edit product details and manage stock.
                </p>
              </div>
              <div className="admin-product-actions">
                <button
                  className="admin-secondary"
                  onClick={loadProducts}
                  disabled={loadingProducts}
                >
                  {loadingProducts ? "Refreshing..." : "Refresh products"}
                </button>
                <button className="admin-primary" onClick={startAddProduct}>
                  + Add product
                </button>
              </div>
            </div>

            <div className="admin-product-search">
              <label htmlFor="admin-product-search">Search products</label>
              <input
                id="admin-product-search"
                type="search"
                placeholder="Search by name, category or ID..."
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
              />
            </div>

            {formOpen && (
              <form
                ref={productFormRef}
                className="admin-product-form"
                onSubmit={saveProduct}
              >
                <div className="admin-product-form-heading">
                  <div>
                    <h3>
                      {editingId !== null
                        ? `Edit product #${editingId}`
                        : "Add a product"}
                    </h3>
                    <p className="admin-muted">
                      For images, use a path such as /images/p101.png.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-secondary"
                    onClick={closeProductForm}
                    disabled={savingProduct}
                  >
                    Close
                  </button>
                </div>
                <div className="admin-product-form-grid">
                  <div className="admin-field">
                    <label htmlFor="product-name">Product name *</label>
                    <input
                      ref={productNameRef}
                      id="product-name"
                      name="name"
                      value={productForm.name}
                      onChange={changeProductField}
                      maxLength={150}
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="product-category">Category *</label>
                    <input
                      id="product-category"
                      name="category"
                      value={productForm.category}
                      onChange={changeProductField}
                      maxLength={50}
                      placeholder="Black, Green, Herbal, Gifts..."
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="product-price">Price (₹) *</label>
                    <input
                      id="product-price"
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={productForm.price}
                      onChange={changeProductField}
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="product-stock">Stock quantity *</label>
                    <input
                      id="product-stock"
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={productForm.stock}
                      onChange={changeProductField}
                      required
                    />
                  </div>
                  <div className="admin-field admin-field-wide">
                    <label htmlFor="product-image">Image path *</label>
                    <input
                      id="product-image"
                      name="image"
                      value={productForm.image}
                      onChange={changeProductField}
                      maxLength={500}
                      placeholder="/images/p101.png"
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="product-rating">Rating (0 to 5)</label>
                    <input
                      id="product-rating"
                      name="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={productForm.rating}
                      onChange={changeProductField}
                    />
                  </div>
                  <div className="admin-field">
                    <label htmlFor="product-reviews">Review count</label>
                    <input
                      id="product-reviews"
                      name="reviews"
                      type="number"
                      min="0"
                      step="1"
                      value={productForm.reviews}
                      onChange={changeProductField}
                    />
                  </div>
                  <div className="admin-field admin-field-wide">
                    <label htmlFor="product-description">Description</label>
                    <textarea
                      id="product-description"
                      name="description"
                      rows="4"
                      maxLength={5000}
                      value={productForm.description}
                      onChange={changeProductField}
                      placeholder="Describe the tea, flavour notes and origin..."
                    />
                  </div>
                </div>
                <div className="admin-product-form-footer">
                  <p className="admin-muted">Fields marked * are required.</p>
                  <button
                    className="admin-primary"
                    type="submit"
                    disabled={savingProduct}
                  >
                    {savingProduct
                      ? "Saving..."
                      : editingId !== null
                        ? "Save changes"
                        : "Create product"}
                  </button>
                </div>
              </form>
            )}

            {loadingProducts && products.length === 0 ? (
              <p className="admin-empty">Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="admin-empty">
                {products.length === 0
                  ? "No products found. Add your first product above."
                  : "No products match that search."}
              </p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-product-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Rating</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="admin-product-identity">
                            <img
                              src={product.image}
                              alt=""
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.visibility = "hidden";
                              }}
                            />
                            <div>
                              <strong>{product.name}</strong>
                              <small>ID #{product.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>
                          <div className="admin-stock-info">
                            <span>Stock: {product.stock}</span>

                            {Number(product.stock) === 0 ? (
                              <span className="admin-stock-badge out-of-stock">
                                Out of stock
                              </span>
                            ) : Number(product.stock) <= LOW_STOCK_THRESHOLD ? (
                              <span className="admin-stock-badge low-stock">
                                Low stock
                              </span>
                            ) : (
                              <span className="admin-stock-badge in-stock">
                                In stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {product.rating == null
                            ? "Not set"
                            : `${product.rating}/5`}
                          <small>{product.reviews ?? 0} reviews</small>
                        </td>
                        <td>
                          <button
                            className="admin-secondary"
                            onClick={() => startEditProduct(product)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteProduct(product)}
                            className="admin-delete-button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="admin-product-footnote">
              Tip: set stock to 0 to temporarily make a product unavailable.
              Products are not deleted, so order history stays intact.
            </p>
          </section>
        )}

        {activeSection === "inventory" && (
          <section className="admin-orders admin-inventory-section">
            <div className="admin-orders-heading">
              <div>
                <p className="admin-eyebrow">STOCK CONTROL</p>
                <h2>Inventory</h2>
                <p className="admin-muted">
                  Products with {LOW_STOCK_THRESHOLD} or fewer units are flagged
                  for review.
                </p>
              </div>
              <button
                type="button"
                className="admin-secondary"
                onClick={loadProducts}
                disabled={loadingProducts}
              >
                {loadingProducts ? "Refreshing..." : "Refresh inventory"}
              </button>
            </div>
            <div className="admin-inventory-summary">
              <div>
                <span>Products in catalogue</span>
                <strong>{products.length}</strong>
              </div>
              <div>
                <span>Low stock / out of stock</span>
                <strong
                  className={
                    lowStockProducts.length ? "admin-inventory-warning" : ""
                  }
                >
                  {lowStockProducts.length}
                </strong>
              </div>
              <div>
                <span>Healthy stock</span>
                <strong>{products.length - lowStockProducts.length}</strong>
              </div>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="admin-empty">
                All products have more than {LOW_STOCK_THRESHOLD} units in
                stock.
              </p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-product-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Inventory status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="admin-product-identity">
                            <img
                              src={product.image}
                              alt=""
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.visibility = "hidden";
                              }}
                            />
                            <div>
                              <strong>{product.name}</strong>
                              <small>ID #{product.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>
                          <strong>{product.stock}</strong>
                        </td>
                        <td>
                          <span
                            className={`admin-stock-badge ${Number(product.stock) === 0 ? "out-of-stock" : "low-stock"}`}
                          >
                            {Number(product.stock) === 0
                              ? "Out of stock"
                              : "Low stock"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-secondary"
                            onClick={() => {
                              navigateTo("products");
                              startEditProduct(product);
                            }}
                          >
                            Edit product
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="admin-product-footnote">
              Inventory changes are saved through the existing product editor.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

export default AdminDashboard;
