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
import { ThemeProvider } from "./context/ThemeContext";
import { MobileMenuProvider } from "./context/MobileMenuContext";
import { SAMPLE_PRODUCTS } from "./data/sampleProducts";
import { DEFAULT_CATEGORIES, mergeCategories } from "./utils/categories";

// --- COMPONENTS ---
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import MobileAppDock from "./components/layout/MobileAppDock";
import AddToHomeScreen from "./components/ui/AddToHomeScreen";
import SupportBot from "./components/ui/SupportBot";
import Preloader from "./components/ui/Preloader";
import PageRouteLoader from "./components/ui/PageRouteLoader";
import HeadingAnimator from "./components/ui/HeadingAnimator";
import RouteSeo from "./components/seo/RouteSeo";

// --- PAGES ---
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import AboutPage from "./pages/AboutPage";
import CollectionsPage from "./pages/CollectionsPage";
import AuthPage from "./pages/AuthPage";
import CheckoutPage from "./pages/CheckoutPage";
import TrackingPage from "./pages/TrackingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import GalleryPage from "./pages/GalleryPage";

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

const RootLanding = ({ products, categories, settings }) => {
  const isMobile =
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  if (isMobile) return <Navigate to="/shop" replace />;
  return <HomePage products={products} categories={categories} settings={settings} />;
};

const App = () => {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({
    siteName: "WELAMA",
    tagline: "The Essence of Luxury",
    logoUrl: "/welamalogo.png",
    contactPhone: "0244374433",
    contactEmail: "",
    address: "Accra, Ghana",
    smsApiKey: "",
    smsSenderId: "Welama",
    smsEnabled: true,
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
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

    const applyCatalog = (catRes, prodRes, setRes) => {
      if (cancelled) return;

      if (setRes?.success && setRes.data) {
        setSettings(setRes.data);
      }

      const liveProducts =
        prodRes?.success && Array.isArray(prodRes.data) && prodRes.data.length > 0
          ? prodRes.data
          : null;

      if (liveProducts) {
        setProducts(liveProducts);
        try {
          sessionStorage.setItem("welama_products", JSON.stringify(liveProducts));
        } catch {
          /* quota / private mode */
        }
      } else {
        setProducts((prev) => {
          if (prev.length) return prev;
          return import.meta.env.PROD ? prev : SAMPLE_PRODUCTS;
        });
      }

      const catalogProducts = liveProducts?.length
        ? liveProducts
        : import.meta.env.PROD
          ? []
          : SAMPLE_PRODUCTS;
      setCategories(
        mergeCategories(
          catRes?.success ? catRes.data : [],
          catalogProducts.map((p) => p.category),
          DEFAULT_CATEGORIES,
        ),
      );
    };

    const initApp = async () => {
      try {
        const [catRes, prodRes, setRes] = await Promise.all([
          apiRequest("/categories", "GET", null, 25000),
          apiRequest("/products", "GET", null, 25000),
          apiRequest("/settings", "GET", null, 25000),
        ]);
        applyCatalog(catRes, prodRes, setRes);

        const verifyRes = await apiRequest("/auth/me", "GET", null, 2500);
        if (cancelled) return;
        if (verifyRes.success) {
          setUser(verifyRes.data);
          const ordRes = await apiRequest("/orders", "GET", null, 4000);
          if (!cancelled && ordRes.success) setOrders(ordRes.data);
        }
      } catch (error) {
        console.error("Failed to initialize catalog:", error);
        if (!cancelled) {
          setProducts((prev) => (prev.length ? prev : SAMPLE_PRODUCTS));
          setCategories((prev) =>
            prev.length ? prev : mergeCategories(SAMPLE_PRODUCTS.map((p) => p.category), DEFAULT_CATEGORIES),
          );
        }
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    };

    initApp();
    return () => {
      cancelled = true;
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
        title: "Status Updated! 📱",
        text: `Order status updated & SMS notification sent to customer.`,
        icon: "success",
        timer: 1800,
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

  const brandColor = settings?.brandColor || "#0A0A0A";

  return (
    <AnimatePresence mode="wait">
        <Router key="app">
        <style>{`:root { --brand-color: ${brandColor}; }`}</style>
        <ThemeProvider>
        <MobileMenuProvider>
        <CartProvider>
          <ModalProvider products={products}>
            <div className="app">
              <RouteSeo />
              <HeadingAnimator />
              <PageRouteLoader />
              <Navbar user={user} categories={categories} settings={settings} />
              <Routes>
                <Route
                  path="/"
                  element={<RootLanding products={products} categories={categories} settings={settings} />}
                />
                <Route
                  path="/home"
                  element={
                    <HomePage products={products} categories={categories} settings={settings} />
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
                <Route path="/customize" element={<Navigate to="/shop" replace />} />
                <Route path="/gallery" element={<GalleryPage />} />
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
              <MobileAppDock />
              <AddToHomeScreen />
              <SupportBot />
            </div>
          </ModalProvider>
        </CartProvider>
        </MobileMenuProvider>
        </ThemeProvider>
        </Router>
    </AnimatePresence>
  );
};

export default App;
