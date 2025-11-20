import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../App.css";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      navigate("/", { replace: true });
      return;
    }
    setInfo("Please check your email to confirm your registration.");
  };

  return (
    <div className="login-container">
      <section className="login-left">
        <div className="login-left-inner">
          <h1>Create your BUTDA account</h1>
          <p>
            Sign up to access personalized news and AI-powered summaries.
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
          <h3>Create a new account</h3>
          <form onSubmit={handleRegister}>
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
            <button type="submit">Sign up</button>
          </form>
          {error && <p className="message-body" style={{ color: "#b00020" }}>{error}</p>}
          {info && <p className="message-body" style={{ color: "#1d7a00" }}>{info}</p>}
          <p className="signup-hint">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}