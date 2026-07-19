"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  const links = [
    { href: "/", label: "Home" },
    { href: "/bikes", label: "Motorcycles" },
    { href: "/helmets", label: "Helmets" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      backgroundColor: "var(--background)",
      borderBottom: "1px solid var(--border)",
      padding: "1rem 2rem"
    }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo */}
        <Link href="/" style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>
          SK Bikes
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ display: "flex", gap: "2rem" }}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{ color: isActive(link.href) ? "var(--primary)" : "var(--foreground)", fontWeight: isActive(link.href) ? "600" : "400" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger Button (mobile only) */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{
            display: "none", flexDirection: "column", gap: "5px",
            background: "none", border: "none", cursor: "pointer", padding: "4px"
          }}
        >
          <span style={{ display: "block", width: "24px", height: "2px", backgroundColor: "var(--foreground)", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ display: "block", width: "24px", height: "2px", backgroundColor: "var(--foreground)", transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: "24px", height: "2px", backgroundColor: "var(--foreground)", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)",
          padding: "1rem 2rem", display: "flex", flexDirection: "column", gap: "1rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
        }}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: isActive(link.href) ? "var(--primary)" : "var(--foreground)",
                fontWeight: isActive(link.href) ? "700" : "500",
                fontSize: "1.1rem", padding: "0.5rem 0",
                borderBottom: "1px solid var(--border)"
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
