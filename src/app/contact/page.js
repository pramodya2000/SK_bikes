export default function ContactPage() {
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
              <p style={{ color: "var(--text-muted)" }}>123 Bike Lane, Colombo, Sri Lanka</p>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ marginBottom: "0.25rem" }}>Phone:</h4>
              <p style={{ color: "var(--text-muted)" }}>+94 77 123 4567</p>
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ marginBottom: "0.25rem" }}>Email:</h4>
              <p style={{ color: "var(--text-muted)" }}>info@skbikes.lk</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card" style={{ padding: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem", color: "var(--primary)" }}>Send a Message</h2>
          <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Name</label>
              <input type="text" id="name" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }} placeholder="Your Name" required />
            </div>
            
            <div>
              <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Email</label>
              <input type="email" id="email" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }} placeholder="your.email@example.com" required />
            </div>
            
            <div>
              <label htmlFor="message" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Message</label>
              <textarea id="message" rows="5" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", resize: "vertical" }} placeholder="How can we help you?" required></textarea>
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }}>Send Message</button>
          </form>
        </div>
      </div>
    </main>
  );
}
