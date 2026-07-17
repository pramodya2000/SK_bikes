"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Don't show public navbar on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header style={{ 
      position: "sticky", 
      top: 0, 
      zIndex: 100, 
      backgroundColor: "var(--background)",
      borderBottom: "1px solid var(--border)",
      padding: "1rem 2rem"
    }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>
          SK Bikes
        </Link>
        <nav style={{ display: "flex", gap: "2rem" }}>
          <Link href="/" style={{ color: pathname === "/" ? "var(--primary)" : "var(--foreground)" }}>Home</Link>
          <Link href="/bikes" style={{ color: pathname?.startsWith("/bikes") ? "var(--primary)" : "var(--foreground)" }}>Bikes</Link>
          <Link href="/helmets" style={{ color: pathname?.startsWith("/helmets") ? "var(--primary)" : "var(--foreground)" }}>Helmets</Link>
          <Link href="/about" style={{ color: pathname === "/about" ? "var(--primary)" : "var(--foreground)" }}>About Us</Link>
          <Link href="/contact" style={{ color: pathname === "/contact" ? "var(--primary)" : "var(--foreground)" }}>Contact Us</Link>
        </nav>
      </div>
    </header>
  );
}
