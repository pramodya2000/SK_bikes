"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Don't show public footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer style={{ 
      backgroundColor: "var(--card-bg)",
      borderTop: "1px solid var(--border)",
      padding: "3rem 2rem 1.5rem",
      marginTop: "auto"
    }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
        <div>
          <h3 style={{ color: "var(--primary)", marginBottom: "1rem" }}>SK Bikes</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Your premium destination for high-quality motorcycles and safety gear in Sri Lanka.
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: "1rem" }}>Quick Links</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-muted)" }}>
            <li><a href="/bikes">All Motorcycles</a></li>
            <li><a href="/helmets">Helmets</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/admin" style={{ color: "var(--primary)" }}>Admin Login</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: "1rem" }}>Contact</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-muted)" }}>
            <li>+94 77 123 4567</li>
            <li>info@skbikes.lk</li>
            <li>123 Motorcycle Lane, Colombo</li>
          </ul>
        </div>
      </div>
      <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
        &copy; {new Date().getFullYear()} SK Bikes. All rights reserved.
      </div>
    </footer>
  );
}







