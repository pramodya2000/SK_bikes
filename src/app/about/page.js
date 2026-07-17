export default function AboutPage() {
  return (
    <main className="container" style={{ padding: "4rem 2rem", minHeight: "80vh" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", textAlign: "center" }}>About SK Bikes</h1>
        
        <div className="card" style={{ padding: "3rem", marginBottom: "3rem" }}>
          <h2 style={{ marginBottom: "1.5rem", color: "var(--primary)" }}>Our Story</h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "1.5rem" }}>
            Founded with a passion for cycling, SK Bikes has grown into a premier destination for cycling enthusiasts. 
            We believe that a bicycle is more than just a mode of transportation; it's a lifestyle, a fitness journey, and a way to connect with the world.
          </p>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.8" }}>
            Our mission is to provide the highest quality bicycles, helmets, and gear to riders of all levels. Whether you are a daily commuter, a weekend warrior, or a professional racer, we have the perfect ride for you.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Quality Guaranteed</h3>
            <p>Every product we sell undergoes strict quality checks to ensure your safety and satisfaction.</p>
          </div>
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Expert Advice</h3>
            <p>Our team consists of passionate cyclists who are always ready to guide you to the right purchase.</p>
          </div>
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Customer First</h3>
            <p>We pride ourselves on exceptional after-sales service and long-term customer relationships.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
