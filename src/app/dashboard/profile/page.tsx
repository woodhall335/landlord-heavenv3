"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        fullName: data.full_name || "",
        email: data.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile() {
    setSaving(true);
    setMessage(null);

    try {
      if (!profile) throw new Error("No profile loaded");

      // Update profile in users table
      const { error: profileError } = await supabase
        .from("users")
        .update({
          full_name: formData.fullName,
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      setMessage({ type: "success", text: "Profile updated successfully!" });
      loadProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setSaving(true);
    setMessage(null);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("New passwords don't match");
      }

      if (formData.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Password changed successfully!" });
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      setMessage({ type: "error", text: error.message || "Failed to change password" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // Call admin API to delete user account
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      // Sign out and redirect
      await supabase.auth.signOut();
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setMessage({ type: "error", text: error.message || "Failed to delete account" });
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-charcoal mb-8">Profile Settings</h1>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-error/10 text-error border border-error/20"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Profile Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Profile Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed. Contact support if needed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Member Since</label>
                <input
                  type="text"
                  value={profile ? new Date(profile.created_at).toLocaleDateString() : ""}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Update Profile"}
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Change Password</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">New Password</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter new password"
                />
                <p className="mt-1 text-sm text-gray-500">Must be at least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={saving || !formData.newPassword || !formData.confirmPassword}
                className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-white rounded-lg border border-error p-6">
            <h2 className="text-xl font-semibold text-error mb-4">Delete Account</h2>
            <p className="text-gray-700 mb-4">
              Once you delete your account, there is no going back. All your data, cases, and documents will be
              permanently deleted.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-error text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            ) : (
              <div className="bg-error/10 border border-error rounded-lg p-4">
                <p className="text-error font-semibold mb-4">Are you absolutely sure?</p>
                <p className="text-gray-700 mb-4">
                  This action cannot be undone. Type "DELETE" below to confirm.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={saving}
                    className="bg-error text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Deleting..." : "Yes, Delete My Account"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={saving}
                    className="bg-gray-200 text-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
