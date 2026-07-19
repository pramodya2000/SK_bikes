"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function BikesPage() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBikes() {
      try {
        const { data, error } = await supabase.from("bikes").select("*");
        if (error) throw error;
        setBikes(data || []);
      } catch (error) {
        console.error("Error fetching bikes: ", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBikes();
  }, []);

  return (
    <main className="container" style={{ padding: "4rem 2rem", minHeight: "80vh" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", textAlign: "center" }}>Our Premium Motorcycles</h1>
      
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading motorcycles...</p>
      ) : bikes.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>No motorcycles available at the moment. Please check back later.</p>
      ) : (
        <div className="category-grid">
          {bikes.map((bike) => (
            <Link href={`/bikes/${bike.id}`} key={bike.id} className="card" style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
              <div 
                style={{ 
                  height: "200px", 
                  backgroundImage: `url(${bike.imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "#ffffff",
                  borderBottom: "1px solid var(--border)",
                  padding: "1rem"
                }}
              ></div>
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flexGrow: 1, backgroundColor: "var(--card-bg)" }}>
                <h3 style={{ fontSize: "1.15rem", marginBottom: "0.25rem", color: "var(--foreground)", lineHeight: "1.3" }}>{bike.name}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>Model: {bike.model}</p>
                
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <p style={{ color: "var(--primary)", fontWeight: "800", fontSize: "1.1rem", margin: 0 }}>Rs. {bike.price}</p>
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
