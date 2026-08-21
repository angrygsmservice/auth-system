"use client";

import { useEffect, useState } from "react";
import API from "../../../lib/api";
import { useDarkMode } from "@/context/DarkModeContext";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "suspended";
  avatar?: string;
  createdAt?: string;
  balance: number;
}

export default function UsersPage() {
  const { darkMode } = useDarkMode();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("");

  const getUsers = async () => {
    try {
      console.log("GET USERS");

      const res = await API.get("/auth/admin/users");

      console.log("USERS:", res.data);

      setUsers(res.data.users || []);
    } catch (error: any) {
      console.log("GET USERS ERROR:", error);

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase().trim();

   const matchesSearch =
    (user.name || "").toLowerCase().includes(searchText) ||
    (user.email || "").toLowerCase().includes(searchText) ||
    (user.role || "").toLowerCase().includes(searchText);

    const matchesRole =
      !roleFilter || user.role === roleFilter;

    const matchesStatus =
      !statusFilter || user.status === statusFilter;

    const matchesBalance =
      !balanceFilter ||
      (balanceFilter === "zero" && user.balance === 0) ||
      (balanceFilter === "positive" && user.balance > 0);

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus &&
      matchesBalance
    );
  });

  if (loading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          darkMode
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <p className="text-lg font-semibold">
          Loading users...
        </p>
      </div>
    );
  }

  return (
  <div
    className={`min-h-screen p-8 transition-colors duration-300 ${
      darkMode
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-gray-900"
    }`}
  >
    {/* HEADER */}
    <div className="mb-6">
      <h1 className="text-3xl font-bold">
        User List
      </h1>

      <p
        className={`mt-2 ${
          darkMode
            ? "text-gray-300"
            : "text-gray-500"
        }`}
      >
        Manage registered users.
      </p>
    </div>

    {/* SEARCH */}
    <div className="mb-5">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users by name, email or role..."
        className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
          darkMode
            ? "border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 focus:border-blue-500"
            : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
        }`}
      />
    </div>

    {/* ADVANCED FILTERS */}
    <div className="mb-5">
      <button
        type="button"
        onClick={() =>
          setShowAdvancedFilters(!showAdvancedFilters)
        }
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          darkMode
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
        }`}
      >
        🎛 Advanced filters
      </button>
    </div>

    {showAdvancedFilters && (
      <div
        className={`mb-5 rounded-xl border p-5 ${
          darkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <h2 className="mb-4 text-lg font-semibold">
          Advanced Filters
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* ROLE FILTER */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Role
            </label>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 outline-none ${
                darkMode
                  ? "border-gray-700 bg-gray-700 text-white"
                  : "border-gray-200 bg-gray-50 text-gray-900"
              }`}
            >
              <option value="">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* STATUS FILTER */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
                darkMode
                  ? "border-gray-700 bg-gray-700 text-white focus:border-blue-500"
                  : "border-gray-200 bg-gray-50 text-gray-900 focus:border-blue-500"
              }`}
             >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* BALANCE FILTER */}
          <div>
            <label className="mb-2 block text-sm font-medium">
             Balance
            </label>

           <select
              value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
                darkMode
                  ? "border-gray-700 bg-gray-700 text-white focus:border-blue-500"
                  : "border-gray-200 bg-gray-50 text-gray-900 focus:border-blue-500"
              }`}
            >
              <option value="">All balances</option>
              <option value="zero">$0.00</option>
              <option value="positive">Greater than $0</option>
            </select>
          </div>

        </div>
      </div>
    )}

    {/* USER TABLE */}
    <div
      className={`overflow-hidden rounded-xl border shadow ${
        darkMode
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-white"
      }`}
    >
      {filteredUsers.length === 0 ? (
        <div className="py-12 text-center">
          <p
            className={`text-lg ${
              darkMode
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            {search.trim()
              ? "No users match your search."
              : "No users found."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            {/* TABLE HEADER */}
            <thead>
              <tr
                className={`border-b text-left text-sm ${
                  darkMode
                    ? "border-gray-700 bg-gray-700 text-gray-300"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                <th className="px-6 py-4 font-semibold">
                  User
                </th>

                <th className="px-6 py-4 font-semibold">
                  Email
                </th>

                <th className="px-6 py-4 font-semibold">
                  Role
                </th>

                <th className="px-6 py-4 font-semibold">
                  Registered
                </th>

                <th className="px-6 py-4 font-semibold">
                  Balance
                </th>

                <th className="px-6 py-4 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className={`border-b transition ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {/* USER */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={
                            user.avatar.startsWith("http")
                              ? user.avatar
                              : `http://localhost:3000${user.avatar}`
                          }
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                          {user.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold">
                          {user.name}
                        </p>

                        <p
                          className={`text-xs ${
                            darkMode
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          ID: {user._id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* EMAIL */}
                  <td className="px-6 py-4">
                    <span
                      className={
                        darkMode
                          ? "text-gray-300"
                          : "text-gray-600"
                      }
                    >
                      {user.email}
                    </span>
                  </td>

                  {/* ROLE */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === "admin"
                          ? darkMode
                            ? "bg-blue-900 text-blue-200"
                            : "bg-blue-100 text-blue-700"
                          : darkMode
                            ? "bg-gray-600 text-gray-200"
                            : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* REGISTERED */}
                  <td className="px-6 py-4">
                    <span
                      className={
                        darkMode
                          ? "text-gray-300"
                          : "text-gray-600"
                      }
                    >
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </td>

                   {/* BALANCE */}
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <span
                         className={
                           darkMode
                             ? "text-gray-300"
                             : "text-gray-600"
                         }
                       >
                         ${user.balance.toFixed(2)}
                       </span>

                       <button
                         type="button"
                         onClick={() => {
                           setEditingUser({
                             ...user,
                           });

                           setBalanceAmount("");
                         }}
                         className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                       >
                         + Balance
                       </button>
                     </div>
                   </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() =>
                          setEditingUser({
                            ...user,
                          })
                        }
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                          darkMode
                            ? "bg-gray-600 text-white hover:bg-gray-500"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Edit
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={async () => {
                          const confirmed =
                            window.confirm(
                              `Are you sure you want to delete ${user.name}?`
                            );

                          if (!confirmed) return;

                          try {
                            await API.delete(
                              `/auth/admin/users/${user._id}`
                            );

                            setUsers((prevUsers) =>
                              prevUsers.filter(
                                (item) =>
                                  item._id !== user._id
                              )
                            );

                            alert(
                              "User deleted successfully"
                            );
                          } catch (error: any) {
                            console.log(
                              "DELETE USER ERROR:",
                              error
                            );

                            alert(
                              error.response?.data
                                ?.message ||
                                "Failed to delete user."
                            );
                          }
                        }}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                          darkMode
                            ? "bg-red-600 text-white hover:bg-red-500"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* RESULT COUNT */}
    <div className="mt-4">
      <p
        className={`text-sm ${
          darkMode
            ? "text-gray-400"
            : "text-gray-500"
        }`}
      >
        Showing {filteredUsers.length} of{" "}
        {users.length} users
      </p>
    </div>

    {/* EDIT USER MODAL */}
    {editingUser && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={() => setEditingUser(null)}
      >
        <div
          className={`w-full max-w-md rounded-xl p-6 shadow-xl ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-900"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* MODAL HEADER */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Edit User
            </h2>

            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className={`rounded-lg px-3 py-1 text-sm transition ${
                darkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Close
            </button>
          </div>

          {/* NAME */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold">
              Name
            </label>

            <input
              type="text"
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  name: e.target.value,
                })
              }
              className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
                darkMode
                  ? "border-gray-700 bg-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  : "border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
              }`}
            />
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold">
              Email
            </label>

            <input
              type="email"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  email: e.target.value,
                })
              }
              className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
                darkMode
                  ? "border-gray-700 bg-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  : "border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
              }`}
            />
          </div>

          {/* ROLE */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold">
              Role
            </label>

            <select
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  role: e.target.value,
                })
              }
              className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
                darkMode
                  ? "border-gray-700 bg-gray-700 text-white focus:border-blue-500"
                  : "border-gray-200 bg-gray-50 text-gray-900 focus:border-blue-500"
              }`}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>

          {/* STATUS */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold">
              Status
            </label>

            <select
              value={editingUser.status}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  status: e.target.value as "active" | "suspended",
                })
              }
              className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
                darkMode
                  ? "border-gray-700 bg-gray-700 text-white focus:border-blue-500"
                  : "border-gray-200 bg-gray-50 text-gray-900 focus:border-blue-500"
              }`}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* MODAL ACTIONS */}
          <div className="flex justify-end gap-3">
            {/* CANCEL */}
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className={`rounded-lg px-4 py-2 font-medium transition ${
                darkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>

           
            {/* SAVE */}
            <button
              type="button"
              onClick={async () => {
                if (!editingUser) return;

                try {
                  const res = await API.put(
                    `/auth/admin/users/${editingUser._id}`,
                    {
                      name: editingUser.name,
                      email: editingUser.email,
                      role: editingUser.role,
                      status: editingUser.status,
                    }
                  );

                  console.log("UPDATED USER:", res.data);

                  setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                      user._id === editingUser._id
                        ? res.data.data
                        : user
                    )
                  );

                  setEditingUser(null);

                  alert("User updated successfully");
                } catch (error: any) {
                  console.log("UPDATE USER ERROR:", error);

                  alert(
                    error.response?.data?.message ||
                      "Failed to update user."
                  );
                }
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

