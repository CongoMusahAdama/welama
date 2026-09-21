import React from "react";

const ProductDescription = ({ text, className = "" }) => {
  const parts = String(text || "")
    .trim()
    .split(/\n+/)
    .map((para) => para.trim())
    .filter(Boolean);

  if (!parts.length) return null;

  return (
    <div className={`product-detail-description ${className}`.trim()}>
      <h3>Description</h3>
      {parts.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
};

export default ProductDescription;
