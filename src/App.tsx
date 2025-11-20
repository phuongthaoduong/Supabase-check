import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { supabase } from "./supabaseClient";
import type { Session } from "@supabase/supabase-js";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import "./App.css";

function RequireAuth(props: { session: Session | null }) {
  if (!props.session) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireAuth session={session} />}>
          <Route path="/" element={<Main />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
