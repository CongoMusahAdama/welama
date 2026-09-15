import React, { useEffect, useState } from "react";
import { Star, Camera, X } from "lucide-react";
import Swal from "sweetalert2";
import { apiRequest, API_URL } from "../utils/api";

const StarRating = ({ value, onChange }) => {
  return (
    <div style={{ display: "flex", gap: "0.4rem" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange && onChange(n)}
          style={{ cursor: onChange ? "pointer" : "default", background: "none", border: "none", padding: 0 }}
          aria-label={`${n} star`}
        >
          <Star
            size={onChange ? 28 : 14}
            fill={n <= value ? "#C9A227" : "none"}
            color={n <= value ? "#C9A227" : "#cbd5e1"}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 5, productName: "", text: "", image: "" });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchReviews = async () => {
      const res = await apiRequest("/reviews");
      if (res.success) setReviews(res.data);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("screenshot", file);
    try {
      const res = await fetch(`${API_URL}/upload/screenshot`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setForm((f) => ({ ...f, image: data.url }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) return;

    setIsSubmitting(true);
    const res = await apiRequest("/reviews", "POST", form);
    setIsSubmitting(false);

    if (res.success) {
      Swal.fire({
        title: "Thank You!",
        text: "Your review has been submitted and will appear once approved.",
        icon: "success",
        confirmButtonColor: "#0A0A0A",
      });
      setForm({ name: "", rating: 5, productName: "", text: "", image: "" });
      setShowForm(false);
    } else {
      Swal.fire("Error", res.message || "Could not submit your review.", "error");
    }
  };

  return (
    <div className="reviews-page">
      <section className="about-hero">
        <div className="container center-text">
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.5em",
              fontSize: "0.9rem",
            }}
          >
            WELAMA
          </span>
          <h1 className="serif" style={{ fontSize: "4rem", marginTop: "1rem" }}>
            Style Gallery
          </h1>
        </div>
      </section>

      <section className="section-padding container">
        <div className="reviews-gallery-header">
          <div>
            <h2 className="serif" style={{ fontSize: "2.2rem" }}>
              Real Women, Real Style
            </h2>
            <p style={{ color: "#666", marginTop: "0.5rem" }}>
              A look at how our community wears WELAMA.
            </p>
          </div>
          <button className="cta-button-premium" onClick={() => setShowForm(true)}>
            <span>Share Your Review</span>
          </button>
        </div>

        {loading && <p style={{ color: "#666" }}>Loading gallery...</p>}

        {!loading && reviews.length === 0 && (
          <div className="reviews-gallery-empty">
            <Camera size={40} color="#C9A227" style={{ marginBottom: "1rem" }} />
            <p style={{ color: "#666" }}>
              No reviews yet — be the first to share your WELAMA style.
            </p>
          </div>
        )}

        <div className="reviews-gallery-grid">
          {reviews.map((r) => (
            <div className="review-gallery-card" key={r._id}>
              <div className="review-gallery-image">
                {r.image ? (
                  <img src={r.image} alt={r.name} />
                ) : (
                  <div className="review-gallery-placeholder">
                    <Camera size={28} />
                  </div>
                )}
                <div className="review-gallery-overlay">
                  <StarRating value={r.rating} />
                  <p>"{r.text}"</p>
                  <div className="review-gallery-author">
                    <strong>{r.name}</strong>
                    {r.productName && <span>{r.productName}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showForm && (
        <div className="product-modal-backdrop" onClick={() => setShowForm(false)}>
          <div
            className="review-form-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={() => setShowForm(false)}>
              <X size={24} />
            </button>
            <h3 className="serif" style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>
              Share Your Review
            </h3>
            <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Add a photo and tell other shoppers about your WELAMA experience.
            </p>

            <form onSubmit={handleSubmit} className="review-form">
              <div className="review-form-group">
                <label>Photo (optional)</label>
                <label className="review-photo-upload">
                  {form.image ? (
                    <img src={form.image} alt="Preview" />
                  ) : (
                    <span>{isUploading ? "Uploading..." : "Click to add a photo"}</span>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                </label>
              </div>

              <div className="review-form-group">
                <label>Your Rating</label>
                <StarRating value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} />
              </div>

              <div className="review-form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ama Serwaa"
                />
              </div>

              <div className="review-form-group">
                <label>Product (optional)</label>
                <input
                  type="text"
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  placeholder="e.g. Golden Hour Tote"
                />
              </div>

              <div className="review-form-group">
                <label>Your Review</label>
                <textarea
                  required
                  rows={4}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Share your experience..."
                />
              </div>

              <button type="submit" className="cta-button-premium" disabled={isSubmitting} style={{ width: "100%", justifyContent: "center" }}>
                <span>{isSubmitting ? "Submitting..." : "Submit Review"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
