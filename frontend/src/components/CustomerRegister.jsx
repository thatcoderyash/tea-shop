import { useState, useEffect } from "react";
import API_BASE_URL from "../api";

function CustomerRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("customer-token");

    if (!token) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect");

    const destination =
      redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
        ? redirectTo
        : "/";

    window.location.replace(destination);
  }, []);

  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      // Step 1: Create the customer account
      const registerResponse = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        },
      );

      const registerData = await registerResponse.text();

      if (!registerResponse.ok) {
        throw new Error(registerData || "Registration failed");
      }

      // Step 2: Log in using the newly created credentials
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok || !loginData.accessToken) {
        throw new Error(
          "Account created, but automatic login failed. Please sign in.",
        );
      }

      // Step 3: Save the customer session
      localStorage.setItem("customer-token", loginData.accessToken);

      window.dispatchEvent(new Event("customer-auth-change"));

      // Step 4: Redirect to requested page or storefront
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
        <h2>Create Your Account</h2>
        <p>Join Mistvale Tea Co.</p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (at least 8 characters)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={72}
            required
          />

          {message && <p className="auth-success">{message}</p>}
          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default CustomerRegister;
