import React, { useState } from "react";
import Swal from "sweetalert2";
import { apiRequest } from "../utils/api";

const ForcePasswordChangeModal = ({ setUser }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiRequest("/auth/updatepassword", "PUT", {
        currentPassword,
        newPassword,
      });
      Swal.fire("Success", "Password updated securely. Welcome!", "success");
      setUser((prev) => ({ ...prev, needsPasswordChange: false }));
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-modal-backdrop" style={{ zIndex: 99999 }}>
      <div
        className="product-modal-window p-8 max-w-md w-full"
        style={{ padding: "2rem", maxWidth: "400px" }}
      >
        <h2 className="text-2xl font-bold text-center mb-6 serif">
          Security Requirement
        </h2>
        <p className="text-center mb-6 text-gray-500 text-sm">
          Welcome! Before you can access the dashboard, you must change your
          password from the default one provided.
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A0A0A] text-white py-3 rounded-md font-bold mt-4 hover:bg-[#1A1A1A] transition-colors"
          >
            {loading ? "Updating..." : "Update Password & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForcePasswordChangeModal;
