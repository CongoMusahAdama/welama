import React, { useState, useEffect } from "react";
import { 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Sparkles, 
  Smartphone, 
  CreditCard,
  Building, 
  Send,
  Lock,
  CheckCircle
} from "lucide-react";
import Swal from "sweetalert2";
import { apiRequest, API_URL } from "../../utils/api";

const SETTINGS_TABS = [
  { id: "brand", label: "Brand", icon: ImageIcon },
  { id: "contact", label: "Contact", icon: Building },
  { id: "sms", label: "mNotify SMS", icon: Smartphone },
  { id: "paystack", label: "Paystack", icon: CreditCard },
  { id: "account", label: "Account", icon: Lock },
];

const AdminSettings = ({ settings, updateSettings, user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    siteName: "WELAMA",
    tagline: "The Essence of Luxury",
    logoUrl: "/welamalogo.png",
    heroImageUrl: "/shophero.png",
    contactPhone: "+233 24 437 4433",
    contactEmail: "info@welama.com",
    address: "Accra, Ghana",
    // mNotify SMS
    mnotifyApiKey: "",
    mnotifySenderId: "WELAMA",
    smsEnabled: true,
    // Paystack
    paystackPublicKey: "",
    paystackSecretKey: "",
    paystackEnabled: true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [settingsTab, setSettingsTab] = useState("brand");

  // Password Change State
  const [pwdData, setPwdData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
  }, [user?.name]);

  useEffect(() => {
    let cancelled = false;
    const loadAdminSettings = async () => {
      const res = await apiRequest("/settings/admin");
      if (cancelled) return;
      const source = res.success && res.data ? res.data : settings;
      if (source) {
        setFormData((prev) => ({
          ...prev,
          ...source,
          mnotifyApiKey: source.mnotifyApiKey || source.smsApiKey || "",
          mnotifySenderId: source.mnotifySenderId || source.smsSenderId || "WELAMA",
        }));
      }
    };
    loadAdminSettings();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire("Invalid File", "Please select an image file (PNG, JPG, SVG, WebP).", "error");
      return;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("logo", file);

    try {
      const token = localStorage.getItem("welama_auth_token");
      const res = await fetch(`${API_URL}/upload/logo`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: uploadData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, logoUrl: data.url }));
        Swal.fire({
          title: "Logo Uploaded to Cloudinary!",
          text: "Click 'Save Changes' to apply this new logo across the website and receipts.",
          icon: "success",
          confirmButtonColor: "#0A0A0A",
        });
      } else {
        Swal.fire("Upload Failed", data.message || "Failed to upload logo.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Upload Error", "Could not connect to the upload server.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleHeroFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire("Invalid File", "Please select an image file.", "error");
      return;
    }

    setIsUploadingHero(true);
    const uploadData = new FormData();
    uploadData.append("hero", file);

    try {
      const token = localStorage.getItem("welama_auth_token");
      const res = await fetch(`${API_URL}/upload/hero`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: uploadData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, heroImageUrl: data.url }));
        Swal.fire({
          title: "Hero Image Uploaded!",
          text: "Click 'Save Changes' to apply this to the storefront.",
          icon: "success",
          confirmButtonColor: "#0A0A0A",
        });
      } else {
        Swal.fire("Upload Failed", data.message || "Failed to upload hero image.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Upload Error", "Could not connect to the upload server.", "error");
    } finally {
      setIsUploadingHero(false);
    }
  };

  const handlePwdChange = (e) => {
    setPwdData({ ...pwdData, [e.target.name]: e.target.value });
  };

  const submitDisplayName = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      return Swal.fire("Name required", "Please enter the name to show on the dashboard.", "info");
    }
    setIsSavingName(true);
    const res = await apiRequest("/auth/profile", "PUT", { name: displayName.trim() });
    setIsSavingName(false);
    if (res.success && res.data) {
      onUpdateUser?.(res.data);
      Swal.fire({
        title: "Name updated",
        text: `Welcome will now say ${displayName.trim().split(" ")[0]}.`,
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
      });
    } else {
      Swal.fire("Error", res.message || "Could not update your name.", "error");
    }
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      return Swal.fire("Error", "New passwords do not match.", "error");
    }
    
    setIsChangingPwd(true);
    try {
      const res = await apiRequest("/auth/updatepassword", "PUT", {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword
      });

      if (res.success) {
        Swal.fire("Password Updated", "Your password has been changed successfully.", "success");
        setPwdData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        Swal.fire("Update Failed", res.message || "Failed to change password.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Could not change password.", "error");
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const success = await updateSettings(formData);
    setIsSaving(false);
    if (success) {
      Swal.fire({
        title: "Settings Saved!",
        text: "Store branding, mNotify SMS, and Paystack configurations updated successfully.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    }
  };

  const handleSendTestSMS = async () => {
    if (!testPhone.trim()) {
      Swal.fire("Phone Required", "Please enter a recipient phone number for the test SMS.", "warning");
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await apiRequest("/settings/test-sms", "POST", {
        phone: testPhone,
      }, 20000);

      if (res.success) {
        Swal.fire({
          title: "mNotify SMS Dispatched!",
          text: res.message || `Test SMS sent to ${testPhone}. Check the phone shortly.`,
          icon: "success",
          confirmButtonColor: "#0A0A0A",
        });
      } else {
        Swal.fire("Dispatch Failed", res.message || "Could not trigger test SMS.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Could not trigger test SMS.", "error");
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Settings</h1>
          <p>Brand, contact, SMS, payments, and your account — switch tabs instead of scrolling.</p>
        </div>
        <div className="header-actions">
          {settingsTab !== "account" && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="cta-button-premium shadowed"
            style={{
              padding: "0.8rem 1.8rem",
              fontSize: "0.85rem",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
          )}
        </div>
      </header>

      <div className="settings-tabs" role="tablist" aria-label="Settings sections">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={settingsTab === tab.id}
              className={`settings-tab ${settingsTab === tab.id ? "is-on" : ""}`}
              onClick={() => setSettingsTab(tab.id)}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave}>
        {settingsTab === "brand" && (
          <div className="settings-tab-panel">
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="admin-card">
              <div className="card-header" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <ImageIcon size={20} color="#0A0A0A" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Official Brand Logo</h2>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                      Appears on Navbar, Footer, Admin, and as the Receipt Watermark.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Logo Preview */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "2px dashed #cbd5e1",
                  borderRadius: "16px",
                  padding: "2rem",
                  textAlign: "center",
                  position: "relative",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    width: "180px",
                    height: "90px",
                    margin: "0 auto 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0A0A0A",
                    borderRadius: "12px",
                    padding: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={formData.logoUrl || "/welamalogo.png"}
                    alt="Brand Logo Preview"
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.src = "/welamalogo.png";
                    }}
                  />
                </div>

                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
                  Live Logo Preview
                </div>
                <p style={{ fontSize: "0.75rem", color: "#64748b", maxWidth: "300px", margin: "0 auto 1.25rem" }}>
                  Uploaded directly to Cloudinary (PNG transparent, SVG, or JPG recommended)
                </p>

                <label
                  className="cta-button-premium"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1.4rem",
                    fontSize: "0.8rem",
                    borderRadius: "10px",
                    cursor: isUploading ? "not-allowed" : "pointer",
                  }}
                >
                  <Upload size={16} /> {isUploading ? "Uploading to Cloudinary..." : "Upload New Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    disabled={isUploading}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                  Or Custom Logo URL
                </label>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={handleChange("logoUrl")}
                  placeholder="https://res.cloudinary.com/... or /welamalogo.png"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              {/* Hero Image Preview & Upload */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "2px dashed #cbd5e1",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  textAlign: "center",
                  position: "relative",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0A0A0A", marginBottom: "0.5rem" }}>
                  Storefront Hero Image
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "140px",
                    margin: "0 auto 1rem",
                    background: "#e2e8f0",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={formData.heroImageUrl || "/shophero.png"}
                    alt="Hero Image Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src = "/shophero.png";
                    }}
                  />
                </div>
                <label
                  className="cta-button-premium"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1.4rem",
                    fontSize: "0.8rem",
                    borderRadius: "10px",
                    cursor: isUploadingHero ? "not-allowed" : "pointer",
                  }}
                >
                  <Upload size={16} /> {isUploadingHero ? "Uploading..." : "Upload Hero Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroFileUpload}
                    disabled={isUploadingHero}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                  Or Custom Hero Image URL
                </label>
                <input
                  type="text"
                  value={formData.heroImageUrl}
                  onChange={handleChange("heroImageUrl")}
                  placeholder="https://... or /shophero.png"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                  Site name
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={handleChange("siteName")}
                  placeholder="WELAMA"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={handleChange("tagline")}
                  placeholder="The Essence of Luxury"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.85rem",
                  }}
                />
              </div>
            </div>
          </div>
          </div>
        )}

        {settingsTab === "contact" && (
          <div className="settings-tab-panel">
            {/* Business Contact Info */}
            <div className="admin-card">
              <div className="card-header" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <Building size={20} color="#0A0A0A" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Business Contact Info</h2>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                      Displayed in website footer & receipts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={handleChange("contactPhone")}
                  placeholder="+233 55 108 2163"
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange("contactEmail")}
                  placeholder="concierge@welama.com"
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                  Address / Showroom Location
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={handleChange("address")}
                  placeholder="Accra, Ghana"
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.85rem",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {settingsTab === "sms" && (
          <div className="settings-tab-panel">
            {/* mNotify Ghana SMS Settings */}
            <div className="admin-card">
              <div className="card-header" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ background: "#f0fdf4", padding: "8px", borderRadius: "10px", border: "1px solid #dcfce7" }}>
                    <Smartphone size={20} color="#16a34a" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.1rem", margin: 0 }}>mNotify Ghana SMS Gateway</h2>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                      Automated SMS updates with tracking ID & links via mNotify.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <input
                  type="checkbox"
                  id="smsEnabled"
                  checked={formData.smsEnabled}
                  onChange={handleChange("smsEnabled")}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#0A0A0A" }}
                />
                <label htmlFor="smsEnabled" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", cursor: "pointer" }}>
                  Enable mNotify SMS Order & Tracking Updates
                </label>
              </div>



              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                  mNotify Sender ID (Max 11 chars)
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={formData.mnotifySenderId}
                  onChange={handleChange("mnotifySenderId")}
                  placeholder="WELAMA"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              {/* Test SMS Box */}
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                  Send Test mNotify SMS
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="e.g. 0551082163"
                    style={{
                      flex: 1,
                      padding: "0.65rem 1rem",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.85rem",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendTestSMS}
                    disabled={isSendingTest}
                    className="cta-button-premium"
                    style={{
                      padding: "0.65rem 1.2rem",
                      fontSize: "0.8rem",
                      borderRadius: "10px",
                      background: "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Send size={14} /> {isSendingTest ? "Sending..." : "Test SMS"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {settingsTab === "paystack" && (
          <div className="settings-tab-panel">
            {/* Paystack Online Payment Settings */}
            <div className="admin-card">
              <div className="card-header" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ background: "#eff6ff", padding: "8px", borderRadius: "10px", border: "1px solid #dbeafe" }}>
                    <CreditCard size={20} color="#2563eb" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Paystack Payment Gateway</h2>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                      Accept MoMo (MTN/Telecel/AirtelTigo), Visa, Mastercard, and Bank.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <input
                  type="checkbox"
                  id="paystackEnabled"
                  checked={formData.paystackEnabled}
                  onChange={handleChange("paystackEnabled")}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#0A0A0A" }}
                />
                <label htmlFor="paystackEnabled" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", cursor: "pointer" }}>
                  Enable Paystack Online Checkout
                </label>
              </div>


            </div>
          </div>
        )}
      </form>

      {settingsTab === "account" && (
      <div className="settings-tab-panel">
        <div className="admin-card">
          <div className="card-header" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "#fef2f2", padding: "8px", borderRadius: "10px", border: "1px solid #fee2e2" }}>
                <Lock size={20} color="#dc2626" />
              </div>
              <div>
                <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Your account</h2>
                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                  This name appears on the dashboard welcome.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={submitDisplayName} style={{ maxWidth: "500px", marginBottom: "2rem" }}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.85rem",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSavingName}
              style={{
                background: "#0A0A0A",
                color: "white",
                border: "none",
                padding: "0.7rem 1.25rem",
                borderRadius: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {isSavingName ? "Saving..." : "Save name"}
            </button>
          </form>

          <div className="card-header" style={{ marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Account Security</h2>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                Update your admin portal password.
              </p>
            </div>
          </div>
          
          <form onSubmit={submitPasswordChange} style={{ maxWidth: "500px" }}>
            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={pwdData.currentPassword}
                onChange={handlePwdChange}
                required
                placeholder="Enter current password"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={pwdData.newPassword}
                onChange={handlePwdChange}
                required
                placeholder="Enter new password"
                minLength={6}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={pwdData.confirmPassword}
                onChange={handlePwdChange}
                required
                placeholder="Re-enter new password"
                minLength={6}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPwd}
              className="cta-button-premium"
              style={{
                padding: "0.8rem 1.8rem",
                fontSize: "0.85rem",
                borderRadius: "10px",
                background: "#0A0A0A",
              }}
            >
              {isChangingPwd ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};

export default AdminSettings;
