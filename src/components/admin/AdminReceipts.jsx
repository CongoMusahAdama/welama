import React, { useState } from "react";
import { Receipt, CheckCircle } from "lucide-react";
import ReceiptModal from "../modals/ReceiptModal";
import { Cedis } from "../../utils/currency";

const AdminReceipts = ({ orders, updateOrder, settings, products = [] }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Generate Receipt</h1>
          <p>
            Pick an order and tap to generate its receipt. {orders.length} order
            {orders.length !== 1 ? "s" : ""} available.
          </p>
        </div>
      </header>

      <div className="admin-card" style={{ padding: "0" }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>Receipt #</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((order, index) => (
                <tr key={order._id || order.id}>
                  <td data-label="#">{indexOfFirstItem + index + 1}</td>
                  <td data-label="Receipt #" style={{ fontWeight: 700 }}>
                    RC-
                    {order.orderId?.split("-")[1] ||
                      order.id?.split("-")[1] ||
                      (order._id
                        ? order._id.substring(order._id.length - 4)
                        : "0000")}
                  </td>
                  <td data-label="Customer">{order.customer}</td>
                  <td data-label="Product">{order.items[0]?.name || "N/A"}</td>
                  <td data-label="Category">
                    {order.items[0]?.category || "N/A"}
                  </td>
                  <td data-label="Qty">{order.items[0]?.qty || "1"}</td>
                  <td data-label="Total"><Cedis value={order.total} /></td>
                  <td data-label="Payment">
                    <span
                      className={`badge ${order.payment === "Paid" ? "badge-success" : "badge-warning"}`}
                      style={{
                        padding: "0.4rem 0.8rem",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background:
                          order.payment === "Paid" ? "#f0fdf4" : "#fffbeb",
                        color: order.payment === "Paid" ? "#16a34a" : "#d97706",
                      }}
                    >
                      {order.payment}
                    </span>
                  </td>
                  <td data-label="Date">{order.date}</td>
                  <td data-label="Actions">
                    <div
                      style={{
                        display: "flex",
                        gap: "0.4rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => setSelectedReceipt(order)}
                        style={{
                          padding: "0.6rem 1rem",
                          borderRadius: "10px",
                          background: "#0A0A0A",
                          color: "white",
                          border: "none",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          width: "max-content",
                        }}
                      >
                        <Receipt size={14} />
                        Receipt
                      </button>

                      {order.payment !== "Paid" && (
                        <button
                          onClick={() =>
                            updateOrder(order._id || order.id, {
                              payment: "Paid",
                            })
                          }
                          style={{
                            padding: "0.6rem 1rem",
                            borderRadius: "10px",
                            background: "#16a34a",
                            color: "white",
                            border: "none",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            width: "max-content",
                          }}
                        >
                          <CheckCircle size={14} />
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
              Page {currentPage} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="pagination-btn"
              >
                Back
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

export default AdminReceipts;
