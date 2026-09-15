import React, { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { apiRequest } from "../../utils/api";

const AdminCategories = ({ categories, setCategories }) => {
  const [newCat, setNewCat] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const add = async (e) => {
    e.preventDefault();
    if (newCat && !categories.includes(newCat)) {
      try {
        const data = await apiRequest("/categories", "POST", {
          name: newCat.trim(),
        });
        if (data.success) {
          setCategories([...categories, data.data.name]);
        }
      } catch (err) {
        setCategories([...categories, newCat.trim()]);
      }
    }
    setNewCat("");
  };

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Category Manager</h1>
          <p>Organize collections — {categories.length} Tiers</p>
        </div>
      </header>

      <div className="admin-card">
        <div className="card-header" style={{ marginBottom: "2rem" }}>
          <form
            onSubmit={add}
            style={{ display: "flex", gap: "1rem", width: "100%" }}
          >
            <input
              type="text"
              placeholder="New Category Name"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              style={{
                flex: 1,
                padding: "0.8rem 1rem",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            />
            <button
              type="submit"
              className="cta-button-premium"
              style={{ borderRadius: "12px" }}
            >
              <Plus size={20} />
            </button>
          </form>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Title</th>
                <th style={{ textAlign: "right" }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.map((cat, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>{cat}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() =>
                        setCategories(categories.filter((c) => c !== cat))
                      }
                      style={{
                        color: "#ef4444",
                        background: "#fee2e2",
                        padding: "0.5rem",
                        borderRadius: "8px",
                      }}
                    >
                      <Trash size={16} />
                    </button>
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
              justifyContent: "center",
              borderTop: "1px solid #f1f5f9",
            }}
          >
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
    </div>
  );
};

export default AdminCategories;
