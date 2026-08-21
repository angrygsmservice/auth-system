"use client";

import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api";
import { useDarkMode } from "@/context/DarkModeContext";

type Activity = {
  _id: string;
  action: string;
  description?: string;
  createdAt?: string;
  status?: "pending" | "completed" | "cancelled";

  admin?: {
    name: string;
    avatar?: string;
  };

  targetUser?: {
    name: string;
    avatar?: string;
  };
};

export default function CalendarPage() {
  const { darkMode } = useDarkMode();

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";

      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterAction, setFilterAction] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("");
  const [filterTargetUser, setFilterTargetUser] = useState("");

  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const clearFilters = () => {
    setFilterAction("");
    setFilterStatus("");
    setFilterAdmin("");
    setFilterTargetUser("");
  };

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const res = await API.get<{ data: Activity[] }>(
          "/admin/activities"
        );

        setActivities(res.data.data ?? []);
      } catch (error) {
        console.error("Calendar activities yuklanmadi:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [firstDay, daysInMonth]);

  const getActivitiesForDay = (day: number) => {
    return activities.filter((activity) => {
      if (!activity.createdAt) return false;

      const date = new Date(activity.createdAt);

      const sameDay =
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day;

      if (!sameDay) return false;

      if (
        filterAction &&
        activity.action !== filterAction
      ) {
        return false;
      }

      if (
        filterStatus &&
        activity.status !== filterStatus
      ) {
        return false;
      }

      if (
        filterAdmin &&
        activity.admin?.name !== filterAdmin
      ) {
        return false;
      }

      if (
        filterTargetUser &&
        activity.targetUser?.name !== filterTargetUser
      ) {
        return false;
      }

      return true;
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const activeFilterCount = [
    filterAction,
    filterStatus,
    filterAdmin,
    filterTargetUser,
  ].filter(Boolean).length;

  const filteredActivities = activities.filter(
    (activity) => {
      if (
        filterAction &&
        activity.action !== filterAction
      ) {
        return false;
      }

      if (
        filterStatus &&
        activity.status !== filterStatus
      ) {
        return false;
      }

      if (
        filterAdmin &&
        activity.admin?.name !== filterAdmin
      ) {
        return false;
      }

      if (
        filterTargetUser &&
        activity.targetUser?.name !==
          filterTargetUser
      ) {
        return false;
      }

      return true;
    }
  );

  const totalActivities =
    filteredActivities.length;

  const completedActivities =
    filteredActivities.filter(
      (activity) =>
        activity.status === "completed"
    ).length;

  const pendingActivities =
    filteredActivities.filter(
      (activity) =>
        activity.status === "pending"
    ).length;

  const cancelledActivities =
    filteredActivities.filter(
      (activity) =>
        activity.status === "cancelled"
    ).length;

  if (loading) {
    return <div>Loading...</div>;
  }


return (
  <div className="space-y-6">
    {/* STATISTICS */}
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        className={`rounded-xl border p-5 ${
          darkMode
            ? "border-gray-700 bg-gray-700"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <p
          className={`text-sm font-medium ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Total Activities
        </p>
        <p className="mt-1 text-3xl font-bold">
          {totalActivities}
        </p>
      </div>

      <div
        className={`rounded-xl border p-5 ${
          darkMode
            ? "border-gray-700 bg-gray-700"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <p
          className={`text-sm font-medium ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Completed
        </p>
        <p className="mt-1 text-3xl font-bold">
          {completedActivities}
        </p>
      </div>

      <div
        className={`rounded-xl border p-5 ${
          darkMode
            ? "border-gray-700 bg-gray-700"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <p
          className={`text-sm font-medium ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Pending
        </p>
        <p className="mt-1 text-3xl font-bold">
          {pendingActivities}
        </p>
      </div>

      <div
        className={`rounded-xl border p-5 ${
          darkMode
            ? "border-gray-700 bg-gray-700"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <p
          className={`text-sm font-medium ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Cancelled
        </p>
        <p className="mt-1 text-3xl font-bold">
          {cancelledActivities}
        </p>
      </div>
    </div>

    {/* HEADER */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          Activity Calendar
        </h1>

        <p
          className={`mt-2 ${
            darkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          View administrator activities by date.
        </p>
      </div>

      <div className="flex items-center">
        <button
          onClick={goToday}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Today
        </button>

        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`ml-2 rounded-lg px-4 py-2 font-medium transition ${
            filterOpen
              ? "bg-blue-700 text-white"
              : darkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🔍 Advanced Filter

          {activeFilterCount > 0 && (
            <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-blue-700">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>

    {/* CLEAR FILTERS */}
    {activeFilterCount > 0 && (
      <div className="flex justify-end">
        <button
          onClick={clearFilters}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            darkMode
              ? "bg-gray-600 text-white hover:bg-gray-500"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Clear Filters
        </button>
      </div>
    )}

    {/* ADVANCED FILTER */}
    {filterOpen && (
      <div
        className={`rounded-xl border p-5 ${
          darkMode
            ? "border-gray-700 bg-gray-700"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            Advanced Filter
          </h3>

          <button
            onClick={() => setFilterOpen(false)}
            className={`rounded-lg px-3 py-1 text-sm ${
              darkMode
                ? "bg-gray-600 hover:bg-gray-500"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Close
          </button>
        </div>

        <p
          className={`mt-2 text-sm ${
            darkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          Filter activities by action, status, admin, or target user.
        </p>

        {activeFilterCount > 0 && (
          <p
            className={`mt-3 text-sm font-medium ${
              darkMode ? "text-blue-300" : "text-blue-600"
            }`}
          >
            {activeFilterCount} filter
            {activeFilterCount > 1 ? "s" : ""} active
          </p>
        )}

        {/* FILTER INPUTS */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* ACTION */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Action
            </label>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 ${
                darkMode
                  ? "border-gray-600 bg-gray-800 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="delete">Delete</option>
              <option value="restore">Restore</option>
              <option value="change-role">Change Role</option>
              <option value="login">Login</option>
            </select>
          </div>

          {/* STATUS */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Status
            </label>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 ${
                darkMode
                  ? "border-gray-600 bg-gray-800 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* ADMIN */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Admin
            </label>

            <select
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 ${
                darkMode
                  ? "border-gray-600 bg-gray-800 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="">All Admins</option>

              {Array.from(
                new Map(
                  activities
                    .filter((activity) => activity.admin?.name)
                    .map((activity) => [
                      activity.admin!.name,
                      activity.admin!.name,
                    ])
                ).values()
              ).map((adminName) => (
                <option key={adminName} value={adminName}>
                  {adminName}
                </option>
              ))}
            </select>
          </div>

          {/* TARGET USER */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Target User
            </label>

            <select
              value={filterTargetUser}
              onChange={(e) => setFilterTargetUser(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 ${
                darkMode
                  ? "border-gray-600 bg-gray-800 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="">All Users</option>

              {Array.from(
                new Map(
                  activities
                    .filter((activity) => activity.targetUser?.name)
                    .map((activity) => [
                      activity.targetUser!.name,
                      activity.targetUser!.name,
                    ])
                ).values()
              ).map((userName) => (
                <option key={userName} value={userName}>
                  {userName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )}

    {/* VIEW MODE */}
    <div className="flex justify-end gap-2">
      <button
        onClick={() => setViewMode("calendar")}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
          viewMode === "calendar"
            ? "bg-blue-600 text-white"
            : darkMode
              ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        📅 Calendar
      </button>

      <button
        onClick={() => setViewMode("list")}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
          viewMode === "list"
            ? "bg-blue-600 text-white"
            : darkMode
              ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        📋 List
      </button>
    </div>

    {/* LIST / CALENDAR */}
    {viewMode === "list" ? (
      <div
        className={`rounded-xl border p-5 ${
          darkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <h2 className="mb-4 text-xl font-bold">
          All Activities
        </h2>

        {filteredActivities.length === 0 ? (
          <p
            className={
              darkMode ? "text-gray-300" : "text-gray-500"
            }
          >
            No activities found.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div
                key={activity._id}
                onClick={() => setSelectedActivity(activity)}
                className={`cursor-pointer rounded-xl border p-4 ${
                  darkMode
                    ? "border-gray-700 bg-gray-700"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        activity.admin?.avatar
                          ? `http://localhost:3000${activity.admin.avatar}`
                          : "/default-avatar.png"
                      }
                      alt={activity.admin?.name || "Admin"}
                      className="h-10 w-10 rounded-full object-cover"
                    />

                    <div>
                      <p className="font-bold">
                        {activity.admin?.name || "Admin"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {activity.action
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1)
                          )
                          .join(" ")}
                      </p>
                    </div>
                  </div>

                  {activity.status && (
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        activity.status
                      )}`}
                    >
                      {activity.status}
                    </span>
                  )}
                </div>

                <div
                  className={`mt-3 rounded-lg p-3 text-sm ${
                    darkMode
                      ? "bg-gray-800 text-gray-300"
                      : "bg-white text-gray-600"
                  }`}
                >
                  {activity.description || "No description"}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Target User: {activity.targetUser?.name || "-"}
                  </span>

                  <span>
                    {activity.createdAt
                      ? new Date(
                          activity.createdAt
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ) : (
      <>
        {/* MONTH NAVIGATION */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={previousMonth}
            className={`rounded-lg px-4 py-2 ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            ← Previous
          </button>

          <h2 className="text-2xl font-bold">
            {monthName} {year}
          </h2>

          <button
            onClick={nextMonth}
            className={`rounded-lg px-4 py-2 ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Next →
          </button>
        </div>

        {/* WEEK DAYS */}
        <div className="mb-2 grid grid-cols-7 gap-2">
          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <div
              key={day}
              className={`py-3 text-center font-semibold ${
                darkMode
                  ? "text-gray-300"
                  : "text-gray-600"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* CALENDAR DAYS */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="hidden min-h-32 sm:block"
                />
              );
            }

            const dayActivities = getActivitiesForDay(day);
            const today = new Date();

            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`min-h-32 cursor-pointer rounded-xl border p-3 ${
                  darkMode
                    ? "border-gray-700 bg-gray-700"
                    : "border-gray-200 bg-gray-50"
                } ${
                  isToday ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold ${
                      isToday ? "text-blue-500" : ""
                    }`}
                  >
                    {day}
                  </span>

                  {dayActivities.length > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                      {dayActivities.length}
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1">
                  {dayActivities.slice(0, 3).map((activity) => (
                    <div
                      key={activity._id}
                      className={`truncate rounded border px-2 py-1 text-xs ${getStatusStyle(
                        activity.status
                      )}`}
                    >
                      {activity.action
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1)
                        )
                        .join(" ")}
                    </div>
                  ))}

                  {dayActivities.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayActivities.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    )}

    {/* SELECTED DAY ACTIVITIES */}
    {selectedDay !== null && (
      <div
        className={`rounded-xl border p-6 ${
          darkMode
            ? "border-gray-700 bg-gray-700"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            Activities for {monthName} {selectedDay}, {year}
          </h3>

          <button
            onClick={() => setSelectedDay(null)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              darkMode
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Close
          </button>
        </div>

        {getActivitiesForDay(selectedDay).length === 0 ? (
          <p
            className={
              darkMode ? "text-gray-300" : "text-gray-500"
            }
          >
            No activities on this day.
          </p>
        ) : (
          <div className="space-y-3">
            {getActivitiesForDay(selectedDay).map((activity) => (
              <div
                key={activity._id}
                onClick={() => setSelectedActivity(activity)}
                className={`cursor-pointer rounded-xl border p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                  darkMode
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        activity.admin?.avatar
                          ? `http://localhost:3000${activity.admin.avatar}`
                          : "/default-avatar.png"
                      }
                      alt={activity.admin?.name || "Admin"}
                      className="h-10 w-10 rounded-full object-cover"
                    />

                    <div>
                      <div className="font-bold">
                        {activity.admin?.name || "Admin"}
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <div className="text-xs text-gray-500">
                          {activity.action
                            .split("-")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1)
                            )
                            .join(" ")}
                        </div>

                        {activity.status && (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusStyle(
                              activity.status
                            )}`}
                          >
                            {activity.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs text-gray-500">
                    {activity.createdAt ? (
                      <>
                        <div>
                          📅{" "}
                          {new Date(
                            activity.createdAt
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>

                        <div className="mt-1">
                          🕒{" "}
                          {new Date(
                            activity.createdAt
                          ).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>

                <div
                  className={`mt-3 rounded-lg p-3 text-sm ${
                    darkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-50 text-gray-600"
                  }`}
                >
                  <p className="mb-1 text-xs font-semibold opacity-70">
                    Description
                  </p>

                  <p>
                    {activity.description || "No description"}
                  </p>
                </div>

                {activity.targetUser?.name && (
                  <div
                    className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      darkMode
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {activity.targetUser.avatar ? (
                      <img
                        src={
                          activity.targetUser.avatar.startsWith(
                            "http"
                          )
                            ? activity.targetUser.avatar
                            : `http://localhost:3000${activity.targetUser.avatar}`
                        }
                        alt={activity.targetUser.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-semibold text-white">
                        {activity.targetUser.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div>
                      <p className="text-xs opacity-70">
                        Target User
                      </p>

                      <p className="font-semibold">
                        {activity.targetUser.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ACTIVITY DETAILS MODAL */}
    {selectedActivity && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={() => setSelectedActivity(null)}
      >
        <div
          className={`w-full max-w-md rounded-xl p-6 shadow-xl ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-900"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Activity Details
            </h2>

            <button
              onClick={() => setSelectedActivity(null)}
              className="rounded-lg bg-gray-500 px-3 py-1 text-white"
            >
              Close
            </button>
          </div>

          <div className="flex items-center gap-2">
            <p>
              <strong>Action:</strong>{" "}
              {selectedActivity.action}
            </p>

            {selectedActivity.status && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                  selectedActivity.status
                )}`}
              >
                {selectedActivity.status}
              </span>
            )}
          </div>

          <div className="mb-4 mt-4 flex items-center gap-3">
            <img
              src={
                selectedActivity.admin?.avatar
                  ? `http://localhost:3000${selectedActivity.admin.avatar}`
                  : "/default-avatar.png"
              }
              alt={selectedActivity.admin?.name || "Admin"}
              className="h-12 w-12 rounded-full object-cover"
            />

            <div>
              <p className="text-xs opacity-70">Admin</p>

              <p className="font-semibold">
                {selectedActivity.admin?.name || "-"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {selectedActivity.targetUser?.avatar ? (
              <img
                src={
                  selectedActivity.targetUser.avatar.startsWith(
                    "http"
                  )
                    ? selectedActivity.targetUser.avatar
                    : `http://localhost:3000${selectedActivity.targetUser.avatar}`
                }
                alt={selectedActivity.targetUser.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 font-semibold text-white">
                {selectedActivity.targetUser?.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>
            )}

            <div>
              <p className="text-xs opacity-70">
                Target User
              </p>

              <p className="font-semibold">
                {selectedActivity.targetUser?.name || "-"}
              </p>
            </div>
          </div>

          <p className="mt-2">
            <strong>Description:</strong>{" "}
            {selectedActivity.description || "-"}
          </p>

          <div className="mt-4 border-t pt-3">
            <p className="text-sm">
              <strong>Date:</strong>{" "}
              {selectedActivity.createdAt
                ? new Date(
                    selectedActivity.createdAt
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-"}
            </p>

            <p className="mt-1 text-sm">
              <strong>Time:</strong>{" "}
              {selectedActivity.createdAt
                ? new Date(
                    selectedActivity.createdAt
                  ).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
);
}