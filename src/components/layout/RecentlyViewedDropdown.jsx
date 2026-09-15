import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const RecentlyViewedDropdown = () => {
  const [recent, setRecent] = useState([]);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();
  const scrollerRef = useRef(null);

  const loadRecent = () => {
    const data = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    setRecent(data.slice(0, 8));
  };

  useEffect(() => {
    loadRecent();
    window.addEventListener("storage", loadRecent);
    return () => window.removeEventListener("storage", loadRecent);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || recent.length < 2) return;

    const id = setInterval(() => {
      if (paused || !scrollerRef.current) return;
      const track = scrollerRef.current;
      const step = 52;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      track.scrollTo({
        left: atEnd ? 0 : track.scrollLeft + step,
        behavior: "smooth",
      });
    }, 2200);

    return () => clearInterval(id);
  }, [recent, paused]);

  if (recent.length === 0) return null;

  return (
    <div
      className="nav-recent-carousel desktop-only"
      aria-label="Recently viewed"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="nav-recent-track" ref={scrollerRef}>
        {recent.map((p) => (
          <button
            key={p._id || p.id}
            type="button"
            className="nav-recent-thumb"
            title={p.name}
            onClick={() => navigate(`/product/${p._id || p.id}`)}
          >
            <img src={p.image} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedDropdown;
