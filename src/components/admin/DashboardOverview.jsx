import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  Truck,
  CheckCircle2,
  Wallet,
  Layers,
  FileText,
  Search,
} from "lucide-react";
import { Cedis, formatCedis } from "../../utils/currency";
import { productFullySoldOut, totalStock } from "../../utils/productStock";

const welcomeFirstName = (user) => {
  const raw = String(user?.name || "").trim();
  if (!raw) return "there";
  const parts = raw.split(/\s+/).filter((part) => !/^(admin|administrator)$/i.test(part));
  return (parts[0] || raw.split(/\s+/)[0] || "there");
};

const KPI_TONES = {
  sky: { bg: "#e0f2fe", ink: "#0369a1", icon: "#bae6fd" },
  mint: { bg: "#dcfce7", ink: "#166534", icon: "#bbf7d0" },
  lemon: { bg: "#fef9c3", ink: "#854d0e", icon: "#fde68a" },
  peach: { bg: "#ffedd5", ink: "#9a3412", icon: "#fed7aa" },
  lilac: { bg: "#ede9fe", ink: "#6d28d9", icon: "#ddd6fe" },
  aqua: { bg: "#ccfbf1", ink: "#0f766e", icon: "#99f6e4" },
  rose: { bg: "#fee2e2", ink: "#991b1b", icon: "#fecaca" },
  slate: { bg: "#f1f5f9", ink: "#334155", icon: "#e2e8f0" },
};

const parseOrderDate = (order) => {
  if (order?.createdAt) return new Date(order.createdAt);
  if (order?.date) {
    const parsed = new Date(order.date);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

const polar = (cx, cy, r, angle) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const pieSlicePath = (cx, cy, r, start, end) => {
  const a = polar(cx, cy, r, end);
  const b = polar(cx, cy, r, start);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 0 ${b.x} ${b.y} Z`;
};

const SalesLineChart = ({ days, paidSales }) => {
  const width = 360;
  const height = 180;
  const pad = { top: 22, right: 12, bottom: 32, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxVal = Math.max(...days.map((d) => d.total), 1);
  const points = days.map((d, i) => {
    const x = pad.left + (days.length === 1 ? innerW / 2 : (i / (days.length - 1)) * innerW);
    const y = pad.top + innerH - (d.total / maxVal) * innerH;
    return { ...d, x, y };
  });
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`;
  const ticks = [0, 0.5, 1];

  return (
    <div>
      <svg className="dash-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sales over the last 7 days">
        {ticks.map((t) => {
          const y = pad.top + innerH - t * innerH;
          return (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="dash-line-grid" />
              <text x={pad.left - 6} y={y + 4} className="dash-line-axis" textAnchor="end">
                {t === 0 ? "0" : formatCedis(Math.round(maxVal * t), 0)}
              </text>
            </g>
          );
        })}
        <path d={area} className="dash-line-area" />
        <path d={line} className="dash-line-stroke" fill="none" />
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="4.5" className="dash-line-dot" />
            {p.total > 0 && (
              <text x={p.x} y={p.y - 10} textAnchor="middle" className="dash-line-value">
                {p.total}
              </text>
            )}
            <text x={p.x} y={height - 8} textAnchor="middle" className="dash-line-day">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <p className="dash-chart-note">
        Paid this week: <b><Cedis value={paidSales} /></b>
      </p>
    </div>
  );
};

const StatusPieChart = ({ segments }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const cx = 60;
  const cy = 60;
  const r = 54;
  let angle = 0;

  return (
    <div className="dash-pie-wrap">
      <svg viewBox="0 0 120 120" className="dash-pie" aria-hidden="true">
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="#e2e8f0" />
        ) : (
          segments.map((seg) => {
            if (!seg.value) return null;
            const sweep = (seg.value / total) * 360;
            const start = angle;
            const end = angle + sweep;
            angle = end;
            if (seg.value === total) {
              return <circle key={seg.label} cx={cx} cy={cy} r={r} fill={seg.color} />;
            }
            return <path key={seg.label} d={pieSlicePath(cx, cy, r, start, end)} fill={seg.color} />;
          })
        )}
        <circle cx={cx} cy={cy} r="28" fill="#fff" />
        <text x={cx} y={56} textAnchor="middle" fontSize="15" fontWeight="800" fill="#0A0A0A">
          {total}
        </text>
        <text x={cx} y={70} textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="700">
          ORDERS
        </text>
      </svg>
      <ul className="dash-legend">
        {segments.map((seg) => (
          <li key={seg.label}>
            <span style={{ background: seg.color }} />
            {seg.label}
            <b>{seg.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
};

const DashboardOverview = ({ products = [], orders = [], user, settings }) => {
  const navigate = useNavigate();
  const [tableQuery, setTableQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [insightTab, setInsightTab] = useState("sales");
  const [tableTab, setTableTab] = useState("orders");
  const itemsPerPage = 8;

  const stats = useMemo(() => {
    let pending = 0;
    let processing = 0;
    let shipped = 0;
    let delivered = 0;
    let unpaid = 0;
    let paid = 0;
    let cancelled = 0;
    let blocked = 0;
    let custom = 0;
    let totalSales = 0;
    let paidSales = 0;

    for (const o of orders) {
      if (o.status === "Pending") pending += 1;
      else if (o.status === "Processing") processing += 1;
      else if (o.status === "Shipped") shipped += 1;
      else if (o.status === "Delivered") delivered += 1;
      else if (o.status === "Cancelled") cancelled += 1;
      else if (o.status === "Blocked") blocked += 1;
      if (o.payment === "Unpaid") unpaid += 1;
      if (o.payment === "Paid") {
        paid += 1;
        paidSales += Number(o.total) || 0;
      }
      if (o.isCustomRequest) custom += 1;
      totalSales += Number(o.total) || 0;
    }

    let lowStock = 0;
    let soldOut = 0;
    for (const p of products) {
      const remaining = totalStock(p);
      if (productFullySoldOut(p)) soldOut += 1;
      else if (remaining > 0 && remaining <= 5) lowStock += 1;
    }

    return {
      pending,
      processing,
      shipped,
      delivered,
      unpaid,
      paid,
      cancelled,
      blocked,
      custom,
      lowStock,
      soldOut,
      totalSales,
      paidSales,
    };
  }, [orders, products]);

  const salesTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((day) => {
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const dayOrders = orders.filter((o) => {
        const dt = parseOrderDate(o);
        return dt && dt >= day && dt < next;
      });
      return {
        label: day.toLocaleDateString("en-US", { weekday: "short" }),
        total: dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
        count: dayOrders.length,
      };
    });
  }, [orders]);

  const paymentSplit = useMemo(() => {
    const buckets = { WhatsApp: 0, Paystack: 0, Other: 0 };
    orders.forEach((o) => {
      const method = (o.paymentMethod || "").toLowerCase();
      if (method.includes("whatsapp")) buckets.WhatsApp += 1;
      else if (method.includes("paystack")) buckets.Paystack += 1;
      else buckets.Other += 1;
    });
    return buckets;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [o.orderId, o.customer, o.phone, o.status, o.payment]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [orders, tableQuery]);

  const filteredProducts = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.category, p.sku, p.stock, p.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [products, tableQuery]);

  const tableRows = tableTab === "orders" ? filteredOrders : filteredProducts;
  const totalPages = Math.max(1, Math.ceil(tableRows.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const currentOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const currentProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const lowStockItems = products
    .filter((p) => totalStock(p) <= 5)
    .sort((a, b) => totalStock(a) - totalStock(b))
    .slice(0, 6);

  const firstName = welcomeFirstName(user);

  const kpis = [
    { label: "Total Products", value: products.length, tone: "sky", icon: Package, to: "/admin/products" },
    { label: "Total Orders", value: orders.length, tone: "mint", icon: ShoppingCart, to: "/admin/orders" },
    { label: "Total Sales", value: <Cedis value={stats.totalSales} />, tone: "lemon", icon: Wallet, to: "/admin/receipts" },
    { label: "Pending", value: stats.pending, tone: "peach", icon: AlertTriangle, to: "/admin/orders" },
    { label: "Processing", value: stats.processing, tone: "lilac", icon: Layers, to: "/admin/orders" },
    { label: "Delivered", value: stats.delivered, tone: "aqua", icon: CheckCircle2, to: "/admin/orders" },
    { label: "Unpaid", value: stats.unpaid, tone: "rose", icon: FileText, to: "/admin/receipts" },
    { label: "Low Stock", value: stats.lowStock, tone: "slate", icon: Truck, to: "/admin/products" },
  ];

  const quickActions = [
    { label: "+ New Product", to: "/admin/products" },
    { label: "Orders", to: "/admin/orders" },
  ];

  const statusSegments = [
    { label: "Pending", value: stats.pending, color: "#fb923c" },
    { label: "Processing", value: stats.processing, color: "#8b5cf6" },
    { label: "Shipped", value: stats.shipped, color: "#38bdf8" },
    { label: "Delivered", value: stats.delivered, color: "#10b981" },
    { label: "Cancelled", value: stats.cancelled, color: "#94a3b8" },
    { label: "Blocked", value: stats.blocked, color: "#ef4444" },
  ];

  return (
    <div className="dashboard-view fade-in">
      <div
        className="welcome-banner dash-banner reveal active"
        style={{ backgroundImage: `url('${settings?.heroImageUrl || "/shophero.png"}')` }}
      >
        <div className="welcome-content">
          <p className="dash-banner-kicker">Main Dashboard</p>
          <h2 className="serif">Welcome back, {firstName}</h2>
          <p>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="dash-quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="dash-quick-btn"
              onClick={() => navigate(action.to)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-kpi-grid">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const tone = KPI_TONES[kpi.tone];
          return (
            <button
              key={kpi.label}
              type="button"
              className="dash-kpi"
              style={{ background: tone.bg, borderColor: tone.icon }}
              onClick={() => navigate(kpi.to)}
            >
              <span className="dash-kpi-icon" style={{ color: tone.ink, background: tone.icon }}>
                <Icon size={14} />
              </span>
              <span className="dash-kpi-value" style={{ color: tone.ink }}>
                {kpi.value}
              </span>
              <span className="dash-kpi-label">{kpi.label}</span>
            </button>
          );
        })}
      </div>

      <div className="dash-board-grid">
        <div className="admin-card dash-table-card">
          <div className="card-header dash-table-header">
            <div className="dash-table-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                className={`dash-table-tab ${tableTab === "orders" ? "is-on" : ""}`}
                onClick={() => {
                  setTableTab("orders");
                  setCurrentPage(1);
                }}
              >
                Recent Orders
              </button>
              <button
                type="button"
                role="tab"
                className={`dash-table-tab ${tableTab === "products" ? "is-on" : ""}`}
                onClick={() => {
                  setTableTab("products");
                  setCurrentPage(1);
                }}
              >
                Products
              </button>
            </div>
            <div className="dash-table-tools">
              <label className="dash-table-search">
                <Search size={14} />
                <input
                  type="search"
                  placeholder="Search this table..."
                  value={tableQuery}
                  onChange={(e) => {
                    setTableQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </label>
              <Link to={tableTab === "orders" ? "/admin/orders" : "/admin/products"}>View All</Link>
            </div>
          </div>
          <div className="admin-table-container">
            {tableTab === "orders" ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>
                      No orders match the selected filters.
                    </td>
                  </tr>
                )}
                {currentOrders.map((order, index) => (
                  <tr key={order._id || order.id || order.orderId}>
                    <td>{(page - 1) * itemsPerPage + index + 1}</td>
                    <td style={{ fontWeight: 700 }}>#{order.orderId || order._id}</td>
                    <td>{order.customer}</td>
                    <td>{order.payment || "Unpaid"}</td>
                    <td style={{ fontWeight: 600 }}><Cedis value={order.total} /></td>
                    <td>
                      <span className={`badge badge-${String(order.status || "pending").toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>
                      No products match the selected filters.
                    </td>
                  </tr>
                )}
                {currentProducts.map((product, index) => {
                  const stock = totalStock(product);
                  const soldOut = productFullySoldOut(product);
                  return (
                    <tr key={product._id || product.id}>
                      <td>{(page - 1) * itemsPerPage + index + 1}</td>
                      <td style={{ fontWeight: 700 }}>{product.name}</td>
                      <td>{product.category || "—"}</td>
                      <td style={{ fontWeight: 600 }}><Cedis value={product.price} /></td>
                      <td>{stock}</td>
                      <td>
                        <span className={`badge ${soldOut ? "badge-cancelled" : "badge-delivered"}`}>
                          {soldOut ? "Sold Out" : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </div>
          {totalPages > 1 && (
            <div className="pagination-wrapper dash-pager">
              <button disabled={page === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className="pagination-btn">
                Prev
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="dash-side-stack">
          <div className="admin-card dash-insight-card">
            <div className="dash-insight-tabs" role="tablist">
              {[
                { id: "sales", label: "Sales" },
                { id: "status", label: "Status" },
                { id: "payments", label: "Payments" },
                { id: "stock", label: "Stock" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={insightTab === tab.id}
                  className={`dash-insight-tab ${insightTab === tab.id ? "is-on" : ""}`}
                  onClick={() => setInsightTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {insightTab === "sales" && (
              <div>
                <div className="card-header">
                  <h2>Sales · last 7 days</h2>
                </div>
                <SalesLineChart days={salesTrend} paidSales={stats.paidSales} />
              </div>
            )}

            {insightTab === "status" && (
              <div>
                <div className="card-header">
                  <h2>Order status</h2>
                </div>
                <StatusPieChart segments={statusSegments} />
              </div>
            )}

            {insightTab === "payments" && (
              <div>
                <div className="card-header">
                  <h2>Payment mix</h2>
                </div>
                {Object.entries(paymentSplit).map(([label, value]) => {
                  const pct = orders.length ? Math.round((value / orders.length) * 100) : 0;
                  return (
                    <div key={label} className="dash-mix-row">
                      <div className="dash-mix-label">
                        <span>{label}</span>
                        <b>{value}</b>
                      </div>
                      <div className="dash-mix-track">
                        <div className="dash-mix-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {insightTab === "stock" && (
              <div>
                <div className="card-header">
                  <h2>Stock alerts</h2>
                  <Link to="/admin/products">Manage</Link>
                </div>
                {lowStockItems.length === 0 ? (
                  <p className="dash-chart-note">All catalog items are adequately stocked.</p>
                ) : (
                  <ul className="dash-stock-list">
                    {lowStockItems.map((p) => (
                      <li key={p._id || p.id}>
                        <span>{p.name}</span>
                        <b className={totalStock(p) === 0 ? "is-out" : ""}>{totalStock(p) === 0 ? "Out" : totalStock(p)}</b>
                      </li>
                    ))}
                  </ul>
                )}
                {stats.soldOut > 0 && (
                  <p className="dash-chart-note">{stats.soldOut} sold out · {stats.custom} custom requests</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
