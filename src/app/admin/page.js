"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/admin/dashboard");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      setError("Failed to login. Please check your credentials.");
      console.error(err);
    }
  };

  if (loading) return <main className="container" style={{ padding: "4rem 2rem", textAlign: "center" }}><p>Loading...</p></main>;

  return (
    <main className="container" style={{ padding: "4rem 2rem", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="card" style={{ padding: "3rem", width: "100%", maxWidth: "450px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "var(--primary)" }}>Admin Login</h1>
        
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
          <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }}>Login</button>
        </form>
      </div>
    </main>
  );
}
