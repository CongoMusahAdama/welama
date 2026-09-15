import React, { useEffect, useState } from "react";
import { ImagePlus, Trash2, Pencil } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL, apiRequest } from "../../utils/api";

const EMPTY_FORM = {
  heading: "",
  description: "",
  category: "",
  mediaUrl: "",
  mediaType: "image",
};

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    const data = await apiRequest("/gallery/all", "GET", null, 12000);
    if (data?.success) setItems(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      Swal.fire("Invalid File", "Please choose an image or video.", "error");
      return;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("media", file);

    try {
      const token = localStorage.getItem("welama_auth_token");
      const res = await fetch(`${API_URL}/upload/gallery`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: uploadData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({
          ...prev,
          mediaUrl: data.url,
          mediaType: data.mediaType || (isVideo ? "video" : "image"),
        }));
      } else {
        Swal.fire("Upload Failed", data.message || "Could not upload media.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Upload Error", "Could not connect to the upload server.", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.heading.trim()) {
      Swal.fire("Missing heading", "Please add a heading for this gallery item.", "warning");
      return;
    }
    if (!form.mediaUrl) {
      Swal.fire("Missing media", "Please upload an image or video first.", "warning");
      return;
    }

    setIsSaving(true);
    const payload = {
      heading: form.heading.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      mediaUrl: form.mediaUrl,
      mediaType: form.mediaType,
      published: true,
    };

    const data = editingId
      ? await apiRequest(`/gallery/${editingId}`, "PUT", payload, 12000)
      : await apiRequest("/gallery", "POST", payload, 12000);

    setIsSaving(false);

    if (data?.success) {
      Swal.fire({
        title: editingId ? "Updated" : "Added to gallery",
        icon: "success",
        confirmButtonColor: "#0A0A0A",
        timer: 1400,
        showConfirmButton: false,
      });
      resetForm();
      loadItems();
    } else {
      Swal.fire("Could not save", data?.message || "Please try again.", "error");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      heading: item.heading || "",
      description: item.description || "",
      category: item.category || "",
      mediaUrl: item.mediaUrl || "",
      mediaType: item.mediaType || "image",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Remove this item?",
      text: item.heading,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0A0A0A",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;

    const data = await apiRequest(`/gallery/${item._id}`, "DELETE", null, 12000);
    if (data?.success) {
      setItems((prev) => prev.filter((g) => g._id !== item._id));
      if (editingId === item._id) resetForm();
    } else {
      Swal.fire("Delete failed", data?.message || "Please try again.", "error");
    }
  };

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Gallery</h1>
          <p>Upload images and videos with a heading and description for the public gallery page.</p>
        </div>
      </header>

      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                HEADING
              </label>
              <input
                type="text"
                value={form.heading}
                onChange={handleChange("heading")}
                placeholder="e.g. Summer Two-Piece"
                style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                CATEGORY (OPTIONAL)
              </label>
              <input
                type="text"
                value={form.category}
                onChange={handleChange("category")}
                placeholder="e.g. Dresses, Bags"
                style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: "0.75rem", marginBottom: "0.4rem" }}>
              DESCRIPTION
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={handleChange("description")}
              placeholder="A short caption for this look..."
              style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0", resize: "vertical" }}
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", fontWeight: 700, fontSize: "0.75rem", marginBottom: "0.4rem" }}>
              IMAGE OR VIDEO
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                border: "1px dashed #cbd5e1",
                borderRadius: "12px",
                padding: "1rem",
                cursor: "pointer",
                background: "#fff",
              }}
            >
              <ImagePlus size={20} />
              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {isUploading ? "Uploading..." : "Choose image or video"}
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {form.mediaUrl && (
            <div style={{ marginTop: "1rem", maxWidth: "280px" }}>
              {form.mediaType === "video" ? (
                <video src={form.mediaUrl} controls style={{ width: "100%", borderRadius: "12px", background: "#000" }} />
              ) : (
                <img src={form.mediaUrl} alt="Preview" style={{ width: "100%", borderRadius: "12px", objectFit: "cover" }} />
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button type="submit" className="cta-button-premium" disabled={isSaving || isUploading} style={{ borderRadius: "12px" }}>
              {isSaving ? "Saving..." : editingId ? "Update item" : "Add to gallery"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.7rem 1rem", fontWeight: 600 }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h3 className="serif" style={{ marginBottom: "1.25rem" }}>
          Published items ({items.length})
        </h3>
        {loading ? (
          <p style={{ color: "#64748b" }}>Loading gallery...</p>
        ) : items.length === 0 ? (
          <p style={{ color: "#64748b" }}>No gallery items yet. Upload the first look above.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
            {items.map((item) => (
              <div key={item._id} style={{ border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", background: "#fff" }}>
                {item.mediaType === "video" ? (
                  <video src={item.mediaUrl} muted playsInline style={{ width: "100%", height: "160px", objectFit: "cover", background: "#000" }} />
                ) : (
                  <img src={item.mediaUrl} alt={item.heading} style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                )}
                <div style={{ padding: "0.9rem 1rem 1rem" }}>
                  <p style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{item.heading}</p>
                  {item.category && (
                    <p style={{ fontSize: "0.72rem", color: "#C9A227", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                      {item.category}
                    </p>
                  )}
                  {item.description && (
                    <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.45 }}>
                      {item.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem" }}>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "0.45rem 0.6rem" }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "8px", padding: "0.45rem 0.6rem" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGallery;
