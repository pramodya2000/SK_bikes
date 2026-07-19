import Link from 'next/link';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1>Experience the Ultimate Ride</h1>
          <p>Discover premium motorcycles and accessories tailored for every journey.</p>
          <div className="hero-buttons">
            <Link href="/bikes" className="btn-primary">Explore Motorcycles</Link>
            <Link href="/contact" className="btn-secondary">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="featured container">
        <h2>Featured Categories</h2>
        <div className="home-categories">
          <Link href="/bikes" className="card category-card">
            <div className="card-image-placeholder bikes-bg"></div>
            <h3>Premium Motorcycles</h3>
            <p>From high-performance sports bikes to everyday commuters, find your perfect match.</p>
          </Link>
          <Link href="/helmets" className="card category-card">
            <div className="card-image-placeholder helmets-bg"></div>
            <h3>Safety Helmets</h3>
            <p>Top-tier protection without compromising on style.</p>
          </Link>
        </div>
      </section>

      {/* About Teaser */}
      <section className="about-teaser container">
        <div className="glass p-8 rounded-lg">
          <h2>Why Choose SK Bikes?</h2>
          <p>
            With years of experience and a passion for riding, we bring you only the best. 
            Our expert team is here to help you gear up for your next adventure.
          </p>
          <Link href="/about" className="text-link">Read our story &rarr;</Link>
        </div>
      </section>
    </main>
  );
}
