import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PulseWatchLogo } from "../components/PulseWatchLogo";
import { useAuth } from "../state/AuthContext";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      navigate("/");
    } catch {
      setError("Authentication failed. Check your credentials and try again.");
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="auth-brand">
          <PulseWatchLogo />
          <div>
            <p className="eyebrow">Real-Time Monitoring Platform</p>
            <h1>PulseWatch</h1>
          </div>
        </div>
        <h2 className="auth-tagline">Real-time event intelligence with live streaming insights.</h2>
        <p>
          Monitor incident traffic, detect threshold alerts, and explore analytics in a polished SaaS
          dashboard.
        </p>
      </section>
      <form className="auth-card" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">{mode === "login" ? "Welcome back" : "Create account"}</p>
          <h2>{mode === "login" ? "Sign in to PulseWatch" : "Launch your workspace"}</h2>
        </div>
        {mode === "register" && (
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        )}
        <input
          placeholder="Email address"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit">{mode === "login" ? "Sign In" : "Create Account"}</button>
        <button type="button" className="ghost-button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Need an account? Register" : "Have an account? Sign in"}
        </button>
      </form>
    </main>
  );
};
