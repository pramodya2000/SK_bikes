"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function HelmetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [helmet, setHelmet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Shop Contact Details
  const PHONE_NUMBER = "+94771234567"; // Replace with actual shop number
  const WHATSAPP_NUMBER = "94771234567"; // No '+' for WhatsApp link

  useEffect(() => {
    async function fetchHelmet() {
      if (!params.id) return;
      try {
        const { data, error } = await supabase.from("helmets").select("*").eq("id", params.id).single();
        if (error) {
          if (error.code === 'PGRST116') {
            console.log("No such document!");
            setHelmet(null);
          } else {
            throw error;
          }
        } else {
          setHelmet(data);
        }
      } catch (error) {
        console.error("Error fetching helmet details: ", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHelmet();
  }, [params.id]);

  if (loading) {
    return <main className="container" style={{ padding: "4rem 2rem", textAlign: "center" }}><p>Loading details...</p></main>;
  }

  if (!helmet) {
    return (
      <main className="container" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2>Helmet Not Found</h2>
        <p>The helmet you are looking for does not exist.</p>
        <Link href="/helmets" className="text-link">&larr; Back to Helmets</Link>
      </main>
    );
  }

  const whatsappMessage = encodeURIComponent(`Hi, I am interested in the helmet: ${helmet.name} (${helmet.model}). Please provide more details.`);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
  const phoneUrl = `tel:${PHONE_NUMBER}`;

  return (
    <main className="container" style={{ padding: "4rem 2rem" }}>
      <Link href="/helmets" className="text-link" style={{ display: "inline-block", marginBottom: "2rem" }}>&larr; Back to Helmets</Link>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
        {/* Helmet Image */}
        <div style={{ borderRadius: "12px", overflow: "hidden", height: "400px", backgroundColor: "#ffffff", border: "1px solid var(--border)", display: "flex", justifyContent: "center", alignItems: "center" }}>
           <div 
             style={{ 
               width: "90%", 
               height: "90%", 
               backgroundImage: `url(${helmet.imageUrl || '/helmet_product.png'})`,
               backgroundSize: "contain",
               backgroundPosition: "center",
               backgroundRepeat: "no-repeat"
             }}
           ></div>
        </div>

        {/* Helmet Details */}
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{helmet.name}</h1>
          <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Model: {helmet.model}</p>
          <p style={{ fontSize: "2rem", color: "var(--primary)", fontWeight: "bold", marginBottom: "2rem" }}>Rs. {helmet.price}</p>
          
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Description</h3>
            <p style={{ lineHeight: "1.8" }}>{helmet.description || "No description provided."}</p>
          </div>

          {/* Inquiry Buttons */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "3rem" }}>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ backgroundColor: "#25D366", color: "#fff", textDecoration: "none" }}>
              Inquire via WhatsApp
            </a>
            <a href={phoneUrl} className="btn-secondary" style={{ textDecoration: "none" }}>
              Call Us ({PHONE_NUMBER})
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
