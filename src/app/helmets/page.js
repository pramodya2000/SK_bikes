"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HelmetsPage() {
  const [helmets, setHelmets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shop Contact Details for Inquiry
  const PHONE_NUMBER = "+94771234567"; 
  const WHATSAPP_NUMBER = "94771234567";

  useEffect(() => {
    async function fetchHelmets() {
      try {
        const querySnapshot = await getDocs(collection(db, "helmets"));
        const helmetsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHelmets(helmetsData);
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
          {helmets.map((helmet) => {
            const whatsappMessage = encodeURIComponent(`Hi, I am interested in the helmet: ${helmet.name} (${helmet.model}). Please provide more details.`);
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
            
            return (
              <div key={helmet.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
                <div 
                  className="card-image-placeholder" 
                  style={{ backgroundImage: `url(${helmet.imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})` }}
                ></div>
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <h3>{helmet.name}</h3>
                  <p style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "0.5rem" }}>Rs. {helmet.price}</p>
                  <p style={{ marginBottom: "1rem" }}>Model: {helmet.model}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", flexGrow: 1 }}>{helmet.description}</p>
                  
                  <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ backgroundColor: "#25D366", color: "#fff", textDecoration: "none", flex: 1, textAlign: "center", fontSize: "0.9rem", padding: "0.5rem" }}>
                      WhatsApp
                    </a>
                    <a href={`tel:${PHONE_NUMBER}`} className="btn-secondary" style={{ textDecoration: "none", flex: 1, textAlign: "center", fontSize: "0.9rem", padding: "0.5rem" }}>
                      Call
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
