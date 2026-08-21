"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { useDarkMode } from "@/context/DarkModeContext";

export default function AdminSettingsPage() {
  const { darkMode } = useDarkMode();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await API.get("/settings");
        setMaintenanceMode(res.data.data.maintenanceMode);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleToggleMaintenance = async () => {
    try {
      const res = await API.put("/settings/maintenance");

      setMaintenanceMode(res.data.data.maintenanceMode);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`min-h-screen p-8 transition-colors duration-300 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div
        className={`max-w-5xl mx-auto rounded-2xl shadow-lg p-8 ${
          darkMode
            ? "bg-gray-800"
            : "bg-white"
        }`}
      >
        <h1 className="text-3xl font-bold">
          Admin Settings
        </h1>

        <p
          className={`mt-2 ${
            darkMode
              ? "text-gray-300"
              : "text-gray-500"
          }`}
        >
          Configure your application settings.
        </p>

        <div className="mt-10">

          <h2 className="text-2xl font-semibold mb-6">
            General Settings
          </h2>

          <div
            className={`rounded-xl p-6 border ${
              darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-lg font-semibold">
                  Website Maintenance
                </h3>

                <p
                  className={`text-sm mt-1 ${
                    darkMode
                      ? "text-gray-300"
                      : "text-gray-500"
                  }`}
                >
                  Enable or disable maintenance mode.
                </p>
              </div>

              <button
                onClick={handleToggleMaintenance}
                className={`px-5 py-2 rounded-lg text-white transition ${
                  maintenanceMode
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {maintenanceMode ? "ON" : "OFF"}
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}