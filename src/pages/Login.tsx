import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../App.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="login-container">
      <section className="login-left">
        <div className="login-left-inner">
          <h1>Stay Informed with BUTDA</h1>
          <p>
            Your personal AI assistant for staying up-to-date with the latest
            news and developments.
          </p>
          <div className="feature-grid">
            {[
              { icon: "📰", title: "Personalized News Digests" },
              { icon: "🤖", title: "AI-Powered Summaries" },
              { icon: "⚡", title: "Real-time Updates" },
              { icon: "🛡️", title: "Trusted Sources" }
            ].map((card) => (
              <article key={card.title} className="feature-card">
                <span className="feature-icon">{card.icon}</span>
                <p>{card.title}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="login-right">
        <div className="login-card">
          <div className="brand-badge">
            <img src="/logo.png" alt="BUTDA Logo" />
            <h2>BUTDA</h2>
            <p>Being-up-to-date Assistant</p>
          </div>
          <h3>Sign in to your account</h3>
          <form onSubmit={handleLogin}>
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
            <button type="submit">Sign in</button>
          </form>
          {error && <p className="message-body" style={{ color: "#b00020" }}>{error}</p>}
          <p className="signup-hint">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </section>
    </div>
  );
}