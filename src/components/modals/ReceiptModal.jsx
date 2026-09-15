import React, { useState } from "react";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";
import Swal from "sweetalert2";
import { Cedis } from "../utils/currency";

const resolveItemImage = (item, products = []) => {
  if (item?.image && !String(item.image).startsWith("blob:")) return item.image;
  const pid = item?.productId?._id || item?.productId;
  const byId = products.find((p) => (p._id || p.id) === pid || String(p._id) === String(pid));
  if (byId?.image) return byId.image;
  const baseName = String(item?.name || "").split(" (")[0].trim().toLowerCase();
  const byName = products.find((p) => String(p.name || "").toLowerCase() === baseName);
  return byName?.image || "/welamalogo.png";
};

const ReceiptModal = ({ order, onClose, settings, products = [] }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const receiptRef = React.useRef(null);
  const logoUrl = settings?.logoUrl || "/welamalogo.png";
  const siteName = settings?.siteName || "WELAMA";
  const tagline = settings?.tagline || "The Essence of Luxury";

  if (!order) return null;

  const handleDownloadAndShare = async () => {
    setIsGenerating(true);
    const element = receiptRef.current;

    const opt = {
      margin: 10,
      filename: `Receipt_RC-${order.orderId?.split("-")[1]?.toUpperCase() || order._id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      await html2pdf().set(opt).from(element).save();
      // After download, open whatsapp sharing in a new tab
      const waText = `Hello ${order.customer}, thank you for your purchase from ${siteName}! We've attached your digital receipt RC-${order.orderId?.split("-")[1]?.toUpperCase() || order._id} for your records. Let us know if you need anything else!`;
      const waUrl = `https://wa.me/${order.phone ? order.phone.replace(/[^0-9]/g, "") : ""}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, "_blank");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not generate receipt PDF.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="admin-modal-overlay"
      onClick={onClose}
      style={{ zIndex: 1000001 }}
    >
      <div
        className="admin-modal-card modal-narrow"
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", padding: "0", border: "1px solid #eee" }}
      >
        <div
          ref={receiptRef}
          style={{
            background: "#fff",
            padding: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Watermark Logo */}
          <img
            src={logoUrl}
            alt="Watermark"
            crossOrigin="anonymous"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0.05,
              width: "80%",
              objectFit: "contain",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                borderBottom: "2px solid #f8fafc",
                paddingBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
                <img
                  src={logoUrl}
                  alt={siteName}
                  crossOrigin="anonymous"
                  style={{ maxHeight: "45px", maxWidth: "160px", objectFit: "contain" }}
                />
              </div>
              <h2
                className="serif"
                style={{ color: "#0A0A0A", fontSize: "1.4rem", margin: "0" }}
              >
                {siteName}
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.85rem",
                  margin: "0.25rem 0",
                }}
              >
                {tagline}
              </p>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#94a3b8",
                  marginTop: "0.5rem",
                }}
              >
                Receipt #: RC-
                {order.orderId?.split("-")[1]?.toUpperCase() || order._id} |
                Date: {order.date}
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <span style={{ color: "#64748b", fontWeight: 600 }}>
                  Customer
                </span>
                <span style={{ fontWeight: 700 }}>{order.customer}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <span style={{ color: "#64748b", fontWeight: 600 }}>
                  Location
                </span>
                <span style={{ fontWeight: 700 }}>
                  {order.location || "N/A"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontWeight: 600 }}>
                  Payment Method
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: order.payment === "Paid" ? "#16a34a" : "#d97706",
                  }}
                >
                  {order.payment}
                </span>
              </div>
            </div>

            <div
              style={{
                background: "rgba(248, 250, 252, 0.8)",
                borderRadius: "12px",
                padding: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 800,
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: "0.75rem",
                  marginBottom: "0.75rem",
                  fontSize: "0.75rem",
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                <span>Item</span>
                <div style={{ display: "flex", gap: "3rem" }}>
                  <span>Qty</span>
                  <span>Price</span>
                </div>
              </div>
              {(order.items || []).map((item, idx) => {
                const itemSpec = [
                  item.size && `Size: ${item.size}`,
                  item.color && `Color: ${item.color}`
                ].filter(Boolean).join(" • ");

                const photo = resolveItemImage(item, products);
                const lineTotal = Number(item.price || order.total / (order.items?.length || 1));

                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, flex: 1 }}>
                      <img
                        src={photo}
                        alt=""
                        crossOrigin="anonymous"
                        style={{
                          width: "56px",
                          height: "56px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          flexShrink: 0,
                          background: "#fff",
                        }}
                      />
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ fontSize: "0.9rem", color: "#0A0A0A" }}>{item.name}</span>
                        {itemSpec && (
                          <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                            {itemSpec}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexShrink: 0 }}>
                      <span>x{item.qty}</span>
                      <span><Cedis value={lineTotal} decimals={2} /></span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "2px solid #0A0A0A",
                paddingTop: "1.5rem",
                marginTop: "1rem",
              }}
            >
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#1e293b",
                }}
              >
                Total Amount
              </span>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  color: "#0A0A0A",
                }}
              >
                <Cedis value={order.total} decimals={2} />
              </span>
            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: "2.5rem",
                color: "#64748b",
                fontSize: "0.8rem",
                fontStyle: "italic",
              }}
            >
              Thank you for choosing luxury. Visit again!
            </div>
          </div>
        </div>

        <div
          className="modal-footer-premium"
          style={{
            marginTop: "0",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            borderBottomLeftRadius: "24px",
            borderBottomRightRadius: "24px",
            padding: "1.5rem",
            display: "flex",
            gap: "1rem"
          }}
        >
          <button
            className="btn-cancel-premium"
            onClick={onClose}
            style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }}
          >
            Close
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.8rem",
              borderRadius: "12px",
              border: "none",
              background: "#dc2626",
              color: "#fff",
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: isGenerating ? "not-allowed" : "pointer",
              opacity: isGenerating ? 0.7 : 1,
            }}
            onClick={handleDownloadAndShare}
            disabled={isGenerating}
          >
            {isGenerating ? (
              "Processing..."
            ) : (
              <>
                <Download size={16} /> Save PDF & WA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
