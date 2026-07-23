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
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
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
      const { id, created_at, ...cleanData } = formData;
      if (activeTab === "helmets") delete cleanData.advancedDetails;

      if (editId) {
        const { error } = await supabase.from(activeTab).update(cleanData).eq('id', editId);
        if (error) throw error;
      } else {
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

  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--background)",
    color: "var(--foreground)",
    boxSizing: "border-box",
  };

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
        <div className="admin-sidebar-header">
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>🏍️ Admin Panel</h2>
          <button
            className="admin-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        <nav className={`admin-sidebar-nav ${menuOpen ? "open" : ""}`}>
          <button
            onClick={() => handleTabChange("bikes")}
            className={`admin-sidebar-btn ${activeTab === "bikes" ? "active" : ""}`}
          >
            🏍️ Motorcycles
          </button>
          <button
            onClick={() => handleTabChange("helmets")}
            className={`admin-sidebar-btn ${activeTab === "helmets" ? "active" : ""}`}
          >
            🪖 Helmets
          </button>
          <button
            onClick={() => handleTabChange("messages")}
            className={`admin-sidebar-btn admin-msg-btn ${activeTab === "messages" ? "active" : ""}`}
          >
            <span>📩 Messages</span>
            {unreadCount > 0 && (
              <span className="admin-unread-badge">{unreadCount}</span>
            )}
          </button>
          <button onClick={handleLogout} className="admin-logout-btn">
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-page-header">
          <h1 style={{ textTransform: "capitalize", fontSize: "clamp(1.2rem, 4vw, 1.8rem)", margin: 0 }}>
            {activeTab === "messages" ? "Customer Messages" : `Manage ${activeTab}`}
          </h1>
          {activeTab !== "messages" && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-primary">
              + Add New
            </button>
          )}
        </div>

        {/* MESSAGES TAB */}
        {activeTab === "messages" ? (
          <div className="admin-cards-grid">
            {dbTableError && (
              <div className="admin-db-error-box">
                <h3>⚠️ Supabase &apos;messages&apos; Table Missing!</h3>
                <p>
                  Copy the SQL below and run it in{" "}
                  <strong>Supabase Dashboard → SQL Editor → Run</strong>:
                </p>
                <textarea
                  readOnly
                  rows={8}
                  value={sqlScriptText}
                  style={{ width: "100%", padding: "0.85rem", fontFamily: "monospace", fontSize: "0.8rem", borderRadius: "8px", border: "1px solid #fed7aa", backgroundColor: "#fff", boxSizing: "border-box", resize: "vertical" }}
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(sqlScriptText); alert("📋 SQL Script copied!"); }}
                  className="btn-primary"
                  style={{ marginTop: "0.75rem" }}
                >
                  📋 Copy SQL Script
                </button>
              </div>
            )}

            {!dbTableError && items.length === 0 && (
              <p style={{ color: "var(--text-muted)" }}>No customer messages found.</p>
            )}

            {items.map(item => (
              <div key={item.id} className="card admin-msg-card">
                <div className="admin-msg-card-top">
                  <div className="admin-msg-card-meta">
                    <div className="admin-msg-name-row">
                      <h3 style={{ margin: 0, fontSize: "1rem" }}>{item.name}</h3>
                      <span className={`admin-status-badge ${item.status === "unread" ? "unread" : "read"}`}>
                        {item.status || "unread"}
                      </span>
                    </div>
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
                      ✉️{" "}
                      <a href={`mailto:${item.email}`} style={{ color: "var(--primary)", textDecoration: "underline" }}>
                        {item.email}
                      </a>
                    </p>
                    <small style={{ color: "var(--text-muted)" }}>
                      📅 {item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}
                    </small>
                  </div>

                  <div className="admin-msg-actions">
                    <a
                      href={`mailto:${item.email}?subject=Response from SK Bikes`}
                      className="btn-primary"
                      style={{ textDecoration: "none", fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
                    >
                      ✉️ Reply
                    </a>
                    <button
                      onClick={() => toggleMessageStatus(item.id, item.status)}
                      className="admin-action-btn"
                    >
                      {item.status === "read" ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="admin-action-btn danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="admin-msg-body">
                  {item.message}
                </div>
              </div>
            ))}
          </div>
        ) : isEditing ? (
          /* PRODUCT ADD/EDIT FORM */
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "clamp(1rem, 3vw, 1.4rem)" }}>
              {editId ? "Edit" : "Add New"} {activeTab === "bikes" ? "Motorcycle" : "Helmet"}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="admin-form-grid">
                <div>
                  <label className="admin-form-label">Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} required />
                </div>
                <div>
                  <label className="admin-form-label">Model</label>
                  <input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} style={inputStyle} required />
                </div>
                <div>
                  <label className="admin-form-label">Price (Rs.)</label>
                  <input type="text" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={inputStyle} required />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="admin-form-label">Product Image</label>
                <div className="admin-image-upload-wrapper">
                  <div
                    className="admin-image-preview"
                    onClick={() => imagePreview && setFullSizeImage(imagePreview)}
                    title={imagePreview ? "Click to view full size" : ""}
                  >
                    {!imagePreview && (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "0.5rem" }}>
                        No image
                      </span>
                    )}
                    {imagePreview && (
                      <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px" }} />
                    )}
                  </div>

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
                        display: "block", padding: "0.75rem 1rem", textAlign: "center",
                        backgroundColor: uploading ? "var(--border)" : "var(--primary)",
                        color: "white", borderRadius: "8px",
                        cursor: uploading ? "not-allowed" : "pointer",
                        fontWeight: "600", transition: "opacity 0.2s"
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
                        🗑️ Remove
                      </button>
                    )}
                    {uploading && <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Uploading, please wait...</p>}
                    {imagePreview && !uploading && <p style={{ color: "green", fontSize: "0.85rem", margin: 0 }}>✅ Image ready!</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="admin-form-label">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" style={inputStyle} required />
              </div>

              {activeTab === "bikes" && (
                <div>
                  <label className="admin-form-label">Advanced Details</label>
                  <textarea value={formData.advancedDetails} onChange={(e) => setFormData({...formData, advancedDetails: e.target.value})} rows="4" style={inputStyle} />
                </div>
              )}

              <div className="admin-form-actions">
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? "Please wait..." : "Save Changes"}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* PRODUCT CARDS LIST */
          <div className="admin-cards-grid">
            {items.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No items found. Click &apos;Add New&apos; to create one.</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="card admin-item-card">
                  <div className="admin-item-card-header">

                    {/* Left: Thumbnail & Title */}
                    <div className="admin-item-info" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      <div
                        onClick={(e) => { e.stopPropagation(); setFullSizeImage(item.imageUrl || '/helmet_product.png'); }}
                        title="Click to view full size"
                        className="admin-item-thumb"
                        style={{ backgroundImage: `url(${item.imageUrl || '/helmet_product.png'})` }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="admin-item-title">
                          {item.name}{" "}
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "normal" }}>
                            ({item.model})
                          </span>
                        </h3>
                        <p style={{ color: "var(--primary)", fontWeight: "600", margin: 0, fontSize: "0.95rem" }}>
                          Rs. {item.price}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="admin-item-actions">
                      <button
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="admin-action-btn"
                      >
                        {expandedId === item.id ? "▲ Hide" : "▼ More"}
                      </button>
                      <button onClick={() => handleEdit(item)} className="admin-action-btn edit">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="admin-action-btn danger">
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === item.id && (
                    <div className="admin-item-expanded">
                      <div>
                        <strong style={{ color: "var(--foreground)", display: "block", marginBottom: "0.4rem" }}>
                          📝 Description:
                        </strong>
                        <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.6", color: "var(--text-muted)" }}>
                          {item.description}
                        </p>
                      </div>

                      {item.advancedDetails && (
                        <div>
                          <strong style={{ color: "var(--foreground)", display: "block", marginBottom: "0.4rem" }}>
                            ⚙️ Advanced Details:
                          </strong>
                          <div style={{
                            whiteSpace: "pre-wrap", backgroundColor: "var(--background)",
                            padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)",
                            color: "var(--foreground)", lineHeight: "1.6", fontSize: "0.9rem",
                            overflowWrap: "anywhere", wordBreak: "break-word"
                          }}>
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
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1000,
            display: "flex", justifyContent: "center", alignItems: "center",
            padding: "1rem", cursor: "zoom-out", backdropFilter: "blur(5px)"
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setFullSizeImage(null); }}
            style={{
              position: "absolute", top: "15px", right: "20px",
              background: "none", border: "none", color: "white",
              fontSize: "2.5rem", cursor: "pointer", padding: "10px",
              opacity: 0.8, lineHeight: 1
            }}
          >
            &times;
          </button>
          <img
            src={fullSizeImage}
            alt="Full size preview"
            style={{
              maxWidth: "100%", maxHeight: "90vh",
              objectFit: "contain", borderRadius: "12px",
              backgroundColor: "white",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
              cursor: "default"
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
