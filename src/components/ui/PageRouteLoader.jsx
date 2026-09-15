import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const PageRouteLoader = () => {
  const location = useLocation();
  const first = useRef(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }

    if (location.pathname.startsWith("/admin")) return undefined;

    setVisible(true);
    const hide = window.setTimeout(() => setVisible(false), 520);
    return () => window.clearTimeout(hide);
  }, [location.pathname, location.search]);

  if (!visible) return null;

  return (
    <div className="page-route-loader" aria-live="polite" aria-busy="true">
      <div className="page-route-spinner" role="status" aria-label="Loading page">
        <span className="page-route-spinner-ring" />
        <span className="page-route-spinner-dot" />
      </div>
    </div>
  );
};

export default PageRouteLoader;
