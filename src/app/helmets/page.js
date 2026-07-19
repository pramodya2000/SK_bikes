"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function HelmetsPage() {
  const [helmets, setHelmets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shop Contact Details for Inquiry
  const PHONE_NUMBER = "+94771234567"; 
  const WHATSAPP_NUMBER = "94771234567";

  useEffect(() => {
    async function fetchHelmets() {
      try {
        const { data, error } = await supabase.from("helmets").select("*");
        if (error) throw error;
        setHelmets(data || []);
      } catch (error) {
        console.error("Error fetching helmets: ", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHelmets();
  }, []);

  return (
    <main className="container" style={{ padding: "4rem 2rem", minHeight: "80vh" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", textAlign: "center" }}>Premium Safety Helmets</h1>
      
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading helmets...</p>
      ) : helmets.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>No helmets available at the moment. Please check back later.</p>
      ) : (
        <div className="category-grid">
          {helmets.map((helmet) => (
            <Link href={`/helmets/${helmet.id}`} key={helmet.id} className="card" style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
              <div 
                style={{ 
                  height: "200px",
                  backgroundImage: `url(${helmet.imageUrl || '/helmet_product.png'})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "#ffffff",
                  borderBottom: "1px solid var(--border)",
                  padding: "1rem"
                }}
              ></div>
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flexGrow: 1, backgroundColor: "var(--card-bg)" }}>
                <h3 style={{ fontSize: "1.15rem", marginBottom: "0.25rem", color: "var(--foreground)", lineHeight: "1.3" }}>{helmet.name}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>Model: {helmet.model}</p>
                
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <p style={{ color: "var(--primary)", fontWeight: "800", fontSize: "1.1rem", margin: 0 }}>Rs. {helmet.price}</p>
                  <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--secondary)", backgroundColor: "rgba(37, 99, 235, 0.1)", padding: "0.4rem 0.75rem", borderRadius: "20px", transition: "all 0.2s ease" }}>
                    View Details &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
