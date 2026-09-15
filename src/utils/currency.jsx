import React from "react";

export const CEDI = "\u20B5";

const formatNumber = (amount, decimals) => {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const digits =
    decimals === 0
      ? 0
      : decimals != null
        ? decimals
        : Number.isInteger(safe)
          ? 0
          : 2;
  return safe.toLocaleString("en-GH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

/** Plain text for labels, SMS, WhatsApp, charts. */
export const formatCedis = (amount, decimals) =>
  `GH${CEDI}${formatNumber(amount, decimals)}`;

export const CediIcon = ({ size = "1em", className = "" }) => (
  <svg
    className={`cedi-icon ${className}`.trim()}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M19 6.2C17 4.1 14.2 2.8 11 2.8 6.3 2.8 2.8 6.9 2.8 12S6.3 21.2 11 21.2c3.2 0 6-1.3 8-3.4"
      stroke="currentColor"
      strokeWidth="2.35"
      strokeLinecap="round"
    />
    <path
      d="M12 2.2v19.6"
      stroke="currentColor"
      strokeWidth="2.35"
      strokeLinecap="round"
    />
  </svg>
);

/** On-screen amount with a Ghana cedi mark (not a dollar sign). */
export const Cedis = ({ value, decimals, className = "" }) => (
  <span className={`cedis-amount ${className}`.trim()} translate="no">
    <span className="cedis-prefix">
      GH
      <CediIcon />
    </span>
    {formatNumber(value, decimals)}
  </span>
);

export default formatCedis;
