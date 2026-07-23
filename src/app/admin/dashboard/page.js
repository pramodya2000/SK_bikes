"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bikes");
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dbTableError, setDbTableError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", model: "", price: "", description: "", imageUrl: "", advancedDetails: "" });
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [fullSizeImage, setFullSizeImage] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const fileInputRef = useRef(null);
  
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        fetchItems("bikes");
      } else {
        router.push("/admin");
      }
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        router.push("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchItems = async (collectionName) => {
    try {
      if (collectionName === "messages") {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Messages query error:", error);
          setDbTableError(true);
          setItems([]);
          setUnreadCount(0);
          return;
        }

        setDbTableError(false);
        setItems(data || []);
        const unread = (data || []).filter(m => m.status === 'unread').length;
        setUnreadCount(unread);
        return;
      }

      // Bikes and Helmets
      const { data, error } = await supabase.from(collectionName).select("*");
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items: ", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchItems(tab);
    resetForm();
    setExpandedId(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const { error } = await supabase.from(activeTab).delete().eq('id', id);
      if (error) console.error("Error deleting item:", error);
      else fetchItems(activeTab);
    }
  };

  const toggleMessageStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "read" ? "unread" : "read";

    const { error } = await supabase.from("messages").update({ status: newStatus }).eq("id", id);
    if (error) {
      console.error("Error updating message status:", error);
    } else {
      fetchItems("messages");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", model: "", price: "", description: "", imageUrl: "", advancedDetails: "" });
    setIsEditing(false);
    setEditId(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
    setIsEditing(true);
    setImagePreview(item.imageUrl || null);
  };

  // Handle image file upload to Supabase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${activeTab}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imageUrl: data.publicUrl }));
      setImagePreview(data.publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed: " + (error.message || JSON.stringify(error)));
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Strip id/created_at from data before saving
      const { id, created_at, ...cleanData } = formData;
      
      // The 'helmets' table doesn't have an advancedDetails column
      if (activeTab === "helmets") {
        delete cleanData.advancedDetails;
      }

      if (editId) {
        // UPDATE existing item
        const { error } = await supabase.from(activeTab).update(cleanData).eq('id', editId);
        if (error) throw error;
      } else {
        // INSERT new item
        const { error } = await supabase.from(activeTab).insert([cleanData]);
        if (error) throw error;
      }
      resetForm();
      fetchItems(activeTab);
    } catch (error) {
      console.error("Error saving item: ", error);
      const msg = error?.message || error?.details || JSON.stringify(error);
      alert("Error: " + msg);
    }
  };

  if (loading) return <main style={{ padding: "4rem", textAlign: "center" }}>Loading...</main>;
  if (!user) return null;

  const inputStyle = { width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)" };

  const sqlScriptText = `CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON messages;
DROP POLICY IF EXISTS "Allow authenticated read" ON messages;
DROP POLICY IF EXISTS "Allow authenticated update" ON messages;
DROP POLICY IF EXISTS "Allow authenticated delete" ON messages;

CREATE POLICY "Allow public insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read" ON messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON messages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON messages FOR DELETE USING (auth.role() = 'authenticated');`;

  return (
    <main className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-header">Admin Panel</h2>
        <nav className="admin-sidebar-nav">
          <button 
            onClick={() => handleTabChange("bikes")}
            className={`admin-sidebar-btn ${activeTab === "bikes" ? "active" : ""}`}
          >
            🏍️ Manage Motorcycles
          </button>
          <button 
            onClick={() => handleTabChange("helmets")}
            className={`admin-sidebar-btn ${activeTab === "helmets" ? "active" : ""}`}
          >
            🪖 Manage Helmets
          </button>
          <button 
            onClick={() => handleTabChange("messages")}
            className={`admin-sidebar-btn ${activeTab === "messages" ? "active" : ""}`}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <span>📩 Customer Messages</span>
            {unreadCount > 0 && (
              <span style={{ backgroundColor: "#ef4444", color: "white", borderRadius: "9999px", padding: "0.15rem 0.5rem", fontSize: "0.75rem", fontWeight: "bold" }}>
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={handleLogout}
            className="admin-logout-btn"
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 style={{ textTransform: "capitalize" }}>
            {activeTab === "messages" ? "Customer Messages" : `Manage ${activeTab}`}
          </h1>
          {activeTab !== "messages" && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-primary">+ Add New</button>
          )}
        </div>

        {/* MESSAGES TAB */}
        {activeTab === "messages" ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {dbTableError && (
              <div style={{ backgroundColor: "#fff7ed", border: "2px dashed #f97316", padding: "1.5rem", borderRadius: "12px", color: "#c2410c", marginBottom: "1rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#c2410c", fontSize: "1.2rem" }}>
                  ⚠️ Supabase 'messages' Table Missing in Database!
                </h3>
                <p style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", lineHeight: "1.5" }}>
                  Your Supabase cloud database does not have the <code>messages</code> table yet. 
                  Copy the SQL script below and paste it into your <strong>Supabase Dashboard → SQL Editor → Run</strong> to enable message saving:
                </p>
                <textarea 
                  readOnly 
                  rows={8} 
                  value={sqlScriptText}
                  style={{ width: "100%", padding: "0.85rem", fontFamily: "monospace", fontSize: "0.85rem", borderRadius: "8px", border: "1px solid #fed7aa", backgroundColor: "#fff" }}
                />
                <button 
                  onClick={() => { navigator.clipboard.writeText(sqlScriptText); alert("📋 SQL Script copied to clipboard! Paste and Run it in Supabase SQL Editor."); }}
                  className="btn-primary" 
                  style={{ marginTop: "1rem", fontSize: "0.9rem", padding: "0.6rem 1.25rem" }}
                >
                  📋 Copy SQL Setup Script
                </button>
              </div>
            )}

            {!dbTableError && items.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No customer messages found.</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="card admin-item-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", transition: "all 0.3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                        <h3 style={{ margin: 0 }}>{item.name}</h3>
                        <span style={{
                          fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "12px",
                          fontWeight: "bold", textTransform: "uppercase",
                          backgroundColor: item.status === "unread" ? "#fee2e2" : "#e0f2fe",
                          color: item.status === "unread" ? "#b91c1c" : "#0369a1"
                        }}>
                          {item.status || "unread"}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: "var(--primary)", fontWeight: "500", fontSize: "0.95rem" }}>
                        ✉️ <a href={`mailto:${item.email}`} style={{ textDecoration: "underline" }}>{item.email}</a>
                      </p>
                      <small style={{ color: "var(--text-muted)", display: "block", marginTop: "0.25rem" }}>
                        📅 {item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}
                      </small>
                    </div>

                    <div className="admin-item-actions">
                      <a 
                        href={`mailto:${item.email}?subject=Response from SK Bikes`} 
                        className="btn-primary" 
                        style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem", textDecoration: "none" }}
                      >
                        ✉️ Reply
                      </a>
                      <button 
                        onClick={() => toggleMessageStatus(item.id, item.status)} 
                        style={{ padding: "0.5rem 0.85rem", backgroundColor: "var(--border)", color: "var(--foreground)", borderRadius: "6px", fontWeight: "600", fontSize: "0.85rem" }}
                      >
                        {item.status === "read" ? "Mark Unread" : "Mark Read"}
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        style={{ padding: "0.5rem 0.85rem", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "6px", fontWeight: "600", fontSize: "0.85rem" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border)", color: "var(--foreground)", whiteSpace: "pre-wrap", lineHeight: "1.6", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                    {item.message}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : isEditing ? (
          /* PRODUCT ADD/EDIT FORM */
          <div className="card" style={{ padding: "2rem" }}>
            <h2 style={{ marginBottom: "2rem" }}>{editId ? "Edit" : "Add New"} {activeTab === "bikes" ? "Motorcycle" : "Helmet"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="admin-form-grid">
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Model</label>
                  <input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Price (Rs.)</label>
                  <input type="text" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={inputStyle} required />
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: "600" }}>Product Image</label>
                <div className="admin-image-upload-wrapper">
                  {/* Preview Box */}
                  <div 
                    className="admin-image-preview"
                    onClick={() => imagePreview && setFullSizeImage(imagePreview)}
                    title={imagePreview ? "Click to view full size" : ""}
                    style={{
                      width: "160px", height: "160px", borderRadius: "12px",
                      border: "2px dashed var(--border)", flexShrink: 0,
                      backgroundImage: imagePreview ? `url(${imagePreview})` : "none",
                      backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat",
                      backgroundColor: "var(--card-bg)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden", cursor: imagePreview ? "pointer" : "default"
                    }}
                  >
                    {!imagePreview && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "0.5rem" }}>No image selected</span>}
                  </div>

                  {/* Upload Controls */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      style={{
                        display: "inline-block", padding: "0.75rem 1.5rem",
                        backgroundColor: uploading ? "var(--border)" : "var(--primary)",
                        color: "white", borderRadius: "8px", cursor: uploading ? "not-allowed" : "pointer",
                        fontWeight: "600", textAlign: "center", transition: "opacity 0.2s"
                      }}
                    >
                      {uploading ? "⏳ Uploading..." : "📁 Choose Image"}
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setFormData(f => ({...f, imageUrl: ""})); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                        style={{ padding: "0.5rem 1rem", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600" }}
                      >
                        🗑️ Remove Image
                      </button>
                    )}
                    {uploading && <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Uploading image, please wait...</p>}
                    {imagePreview && !uploading && <p style={{ color: "green", fontSize: "0.85rem" }}>✅ Image ready!</p>}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" style={{ ...inputStyle }} required></textarea>
              </div>

              {activeTab === "bikes" && (
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Advanced Details</label>
                  <textarea value={formData.advancedDetails} onChange={(e) => setFormData({...formData, advancedDetails: e.target.value})} rows="4" style={{ ...inputStyle }}></textarea>
                </div>
              )}

              <div className="admin-form-actions">
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? "Please wait..." : "Save Changes"}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          /* PRODUCT CARDS LIST */
          <div style={{ display: "grid", gap: "1rem" }}>
            {items.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No items found. Click 'Add New' to create one.</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="card admin-item-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", transition: "all 0.3s ease" }}>
                  <div className="admin-item-card-header">
                    
                    {/* Left Side: Thumbnail & Title */}
                    <div className="admin-item-info" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      {/* Thumbnail */}
                      <div 
                        onClick={(e) => { e.stopPropagation(); setFullSizeImage(item.imageUrl || '/helmet_product.png'); }}
                        title="Click to view full size"
                        style={{
                          width: "65px", height: "65px", borderRadius: "10px",
                          backgroundImage: `url(${item.imageUrl || '/helmet_product.png'})`,
                          backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat",
                          backgroundColor: "var(--card-bg)", flexShrink: 0,
                          border: "1px solid var(--border)", cursor: "zoom-in"
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.name} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "normal" }}>({item.model})</span>
                        </h3>
                        <p style={{ color: "var(--primary)", fontWeight: "600", margin: 0 }}>Rs. {item.price}</p>
                      </div>
                    </div>

                    {/* Right Side: Actions */}
                    <div className="admin-item-actions">
                      <button 
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} 
                        style={{ padding: "0.5rem 0.75rem", background: "none", color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "600" }}
                      >
                        {expandedId === item.id ? "▲ Hide Info" : "▼ More Info"}
                      </button>
                      <button onClick={() => handleEdit(item)} style={{ padding: "0.5rem 1rem", backgroundColor: "#e0f2fe", color: "#0369a1", borderRadius: "6px", fontWeight: "600" }}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} style={{ padding: "0.5rem 1rem", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "6px", fontWeight: "600" }}>Delete</button>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  {expandedId === item.id && (
                    <div style={{ marginTop: "0.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.95rem", display: "grid", gap: "1.5rem", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                      <div>
                        <strong style={{ color: "var(--foreground)", display: "block", marginBottom: "0.5rem" }}>📝 Description:</strong>
                        <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{item.description}</p>
                      </div>
                      
                      {item.advancedDetails && (
                        <div>
                          <strong style={{ color: "var(--foreground)", display: "block", marginBottom: "0.5rem" }}>⚙️ Advanced Details:</strong>
                          <div style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)", backgroundColor: "var(--background)", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--border)", color: "var(--foreground)", lineHeight: "1.6" }}>
                            {item.advancedDetails}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Full Size Image Modal */}
      {fullSizeImage && (
        <div 
          onClick={() => setFullSizeImage(null)}
          title="Click anywhere to close"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1000,
            display: "flex", justifyContent: "center", alignItems: "center",
            padding: "1rem", cursor: "zoom-out",
            backdropFilter: "blur(5px)"
          }}
        >
          {/* Close Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setFullSizeImage(null); }}
            style={{
              position: "absolute", top: "15px", right: "20px",
              background: "none", border: "none", color: "white",
              fontSize: "2.5rem", cursor: "pointer", lineHeight: "1",
              padding: "10px", opacity: 0.8, transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => e.target.style.opacity = 1}
            onMouseOut={(e) => e.target.style.opacity = 0.8}
            title="Close preview"
          >
            &times;
          </button>
          
          <img 
            src={fullSizeImage} 
            alt="Full size preview" 
            style={{ 
              maxWidth: "100%", maxHeight: "90vh", 
              objectFit: "contain", borderRadius: "12px",
              backgroundColor: "white", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              cursor: "default"
            }} 
            onClick={(e) => e.stopPropagation()} /* Prevent closing when clicking the image itself */
          />
        </div>
      )}
    </main>
  );
}
