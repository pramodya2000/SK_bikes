"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bikes");
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", model: "", price: "", description: "", imageUrl: "", advancedDetails: "" });
  const [editId, setEditId] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchItems("bikes"); // default tab
      } else {
        router.push("/admin");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchItems = async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    } catch (error) {
      console.error("Error fetching items: ", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchItems(tab);
    resetForm();
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin");
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, activeTab, id));
      fetchItems(activeTab);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", model: "", price: "", description: "", imageUrl: "", advancedDetails: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDoc(doc(db, activeTab, editId), formData);
      } else {
        await addDoc(collection(db, activeTab), formData);
      }
      resetForm();
      fetchItems(activeTab);
    } catch (error) {
      console.error("Error saving item: ", error);
      alert("Error saving item. Check console.");
    }
  };

  if (loading) return <main style={{ padding: "4rem", textAlign: "center" }}>Loading...</main>;
  if (!user) return null;

  return (
    <main style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Sidebar */}
      <aside style={{ width: "250px", backgroundColor: "var(--card-bg)", borderRight: "1px solid var(--border)", padding: "2rem" }}>
        <h2 style={{ color: "var(--primary)", marginBottom: "3rem" }}>Admin Panel</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button 
            onClick={() => handleTabChange("bikes")}
            style={{ padding: "1rem", textAlign: "left", backgroundColor: activeTab === "bikes" ? "var(--primary)" : "transparent", color: activeTab === "bikes" ? "white" : "var(--foreground)", borderRadius: "8px", border: "1px solid var(--border)", fontWeight: "600" }}
          >
            Manage Bikes
          </button>
          <button 
            onClick={() => handleTabChange("helmets")}
            style={{ padding: "1rem", textAlign: "left", backgroundColor: activeTab === "helmets" ? "var(--primary)" : "transparent", color: activeTab === "helmets" ? "white" : "var(--foreground)", borderRadius: "8px", border: "1px solid var(--border)", fontWeight: "600" }}
          >
            Manage Helmets
          </button>
          <button 
            onClick={handleLogout}
            style={{ padding: "1rem", textAlign: "left", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fca5a5", fontWeight: "600", marginTop: "auto" }}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "3rem", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
          <h1 style={{ textTransform: "capitalize" }}>Manage {activeTab}</h1>
          {!isEditing && <button onClick={() => setIsEditing(true)} className="btn-primary">+ Add New</button>}
        </div>

        {isEditing ? (
          <div className="card" style={{ padding: "2rem" }}>
            <h2 style={{ marginBottom: "2rem" }}>{editId ? "Edit" : "Add New"} {activeTab === "bikes" ? "Bike" : "Helmet"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }} required />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Model</label>
                  <input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }} required />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Price (Rs.)</label>
                  <input type="text" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }} required />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Image URL</label>
                  <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }} required></textarea>
              </div>

              {activeTab === "bikes" && (
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Advanced Details</label>
                  <textarea value={formData.advancedDetails} onChange={(e) => setFormData({...formData, advancedDetails: e.target.value})} rows="4" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" }}></textarea>
                </div>
              )}

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" onClick={resetForm} className="btn-secondary" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {items.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No items found. Click 'Add New' to create one.</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="card" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ marginBottom: "0.25rem" }}>{item.name} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "normal" }}>({item.model})</span></h3>
                    <p style={{ color: "var(--primary)", fontWeight: "600" }}>Rs. {item.price}</p>
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={() => handleEdit(item)} style={{ padding: "0.5rem 1rem", backgroundColor: "#e0f2fe", color: "#0369a1", borderRadius: "6px", fontWeight: "600" }}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: "0.5rem 1rem", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "6px", fontWeight: "600" }}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
