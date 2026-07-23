"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/admin/dashboard");
      } else {
        setLoading(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push("/admin/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Failed to login. Please check your credentials.");
      console.error(err);
    }
  };

  if (loading) return <main className="container" style={{ padding: "4rem 2rem", textAlign: "center" }}><p>Loading...</p></main>;

  return (
    <main className="container" style={{ padding: "2rem 1rem", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="card admin-login-card" style={{ padding: "3rem", width: "100%", maxWidth: "450px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "var(--primary)", fontSize: "1.8rem" }}>Admin Login</h1>
        
        {error && <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }} 
              required 
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: "1rem", width: "100%", textAlign: "center" }}>Login</button>
        </form>
      </div>
    </main>
  );
}
