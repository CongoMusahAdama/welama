import React, { useEffect, useState } from "react";
import { Link, useLocation, Routes, Route } from "react-router-dom";
import {
  X,
  LayoutGrid,
  Menu,
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  BarChart3,
  Globe,
  ShoppingBag,
  Images,
  Award,
  LogOut,
  Settings as SettingsIcon,
  Plus,
} from "lucide-react";
import ReceiptCedi from "../ui/ReceiptCedi";
import DashboardOverview from "./DashboardOverview";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminReceipts from "./AdminReceipts";
import AdminCategories from "./AdminCategories";
import AdminSettings from "./AdminSettings";
import AdminGallery from "./AdminGallery";
import AdminBrands from "./AdminBrands";

const AdminDashboard = ({
  products,
  categories,
  orders,
  fetchOrders,
  addProduct,
  updateProduct,
  deleteProduct,
  addOrder,
  updateOrder,
  deleteOrder,
  setCategories,
  settings,
  updateSettings,
  user,
  onLogout,
  onUpdateUser,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const location = useLocation();

  const logoUrl = settings?.logoUrl || "/welamalogo.png";
  const siteName = settings?.siteName || "WELAMA";

  const closeMobileNav = () => setIsMobileOpen(false);

  useEffect(() => {
    closeMobileNav();
  }, [location.pathname]);

  return (
    <div className={`dashboard-layout ${isMinimized ? "minimized" : ""}`}>
      <div
        className={`admin-sidebar-overlay ${isMobileOpen ? "is-visible" : ""}`}
        onClick={closeMobileNav}
      />

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${isMobileOpen ? "mobile-open" : ""} ${isMinimized ? "minimized" : ""}`}
      >
        <button
          type="button"
          className="admin-sidebar-close mobile-only"
          onClick={closeMobileNav}
          aria-label="Close menu"
        >
          <X size={18} strokeWidth={2.2} />
        </button>

        <div className="sidebar-header">
          {!isMinimized && (
            <div className="flex items-center gap-4">
              <Link to="/" title="Go to Website">
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="admin-logo"
                  style={{ cursor: "pointer", maxHeight: "38px", objectFit: "contain" }}
                  onError={(e) => {
                    e.target.src = "/welamalogo.png";
                  }}
                />
              </Link>
              <div className="admin-profile-hint">
                <h2
                  className="serif"
                  style={{ fontSize: "1rem", color: "#f8fafc", fontWeight: 800, margin: 0 }}
                >
                  {siteName}
                </h2>
                <p
                  style={{
                    fontSize: "0.65rem",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 700,
                  }}
                >
                  {user?.role || "Admin Portal"}
                </p>
              </div>
            </div>
          )}
          <button
            className="sidebar-minimize-toggle"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <LayoutGrid size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav" onClick={closeMobileNav}>
          <Link
            to="/admin"
            className={`sidebar-link ${location.pathname === "/admin" ? "active" : ""}`}
          >
            <LayoutDashboard size={18} />
            <span className="sidebar-text">Dashboard</span>
          </Link>
          <Link
            to="/admin/products"
            className={`sidebar-link ${location.pathname.startsWith("/admin/products") ? "active" : ""}`}
          >
            <Package size={18} />
            <span className="sidebar-text">Products</span>
          </Link>
          <Link
            to="/admin/categories"
            className={`sidebar-link ${location.pathname.startsWith("/admin/categories") ? "active" : ""}`}
          >
            <Layers size={18} />
            <span className="sidebar-text">Categories</span>
          </Link>
          <Link
            to="/admin/orders"
            className={`sidebar-link ${location.pathname.startsWith("/admin/orders") ? "active" : ""}`}
          >
            <ShoppingCart size={18} />
            <span className="sidebar-text">Orders & Custom</span>
          </Link>
          <Link
            to="/admin/receipts"
            className={`sidebar-link ${location.pathname.startsWith("/admin/receipts") ? "active" : ""}`}
          >
            <ReceiptCedi size={18} />
            <span className="sidebar-text">Receipts</span>
          </Link>
          <Link
            to="/admin/gallery"
            className={`sidebar-link ${location.pathname.startsWith("/admin/gallery") ? "active" : ""}`}
          >
            <Images size={18} />
            <span className="sidebar-text">Gallery</span>
          </Link>
          <Link
            to="/admin/brands"
            className={`sidebar-link ${location.pathname.startsWith("/admin/brands") ? "active" : ""}`}
          >
            <Award size={18} />
            <span className="sidebar-text">Brands</span>
          </Link>
          <Link
            to="/admin/settings"
            className={`sidebar-link ${location.pathname.startsWith("/admin/settings") ? "active" : ""}`}
          >
            <SettingsIcon size={18} />
            <span className="sidebar-text">Store Settings & SMS</span>
          </Link>

          <div
            className="sidebar-divider"
            style={{
              margin: "1rem 0",
              height: "1px",
              background: "rgba(255,255,255,0.1)",
            }}
          ></div>
          <Link to="/" className="sidebar-link">
            <Globe size={18} />
            <span className="sidebar-text">View Website</span>
          </Link>
          <Link to="/shop" className="sidebar-link">
            <ShoppingBag size={18} />
            <span className="sidebar-text">Go to Shop</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={onLogout}
            className="logout-btn"
            style={{ width: "100%", border: "none", background: "none" }}
          >
            <LogOut size={18} />
            <span className="sidebar-text">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-mobile-topbar">
          <button
            type="button"
            className="admin-mobile-menu-btn"
            onClick={() => setIsMobileOpen((open) => !open)}
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            {isMobileOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={2.2} />}
          </button>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <DashboardOverview
                products={products}
                orders={orders}
                user={user}
                settings={settings}
              />
            }
          />
          <Route
            path="/products"
            element={
              <AdminProducts
                products={products}
                categories={categories}
                deleteProduct={deleteProduct}
                addProduct={addProduct}
                updateProduct={updateProduct}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <AdminOrders
                orders={orders}
                fetchOrders={fetchOrders}
                addOrder={addOrder}
                updateOrder={updateOrder}
                deleteOrder={deleteOrder}
                products={products}
                settings={settings}
              />
            }
          />
          <Route
            path="/receipts"
            element={
              <AdminReceipts 
                orders={orders} 
                updateOrder={updateOrder} 
                settings={settings}
                products={products}
              />
            }
          />
          <Route
            path="/categories"
            element={
              <AdminCategories
                categories={categories}
                setCategories={setCategories}
              />
            }
          />
          <Route
            path="/gallery"
            element={<AdminGallery />}
          />
          <Route
            path="/brands"
            element={<AdminBrands />}
          />
          <Route
            path="/settings"
            element={
              <AdminSettings
                settings={settings}
                updateSettings={updateSettings}
                user={user}
                onUpdateUser={onUpdateUser}
              />
            }
          />
          {/* Default to Overview */}
          <Route
            path="*"
            element={
              <DashboardOverview
                products={products}
                orders={orders}
                user={user}
                settings={settings}
              />
            }
          />
        </Routes>
      </main>

      <nav className="admin-bottom-nav" aria-label="Admin navigation">
        <div className="admin-dock">
          <Link
            to="/admin"
            className={`admin-dock-item ${location.pathname === "/admin" ? "active" : ""}`}
          >
            <span className="admin-dock-icon">
              <LayoutDashboard size={20} />
            </span>
            <span>Home</span>
          </Link>
          <Link
            to="/admin/products"
            className={`admin-dock-item ${location.pathname.startsWith("/admin/products") ? "active" : ""}`}
          >
            <span className="admin-dock-icon">
              <Package size={20} />
            </span>
            <span>Stock</span>
          </Link>
          <Link
            to="/admin/orders"
            className={`admin-dock-item ${location.pathname.startsWith("/admin/orders") ? "active" : ""}`}
          >
            <span className="admin-dock-icon">
              <ShoppingCart size={20} />
            </span>
            <span>Orders</span>
          </Link>
          <Link
            to="/admin/receipts"
            className={`admin-dock-item ${location.pathname.startsWith("/admin/receipts") ? "active" : ""}`}
          >
            <span className="admin-dock-icon">
              <ReceiptCedi size={20} />
            </span>
            <span>Receipts</span>
          </Link>
        </div>
        <Link to="/admin/products?new=1" className="admin-dock-fab" aria-label="Add product">
          <Plus size={26} strokeWidth={2.4} />
        </Link>
      </nav>
    </div>
  );
};

export default AdminDashboard;
