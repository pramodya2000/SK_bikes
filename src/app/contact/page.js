"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      if (!supabase) {
        throw new Error("Supabase connection is not initialized. Please check environment variables.");
      }

      // Save message to Supabase 'messages' table
      const { error: insertError } = await supabase
        .from("messages")
        .insert([{
          name: formData.name,
          email: formData.email,
          message: formData.message,
          status: "unread"
        }]);

      if (insertError) {
        console.error("Supabase insert error details:", insertError);
        if (insertError.code === '42P01' || insertError.message?.includes('does not exist')) {
          throw new Error("Supabase 'messages' table not created. Please run the SQL script in Supabase SQL Editor.");
        }
        throw new Error(insertError.message || insertError.details || "Database insert failed.");
      }

      // Also save to LocalStorage backup so messages are never lost
      try {
        const localMsgs = JSON.parse(localStorage.getItem("sk_contact_messages") || "[]");
        localMsgs.unshift({
          id: 'local_' + Date.now(),
          name: formData.name,
          email: formData.email,
          message: formData.message,
          status: "unread",
          created_at: new Date().toISOString()
        });
        localStorage.setItem("sk_contact_messages", JSON.stringify(localMsgs));
      } catch (e) {
        // ignore storage errors
      }

      setSuccess(true);
      alert("🎉 Success! Your message has been sent to SK Bikes.");
      setFormData({ name: "", email: "", message: "" });

    } catch (err) {
      console.error("Error sending message:", err);
      const msg = err?.message || "Failed to send message. Please try again.";
      setError(msg);
      alert("⚠️ Error: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ padding: "4rem 2rem", minHeight: "80vh" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "3rem", textAlign: "center" }}>Contact Us</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
        {/* Contact Info */}
        <div>
          <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Get in Touch</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              We are here to answer any questions you may have about our bikes, helmets, or services. Reach out to us and we'll respond as soon as we can.
            </p>
            
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ marginBottom: "0.25rem" }}>Address:</h4>
              <p style={{ color: "var(--text-muted)" }}>123 Motorcycle Lane, Colombo, Sri Lanka</p>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ marginBottom: "0.25rem" }}>Phone:</h4>
              <p style={{ color: "var(--text-muted)" }}>+94 77 123 4567</p>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ marginBottom: "0.25rem" }}>Email:</h4>
              <p style={{ color: "var(--text-muted)" }}>skbikekurunegala@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card" style={{ padding: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem", color: "var(--primary)" }}>Send a Message</h2>
          
          {success && (
            <div style={{ backgroundColor: "#dcfce7", color: "#15803d", padding: "1.25rem", borderRadius: "8px", marginBottom: "1.5rem", fontWeight: "600", border: "1px solid #86efac" }}>
              🎉 Thank you! Your message has been sent successfully. We will get back to you soon.
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "1.25rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid #fca5a5" }}>
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Name</label>
              <input 
                type="text" 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }} 
                placeholder="Your Name" 
                required 
              />
            </div>
            
            <div>
              <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Email</label>
              <input 
                type="email" 
                id="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }} 
                placeholder="your.email@example.com" 
                required 
              />
            </div>
            
            <div>
              <label htmlFor="message" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Message</label>
              <textarea 
                id="message" 
                rows="5" 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", resize: "vertical" }} 
                placeholder="How can we help you?" 
                required
              ></textarea>
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem", opacity: loading ? 0.7 : 1, width: "100%", padding: "0.85rem" }}>
              {loading ? "⌛ Sending message..." : "✉️ Send Message"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
