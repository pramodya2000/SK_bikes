import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SK Bikes | Premium Motorcycles & Helmets",
  description: "Your premium destination for high-quality motorcycles and safety gear in Sri Lanka.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
