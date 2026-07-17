"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BikesPage() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBikes() {
      try {
        const querySnapshot = await getDocs(collection(db, "bikes"));
        const bikesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBikes(bikesData);
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
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", textAlign: "center" }}>Our Premium Bikes</h1>
      
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading bikes...</p>
      ) : bikes.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>No bikes available at the moment. Please check back later.</p>
      ) : (
        <div className="category-grid">
          {bikes.map((bike) => (
            <Link href={`/bikes/${bike.id}`} key={bike.id} className="card">
              <div 
                className="card-image-placeholder" 
                style={{ backgroundImage: `url(${bike.imageUrl || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})` }}
              ></div>
              <div style={{ padding: "1.5rem" }}>
                <h3>{bike.name}</h3>
                <p style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "0.5rem" }}>Rs. {bike.price}</p>
                <p style={{ marginBottom: "0" }}>Model: {bike.model}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
