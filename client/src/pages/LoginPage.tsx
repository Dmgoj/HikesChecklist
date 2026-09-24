import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../api/authApi";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/useAuth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await loginRequest(email, password);
      login(result.token, result.email);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? "Invalid email or password." : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: "80px auto", padding: "0 24px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 28 }}>
        Log in
      </h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "var(--color-danger)", margin: 0, fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: "14px 0", fontSize: 14 }}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
