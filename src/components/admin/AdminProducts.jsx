import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, X, Upload, Edit3, PackageX, Trash, Check } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { API_URL } from "../../utils/api";
import { Cedis } from "../../utils/currency";

const PRESET_COLORS = [
  { name: "Onyx Black", hex: "#0A0A0A" },
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Royal Gold", hex: "#D4AF37" },
  { name: "Emerald Green", hex: "#1B5E20" },
  { name: "Royal Blue", hex: "#1E3A8A" },
  { name: "Deep Ruby", hex: "#800020" },
  { name: "Terracotta", hex: "#C77B5D" },
  { name: "Sage Green", hex: "#588157" },
  { name: "Fuchsia", hex: "#C2185B" },
  { name: "Warm Camel", hex: "#B08050" },
  { name: "Cocoa Brown", hex: "#6F4E37" },
  { name: "Lavender", hex: "#9370DB" },
  { name: "Cobalt", hex: "#0047AB" },
  { name: "Mustard", hex: "#D4A017" },
];

const AdminProducts = ({
  products,
  categories,
  deleteProduct,
  addProduct,
  updateProduct,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#0A0A0A");
  const [collectionQuery, setCollectionQuery] = useState("");

  // Filtering & Pagination & Sorting (Newest First)
  const filteredProducts = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(adminSearch.toLowerCase())) || 
    (p.sku && p.sku.toLowerCase().includes(adminSearch.toLowerCase()))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const [newProd, setNewProd] = useState({
    name: "",
    price: "",
    discountPrice: "",
    stock: "",
    category: "Luxury",
    description: "",
    comesWithPouch: false,
    images: [],
    sku: "",
    sizes: [],
    colors: [],
    discountPercentage: 0
  });

  useEffect(() => {
    if (showModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const openAddModal = () => {
    setEditingId(null);
    setNewProd({
      name: "",
      price: "",
      discountPrice: "",
      stock: "",
      category: "Luxury",
      description: "",
      comesWithPouch: false,
      images: [],
      discountPercentage: 0,
      sku: "",
      sizes: [],
      colors: [],
    });
    setCustomColorName("");
    setCustomColorHex("#0A0A0A");
    setCollectionQuery("");
    setShowModal(true);
  };

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      openAddModal();
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
  }, []);

  const handleEdit = (prod) => {
    setEditingId(prod._id || prod.id);
    const parsedColors = Array.isArray(prod.colors)
      ? prod.colors.map(c => typeof c === "string" ? { name: c, hex: "#0A0A0A" } : c)
      : [];

    setNewProd({
      name: prod.name || "",
      price: prod.price || "",
      discountPrice: prod.discountPrice || "",
      stock: prod.stock || "",
      category: prod.category || "Luxury",
      description: prod.description || "",
      comesWithPouch: !!prod.comesWithPouch,
      images: prod.images || (prod.image ? [prod.image] : []),
      discountPercentage: prod.discountPercentage || 0,
      sku: prod.sku || "",
      sizes: prod.sizes || [],
      colors: parsedColors,
    });
    setCustomColorName("");
    setCustomColorHex("#0A0A0A");
    setCollectionQuery("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewProd({
      name: "",
      price: "",
      discountPrice: "",
      stock: "",
      category: "Luxury",
      description: "",
      comesWithPouch: false,
      images: [],
      discountPercentage: 0,
      sku: "",
      sizes: [],
      colors: [],
    });
    setCustomColorName("");
    setCustomColorHex("#0A0A0A");
  };

  const handleTogglePresetColor = (preset) => {
    const currentColors = Array.isArray(newProd.colors) ? [...newProd.colors] : [];
    const exists = currentColors.some(
      (c) => (typeof c === "object" ? c.name.toLowerCase() === preset.name.toLowerCase() : c.toLowerCase() === preset.name.toLowerCase())
    );
    if (exists) {
      setNewProd({
        ...newProd,
        colors: currentColors.filter(
          (c) => (typeof c === "object" ? c.name.toLowerCase() !== preset.name.toLowerCase() : c.toLowerCase() !== preset.name.toLowerCase())
        ),
      });
    } else {
      setNewProd({
        ...newProd,
        colors: [...currentColors, preset],
      });
    }
  };

  const handleAddCustomColor = (e) => {
    if (e) e.preventDefault();
    if (!customColorName.trim()) {
      Swal.fire("Enter Color Name", "Please provide a name for this custom color (e.g. Royal Blue).", "info");
      return;
    }
    const currentColors = Array.isArray(newProd.colors) ? [...newProd.colors] : [];
    const exists = currentColors.some(
      (c) => (typeof c === "object" ? c.name.toLowerCase() === customColorName.trim().toLowerCase() : c.toLowerCase() === customColorName.trim().toLowerCase())
    );
    if (exists) {
      Swal.fire("Color Already Added", "This color is already in the product's color list.", "warning");
      return;
    }
    setNewProd({
      ...newProd,
      colors: [...currentColors, { name: customColorName.trim(), hex: customColorHex }],
    });
    setCustomColorName("");
  };

  const handleRemoveColor = (index) => {
    const currentColors = Array.isArray(newProd.colors) ? [...newProd.colors] : [];
    setNewProd({
      ...newProd,
      colors: currentColors.filter((_, i) => i !== index),
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (newProd.images.length + files.length > 16) {
      Swal.fire("Too many photos", "You can add up to 16 product images.", "info");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));

    const token = localStorage.getItem("welama_auth_token");

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNewProd((prev) => ({
          ...prev,
          images: [...prev.images, ...data.urls],
        }));
      } else {
        Swal.fire(
          "Media Error",
          data.message || "Image upload failed.",
          "error",
        );
      }
    } catch (err) {
      console.error("Upload Error:", err);
      Swal.fire(
        "Network Error",
        "Image upload failed due to network issue.",
        "error",
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    const updatedImages = newProd.images.filter((_, i) => i !== index);
    setNewProd({ ...newProd, images: updatedImages });
  };

  const handleSoldOut = async (prod) => {
    const isSoldOut =
      prod.status === "Sold Out" || prod.stock === 0 || !!prod.soldOutAt;

    const result = await Swal.fire({
      title: isSoldOut ? "Restock Product?" : "Mark as Sold Out?",
      text: isSoldOut
        ? "This will make the product active again."
        : "This will mark it as Sold Out and hide it from the shop after 3 days.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0A0A0A",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, proceed",
    });

    if (result.isConfirmed) {
      if (isSoldOut) {
        await updateProduct(prod._id || prod.id, {
          soldOutAt: null,
          status: "Active",
          stock: Math.max(1, prod.stock),
        });
      } else {
        await updateProduct(prod._id || prod.id, {
          soldOutAt: new Date().toISOString(),
          status: "Sold Out",
          stock: 0,
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const priceVal = parseFloat(newProd.price) || 0;
    const discPercent = parseFloat(newProd.discountPercentage) || 0;
    const stockVal = parseInt(newProd.stock) || 0;
    const calculatedDiscountPrice =
      discPercent > 0
        ? parseFloat((priceVal * (1 - discPercent / 100)).toFixed(2))
        : null;

    const finalProdData = {
      ...newProd,
      price: priceVal,
      discountPercentage: discPercent,
      discountPrice: calculatedDiscountPrice,
      stock: stockVal,
      sizes: Array.isArray(newProd.sizes) ? newProd.sizes : [],
      colors: Array.isArray(newProd.colors) ? newProd.colors : [],
      sku: newProd.sku?.trim() || "",
      image: newProd.images[0] || "/welamalogo.png",
    };

    console.log("Submitting Product Data:", finalProdData);

    let success = false;
    if (editingId) {
      success = await updateProduct(editingId, finalProdData);
    } else {
      success = await addProduct(finalProdData);
    }

    if (success) {
      closeModal();
    }
  };

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Product Library</h1>
          <p>Displaying all {products.length} products</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="admin-search-wrap" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              value={adminSearch}
              onChange={(e) => {
                setAdminSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.6rem 1rem 0.6rem 2.2rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: '0.85rem',
                width: '240px',
                background: '#f8fafc'
              }}
            />
          </div>
          <button
            onClick={openAddModal}
            className="cta-button-premium"
            style={{
              padding: "0.8rem 1.5rem",
              fontSize: "0.75rem",
              borderRadius: "12px",
            }}
          >
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </header>

      {showModal && createPortal(
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div
            className="admin-modal-card admin-modal-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-pull-handle"></div>
            <div className="modal-header-premium">
              <div>
                <h2 className="serif">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="modal-header-sub">
                  {editingId
                    ? "Refine the essence of this luxury item."
                    : "Define the features and essence of your next luxury item."}
                </p>
              </div>
              <button onClick={closeModal} className="sidebar-minimize-toggle">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="modal-content-scroll">
                  <div className="product-photo-section">
                    <div className="product-photo-head">
                      <label>Product photos</label>
                      <span>{newProd.images.length}/16 · first photo is the cover</span>
                    </div>
                    <div className="product-photo-grid">
                      {newProd.images.map((img, i) => (
                        <div key={`${img}-${i}`} className={`product-photo-tile ${i === 0 ? "is-cover" : ""}`}>
                          <img
                            src={img && !img.startsWith("blob:") ? img : "/welamalogo.png"}
                            alt={`Product ${i + 1}`}
                          />
                          {i === 0 && <em>Cover</em>}
                          <button type="button" onClick={() => removeImage(i)} aria-label="Remove photo">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="product-photo-add"
                        disabled={isUploading || newProd.images.length >= 16}
                        onClick={() => document.getElementById("image-upload")?.click()}
                      >
                        <Upload size={22} />
                        <span>{isUploading ? "Uploading..." : "Add photos"}</span>
                      </button>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                      disabled={isUploading}
                    />
                  </div>

                  <div className="product-form-fields">
                    <div className="product-form-row">
                      <div className="product-field">
                        <label htmlFor="product-name">Product name</label>
                        <input
                          id="product-name"
                          type="text"
                          required
                          placeholder="e.g. Meadow Ditsy Floral Dress"
                          value={newProd.name}
                          onChange={(e) =>
                            setNewProd({ ...newProd, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="product-field">
                        <label htmlFor="product-sku">SKU (optional)</label>
                        <input
                          id="product-sku"
                          type="text"
                          placeholder="Auto-generated if empty"
                          value={newProd.sku}
                          onChange={(e) =>
                            setNewProd({ ...newProd, sku: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="product-form-row">
                      <div className="product-field product-collection-field">
                        <label htmlFor="product-collection-search">Collection</label>
                        <input
                          id="product-collection-search"
                          type="search"
                          autoComplete="off"
                          placeholder="Search collections"
                          value={collectionQuery}
                          onChange={(e) => setCollectionQuery(e.target.value)}
                        />
                        {newProd.category ? (
                          <span className="product-collection-current">Selected: {newProd.category}</span>
                        ) : null}
                        <div className="product-collection-list" role="listbox" aria-label="Collections">
                          {(() => {
                            const labels = (categories || [])
                              .map((cat) => (typeof cat === "object" ? cat.label || cat.name : cat))
                              .filter(Boolean);
                            const q = collectionQuery.trim().toLowerCase();
                            const visible = q
                              ? labels.filter((label) => label.toLowerCase().includes(q))
                              : labels;
                            if (labels.length === 0) {
                              return (
                                <p className="product-collection-empty">No collections yet. Add them in Categories.</p>
                              );
                            }
                            if (visible.length === 0) {
                              return (
                                <p className="product-collection-empty">No collection matches “{collectionQuery}”.</p>
                              );
                            }
                            return visible.map((label) => {
                              const selected = newProd.category === label;
                              return (
                                <button
                                  key={label}
                                  type="button"
                                  role="option"
                                  aria-selected={selected}
                                  className={`product-collection-option ${selected ? "is-on" : ""}`}
                                  onClick={() => {
                                    setNewProd({ ...newProd, category: label });
                                    setCollectionQuery("");
                                  }}
                                >
                                  <span>{label}</span>
                                  {selected ? <Check size={16} strokeWidth={2.5} /> : null}
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </div>
                      <div className="product-field">
                        <label htmlFor="product-stock">Stock</label>
                        <input
                          id="product-stock"
                          type="number"
                          required
                          min="0"
                          placeholder="Units"
                          value={newProd.stock}
                          onChange={(e) =>
                            setNewProd({ ...newProd, stock: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="product-field">
                      <label>Available sizes</label>
                      <div className="admin-size-chip-row">
                        {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`admin-size-chip ${Array.isArray(newProd.sizes) && newProd.sizes.includes(s) ? "is-on" : ""}`}
                            onClick={() => {
                              const currentSizes = Array.isArray(newProd.sizes)
                                ? [...newProd.sizes]
                                : [];
                              if (currentSizes.includes(s)) {
                                setNewProd({
                                  ...newProd,
                                  sizes: currentSizes.filter((x) => x !== s),
                                });
                              } else {
                                setNewProd({
                                  ...newProd,
                                  sizes: [...currentSizes, s],
                                });
                              }
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="product-field">
                      <div className="product-field-head">
                        <label>Colors</label>
                        <span>{newProd.colors?.length || 0} selected</span>
                      </div>
                      {newProd.colors && newProd.colors.length > 0 && (
                        <div className="product-color-tags">
                          {newProd.colors.map((c, idx) => {
                            const colorName = typeof c === "object" ? c.name : c;
                            const colorHex = typeof c === "object" ? c.hex : "#0A0A0A";
                            return (
                              <div key={idx} className="product-color-chip">
                                <span className="product-swatch" style={{ backgroundColor: colorHex }} />
                                <span>{colorName}</span>
                                <button type="button" onClick={() => handleRemoveColor(idx)} aria-label="Remove color">
                                  <X size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="admin-color-presets">
                        {PRESET_COLORS.map((preset, pIdx) => {
                          const isSelected = Array.isArray(newProd.colors) && newProd.colors.some(
                            (c) => (typeof c === "object" ? c.name.toLowerCase() === preset.name.toLowerCase() : c.toLowerCase() === preset.name.toLowerCase())
                          );
                          return (
                            <button
                              key={pIdx}
                              type="button"
                              className={`product-preset ${isSelected ? "is-on" : ""}`}
                              onClick={() => handleTogglePresetColor(preset)}
                            >
                              <span className="product-swatch" style={{ backgroundColor: preset.hex }} />
                              {preset.name}
                            </button>
                          );
                        })}
                      </div>
                      <div className="product-custom-color">
                        <input
                          type="color"
                          value={customColorHex}
                          onChange={(e) => setCustomColorHex(e.target.value)}
                          aria-label="Custom color"
                        />
                        <input
                          type="text"
                          placeholder="Custom color name"
                          value={customColorName}
                          onChange={(e) => setCustomColorName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomColor();
                            }
                          }}
                        />
                        <button type="button" onClick={handleAddCustomColor}>
                          Add color
                        </button>
                      </div>
                    </div>

                    <div className="admin-price-grid">
                      <div className="product-field">
                        <label htmlFor="product-price">Price (GHS)</label>
                        <input
                          id="product-price"
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={newProd.price}
                          onChange={(e) =>
                            setNewProd({ ...newProd, price: e.target.value })
                          }
                        />
                      </div>
                      <div className="product-field">
                        <label htmlFor="product-discount">Discount (%)</label>
                        <input
                          id="product-discount"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={newProd.discountPercentage}
                          onChange={(e) =>
                            setNewProd({
                              ...newProd,
                              discountPercentage: e.target.value,
                            })
                          }
                        />
                        {newProd.discountPercentage > 0 && newProd.price && (
                          <span className="product-price-hint">
                            Sale price:{" "}
                            <Cedis
                              value={
                                newProd.price *
                                (1 - newProd.discountPercentage / 100)
                              }
                              decimals={2}
                            />
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="product-field">
                      <label htmlFor="product-description">Description</label>
                      <textarea
                        id="product-description"
                        rows="4"
                        placeholder="Fabric, fit, and what makes this piece special"
                        value={newProd.description}
                        onChange={(e) =>
                          setNewProd({
                            ...newProd,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="product-check">
                      <input
                        type="checkbox"
                        id="pouch-check"
                        checked={newProd.comesWithPouch}
                        onChange={(e) =>
                          setNewProd({
                            ...newProd,
                            comesWithPouch: e.target.checked,
                          })
                        }
                      />
                      <label htmlFor="pouch-check">Include WELAMA gift wrap</label>
                    </div>
                  </div>
              </div>

              <div className="modal-footer-premium">
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: "1.1rem",
                    borderRadius: "16px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    background: "#f8fafc",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <X size={18} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="cta-button-premium shadowed"
                  style={{
                    flex: 2,
                    padding: "1.1rem",
                    borderRadius: "16px",
                    fontSize: "1rem",
                    fontWeight: 800,
                    background: isUploading
                      ? "#94a3b8"
                      : "#0A0A0A",
                    color: "white",
                    cursor: isUploading ? "wait" : "pointer",
                    opacity: isUploading ? 0.7 : 1,
                  }}
                >
                  {isUploading
                    ? "Uploading Media..."
                    : editingId
                      ? "Save"
                      : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <div className="admin-card" style={{ padding: "0", overflow: "hidden" }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th>Colors</th>
                <th>Sizes</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((prod, index) => {
                const imgFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(prod.name || "P")}&background=0d2f2f&color=fff&size=100`;
                return (
                  <tr key={prod._id || prod.id || index}>
                    <td data-label="SKU" style={{ fontWeight: 800, color: '#0A0A0A', fontSize: '0.75rem' }}>{prod.sku || 'N/A'}</td>
                    <td data-label="Product">
                      <div className="flex items-center">
                        <img
                          src={
                            prod.image && !prod.image.startsWith("blob:")
                              ? prod.image
                              : imgFallback
                          }
                          className="table-product-img"
                          alt=""
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            marginRight: "1rem",
                          }}
                        />
                        <div style={{ fontWeight: 700 }}>
                          {prod.name}
                        </div>
                      </div>
                    </td>
                    <td data-label="Category">{prod.category}</td>
                    <td data-label="Colors">
                      {prod.colors && prod.colors.length > 0 ? (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '120px' }}>
                          {prod.colors.map((c, cIdx) => (
                            <span
                              key={cIdx}
                              title={typeof c === "object" ? c.name : c}
                              style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                backgroundColor: typeof c === "object" ? c.hex : c,
                                display: 'inline-block',
                                border: '1px solid rgba(0,0,0,0.15)',
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td data-label="Sizes">
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {(prod.sizes || []).map((s, idx) => (
                          <span key={idx} className="table-size-tag">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td data-label="Price" style={{ fontWeight: 600 }}>
                      <Cedis value={prod.price} />
                    </td>
                    <td
                      data-label="Stock"
                      style={{
                        fontWeight: 700,
                        color: prod.stock <= 3 ? "#ef4444" : "inherit",
                      }}
                    >
                      {prod.stock}
                    </td>
                    <td data-label="Status">
                      {prod.status === "Sold Out" ||
                        prod.stock === 0 ||
                        !!prod.soldOutAt ? (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          Sold Out
                        </span>
                      ) : (
                        <span className="badge badge-paid">Active</span>
                      )}
                    </td>
                    <td data-label="Actions">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(prod)}
                          style={{
                            padding: "0.4rem",
                            borderRadius: "6px",
                            background: "#f1f5f9",
                          }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleSoldOut(prod)}
                          title={
                            prod.status === "Sold Out" ||
                              prod.stock === 0 ||
                              !!prod.soldOutAt
                              ? "Restock"
                              : "Mark Sold Out"
                          }
                          style={{
                            padding: "0.4rem",
                            borderRadius: "6px",
                            background: "#fef3c7",
                            color: "#d97706",
                          }}
                        >
                          <PackageX size={14} />
                        </button>
                        <button
                          onClick={() => deleteProduct(prod._id || prod.id)}
                          style={{
                            padding: "0.4rem",
                            borderRadius: "6px",
                            background: "#fee2e2",
                            color: "#ef4444",
                          }}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div
            className="pagination-wrapper"
            style={{
              padding: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length}{" "}
              entries
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="pagination-btn"
                style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <div style={{ display: "flex", gap: "0.25rem" }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                    style={{
                      background: currentPage === i + 1 ? "#0A0A0A" : "white",
                      color: currentPage === i + 1 ? "white" : "#1e293b",
                      border: "1px solid #e2e8f0",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "8px",
                      fontWeight: 700,
                      minWidth: "36px",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="pagination-btn"
                style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
