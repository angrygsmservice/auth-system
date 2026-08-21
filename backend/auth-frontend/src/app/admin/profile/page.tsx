"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { useDarkMode } from "@/context/DarkModeContext";

export default function AdminProfilePage() {
  const { darkMode } = useDarkMode();

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/users/profile");

        setUser(res.data.data);
        setName(res.data.data.name);
      } catch (err) {
        console.error(err);
      }
    };

    loadProfile();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleUpdate = async () => {
    try {
      const res = await API.put("/users/profile", {
        name,
      });

      setUser(res.data.data);

      alert("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Barcha parol maydonlarini to‘ldiring.");
      return;
    }

    if (newPassword.length < 8) {
      alert("Yangi parol kamida 8 ta belgidan iborat bo‘lishi kerak.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Yangi parollar bir xil emas.");
      return;
    }

    try {
      await API.put("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      alert("Password changed successfully.");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Password o‘zgartirishda xatolik."
      );
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      alert("Avval rasm tanlang.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await API.post("/users/avatar", formData);

      setUser(res.data.data);
      setAvatarFile(null);

      alert("Avatar muvaffaqiyatli yangilandi.");
    } catch (err) {
      console.error(err);
      alert("Avatar yuklashda xatolik.");
    }
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div
        className={`max-w-4xl mx-auto rounded-2xl shadow-lg p-8 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* TITLE */}
        <h1 className="text-3xl font-bold">
          Admin Profile
        </h1>

        {/* PROFILE */}
        <div className="flex flex-col items-center mt-8">
          <img
            src={
              user.avatar
                ? `http://localhost:3000${user.avatar}`
                : "https://ui-avatars.com/api/?name=Admin"
            }
            alt={user.name}
            className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-lg"
          />

          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={(e) => {
              setAvatarFile(e.target.files?.[0] || null);
            }}
            className="mt-4"
          />

          <button
            onClick={handleAvatarUpload}
            disabled={!avatarFile}
            className="mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg"
          >
            Upload Avatar
          </button>

          <h2 className="text-2xl font-bold mt-4">
            {user.name}
          </h2>

          <p
            className={`mt-2 ${
              darkMode ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {user.email}
          </p>

          <span className="mt-3 px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
            {user.role.toUpperCase()}
          </span>
        </div>

        {/* ACCOUNT INFORMATION */}
        <div className="mt-10">
          <h3
            className={`text-xl font-semibold border-b pb-2 ${
              darkMode
                ? "border-gray-600 text-white"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Account Information
          </h3>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between">
              <span
                className={
                  darkMode ? "text-gray-300" : "text-gray-500"
                }
              >
                Role
              </span>

              <span className="font-semibold">
                {user.role.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between">
              <span
                className={
                  darkMode ? "text-gray-300" : "text-gray-500"
                }
              >
                Email
              </span>

              <span className="font-semibold">
                {user.email}
              </span>
            </div>

            <div className="flex justify-between">
              <span
                className={
                  darkMode ? "text-gray-300" : "text-gray-500"
                }
              >
                User ID
              </span>

              <span className="font-semibold">
                {user._id.slice(-8)}
              </span>
            </div>

            <div className="flex justify-between">
              <span
                className={
                  darkMode ? "text-gray-300" : "text-gray-500"
                }
              >
                Created
              </span>

              <span className="font-semibold">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* EDIT PROFILE */}
        <div className="mt-10">
          <h3
            className={`text-xl font-semibold border-b pb-2 ${
              darkMode
                ? "border-gray-600 text-white"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Edit Profile
          </h3>

          <div className="mt-5">
            <label
              className={`block mb-2 font-medium ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />

            <div className="mt-5">
              <button
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="mt-10">
          <h3
            className={`text-xl font-semibold border-b pb-2 ${
              darkMode
                ? "border-gray-600 text-white"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Change Password
          </h3>

          <div className="mt-5 space-y-4">
            {/* OLD PASSWORD */}
            <div>
              <label
                className={`block mb-2 font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Current Password
              </label>

              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className={`w-full rounded-lg border px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label
                className={`block mb-2 font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={`w-full rounded-lg border px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                className={`block mb-2 font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                className={`w-full rounded-lg border px-4 py-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* BUTTON */}
            <div className="pt-2">
              <button
                onClick={handleChangePassword}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}