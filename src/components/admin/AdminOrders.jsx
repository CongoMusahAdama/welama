import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  X, 
  Sparkles, 
  Eye, 
  Trash2, 
  MessageCircle, 
  Scissors, 
  FileText, 
  Phone,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import ReceiptModal from "../modals/ReceiptModal";
import { Cedis } from "../../utils/currency";
import { catalogProductId } from "../../utils/productId";
import { sellingPrice } from "../../utils/sellingPrice";

const AdminOrders = ({ 
  orders, 
  fetchOrders, 
  addOrder, 
  updateOrder, 
  deleteOrder, 
  products,
  settings 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedCustomRequest, setSelectedCustomRequest] = useState(null);
  const [filterTab, setFilterTab] = useState("all"); // "all", "standard", "custom"
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchId = searchParams.get("search");
    if (searchId) {
      setSearchTerm(searchId);
      setCurrentPage(1);
    }
  }, [location.search]);

  useEffect(() => {
    if (showModal || selectedCustomRequest) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, selectedCustomRequest]);

  const [newOrder, setNewOrder] = useState({
    customer: "",
    phone: "",
    location: "",
    productName: products[0]?.name || "",
    qty: 1,
    payment: "Unpaid",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const prod =
      products.find((p) => p.name === newOrder.productName) || products[0];
    if (!prod) return;
    addOrder({
      customer: newOrder.customer,
      phone: newOrder.phone,
      location: newOrder.location,
      total: sellingPrice(prod) * newOrder.qty,
      items: [{
        name: newOrder.productName,
        qty: parseInt(newOrder.qty),
        productId: catalogProductId(prod._id || prod.id),
        image: prod.image || "",
        price: sellingPrice(prod),
      }],
      payment: newOrder.payment,
      status: "Processing",
    });
    setShowModal(false);
    setNewOrder({
      customer: "",
      phone: "",
      location: "",
      productName: products[0]?.name || "",
      qty: 1,
      payment: "Unpaid",
    });
  };

  const customRequestsCount = orders.filter((o) => o.isCustomRequest).length;
  const standardOrdersCount = orders.filter((o) => !o.isCustomRequest).length;

  const filteredOrders = orders.filter((o) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = (
      (o.customer && o.customer.toLowerCase().includes(s)) ||
      (o.orderId && o.orderId.toLowerCase().includes(s)) ||
      (o.phone && o.phone.includes(searchTerm)) ||
      (o._id && o._id.toString().toLowerCase().includes(s)) ||
      (o.notes && o.notes.toLowerCase().includes(s))
    );

    if (!matchesSearch) return false;

    if (filterTab === "custom") return o.isCustomRequest;
    if (filterTab === "standard") return !o.isCustomRequest;
    return true;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const openWhatsApp = (order) => {
    const cleanPhone = (order.phone || "").replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      `Hello ${order.customer}, this is WELAMA Concierge regarding your order #${order.orderId || order._id}. We'd like to confirm the details with you.`
    )}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Orders & Custom Requests</h1>
          <p>Manage standard sales & bespoke client customization orders ({orders.length} Total)</p>
        </div>

        <div className="admin-search-wrap" style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search customer, ID, phone, notes..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.6rem 1rem 0.6rem 2.2rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.85rem',
              width: '260px',
              background: '#f8fafc'
            }}
          />
        </div>

        <div
          className="header-actions"
          style={{ display: "flex", gap: "1rem" }}
        >
          <button
            onClick={() => {
              fetchOrders();
              Swal.fire({
                title: "Syncing...",
                text: "Fetching latest orders from MongoDB.",
                icon: "info",
                timer: 1000,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
              });
            }}
            className="cta-button-premium"
            style={{
              padding: "0.8rem 1.2rem",
              fontSize: "0.75rem",
              borderRadius: "12px",
              background: "#f8fafc",
              color: "#64748b",
              border: "1px solid #e2e8f0",
            }}
          >
            <Sparkles size={16} /> Sync Orders
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="cta-button-premium"
            style={{
              padding: "0.8rem 1.5rem",
              fontSize: "0.75rem",
              borderRadius: "12px",
            }}
          >
            <Plus size={16} /> Record Sale
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => { setFilterTab("all"); setCurrentPage(1); }}
          style={{
            padding: "0.6rem 1.25rem",
            borderRadius: "12px",
            border: filterTab === "all" ? "1px solid #0A0A0A" : "1px solid #e2e8f0",
            background: filterTab === "all" ? "#0A0A0A" : "white",
            color: filterTab === "all" ? "white" : "#64748b",
            fontWeight: 700,
            fontSize: "0.8rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          All Orders ({orders.length})
        </button>

        <button
          onClick={() => { setFilterTab("standard"); setCurrentPage(1); }}
          style={{
            padding: "0.6rem 1.25rem",
            borderRadius: "12px",
            border: filterTab === "standard" ? "1px solid #0A0A0A" : "1px solid #e2e8f0",
            background: filterTab === "standard" ? "#0A0A0A" : "white",
            color: filterTab === "standard" ? "white" : "#64748b",
            fontWeight: 700,
            fontSize: "0.8rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Standard Orders ({standardOrdersCount})
        </button>

        <button
          onClick={() => { setFilterTab("custom"); setCurrentPage(1); }}
          style={{
            padding: "0.6rem 1.25rem",
            borderRadius: "12px",
            border: filterTab === "custom" ? "1px solid #C9A227" : "1px solid #e2e8f0",
            background: filterTab === "custom" ? "rgba(201, 162, 39, 0.12)" : "white",
            color: filterTab === "custom" ? "#854d0e" : "#64748b",
            fontWeight: 800,
            fontSize: "0.8rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "all 0.2s",
          }}
        >
          <Scissors size={15} color="#C9A227" /> Custom Requests ({customRequestsCount})
        </button>
      </div>

      {/* Record New Sale Modal */}
      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="admin-modal-card modal-narrow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-pull-handle"></div>
            <div className="modal-header-premium">
              <div>
                <h2 className="serif">Record New Sale</h2>
                <p>Create a manual order for offline or WhatsApp sales.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="sidebar-minimize-toggle"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="modal-content-scroll">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    required
                    value={newOrder.customer}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, customer: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>WhatsApp / Phone</label>
                  <input
                    type="text"
                    required
                    value={newOrder.phone}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, phone: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Shipping Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Accra, Osu"
                    value={newOrder.location}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, location: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Select Product</label>
                  <select
                    value={newOrder.productName}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, productName: e.target.value })
                    }
                  >
                    {products.length > 0 ? (
                      products.map((p, idx) => (
                        <option key={p._id || p.id || idx} value={p.name}>
                          {p.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No products available</option>
                    )}
                  </select>
                </div>
                <div
                  className="form-grid-2"
                  style={{
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginTop: "0.25rem",
                  }}
                >
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={newOrder.qty}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, qty: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment State</label>
                    <select
                      value={newOrder.payment}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, payment: e.target.value })
                      }
                    >
                      <option>Unpaid</option>
                      <option>Paid</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer-premium">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-cancel-premium"
                >
                  <X size={16} /> Close
                </button>
                <button
                  type="submit"
                  className="cta-button-premium shadowed"
                  style={{ flex: 2, padding: "1rem", borderRadius: "14px" }}
                >
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Request Detail Modal */}
      {selectedCustomRequest && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedCustomRequest(null)}
          style={{ zIndex: 1000002 }}
        >
          <div
            className="admin-modal-card modal-narrow"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "560px" }}
          >
            <div className="modal-pull-handle"></div>
            <div className="modal-header-premium">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ background: "rgba(201, 162, 39, 0.15)", padding: "10px", borderRadius: "12px" }}>
                  <Scissors size={22} color="#C9A227" />
                </div>
                <div>
                  <h2 className="serif" style={{ margin: 0, fontSize: "1.25rem" }}>
                    Custom Client Request
                  </h2>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                    Order #{selectedCustomRequest.orderId || selectedCustomRequest._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomRequest(null)}
                className="sidebar-minimize-toggle"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="modal-content-scroll" style={{ padding: "1.5rem" }}>
              {/* Customer Info Card */}
              <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "1.25rem", marginBottom: "1.25rem", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Client Details</span>
                  <button
                    onClick={() => openWhatsApp(selectedCustomRequest)}
                    className="cta-button-premium"
                    style={{
                      background: "#25D366",
                      color: "white",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <MessageCircle size={14} /> WhatsApp Client
                  </button>
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0A0A0A" }}>
                  {selectedCustomRequest.customer}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "2px" }}>
                  📞 {selectedCustomRequest.phone} • 📍 {selectedCustomRequest.location || "Location not provided"}
                </div>
              </div>

              {/* Custom Item Details */}
              <div style={{ marginBottom: "1.25rem" }}>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.75rem" }}>
                  Requested Specifications:
                </h4>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1rem" }}>
                  {(selectedCustomRequest.items || []).map((it, idx) => (
                    <div key={idx} style={{ marginBottom: "0.5rem" }}>
                      <div style={{ fontWeight: 700, color: "#0A0A0A" }}>{it.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        Category: <strong>{it.category || "Custom"}</strong> | Size: <strong>{it.size || "M"}</strong> | Qty: <strong>{it.qty || 1}</strong>
                      </div>
                    </div>
                  ))}
                  {selectedCustomRequest.notes && (
                    <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed #cbd5e1" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                        Customer Notes & Instructions:
                      </span>
                      <pre style={{
                        marginTop: "0.4rem",
                        fontFamily: "inherit",
                        whiteSpace: "pre-wrap",
                        background: "#f8fafc",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        color: "#334155",
                        border: "1px solid #f1f5f9"
                      }}>
                        {selectedCustomRequest.notes}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Status Controls */}
              <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "1.25rem", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "0.3rem" }}>
                      Agreed Price (GHS)
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedCustomRequest.total || 0}
                      onBlur={(e) => {
                        const newTotal = parseFloat(e.target.value) || 0;
                        updateOrder(selectedCustomRequest._id || selectedCustomRequest.id, { total: newTotal });
                      }}
                      style={{
                        width: "100%",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "0.3rem" }}>
                      Payment State
                    </label>
                    <select
                      value={selectedCustomRequest.payment}
                      onChange={(e) => {
                        updateOrder(selectedCustomRequest._id || selectedCustomRequest.id, { payment: e.target.value });
                        setSelectedCustomRequest((prev) => ({ ...prev, payment: e.target.value }));
                      }}
                      style={{
                        width: "100%",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-premium" style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setSelectedCustomRequest(null)}
                className="btn-cancel-premium"
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedReceipt(selectedCustomRequest);
                  setSelectedCustomRequest(null);
                }}
                className="cta-button-premium"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
              >
                <FileText size={16} /> View Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="admin-card" style={{ padding: "0" }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Proof</th>
                <th>Location</th>
                <th>Price</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                    No orders found matching this view.
                  </td>
                </tr>
              ) : (
                currentItems.map((order, index) => {
                  const focused =
                    searchTerm &&
                    String(order.orderId || "").toLowerCase() === searchTerm.toLowerCase();
                  return (
                  <tr
                    key={order._id || order.id}
                    data-admin-order={order.orderId || order.id}
                    style={focused ? { background: "rgba(201, 162, 39, 0.14)" } : undefined}
                  >
                    <td data-label="#">{indexOfFirstItem + index + 1}</td>
                    <td
                      data-label="Order ID"
                      style={{ fontWeight: 700, color: "#0A0A0A" }}
                    >
                      #{order.orderId || order.id}
                    </td>
                    <td data-label="Customer">
                      <div style={{ fontWeight: 600 }}>{order.customer}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {order.phone}
                      </div>
                    </td>
                    <td data-label="Type">
                      {order.isCustomRequest ? (
                        <button
                          onClick={() => setSelectedCustomRequest(order)}
                          style={{
                            background: "rgba(201, 162, 39, 0.15)",
                            color: "#854d0e",
                            border: "1px solid rgba(201, 162, 39, 0.3)",
                            padding: "0.3rem 0.6rem",
                            borderRadius: "8px",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <Scissors size={12} /> Custom
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Standard</span>
                      )}
                    </td>
                    <td data-label="Proof">
                      {order.paymentScreenshot ? (
                        <button
                          className="btn-view-proof"
                          onClick={() => {
                            Swal.fire({
                              title: "Payment Screenshot",
                              imageUrl: order.paymentScreenshot,
                              imageAlt: "Payment Proof",
                              confirmButtonColor: "#0A0A0A",
                              confirmButtonText: "Great, Close",
                            });
                          }}
                          style={{
                            background: "#f0fdf4",
                            color: "#16a34a",
                            border: "1px solid #dcfce7",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "8px",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          <Eye
                            size={14}
                            style={{ display: "inline", marginRight: "4px" }}
                          />{" "}
                          View
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                          None
                        </span>
                      )}
                    </td>
                    <td data-label="Location" style={{ fontSize: "0.85rem" }}>
                      {order.location || "N/A"}
                    </td>
                    <td data-label="Price" style={{ fontWeight: 700 }}>
                      <Cedis value={order.total} />
                    </td>
                    <td data-label="Payment">
                      <span
                        className={`badge ${order.payment === "Paid" ? "badge-paid" : "badge-unpaid"}`}
                      >
                        {order.payment}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span
                        className={`badge badge-${order.status?.toLowerCase() || 'pending'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td data-label="Actions" style={{ textAlign: "center" }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
                        <button
                          onClick={() => setSelectedReceipt(order)}
                          title="Generate & View Receipt"
                          style={{
                            background: '#0A0A0A',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          <FileText size={13} /> Receipt
                        </button>
                        {order.isCustomRequest && (
                          <button
                            onClick={() => setSelectedCustomRequest(order)}
                            title="View Custom Request Specs"
                            style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              padding: '0.4rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Scissors size={15} />
                          </button>
                        )}
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrder(order._id || order.id, {
                              status: e.target.value,
                            })
                          }
                          style={{
                            padding: "0.4rem 0.5rem",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: "#334155",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Blocked">Blocked</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => deleteOrder(order._id || order.id)}
                          style={{
                            background: '#fff1f2',
                            color: '#e11d48',
                            border: '1px solid #fee2e2',
                            padding: '0.4rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div
            className="pagination-wrapper"
            style={{
              padding: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length}{" "}
              records
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="pagination-btn"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedReceipt && (
        <ReceiptModal
          order={selectedReceipt}
          settings={settings}
          products={products}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};

export default AdminOrders;
