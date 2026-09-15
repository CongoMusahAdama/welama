import React from "react";

const ReceiptCedi = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
    <path d="M16 8.25c-.85-1-2.15-1.6-3.65-1.6-2.55 0-4.35 1.85-4.35 5.35s1.8 5.35 4.35 5.35c1.5 0 2.8-.6 3.65-1.6" />
    <path d="M11.2 5.7v12.6" />
  </svg>
);

export default ReceiptCedi;
