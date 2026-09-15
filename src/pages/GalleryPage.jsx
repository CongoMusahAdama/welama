import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { apiRequest } from "../utils/api";

const DUMMY_GALLERY = [
  { _id: "dummy-1", heading: "Dresses", description: "", mediaUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop", mediaType: "image", category: "Dresses" },
  { _id: "dummy-2", heading: "Bags", description: "", mediaUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop", mediaType: "image", category: "Bags" },
  { _id: "dummy-3", heading: "Accessories", description: "", mediaUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=600&fit=crop", mediaType: "image", category: "Accessories" },
  { _id: "dummy-4", heading: "Outerwear", description: "", mediaUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop", mediaType: "image", category: "Outerwear" },
  { _id: "dummy-5", heading: "Bags", description: "", mediaUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop", mediaType: "image", category: "Bags" },
  { _id: "dummy-6", heading: "Dresses", description: "", mediaUrl: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=600&h=800&fit=crop", mediaType: "image", category: "Dresses" },
  { _id: "dummy-7", heading: "Tops", description: "", mediaUrl: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&h=600&fit=crop", mediaType: "image", category: "Tops" },
  { _id: "dummy-8", heading: "Skirts", description: "", mediaUrl: "https://images.unsplash.com/photo-1520975954732-57dd22299614?w=600&h=800&fit=crop", mediaType: "image", category: "Skirts" },
  { _id: "dummy-9", heading: "Accessories", description: "", mediaUrl: "https://images.unsplash.com/photo-1550614000-4b95d466f288?w=600&h=400&fit=crop", mediaType: "image", category: "Accessories" },
];

const GalleryPage = () => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "All");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await apiRequest("/gallery", "GET", null, 12000);
      if (!cancelled) {
        setItems([...(data?.success ? data.data || [] : []), ...DUMMY_GALLERY]);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(items.map((item) => item.category).filter(Boolean))
    );
    return ["All", ...unique];
  }, [items]);

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <div className="gallery-page">
      <div className="container">
        <div className="center-text" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.3em", fontSize: "0.8rem", color: "#C9A227" }}>
            Visuals
          </span>
          <h1 className="serif page-hero-heading" style={{ marginTop: "0.5rem" }}>
            Our Gallery
          </h1>
          <p style={{ color: "#666", maxWidth: "600px", margin: "1rem auto 0" }}>
            Explore our curated collection of styles and inspirations.
          </p>
        </div>

        {categories.length > 1 && (
          <div className="gallery-filter-bar">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`gallery-filter-pill ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <p style={{ textAlign: "center", color: "#666" }}>Loading gallery...</p>
        )}

        {!loading && filteredItems.length === 0 && (
          <p style={{ textAlign: "center", color: "#666" }}>
            Gallery looks are coming soon.
          </p>
        )}

        <div className="masonry-grid">
          {filteredItems.map((item, index) => (
            <button
              type="button"
              key={item._id}
              className="masonry-item"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setActiveItem(item)}
            >
              {item.mediaType === "video" ? (
                <video src={item.mediaUrl} muted playsInline preload="metadata" />
              ) : (
                <img src={item.mediaUrl} alt={item.heading} loading="lazy" />
              )}
              <div className="gallery-item-copy">
                <h3>{item.heading}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeItem && (
        <div className="gallery-lightbox" onClick={() => setActiveItem(null)} role="dialog" aria-modal="true">
          <button type="button" className="gallery-lightbox-close" onClick={() => setActiveItem(null)} aria-label="Close">
            <X size={22} />
          </button>
          <div className="gallery-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            {activeItem.mediaType === "video" ? (
              <video src={activeItem.mediaUrl} controls autoPlay playsInline />
            ) : (
              <img src={activeItem.mediaUrl} alt={activeItem.heading} />
            )}
            <div className="gallery-lightbox-copy">
              {activeItem.category && <span>{activeItem.category}</span>}
              <h2 className="serif">{activeItem.heading}</h2>
              {activeItem.description && <p>{activeItem.description}</p>}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gallery-filter-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 3rem;
        }

        .gallery-filter-pill {
          padding: 0.6rem 1.4rem;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: #fff;
          color: #444;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .gallery-filter-pill:hover {
          border-color: #0A0A0A;
          color: #0A0A0A;
        }

        .gallery-filter-pill.active {
          background: #0A0A0A;
          border-color: #0A0A0A;
          color: #fff;
        }

        .masonry-grid {
          column-count: 3;
          column-gap: 1.5rem;
        }

        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1.5rem;
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          animation: masonryFadeIn 0.4s ease both;
          width: 100%;
          padding: 0;
          border: none;
          background: #fff;
          text-align: left;
          display: block;
        }

        @keyframes masonryFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .masonry-item img,
        .masonry-item video {
          width: 100%;
          display: block;
          border-radius: 8px;
          background: #111;
        }

        .gallery-item-copy {
          padding: 0.85rem 0.15rem 0.2rem;
        }

        .gallery-item-copy h3 {
          font-size: 1rem;
          margin: 0 0 0.35rem;
          color: #0A0A0A;
        }

        .gallery-item-copy p {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.5;
          margin: 0;
        }

        .gallery-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.82);
          z-index: 4000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .gallery-lightbox-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: none;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .gallery-lightbox-inner {
          width: min(920px, 100%);
          max-height: 90vh;
          overflow: auto;
          background: #fff;
          border-radius: 12px;
        }

        .gallery-lightbox-inner img,
        .gallery-lightbox-inner video {
          width: 100%;
          max-height: 64vh;
          object-fit: contain;
          background: #0A0A0A;
          display: block;
        }

        .gallery-lightbox-copy {
          padding: 1.25rem 1.4rem 1.5rem;
        }

        .gallery-lightbox-copy span {
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.72rem;
          font-weight: 700;
          color: #C9A227;
          margin-bottom: 0.4rem;
        }

        .gallery-lightbox-copy h2 {
          font-size: 1.6rem;
          margin: 0 0 0.5rem;
        }

        .gallery-lightbox-copy p {
          color: #555;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 900px) {
          .masonry-grid {
            column-count: 2;
          }
        }
        @media (max-width: 600px) {
          .masonry-grid {
            column-count: 1;
            column-gap: 0.75rem;
          }
          .masonry-item {
            margin-bottom: 1.1rem;
          }
          .gallery-filter-pill {
            padding: 0.5rem 1.1rem;
            font-size: 0.72rem;
          }
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;
