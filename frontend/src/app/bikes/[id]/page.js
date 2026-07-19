"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function BikeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);

  // Shop Contact Details
  const PHONE_NUMBER = "+94771234567"; // Replace with actual shop number
  const WHATSAPP_NUMBER = "94771234567"; // No '+' for WhatsApp link

  useEffect(() => {
    async function fetchBike() {
      if (!params.id) return;
      try {
        const { data, error } = await supabase.from("bikes").select("*").eq("id", params.id).single();
        if (error) {
          if (error.code === 'PGRST116') {
            console.log("No such document!");
            setBike(null);
          } else {
            throw error;
          }
        } else {
          setBike(data);
        }
      } catch (error) {
        console.error("Error fetching bike details: ", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBike();
  }, [params.id]);

  if (loading) {
    return <main className="container" style={{ padding: "4rem 2rem", textAlign: "center" }}><p>Loading details...</p></main>;
  }

  if (!bike) {
    return (
      <main className="container" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2>Motorcycle Not Found</h2>
        <p>The motorcycle you are looking for does not exist.</p>
        <Link href="/bikes" className="text-link">&larr; Back to Motorcycles</Link>
      </main>
    );
  }

  const whatsappMessage = encodeURIComponent(`Hi, I am interested in the motorcycle: ${bike.name} (${bike.model}). Please provide more details.`);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
  const phoneUrl = `tel:${PHONE_NUMBER}`;

  return (
    <main className="container" style={{ padding: "4rem 2rem" }}>
      <Link href="/bikes" className="text-link" style={{ display: "inline-block", marginBottom: "2rem" }}>&larr; Back to Motorcycles</Link>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
        {/* Bike Image */}
        <div style={{ borderRadius: "12px", overflow: "hidden", height: "400px", backgroundColor: "var(--card-bg)" }}>
           <div 
             style={{ 
               width: "100%", 
               height: "100%", 
               backgroundImage: `url(${bike.imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})`,
               backgroundSize: "cover",
               backgroundPosition: "center"
             }}
           ></div>
        </div>

        {/* Bike Details */}
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{bike.name}</h1>
          <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Model: {bike.model}</p>
          <p style={{ fontSize: "2rem", color: "var(--primary)", fontWeight: "bold", marginBottom: "2rem" }}>Rs. {bike.price}</p>
          
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Description</h3>
            <p style={{ lineHeight: "1.8" }}>{bike.description || "No description provided."}</p>
          </div>
          
          {bike.advancedDetails && (
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>Advanced Specifications</h3>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>{bike.advancedDetails}</p>
            </div>
          )}

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
