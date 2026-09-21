import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "./App.css";
import "./mobile.css";
import "./Dashboard.css";
import "./phone.css";
import Swal from "sweetalert2";

// --- UTILS & CONTEXT ---
import { apiRequest } from "./utils/api";
import { CartProvider } from "./context/CartContext";
import { ModalProvider } from "./context/ModalContext";
import { ThemeProvider } from "./context/ThemeContext";
import { MobileMenuProvider } from "./context/MobileMenuContext";
import { DEFAULT_CATEGORIES, mergeCategories } from "./utils/categories";
import { liveCatalog } from "./utils/catalog";
import { colorName, hasVariants, normalizeSize } from "./utils/productStock";

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
  const location = useLocation();
  if (!authChecked) {
    return <div className="section-padding container" style={{ minHeight: "40vh" }} />;
  }
  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace />;
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
    contactEmail: "welama.business@gmail.com",
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

  const readCachedProducts = () => {
    for (const store of [window.localStorage, window.sessionStorage]) {
      try {
        const parsed = JSON.parse(store.getItem("welama_products") || "[]");
        if (Array.isArray(parsed) && parsed.length) return liveCatalog(parsed);
      } catch {
        /* ignore */
      }
    }
    return [];
  };

  const writeCachedProducts = (list) => {
    const json = JSON.stringify(list);
    try {
      localStorage.setItem("welama_products", json);
    } catch {
      /* quota */
    }
    try {
      sessionStorage.setItem("welama_products", json);
    } catch {
      /* quota */
    }
  };

  // Initial Data Fetching
  useEffect(() => {
    let cancelled = false;

    const cached = readCachedProducts();
    if (cached.length) setProducts(cached);

    const applyLiveProducts = (prodRes) => {
      if (cancelled) return [];
      const liveProducts =
        prodRes?.success && Array.isArray(prodRes.data)
          ? liveCatalog(prodRes.data)
          : null;
      if (liveProducts) {
        setProducts(liveProducts);
        writeCachedProducts(liveProducts);
        return liveProducts;
      }
      setProducts((prev) => liveCatalog(prev));
      return liveCatalog(cached);
    };

    const initApp = async () => {
      const prodPromise = apiRequest("/products", "GET", null, 8000);
      const catPromise = apiRequest("/categories", "GET", null, 8000);
      const setPromise = apiRequest("/settings", "GET", null, 8000);
      const authPromise = apiRequest("/auth/me", "GET", null, 2500);

      prodPromise
        .then((prodRes) => applyLiveProducts(prodRes))
        .catch(() => {
          if (!cancelled) setProducts((prev) => liveCatalog(prev));
        });

      try {
        const [catRes, prodRes, setRes] = await Promise.all([catPromise, prodPromise, setPromise]);
        if (cancelled) return;
        if (setRes?.success && setRes.data) setSettings(setRes.data);
        const liveProducts = applyLiveProducts(prodRes);
        setCategories(
          mergeCategories(
            catRes?.success ? catRes.data : [],
            liveProducts.map((p) => p.category),
            DEFAULT_CATEGORIES,
          ),
        );
      } catch (error) {
        console.error("Failed to initialize catalog:", error);
        if (!cancelled) {
          setProducts((prev) => liveCatalog(prev));
          setCategories((prev) =>
            prev.length ? prev : mergeCategories([], DEFAULT_CATEGORIES),
          );
        }
      }

      try {
        const verifyRes = await authPromise;
        if (cancelled) return;
        if (verifyRes.success) {
          setUser(verifyRes.data);
          const ordRes = await apiRequest("/orders", "GET", null, 4000);
          if (!cancelled && ordRes.success) setOrders(ordRes.data);
        }
      } catch {
        /* guest */
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
    if (!user) return undefined;
    fetchOrders();
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
            prev.map((p) => {
              const matchesId = item.productId && String(p._id || p.id) === String(item.productId);
              if (!matchesId) return p;
              if (hasVariants(p)) {
                const variants = p.variants.map((row) => {
                  const sameColor = String(row.color || "").trim().toLowerCase() === colorName(item.color).toLowerCase();
                  const sameSize = normalizeSize(row.size).toLowerCase() === normalizeSize(item.size).toLowerCase();
                  if (!sameColor || !sameSize) return row;
                  return { ...row, stock: Math.max(0, (Number(row.stock) || 0) - item.qty) };
                });
                const stock = variants.reduce((sum, row) => sum + (Number(row.stock) || 0), 0);
                return {
                  ...p,
                  variants,
                  stock,
                  status: stock > 0 ? "Active" : "Sold Out",
                  soldOutAt: stock > 0 ? null : p.soldOutAt || new Date().toISOString(),
                };
              }
              const stock = Math.max(0, (Number(p.stock) || 0) - item.qty);
              return {
                ...p,
                stock,
                status: stock > 0 ? p.status : "Sold Out",
                soldOutAt: stock > 0 ? p.soldOutAt : p.soldOutAt || new Date().toISOString(),
              };
            }),
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
                <Route path="/about" element={<AboutPage settings={settings} />} />
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
