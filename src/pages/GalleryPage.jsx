import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { apiRequest } from "../utils/api";

const FALLBACK_SRC = "/welamalogo.png";

const usableUrl = (url) =>
  typeof url === "string" &&
  url.trim() &&
  !url.startsWith("blob:") &&
  !url.includes("undefined");

const GalleryPage = () => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const gridRef = useRef(null);

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
      if (cancelled) return;
      const remote = (data?.success ? data.data || [] : []).filter((item) =>
        usableUrl(item.mediaUrl)
      );
      setItems(remote);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = gridRef.current;
    if (!root) return undefined;

    const cards = root.querySelectorAll(".masonry-item");
    if (!cards.length) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => card.classList.add("in-view"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [items, activeCategory, loading]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
    return ["All", ...unique];
  }, [items]);

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const handleBrokenMedia = (event) => {
    if (event.currentTarget.dataset.fallback === "1") return;
    event.currentTarget.dataset.fallback = "1";
    event.currentTarget.src = FALLBACK_SRC;
  };

  return (
    <div className="gallery-page">
      <div className="container">
        <div className="gallery-intro center-text">
          <span className="gallery-kicker">Visuals</span>
          <h1 className="serif page-hero-heading">
            WELAMA Gallery
          </h1>
          <p>
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

        {loading && items.length === 0 && (
          <p style={{ textAlign: "center", color: "#666" }}>Loading gallery...</p>
        )}

        {!loading && filteredItems.length === 0 && (
          <p style={{ textAlign: "center", color: "#666" }}>
            Gallery looks are coming soon.
          </p>
        )}

        <div className="masonry-grid" ref={gridRef}>
          {filteredItems.map((item, index) => (
            <button
              type="button"
              key={item._id}
              className="masonry-item"
              style={{ "--reveal-delay": `${Math.min(index, 8) * 70}ms` }}
              onClick={() => setActiveItem(item)}
            >
              {item.mediaType === "video" ? (
                <video src={item.mediaUrl} muted playsInline preload="metadata" onError={handleBrokenMedia} />
              ) : (
                <img
                  src={usableUrl(item.mediaUrl) ? item.mediaUrl : FALLBACK_SRC}
                  alt={item.heading}
                  loading="lazy"
                  onError={handleBrokenMedia}
                />
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
              <video src={activeItem.mediaUrl} controls autoPlay playsInline onError={handleBrokenMedia} />
            ) : (
              <img
                src={usableUrl(activeItem.mediaUrl) ? activeItem.mediaUrl : FALLBACK_SRC}
                alt={activeItem.heading}
                onError={handleBrokenMedia}
              />
            )}
            <div className="gallery-lightbox-copy">
              {activeItem.category && <span>{activeItem.category}</span>}
              <h2 className="serif">{activeItem.heading}</h2>
              {activeItem.description && <p>{activeItem.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
