import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, ShoppingBag, Award } from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import { Cedis } from "../utils/currency";

const ShopPage = ({ products = [], categories = [] }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recommended");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    const cat = searchParams.get("category");
    if (cat) {
      setActiveCategory(cat.toLowerCase());
    }
  }, [searchParams]);

  const filteredProducts = products
    .filter((product) => {
      // Hide if sold out > 3 days ago
      const isSoldOut =
        product.status === "Sold Out" ||
        product.stock === 0 ||
        !!product.soldOutAt;
      if (isSoldOut && product.soldOutAt) {
        const soldDate = new Date(product.soldOutAt);
        const daysSoldOut = (new Date() - soldDate) / (1000 * 60 * 60 * 24);
        if (daysSoldOut > 3) return false;
      }

      const matchesCategory =
        activeCategory === "all" ||
        product.category?.toLowerCase() === activeCategory.toLowerCase();

      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice = parseFloat(product.price) <= maxPrice;

      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "Price: Low to High")
        return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "Price: High to Low")
        return parseFloat(b.price) - parseFloat(a.price);
      return 0;
    });

  useEffect(() => {
    window.scrollTo(0, 0);
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(
        (entry) => entry.isIntersecting && entry.target.classList.add("active"),
      );
    }, observerOptions);
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeCategory, searchQuery, sortBy, maxPrice]);

  const isSearching = Boolean(searchQuery.trim());

  const categoryTabs = [
    { id: "all", label: "All Collections" },
    ...categories.map((c) =>
      typeof c === "object" ? c : { id: c.toLowerCase(), label: c },
    ),
  ];

  return (
    <div className={`shop-page-wrapper${isSearching ? " is-searching" : ""}`}>
      {!isSearching && (
        <section className="shop-hero">
          <div className="center-text reveal">
            <span className="shop-hero-brand">WELAMA</span>
            <h1 className="serif shop-hero-title">Elegance, Curated</h1>
          </div>
        </section>
      )}

      <section className="shop-section">
        <div className="container">
          <div className="shop-layout">
            {/* Desktop Sidebar / Mobile Filter Drawer Wrapper */}
            <aside
              className={`shop-sidebar ${showFilters ? "mobile-open" : ""}`}
            >
              <div className="sidebar-inner">
                <div className="sidebar-header mobile-only">
                  <h3 className="serif">Filter & Sort</h3>
                  <button
                    className="close-filters"
                    onClick={() => setShowFilters(false)}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="sidebar-section">
                  <h4 className="sidebar-title">Search</h4>
                  <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Find your product..."
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sidebar-section">
                  <h4 className="sidebar-title">Categories</h4>
                  <div className="category-list">
                    {categoryTabs.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          if (window.innerWidth <= 767) setShowFilters(false);
                        }}
                        className={`category-item-btn ${activeCategory === cat.id ? "active" : ""}`}
                      >
                        <span className="cat-icon">
                          {cat.id === "all" && <ShoppingBag size={18} />}
                          {cat.id !== "all" && <Award size={18} />}
                        </span>
                        <span className="cat-label">{cat.label}</span>
                        <span className="cat-count">
                          {cat.id === "all"
                            ? products.length
                            : products.filter(
                                (p) => p.category?.toLowerCase() === cat.id,
                              ).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sidebar-section">
                  <h4 className="sidebar-title">Price Range</h4>
                  <div className="price-filter">
                    <div className="price-labels">
                      <span><Cedis value={0} /></span>
                      <span><Cedis value={maxPrice} /></span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="50"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="price-slider"
                    />
                    <p className="price-hint">Under <Cedis value={maxPrice} /></p>
                  </div>
                </div>

                <div className="sidebar-section mobile-only">
                  <h4 className="sidebar-title">Sort By</h4>
                  <div className="mobile-sort-options">
                    {[
                      "Recommended",
                      "Price: Low to High",
                      "Price: High to Low",
                    ].map((opt) => (
                      <button
                        key={opt}
                        className={`sort-option-btn ${sortBy === opt ? "active" : ""}`}
                        onClick={() => {
                          setSortBy(opt);
                          setShowFilters(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sidebar-footer mobile-only">
                  <button
                    className="apply-btn"
                    onClick={() => setShowFilters(false)}
                  >
                    Show {filteredProducts.length} Results
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Product Area */}
            <div className="shop-content">
              {/* Mobile Only Header Actions */}
              <div className="mobile-shop-header mobile-only">
                <div className="mobile-page-title-area">
                  <h1 className="mobile-shop-title">Shop All</h1>
                  <p className="mobile-shop-subtitle">
                    WELAMA — Elegance online
                  </p>
                </div>
              </div>

              <div className="mobile-shop-sticky mobile-only">
                <div className="mobile-category-filters">
                  <p className="mobile-filter-label">Categories</p>
                  <div className="mobile-category-scroll-row" role="tablist" aria-label="Filter by category">
                    {categoryTabs.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        role="tab"
                        aria-selected={activeCategory === cat.id}
                        className={`mobile-cat-pill ${activeCategory === cat.id ? "active" : ""}`}
                        onClick={() => setActiveCategory(cat.id)}
                      >
                        {cat.id === "all" ? "All" : cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mobile-item-count">
                  Showing <b>{filteredProducts.length}</b> items
                </div>
              </div>

              {/* Desktop Only Controls */}
              <div className="shop-toolbar desktop-only reveal">
                <div className="results-info">
                  Showing{" "}
                  <span className="highlight">{filteredProducts.length}</span>{" "}
                  pieces
                </div>
                <div className="toolbar-actions">
                  <label>Sort By:</label>
                  <select
                    className="premium-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Chips */}
              {(activeCategory !== "all" || searchQuery || maxPrice < 1000) && (
                <div className="active-filters-row">
                  {activeCategory !== "all" && (
                    <div className="filter-chip">
                      {categoryTabs.find((c) => c.id === activeCategory)?.label}
                      <X size={14} onClick={() => setActiveCategory("all")} />
                    </div>
                  )}
                  {searchQuery && (
                    <div className="filter-chip">
                      "{searchQuery}"
                      <X size={14} onClick={() => setSearchQuery("")} />
                    </div>
                  )}
                  {maxPrice < 1000 && (
                    <div className="filter-chip">
                      Under <Cedis value={maxPrice} />
                      <X size={14} onClick={() => setMaxPrice(1000)} />
                    </div>
                  )}
                </div>
              )}

              <div className="shop-results-container">
                {filteredProducts.length > 0 ? (
                  <div className="product-grid-shop fade-in">
                    {filteredProducts.map((p, index) => (
                      <ProductCard key={p._id || p.id} {...p} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="no-results reveal">
                    <div className="no-results-icon">
                      <Search size={48} />
                    </div>
                    <h3>No products match your criteria</h3>
                    <p>
                      Try adjusting your filters or searching for something
                      else.
                    </p>
                    <button
                      className="clear-all-btn"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("all");
                        setMaxPrice(1000);
                      }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sidebar Backdrop */}
      {showFilters && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setShowFilters(false)}
        ></div>
      )}
    </div>
  );
};

export default ShopPage;
