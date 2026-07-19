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
            Manage Motorcycles
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
            <h2 style={{ marginBottom: "2rem" }}>{editId ? "Edit" : "Add New"} {activeTab === "bikes" ? "Motorcycle" : "Helmet"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
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
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                  {/* Preview Box */}
                  <div 
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
                  }}>
                    {!imagePreview && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "0.5rem" }}>No image selected</span>}
                  </div>

                  {/* Upload Controls */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? "Please wait..." : "Save Changes"}
                </button>
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
                <div key={item.id} className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", transition: "all 0.3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    
                    {/* Left Side: Thumbnail & Title */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", cursor: "pointer", flex: 1, minWidth: "250px" }} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      {/* Thumbnail */}
                      <div 
                        onClick={(e) => { e.stopPropagation(); setFullSizeImage(item.imageUrl || '/helmet_product.png'); }}
                        title="Click to view full size"
                        style={{
                        width: "70px", height: "70px", borderRadius: "10px",
                        backgroundImage: `url(${item.imageUrl || '/helmet_product.png'})`,
                        backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat",
                        backgroundColor: "var(--card-bg)", flexShrink: 0,
                        border: "1px solid var(--border)", cursor: "zoom-in"
                      }} />
                      <div>
                        <h3 style={{ marginBottom: "0.25rem" }}>{item.name} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "normal" }}>({item.model})</span></h3>
                        <p style={{ color: "var(--primary)", fontWeight: "600" }}>Rs. {item.price}</p>
                      </div>
                    </div>

                    {/* Right Side: Actions */}
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 }}>
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
                    <div style={{ marginTop: "0.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.95rem", display: "grid", gap: "1.5rem" }}>
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
            padding: "2rem", cursor: "zoom-out",
            backdropFilter: "blur(5px)"
          }}
        >
          {/* Close Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setFullSizeImage(null); }}
            style={{
              position: "absolute", top: "20px", right: "30px",
              background: "none", border: "none", color: "white",
              fontSize: "3rem", cursor: "pointer", lineHeight: "1",
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
              maxWidth: "100%", maxHeight: "100%", 
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
