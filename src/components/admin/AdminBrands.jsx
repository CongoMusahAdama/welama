import React, { useEffect, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { API_URL, apiRequest } from "../../utils/api";

const EMPTY_FORM = { name: "", logoUrl: "" };

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBrands = async () => {
    const data = await apiRequest("/brands", "GET", null, 12000);
    if (data?.success) setBrands(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire("Invalid file", "Please choose a logo image.", "error");
      return;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("logo", file);

    try {
      const token = localStorage.getItem("welama_auth_token");
      const res = await fetch(`${API_URL}/upload/logo`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: uploadData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, logoUrl: data.url }));
      } else {
        Swal.fire("Upload failed", data.message || "Could not upload the logo.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Upload error", "Could not connect to the upload server.", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      Swal.fire("Missing name", "Please enter a brand name.", "warning");
      return;
    }
    if (!form.logoUrl) {
      Swal.fire("Missing logo", "Please upload a brand logo.", "warning");
      return;
    }

    setIsSaving(true);
    const payload = { name: form.name.trim(), logoUrl: form.logoUrl };
    const data = editingId
      ? await apiRequest(`/brands/${editingId}`, "PUT", payload, 12000)
      : await apiRequest("/brands", "POST", payload, 12000);
    setIsSaving(false);

    if (data?.success) {
      Swal.fire({
        title: editingId ? "Brand updated" : "Brand added",
        icon: "success",
        confirmButtonColor: "#0A0A0A",
        timer: 1400,
        showConfirmButton: false,
      });
      resetForm();
      loadBrands();
    } else {
      Swal.fire("Could not save", data?.message || "Please try again.", "error");
    }
  };

  const startEdit = (brand) => {
    setEditingId(brand._id);
    setForm({ name: brand.name || "", logoUrl: brand.logoUrl || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (brand) => {
    const result = await Swal.fire({
      title: "Remove this brand?",
      text: brand.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0A0A0A",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;

    const data = await apiRequest(`/brands/${brand._id}`, "DELETE", null, 12000);
    if (data?.success) {
      setBrands((prev) => prev.filter((item) => item._id !== brand._id));
      if (editingId === brand._id) resetForm();
    } else {
      Swal.fire("Delete failed", data?.message || "Please try again.", "error");
    }
  };

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Brands</h1>
          <p>Add, update, or remove logos shown in Premium Brands on the storefront.</p>
        </div>
      </header>

      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit} className="admin-brands-form">
          <label className="admin-brands-field">
            <span>Brand name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Gucci"
            />
          </label>

          <label className="admin-brands-upload">
            <ImagePlus size={20} />
            <span>{isUploading ? "Uploading..." : "Upload logo"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>

          {form.logoUrl && (
            <div className="admin-brands-preview">
              <img src={form.logoUrl} alt={form.name || "Brand logo"} />
            </div>
          )}

          <div className="admin-brands-actions">
            <button type="submit" className="cta-button-premium" disabled={isSaving || isUploading}>
              <Plus size={16} />
              {isSaving ? "Saving..." : editingId ? "Update brand" : "Add brand"}
            </button>
            {editingId && (
              <button type="button" className="admin-brands-cancel" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h3 className="serif" style={{ marginBottom: "1.25rem" }}>
          Current brands ({brands.length})
        </h3>
        {loading ? (
          <p style={{ color: "#64748b" }}>Loading brands...</p>
        ) : brands.length === 0 ? (
          <p style={{ color: "#64748b" }}>No brands yet. Add the first logo above.</p>
        ) : (
          <div className="admin-brands-grid">
            {brands.map((brand) => (
              <div key={brand._id} className="admin-brand-card">
                <div className="admin-brand-logo">
                  <img src={brand.logoUrl} alt={brand.name} />
                </div>
                <p>{brand.name}</p>
                <div className="admin-brand-card-actions">
                  <button type="button" onClick={() => startEdit(brand)} aria-label={`Edit ${brand.name}`}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" className="is-danger" onClick={() => handleDelete(brand)} aria-label={`Delete ${brand.name}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBrands;
