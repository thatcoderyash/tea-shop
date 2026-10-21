import { useState, useEffect } from "react";

function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("customer-token");

    if (!token) {
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/customer/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("customer-token");
          return;
        }

        if (!response.ok) {
          console.error("Profile request failed:", response.status);
          return;
        }

        const customerProfile = await response.json();
        setProfile(customerProfile);

        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get("redirect");

        const destination =
          redirectTo &&
          redirectTo.startsWith("/") &&
          !redirectTo.startsWith("//")
            ? redirectTo
            : "/";

        window.location.href = destination;
      } catch (error) {
        console.error("Could not restore customer session:", error);
      }
    };

    loadProfile();
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      localStorage.setItem("customer-token", data.accessToken);
      window.dispatchEvent(new Event("customer-auth-change"));

      const profileResponse = await fetch(
        "http://localhost:8080/api/customer/profile",
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        },
      );

      if (!profileResponse.ok) {
        throw new Error("Login succeeded, but profile could not be loaded.");
      }

      const customerProfile = await profileResponse.json();
      setProfile(customerProfile);

      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect");

      const destination =
        redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : "/";

      window.location.href = destination;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-auth-page">
      <div className="customer-auth-card">
        <a className="back-to-storefront" href="/">
          ← Back to Store
        </a>
        <>
          <h2>Welcome Back</h2>
          <p>Login to your Mistvale Tea Co. account</p>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p>
            Don't have an account? <a href="/register">Create account</a>
          </p>
        </>
      </div>
    </div>
  );
}

export default CustomerLogin;
