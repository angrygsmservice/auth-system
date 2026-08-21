"use client";

import { useEffect, useMemo, useState } from "react";
import { useDarkMode } from "@/context/DarkModeContext";
import API from "@/lib/api";
import type { Activity, ActionFilter } from "./types";

import {
  getActionStyle,
  getActionIcon,
  DATE_LOCALE,
  ITEMS_PER_PAGE,
} from "./utils";

export default function AuditLogPage() {
  const { darkMode } = useDarkMode();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);;
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");

  useEffect(() => {
    const loadActivities = async (): Promise<void> => {
      try {
        const res = await API.get<{ data: Activity[] }>("/admin/activities");

        setActivities(res.data.data ?? []);
        console.log(
          "ACTIONS:",
          res.data.data.map((item) => item.action)
        );
      } catch (err) {
        console.error("Failed to load activities:", err);
      } finally {
        setLoading(false);
      }
    };

  loadActivities();
}, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const value = search.trim().toLowerCase();

      const matchesSearch =
        activity.admin?.name?.toLowerCase().includes(value) ||
        activity.action.includes(value) ||
        activity.description?.toLowerCase().includes(value) ||
        activity.targetUser?.name?.toLowerCase().includes(value);

      const matchesAction =
        actionFilter === "all" ||
        activity.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [activities, search, actionFilter]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const currentActivities = useMemo(() => {
    return filteredActivities.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
  }, [filteredActivities, indexOfFirstItem, indexOfLastItem]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredActivities.length / ITEMS_PER_PAGE)
  );

return (
  <div
    className={`min-h-screen p-8 ${
      darkMode
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-gray-900"
    }`}
  >
    <div
      className={`max-w-7xl mx-auto rounded-2xl shadow-lg p-8 ${
        darkMode
          ? "bg-gray-800"
          : "bg-white"
      }`}
    >
      <h1 className="text-3xl font-bold">
        Audit Log
      </h1>

      <p
        className={`mt-2 ${
          darkMode
            ? "text-gray-300"
            : "text-gray-500"
        }`}
      >
        View all administrator activities.
      </p>

      <div className="mt-6 mb-6">
        <input
          type="text"
           aria-label="Search activities"
          placeholder="Search activities..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className={`w-full px-4 py-3 rounded-lg border outline-none ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-black placeholder-gray-500"
          }`}
        />
      </div>

      <div className="mb-6">
        <select
          aria-label="Filter activities by action"
          value={actionFilter}
          onChange={(e) =>
            setActionFilter(e.target.value as ActionFilter)
          }
          className={`px-4 py-3 rounded-lg border outline-none ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-black"
          }`}
        >
          <option value="all">
            All Actions
          </option>

          <option value="login">
            Login
          </option>

          <option value="create">
            Create
          </option>

          <option value="update">
            Update
          </option>

          <option value="delete">
            Delete
          </option>

        </select>
      </div>

      <div className="mt-8 overflow-x-auto">

        {loading ? (
          <div className="flex justify-center py-10">
            <div
              className={`h-8 w-8 animate-spin rounded-full border-4 border-t-transparent ${
                darkMode ? "border-white" : "border-gray-700"
              }`}
            />
          </div>
        ) : (
          <>
            <table className="w-full border-collapse">

              <thead>
                <tr
                  className={`${
                    darkMode
                      ? "bg-gray-700"
                      : "bg-gray-200"
                  }`}
                >
                  <th className="text-left px-4 py-3">Admin</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3">Description</th>
                  <th className="text-left px-4 py-3">Target User</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {currentActivities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-gray-400"
                    >
                      No activities found.
                    </td>
                  </tr>
                ) : (
                  currentActivities.map((activity) => (
                    <tr
                      key={activity._id}
                      className={`border-b ${
                        darkMode
                          ? "border-gray-700 hover:bg-gray-700"
                          : "border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <td className="px-4 py-3">
                       <div className="flex items-center gap-3">
                         <img
                           src={
                             activity.admin?.avatar
                               ? `http://localhost:3000${activity.admin.avatar}`
                               : "/default-avatar.png"
                           }
                           alt={activity.admin?.name || "Admin"}
                           className="w-10 h-10 rounded-full object-cover"
                         />

                         <span>
                           {activity.admin?.name ?? "-"}
                         </span>
                       </div>
                     </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionStyle(
                            activity.action,
                            darkMode
                          )}`}
                        >
                          <div className="flex items-center gap-2">
                            {getActionIcon(activity.action)}
                            <span>{activity.action.toUpperCase()}</span>
                          </div>

                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {activity.description ?? "-"}
                      </td>

                      <td className="px-4 py-3">
                        {activity.targetUser?.name || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {activity.createdAt
                          ?new Date(activity.createdAt).toLocaleString(DATE_LOCALE, {
                             day: "2-digit",
                             month: "short",
                             year: "numeric",
                             hour: "2-digit",
                             minute: "2-digit",
                           })
                         : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>

            <div className="flex justify-center items-center gap-2 mt-6">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                    setCurrentPage((prev) => prev - 1)
                }
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => (
                  <button
                    key={`page-${index + 1}`}
                    onClick={() =>
                      setCurrentPage(index + 1)
                    }
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === index + 1
                        ? "bg-green-600 text-white"
                        : darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => prev + 1)
                }
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Next
              </button>

            </div>
          </>
        )}

      </div>
    </div>
  </div>
);
}