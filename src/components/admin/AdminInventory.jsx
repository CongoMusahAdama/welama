import React, { useState } from "react";
import { Search } from "lucide-react";
import { hasVariants, productFullySoldOut, totalStock } from "../../utils/productStock";

const AdminInventory = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtering
  const filteredProducts = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Inventory Health</h1>
          <p>Real-time stock tracking — {filteredProducts.length} Items</p>
        </div>
        <div className="admin-search-wrap" style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search products or SKU..." 
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
      </header>

      <div className="admin-card" style={{ padding: "0" }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Available Stock</th>
                <th>Safety Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((p) => {
                const remaining = totalStock(p);
                const soldOut = productFullySoldOut(p);
                return (
                <tr key={p._id || p.id}>
                  <td data-label="Product">
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    {hasVariants(p) && (
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.35rem", display: "grid", gap: "0.15rem" }}>
                        {p.variants.map((row, idx) => (
                          <span key={`${row.color}-${row.size}-${idx}`}>
                            {[row.color, row.size].filter(Boolean).join(" / ") || "Default"}: {Number(row.stock) || 0}
                            {(Number(row.stock) || 0) <= 0 ? " (sold out)" : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td data-label="Available Stock">{remaining} units</td>
                  <td data-label="Safety Level">
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "150px",
                        height: "10px",
                        background: "#f1f5f9",
                        borderRadius: "5px",
                        overflow: "hidden",
                        marginLeft: "auto",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, (remaining / 20) * 100)}%`,
                          height: "100%",
                          background: remaining <= 3 ? "#ef4444" : "#0A0A0A",
                        }}
                      ></div>
                    </div>
                  </td>
                  <td data-label="Status">
                    {soldOut ? (
                      <span className="badge badge-cancelled">Sold Out</span>
                    ) : remaining <= 3 ? (
                      <span className="badge badge-unpaid">Low Stock</span>
                    ) : (
                      <span className="badge badge-paid">Healthy</span>
                    )}
                  </td>
                </tr>
              );
              })}
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
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length}{" "}
              entries
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="pagination-btn"
              >
                Previous
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
    </div>
  );
};

export default AdminInventory;
