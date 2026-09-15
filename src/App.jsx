import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "./App.css";
import "./mobile.css";
import "./Dashboard.css";
import Swal from "sweetalert2";

// --- UTILS & CONTEXT ---
import { apiRequest } from "./utils/api";
import { CartProvider } from "./context/CartContext";
import { ModalProvider } from "./context/ModalContext";
import { SAMPLE_PRODUCTS } from "./data/sampleProducts";

// --- COMPONENTS ---
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import SupportBot from "./components/ui/SupportBot";
import Preloader from "./components/ui/Preloader";
import PageRouteLoader from "./components/ui/PageRouteLoader";
import HeadingAnimator from "./components/ui/HeadingAnimator";

// --- PAGES ---
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import AboutPage from "./pages/AboutPage";
import CollectionsPage from "./pages/CollectionsPage";
import AuthPage from "./pages/AuthPage";
import CheckoutPage from "./pages/CheckoutPage";
import TrackingPage from "./pages/TrackingPage";
import ReviewsPage from "./pages/ReviewsPage";
import CustomizePage from "./pages/CustomizePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import GalleryPage from "./pages/GalleryPage";
import BrandsPage from "./pages/BrandsPage";

// --- ADMIN ---
import AdminDashboard from "./components/admin/AdminDashboard";

// --- PROTECTED ROUTE GUARD ---
const ProtectedRoute = ({ user, authChecked, children }) => {
  if (!authChecked) {
    return <div className="section-padding container" style={{ minHeight: "40vh" }} />;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const App = () => {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    "Shirts",
    "Dresses",
    "Two-piece",
    "Bags",
  ]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({
    siteName: "WELAMA",
    tagline: "The Essence of Luxury",
    logoUrl: "/welamalogo.png",
    contactPhone: "0244374433",
    contactEmail: "info@welama.com",
    address: "Accra, Ghana",
    smsApiKey: "",
    smsSenderId: "WELAMA",
    smsEnabled: true,
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    const ordRes = await apiRequest("/orders");
    if (ordRes.success) setOrders(ordRes.data);
  };

  const fetchSettings = async () => {
    const setRes = await apiRequest("/settings");
    if (setRes.success && setRes.data) {
      setSettings(setRes.data);
    }
  };

  // Initial Data Fetching
  useEffect(() => {
    let cancelled = false;

    const splashStarted = Date.now();
    const SPLASH_MS = 2600;
    const revealApp = () => {
      const wait = Math.max(0, SPLASH_MS - (Date.now() - splashStarted));
      window.setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, wait);
    };

    try {
      const cached = sessionStorage.getItem("welama_products");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) {
          setProducts(parsed);
        }
      }
    } catch {
      /* ignore bad cache */
    }

    const splashCap = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 7000);

    const applyCatalog = (catRes, prodRes, setRes) => {
      if (cancelled) return;

      if (setRes?.success && setRes.data) {
        setSettings(setRes.data);
      }

      if (catRes?.success && catRes.data?.length > 0) {
        const uniqueCats = [...new Set(catRes.data.map((c) => c.name.trim()))];
        setCategories(uniqueCats);
      }

      if (prodRes?.success && prodRes.data?.length > 0) {
        setProducts(prodRes.data);
        try {
          sessionStorage.setItem("welama_products", JSON.stringify(prodRes.data));
        } catch {
          /* quota / private mode */
        }

        const productCategories = prodRes.data
          .map((p) => p.category?.trim())
          .filter(Boolean);
        setCategories((prev) => {
          const combined = [...prev, ...productCategories];
          const normalized = combined.map(
            (c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(),
          );
          return [...new Set(normalized)];
        });
      } else if (!cancelled && !import.meta.env.PROD) {
        setProducts((prev) => (prev.length ? prev : SAMPLE_PRODUCTS));
      }

      revealApp();
    };

    const initApp = async () => {
      const [catRes, prodRes, setRes] = await Promise.all([
        apiRequest("/categories", "GET", null, 12000),
        apiRequest("/products", "GET", null, 12000),
        apiRequest("/settings", "GET", null, 12000),
      ]);
      applyCatalog(catRes, prodRes, setRes);

      const verifyRes = await apiRequest("/auth/me", "GET", null, 2500);
      if (cancelled) return;
      if (verifyRes.success) {
        setUser(verifyRes.data);
        const ordRes = await apiRequest("/orders", "GET", null, 4000);
        if (!cancelled && ordRes.success) setOrders(ordRes.data);
      }
      setAuthChecked(true);
    };

    initApp();
    return () => {
      cancelled = true;
      clearTimeout(splashCap);
    };
  }, []);

  // Auto-refresh orders for admin every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (userData) => {
    if (userData.token) {
      try {
        localStorage.setItem("welama_auth_token", userData.token);
      } catch (e) {
        console.error("Failed to save token to localStorage", e);
      }
    }
    setUser(userData);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Sign Out?",
      text: "Are you sure you want to end your session?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0A0A0A",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Sign Out",
      background: "#fff",
      color: "#1e293b",
    });

    if (result.isConfirmed) {
      await apiRequest("/auth/logout");
      localStorage.removeItem("welama_auth_token");
      setUser(null);
      Swal.fire({
        title: "Signed Out",
        text: "Come back soon!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const addProduct = async (newProduct) => {
    const res = await apiRequest("/products", "POST", newProduct);
    if (res.success) {
      setProducts((prev) => [res.data, ...prev]);
      Swal.fire({
        title: "Product Added!",
        text: `${res.data.name} has been published to the catalog.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Creation Failed",
        text: res.message || "An error occurred while creating the product.",
        icon: "error",
      });
    }
    return res.success;
  };

  const updateProduct = async (id, updated) => {
    const res = await apiRequest(`/products/${id}`, "PUT", updated);
    if (res.success) {
      setProducts((prev) => prev.map((p) => (p._id === id ? res.data : p)));
      Swal.fire({
        title: "Updated!",
        text: "Product details have been synchronized.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Update Failed",
        text: res.message || "An error occurred while updating the product.",
        icon: "error",
      });
    }
    return res.success;
  };

  const deleteProduct = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0A0A0A",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const res = await apiRequest(`/products/${id}`, "DELETE", null);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        Swal.fire({
          title: "Deleted!",
          text: "The product has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      return res.success;
    }
    return false;
  };

  const addOrder = async (newOrder) => {
    const res = await apiRequest("/orders", "POST", newOrder, 20000);
    if (res.success) {
      if (user) {
        setOrders((prev) => [res.data, ...prev]);
        fetchOrders();
      }

      if (res.data.items) {
        res.data.items.forEach((item) => {
          setProducts((prev) =>
            prev.map((p) =>
              p.name === item.name
                ? { ...p, stock: Math.max(0, p.stock - item.qty) }
                : p,
            ),
          );
        });
      }
    }
    return res;
  };

  const updateOrder = async (id, updated) => {
    const res = await apiRequest(`/orders/${id}`, "PUT", updated);
    if (res.success) {
      setOrders((prev) => prev.map((o) => (o._id === id ? res.data : o)));
      Swal.fire({
        title: "Status Updated!",
        text: `Order status has been updated successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire("Error", res.message || "Could not update order", "error");
    }
    return res.success;
  };

  const deleteOrder = async (id) => {
    const result = await Swal.fire({
      title: "Delete Order?",
      text: "This action cannot be undone. The order record will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0A0A0A",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const res = await apiRequest(`/orders/${id}`, "DELETE", null);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => (o._id || o.id) !== id));
        Swal.fire({
          title: "Deleted!",
          text: "The order record has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      return res.success;
    }
    return false;
  };

  const updateSettings = async (newSettings) => {
    const res = await apiRequest("/settings", "PUT", newSettings);
    if (res.success) {
      await fetchSettings();
      return true;
    } else {
      Swal.fire("Error", res.message || "Could not update settings", "error");
      return false;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <Preloader key="preloader" products={products} />
      ) : (
        <Router key="app">
        <CartProvider>
          <ModalProvider products={products}>
            <div className="app">
              <HeadingAnimator />
              <PageRouteLoader />
              <Navbar user={user} categories={categories} settings={settings} />
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage products={products} categories={categories} />
                  }
                />
                <Route
                  path="/shop"
                  element={
                    <ShopPage products={products} categories={categories} />
                  }
                />
                <Route
                  path="/product/:id"
                  element={<ProductDetailPage products={products} addOrder={addOrder} settings={settings} />}
                />
                <Route path="/collections" element={<CollectionsPage settings={settings} />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route
                  path="/customize"
                  element={<CustomizePage addOrder={addOrder} />}
                />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route
                  path="/auth"
                  element={<AuthPage onLogin={handleLogin} />}
                />
                <Route
                  path="/checkout"
                  element={<CheckoutPage addOrder={addOrder} />}
                />
                <Route path="/track" element={<TrackingPage />} />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute user={user} authChecked={authChecked}>
                      <AdminDashboard
                        products={products}
                        categories={categories}
                        orders={orders}
                        fetchOrders={fetchOrders}
                        addProduct={addProduct}
                        updateProduct={updateProduct}
                        deleteProduct={deleteProduct}
                        addOrder={addOrder}
                        updateOrder={updateOrder}
                        deleteOrder={deleteOrder}
                        setCategories={setCategories}
                        settings={settings}
                        updateSettings={updateSettings}
                        user={user}
                        onLogout={handleLogout}
                        onUpdateUser={(next) => setUser((prev) => ({ ...prev, ...next }))}
                      />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Footer settings={settings} />
              <SupportBot />
            </div>
          </ModalProvider>
        </CartProvider>
        </Router>
      )}
    </AnimatePresence>
  );
};

export default App;
