"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../lib/api";
import { toast } from "sonner";

import {
  Users,
  ShieldCheck,
  UserRound,
  UserPlus,
  Percent,
  Trash2,
  Trash,
  RotateCcw,
  Bell,
  Download,
  FileText,
} from "lucide-react";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useDarkMode } from "@/context/DarkModeContext";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt?: string;
}

export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    normalUsers: 0,
    twoFactorEnabled: 0,
    twoFactorDisabled: 0,
    deletedUsers: 0,
    todayRegistrations: 0,
    activeUsers: 0,
    todayLogins: 0,
  });

  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const { darkMode, toggleDarkMode } = useDarkMode();

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState("");

  const [roleUserId, setRoleUserId] = useState<string | null>(null);
  const [roleUserName, setRoleUserName] = useState("");
  const [newRole, setNewRole] = useState("");

  const [showNotifications, setShowNotifications] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [sortField, setSortField] = useState<
    "name" | "email" | "role"
  >("name");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const usersPerPage = 5;

  const adminPercentage =
    stats.totalUsers === 0
      ? 0
      : Math.round((stats.admins / stats.totalUsers) * 100);

  const chartData = [
    {
      name: "Admins",
      users: stats.admins,
    },
    {
      name: "Users",
      users: stats.normalUsers,
    },
    {
      name: "Deleted",
      users: stats.deletedUsers,
    },
  ];

  const recentUsers = users
    .slice()
    .sort(
      (a: User, b: User) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);

  const [registrationData, setRegistrationData] = useState<
    { _id: number | string; users: number }[]
  >([]);

  const [recentLogins, setRecentLogins] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    console.log("RECENT LOGINS:", recentLogins);
  }, [recentLogins]);

  const monthNames = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formattedRegistrationData = registrationData.map((item) => ({
    month: item._id,
    users: item.users,
  }));

  console.log("FORMATTED REGISTRATION:", formattedRegistrationData);

  const getDashboardStats = async () => {
    try {
      console.log("Dashboard request ketdi");

      const res = await API.get("/admin/dashboard");

      if (!res.data.data) {
        throw new Error("Dashboard data topilmadi");
      }

      console.log("DASHBOARD:", res.data.data);

      setStats({
        totalUsers: res.data.data.totalUsers,
        admins: res.data.data.admins,
        normalUsers: res.data.data.normalUsers,
        twoFactorEnabled: res.data.data.twoFactorEnabled,
        twoFactorDisabled: res.data.data.twoFactorDisabled,
        deletedUsers: res.data.data.deletedUsers,
        todayRegistrations: res.data.data.todayRegistrations,
        activeUsers: res.data.data.activeUsers,
        todayLogins: res.data.data.todayLogins,
      });

      const registrationRes = await API.get(
        "/admin/user-registrations"
      );

      console.log(
        "REGISTRATION DATA:",
        registrationRes.data.data
      );

      setRegistrationData(
        Array.isArray(registrationRes.data.data)
          ? registrationRes.data.data
          : []
      );

      const recentLoginsRes = await API.get(
        "/admin/recent-logins"
      );

      setRecentLogins(
        Array.isArray(recentLoginsRes.data.data)
          ? recentLoginsRes.data.data
          : []
      );

      console.log("SET STATS:", res.data.data);
    } catch (error: any) {
      console.log("Dashboard Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Dashboard statistics yuklanmadi"
      );
    }
  };

  const getRecentActivities = async () => {
    try {
      const res = await API.get("/admin/activities");

      setRecentActivities(
        Array.isArray(res.data.data)
          ? res.data.data.slice(0, 5)
          : []
      );
    } catch (err) {
      console.log(err);
    }
  };

  const getNotifications = async () => {
    try {
      const res = await API.get("/notifications");

      setNotifications(
        Array.isArray(res.data.data)
          ? res.data.data
          : []
      );
    } catch (err) {
      console.log(err);
    }
  };

  const getUsers = async () => {
    try {
      console.log(
        "TOKEN:",
        localStorage.getItem("accessToken")
      );

      const usersRes = await API.get(
        "/auth/admin/users"
      );

      console.log("USERS:", usersRes.data);

      console.table(
        (usersRes.data.users || []).map((u: any) => ({
          name: u.name,
          role: u.role,
        }))
      );

      setUsers(
        Array.isArray(usersRes.data.users)
          ? usersRes.data.users
          : []
      );
    } catch (error: any) {
      console.log("GET USERS");
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Users yuklanmadi"
      );
    }
  };

  const getOrders = async () => {
    try {
      console.log("GET ORDERS ISHLADI");

      const res = await API.get("/admin/orders");

      console.log("ORDERS RESPONSE:", res.data);

      setOrders(
        Array.isArray(res.data.data)
          ? res.data.data
          : []
      );
    } catch (error: any) {
      console.log("ORDERS ERROR:", error);
    }
  };

  const updateOrderStatus = async (
    id: string,
    status: string
  ) => {
    try {
      await API.put(
        `/admin/orders/${id}/status`,
        {
          status,
        }
      );

      toast.success("Order status updated");

      await getOrders();
    } catch (error: any) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Status update failed"
      );
    }
  };

  const getActivities = async () => {
    try {
      const res = await API.get(
        "/auth/admin/activities"
      );

      console.log(
        "ACTIVITIES:",
        res.data.activities
      );

      setActivities(
        Array.isArray(res.data.activities)
          ? res.data.activities
          : []
      );
    } catch (error: any) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Activities yuklanmadi"
      );
    }
  };

  const getDeletedUsers = async () => {
    try {
      const res = await API.get(
        "/auth/admin/deleted-users"
      );

      setDeletedUsers(
        Array.isArray(res.data.users)
          ? res.data.users
          : []
      );
    } catch (error: any) {
      console.log(error);
    }
  };

  const restoreUser = async (id: string) => {
    if (!id) {
      toast.error("User id topilmadi");
      return;
    }

    try {
      await API.put(
        `/auth/admin/restore-user/${id}`
      );

      toast.success(
        "User restored successfully"
      );

      await getDashboardStats();
      await getUsers();
      await getDeletedUsers();
    } catch (error: any) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Restore failed"
      );
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        console.log(
          "1-profile boshlanmoqda"
        );

        const res = await API.get(
          "/users/profile"
        );

        console.log(
          "2-profile tugadi",
          res.data
        );

        if (
          !res.data.data ||
          res.data.data.role !== "admin"
        ) {
          toast.error(
            "Siz admin emassiz!"
          );

          router.push("/profile");
          return;
        }

        setAuthorized(true);

        await getDashboardStats();
        await getUsers();
        await getDeletedUsers();
        await getActivities();
        await getRecentActivities();
        await getNotifications();
        await getOrders();
      } catch (error) {
        console.log(error);

        toast.error(
          "Login qiling!"
        );

        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  const pieData = [
    {
      name: "Admins",
      value: stats?.admins || 0,
    },
    {
      name: "Users",
      value: stats?.normalUsers || 0,
    },
  ];

  const COLORS = [
    "#3B82F6",
    "#10B981",
  ];

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {}

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    router.push("/login");
  };

  const handleChangeRole = (
    id: string,
    name: string,
    role: string
  ) => {
    setRoleUserId(id);
    setRoleUserName(name);

    setNewRole(
      role === "admin"
        ? "user"
        : "admin"
    );
  };

  const confirmRoleChange = async () => {
    console.log("CONFIRM ROLE CHANGE CLICK");

    if (!roleUserId) {
      toast.error("User ID topilmadi");
      return;
    }

    if (!newRole) {
      toast.error("Role tanlanmagan");
      return;
    }

    try {
      console.log("ROLE UPDATE:", {
        userId: roleUserId,
        newRole,
      });

      const response = await API.put(
        `/auth/admin/users/${roleUserId}/role`,
        {
          role: newRole,
        }
      );

      console.log(
        "CHANGE ROLE RESPONSE:",
        response.data
      );

      toast.success(
        `User role changed to ${newRole}`
      );

  
    await getUsers();
    await getDashboardStats();
    await getNotifications();
    
    setRoleUserId(null);
    setRoleUserName("");
    setNewRole("");
  } catch (error: any) {
    console.log(
      "CHANGE ROLE ERROR:",
      error
    );

    console.log(
      "ERROR RESPONSE:",
      error.response?.data
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to update role."
    );
  }
};

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    sortField,
    sortOrder,
  ]);

  const filteredUsers = users.filter(
    (user) =>
      (user.name || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      (user.email || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  const sortedUsers = [
    ...filteredUsers,
  ].sort((a, b) => {
    const aValue = String(
      a[
        sortField as keyof User
      ] || ""
    ).toLowerCase();

    const bValue = String(
      b[
        sortField as keyof User
      ] || ""
    ).toLowerCase();

    if (sortOrder === "asc") {
      return aValue.localeCompare(
        bValue
      );
    }

    return bValue.localeCompare(
      aValue
    );
  });

  const indexOfLastUser =
    currentPage * usersPerPage;

  const indexOfFirstUser =
    indexOfLastUser -
    usersPerPage;

  const currentUsers =
    sortedUsers.slice(
      indexOfFirstUser,
      indexOfLastUser
    );

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedUsers.length /
        usersPerPage
    )
  );

  const getPaginationItems = () => {
    const pages: (
      | number
      | string
    )[] = [];

    if (totalPages <= 7) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(
          1,
          2,
          3,
          4,
          5,
          "...",
          totalPages
        );
      } else if (
        currentPage >=
        totalPages - 3
      ) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  const handleDelete = (
    id: string,
    name: string
  ) => {
    setDeleteUserId(id);
    setDeleteUserName(name);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;

    console.log(
      "DELETE USER ID:",
      deleteUserId
    );

    console.log(
      "ALL USERS:",
      users
    );

    try {
      await API.delete(
        `/auth/admin/users/${deleteUserId}`
      );

      toast.success(
        "User deleted successfully"
      );

      await getDashboardStats();
      await getUsers();
      await getDeletedUsers();
      await getNotifications();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete user."
      );
    }

    setDeleteUserId(null);
    setDeleteUserName("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  console.table(
    currentUsers.map((u) => ({
      name: u.name,
      role: u.role,
    }))
  );

  return (
    <div
      className={`min-h-screen p-8 transition-colors duration-300 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div
        className={`rounded-xl shadow p-6 mb-8 transition-colors duration-300 ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1
              className={`text-3xl font-bold ${
                darkMode
                  ? "text-white"
                  : "text-gray-800"
              }`}
            >
              Admin Dashboard
            </h1>

            <p
              className={`mt-1 ${
                darkMode
                  ? "text-gray-300"
                  : "text-gray-500"
              }`}
            >
              Manage users and system
              settings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const token =
                  localStorage.getItem(
                    "accessToken"
                  );

                const response =
                  await fetch(
                    "http://localhost:3000/api/v1/notifications/export/excel",
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                const blob =
                  await response.blob();

                const url =
                  window.URL.createObjectURL(
                    blob
                  );

                const a =
                  document.createElement(
                    "a"
                  );

                a.href = url;
                a.download =
                  "notifications.xlsx";

                a.click();

                window.URL.revokeObjectURL(
                  url
                );
              }}
              className={`p-3 rounded-full transition ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              title="Export Excel"
            >
              <Download size={22} />
            </button>

            <button
              onClick={async () => {
                const token =
                  localStorage.getItem(
                    "accessToken"
                  );

                const response =
                  await fetch(
                    "http://localhost:3000/api/v1/notifications/export/pdf",
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                const blob =
                  await response.blob();

                const url =
                  window.URL.createObjectURL(
                    blob
                  );

                const a =
                  document.createElement(
                    "a"
                  );

                a.href = url;
                a.download =
                  "notifications.pdf";

                a.click();

                window.URL.revokeObjectURL(
                  url
                );
              }}
              className={`p-3 rounded-full transition ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              title="Export PDF"
            >
              <FileText size={22} />
            </button>

            <div className="relative">
              <button
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
                className={`relative p-3 rounded-full transition ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Bell size={22} />

                {notifications.length >
                  0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {
                      notifications.length
                    }
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className={`absolute top-full mt-3 right-0 w-80 rounded-xl shadow-xl p-4 z-50 ${
                    darkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <h3 className="font-bold text-lg mb-3">
                    Notifications
                  </h3>

                  {notifications.length ===
                  0 ? (
                    <p className="text-sm text-gray-400">
                      No notifications
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map(
                        (
                          notification: any
                        ) => (
                          <div
                            key={
                              notification._id
                            }
                            className={`flex gap-3 border-b pb-3 ${
                              darkMode
                                ? "border-gray-700"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="mt-1">
                              {notification.type ===
                                "delete" && (
                                <Trash2
                                  className="text-red-500"
                                  size={18}
                                />
                              )}

                              {notification.type ===
                                "restore" && (
                                <RotateCcw
                                  className="text-green-500"
                                  size={18}
                                />
                              )}

                              {notification.type ===
                                "create" && (
                                <UserPlus
                                  className="text-blue-500"
                                  size={18}
                                />
                              )}

                              {notification.type ===
                                "admin" && (
                                <ShieldCheck
                                  className="text-yellow-500"
                                  size={18}
                                />
                              )}
                            </div>

                            <div>
                              <p className="font-semibold">
                                {
                                  notification.title
                                }
                              </p>

                              <p className="text-sm">
                                {
                                  notification.message
                                }
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={toggleDarkMode}
              className={`px-4 py-2 rounded-lg transition ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-yellow-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              {darkMode
                ? "☀️"
                : "🌙"}
            </button>

            <button
              onClick={() =>
                router.push(
                  "/admin/profile"
                )
              }
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg transition"
            >
              Profile
            </button>

            <button
              onClick={() =>
                router.push(
                  "/admin/settings"
                )
              }
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition"
            >
              Settings
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-5 mb-8">
        <div
          className={`rounded-xl shadow p-5 hover:shadow-lg transition ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
            <Users size={28} />
          </div>

          <h2
            className={`mt-4 text-sm font-medium ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Total Users
          </h2>

          <p
            className={`mt-1 text-3xl font-bold ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {stats.totalUsers}
          </p>
        </div>

        <div
          className={`rounded-xl shadow p-5 hover:shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>

          <h2
            className={`mt-4 text-sm font-medium ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Admins
          </h2>

          <p
            className={`mt-1 text-3xl font-bold ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {stats.admins}
          </p>
        </div>

        <div
          className={`rounded-xl shadow p-5 hover:shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-xl flex items-center justify-center">
            <UserRound size={28} />
          </div>

          <h2
            className={`mt-4 text-sm font-medium ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Regular Users
          </h2>

          <p
            className={`mt-1 text-3xl font-bold ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {stats.normalUsers}
          </p>
        </div>

        <div
          className={`rounded-xl shadow p-5 hover:shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-xl flex items-center justify-center">
            <Percent size={28} />
          </div>

          <h2
            className={`mt-4 text-sm font-medium ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Admin %
          </h2>

          <p
            className={`mt-1 text-3xl font-bold ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {adminPercentage}%
          </p>
        </div>

        <div
          className={`rounded-xl shadow p-5 hover:shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-xl flex items-center justify-center">
            <Trash2 size={28} />
          </div>

          <h2
            className={`mt-4 text-sm font-medium ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Deleted Users
          </h2>

          <p
            className={`mt-1 text-3xl font-bold ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {stats.deletedUsers}
          </p>
        </div>

        <div
          className={`rounded-xl shadow p-5 hover:shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center">
            <Users size={28} />
          </div>

          <h2
            className={`mt-4 text-sm font-medium ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Active Users
          </h2>

          <p
            className={`mt-1 text-3xl font-bold ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {stats.activeUsers}
          </p>
        </div>

        <div
          className={`rounded-xl shadow p-5 hover:shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <div className="bg-cyan-100 text-cyan-600 w-12 h-12 rounded-xl flex items-center justify-center">
            <Users size={28} />
          </div>

          <h2
            className={`mt-4 text-sm font-medium ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Today's Registrations
          </h2>

          <p
            className={`mt-1 text-3xl font-bold ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {stats.todayRegistrations}
          </p>
        </div>

        <div
          className={`rounded-xl shadow p-5 hover:shadow-lg transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center">
            <Users size={28} />
          </div>

          <h2
            className={`mt-4 text-sm font-medium ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Today Logins
          </h2>

          <p
            className={`mt-1 text-3xl font-bold ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {stats.todayLogins}
          </p>
        </div>
      </div>

      <div
        className={`rounded-xl shadow p-6 mb-8 transition-all duration-300 ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-6 ${
            darkMode
              ? "text-white"
              : "text-gray-800"
          }`}
        >
          Users Statistics
        </h2>

        <div className="w-full h-80 relative">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={formattedRegistrationData}
            >
              <CartesianGrid
                stroke={
                  darkMode
                    ? "#374151"
                    : "#e5e7eb"
                }
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="month"
                stroke={
                  darkMode
                    ? "#d1d5db"
                    : "#374151"
                }
              />

              <YAxis
                stroke={
                  darkMode
                    ? "#d1d5db"
                    : "#374151"
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    darkMode
                      ? "#1f2937"
                      : "#ffffff",
                  color: darkMode
                    ? "#ffffff"
                    : "#000000",
                  border: "none",
                }}
              />

              <Bar
                dataKey="users"
                fill="#3B82F6"
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className={`rounded-xl shadow p-6 mb-8 transition-all duration-300 ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-6 ${
            darkMode
              ? "text-white"
              : "text-gray-800"
          }`}
        >
          User Registrations (Last 7 Days)
        </h2>

        <div className="w-full h-80">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={formattedRegistrationData}>
              <CartesianGrid
                stroke={darkMode ? "#374151" : "#e5e7eb"}
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="month"
                stroke={darkMode ? "#d1d5db" : "#374151"}
              />

              <YAxis
                stroke={darkMode ? "#d1d5db" : "#374151"}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode
                    ? "#1f2937"
                    : "#ffffff",
                  color: darkMode
                    ? "#ffffff"
                    : "#000000",
                  border: "none",
                }}
              />

              <Bar
                dataKey="users"
                fill="#3B82F6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className={`rounded-xl shadow p-6 mb-8 transition-all duration-300 ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-6 ${
            darkMode
              ? "text-white"
              : "text-gray-800"
          }`}
        >
          Admin / User Ratio
        </h2>

        <div className="w-full h-80 relative">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                label={(props) => {
                  const percent = props.percent ?? 0;

                 return `${(percent * 100).toFixed(0)}%`;
                }}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [
                  `${value ?? 0} users`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor:
                    darkMode
                      ? "#1f2937"
                      : "#ffffff",
                  border: "none",
                  borderRadius:
                    "10px",
                  color: darkMode
                    ? "#ffffff"
                    : "#000000",
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className={`text-3xl font-bold ${
                darkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              {stats?.totalUsers ||
                0}
            </span>

            <span
              className={`text-sm ${
                darkMode
                  ? "text-gray-300"
                  : "text-gray-500"
              }`}
            >
              Total Users
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div
          className={`rounded-xl shadow p-6 mb-8 transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            Recent Logins
          </h2>

          {recentLogins.length ===
          0 ? (
            <p
              className={`${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              No recent logins
            </p>
          ) : (
            <div className="space-y-4">
              {recentLogins.map(
                (login: any) => (
                  <div
                    key={login._id}
                    className={`border rounded-lg p-4 flex justify-between items-center transition ${
                      darkMode
                        ? "border-gray-700 bg-gray-900"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div>
                      <p
                        className={`font-semibold ${
                          darkMode
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {
                          login.user
                            ?.name
                        }
                      </p>

                      <p
                        className={`text-sm ${
                          darkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {
                          login.user
                            ?.email
                        }
                      </p>

                      <p
                        className={`text-xs ${
                          darkMode
                            ? "text-gray-500"
                            : "text-gray-400"
                        }`}
                      >
                        {
                          login.user
                            ?.role
                        }
                      </p>
                    </div>

                    <div
                      className={`text-right text-sm ${
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(
                        login.createdAt
                      ).toLocaleString()}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div
          className={`rounded-xl shadow p-6 mb-8 transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${
              darkMode
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            Recent Activity Logs
          </h2>

          {recentActivities.length ===
          0 ? (
            <p
              className={`${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              No recent activities
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map(
                (activity: any) => (
                  <div
                    key={
                      activity._id
                    }
                    className={`border rounded-lg p-4 flex justify-between items-center transition ${
                      darkMode
                        ? "border-gray-700 bg-gray-900"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                          activity.action ===
                          "delete"
                            ? "bg-red-100 text-red-700"
                            : activity.action ===
                              "update"
                            ? "bg-yellow-100 text-yellow-700"
                            : activity.action ===
                              "create"
                            ? "bg-blue-100 text-blue-700"
                            : activity.action ===
                              "login"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {activity.action.toUpperCase()}
                      </span>

                      <p className="font-semibold">
                        {
                          activity
                            .admin
                            ?.name
                        }
                      </p>

                      <p className="text-sm mt-1">
                        {
                          activity.description
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-xs ${
                          darkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(
                          activity.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={`rounded-xl shadow p-6 mb-8 transition-all duration-300 ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-6 ${
            darkMode
              ? "text-white"
              : "text-gray-800"
          }`}
        >
          Recent Activities
        </h2>

        <div className="space-y-4">
          {activities.length ===
          0 ? (
            <p
              className={`${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              No activities yet.
            </p>
          ) : (
            activities.map(
              (activity) => (
                <div
                  key={
                    activity._id
                  }
                  className={`flex items-center justify-between border-b pb-4 ${
                    darkMode
                      ? "border-gray-700"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        activity.action ===
                        "delete"
                          ? "bg-red-100"
                          : "bg-green-100"
                      }`}
                    >
                      {activity.action ===
                      "delete" ? (
                        <Trash
                          className="text-red-600"
                          size={22}
                        />
                      ) : (
                        <RotateCcw
                          className="text-green-600"
                          size={22}
                        />
                      )}
                    </div>

                    <div>
                      <p
                        className={`font-semibold ${
                          darkMode
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {
                          activity.description
                        }
                      </p>

                      <p
                        className={`text-sm ${
                          darkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        Admin:{" "}
                        {
                          activity
                            .admin
                            ?.name
                        }
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs ${
                      darkMode
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date(
                      activity.createdAt
                    ).toLocaleString()}
                  </span>
                </div>
              )
            )
          )}
        </div>
      </div>

      <div
        className={`rounded-xl shadow p-6 mb-8 transition-all duration-300 ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-6 ${
            darkMode
              ? "text-white"
              : "text-gray-800"
          }`}
        >
          User Registrations
        </h2>

        <div className="w-full h-80">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={chartData}>
              <CartesianGrid
                stroke={
                  darkMode
                    ? "#374151"
                    : "#e5e7eb"
                }
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
                stroke={
                  darkMode
                    ? "#d1d5db"
                    : "#374151"
                }
              />

              <YAxis
                stroke={
                  darkMode
                    ? "#d1d5db"
                    : "#374151"
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    darkMode
                      ? "#1f2937"
                      : "#ffffff",
                  color: darkMode
                    ? "#ffffff"
                    : "#000000",
                  border: "none",
                }}
              />

              <Bar
                dataKey="users"
                fill="#3B82F6"
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className={`rounded-xl shadow p-6 mb-8 transition-all duration-300 ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-6 ${
            darkMode
              ? "text-white"
              : "text-gray-800"
          }`}
        >
          Recent Users
        </h2>

        <div className="space-y-4">
          {recentUsers.map(
            (user) => (
              <div
                key={user._id}
                className={`flex items-center justify-between border-b pb-3 ${
                  darkMode
                    ? "border-gray-700"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src="/default-avatar.png"
                    alt={user.name}
                    className={`w-12 h-12 rounded-full object-cover border ${
                      darkMode
                        ? "border-gray-600"
                        : "border-gray-300"
                    }`}
                  />

                  <div>
                    <p
                      className={`font-semibold ${
                        darkMode
                          ? "text-white"
                          : "text-gray-800"
                      }`}
                    >
                      {user.name}
                    </p>

                    <p
                      className={`text-sm ${
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role ===
                    "admin"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="Search user..."
        value={search}
        onChange={(e) => {
          setSearch(
            e.target.value
          );

          setCurrentPage(1);
        }}
        className={`w-80 mb-6 px-4 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
        }`}
      />

      <div className="overflow-x-auto">
        <table
          className={`w-full rounded-lg overflow-hidden border transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          <thead
            className={`${
              darkMode
                ? "bg-gray-900 text-gray-200"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <tr>
              <th className="p-3 border-b border-gray-300">
                Avatar
              </th>

              <th
                className="text-left p-3 border-b border-gray-300 cursor-pointer"
                onClick={() => {
                  if (
                    sortField ===
                    "name"
                  ) {
                    setSortOrder(
                      sortOrder ===
                        "asc"
                        ? "desc"
                        : "asc"
                    );
                  } else {
                    setSortField(
                      "name"
                    );

                    setSortOrder(
                      "asc"
                    );
                  }

                  setCurrentPage(1);
                }}
              >
                Name{" "}
                {sortField ===
                  "name" &&
                  (sortOrder ===
                  "asc"
                    ? "▲"
                    : "▼")}
              </th>

              <th
                className="text-left p-3 border-b border-gray-300 cursor-pointer"
                onClick={() => {
                  if (
                    sortField ===
                    "email"
                  ) {
                    setSortOrder(
                      sortOrder ===
                        "asc"
                        ? "desc"
                        : "asc"
                    );
                  } else {
                    setSortField(
                      "email"
                    );

                    setSortOrder(
                      "asc"
                    );
                  }

                  setCurrentPage(1);
                }}
              >
                Email{" "}
                {sortField ===
                  "email" &&
                  (sortOrder ===
                  "asc"
                    ? "▲"
                    : "▼")}
              </th>

              <th
                className="text-left p-3 border-b border-gray-300 cursor-pointer"
                onClick={() => {
                  if (
                    sortField ===
                    "role"
                  ) {
                    setSortOrder(
                      sortOrder ===
                        "asc"
                        ? "desc"
                        : "asc"
                    );
                  } else {
                    setSortField(
                      "role"
                    );

                    setSortOrder(
                      "asc"
                    );
                  }

                  setCurrentPage(1);
                }}
              >
                Role{" "}
                {sortField ===
                  "role" &&
                  (sortOrder ===
                  "asc"
                    ? "▲"
                    : "▼")}
              </th>

              <th className="p-3 border-b border-gray-300">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {currentUsers.length ===
            0 ? (
              <tr>
                <td
                  colSpan={5}
                  className={`text-center p-5 ${
                    darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  User topilmadi 😕
                </td>
              </tr>
            ) : (
              currentUsers.map(
                (user) => (
                  <tr
                    key={user._id}
                    className={`transition ${
                      darkMode
                        ? "border-b border-gray-700 hover:bg-gray-700"
                        : "border-b border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-3">
                      <img
                        src="/default-avatar.png"
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>

                    <td className="p-3">
                      {user.name}
                    </td>

                    <td
                      className={`p-3 ${
                        darkMode
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {user.email}
                    </td>

                    <td className="p-3">
                      {user.role}
                    </td>

                    <td className="p-3 space-x-2">
                      <button
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition"
                        onClick={() =>
                          setSelectedUser(
                            user
                          )
                        }
                      >
                        View
                      </button>

                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
                        onClick={() =>
                          setEditingUser({
                            ...user,
                          })
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
                        onClick={() => {
                          console.log("MAKE USER BUTTON CLICKED");
    
                          handleChangeRole(
                            user._id,
                            user.name,
                            user.role
                          );
                        }}
                      >
                        {user.role === "admin"
                          ? "Make User"
                          : "Make Admin"}
                      </button>

                      {user.role !==
                        "admin" && (
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                          onClick={() =>
                            handleDelete(
                              user._id,
                              user.name
                            )
                          }
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <br />
      <br />

      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() =>
            setCurrentPage(
              currentPage - 1
            )
          }
          disabled={
            currentPage === 1
          }
          className={`px-4 py-2 rounded-lg transition ${
            darkMode
              ? "bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
          } disabled:cursor-not-allowed`}
        >
          ← Previous
        </button>

        {getPaginationItems().map(
          (number, index) =>
            number === "..." ? (
              <span
                key={index}
                className={`px-4 py-2 ${
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() =>
                  setCurrentPage(
                    number as number
                  )
                }
                className={`px-4 py-2 rounded-lg transition ${
                  currentPage ===
                  number
                    ? "bg-blue-600 text-white"
                    : darkMode
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {number}
              </button>
            )
        )}

        <button
          onClick={() =>
            setCurrentPage(
              currentPage + 1
            )
          }
          disabled={
            currentPage >=
              totalPages ||
            totalPages === 0
          }
          className={`px-4 py-2 rounded-lg transition ${
            darkMode
              ? "bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
          } disabled:cursor-not-allowed`}
        >
          Next →
        </button>
      </div>

      <h2
        className={`text-2xl font-bold mt-10 mb-4 ${
          darkMode
            ? "text-white"
            : "text-gray-900"
        }`}
      >
        Deleted Users
      </h2>

      <div
        className={`overflow-x-auto rounded-xl shadow ${
          darkMode
            ? "bg-gray-800"
            : "bg-white"
        }`}
      >
        <table
          className={`w-full border-collapse ${
            darkMode
              ? "text-white"
              : "text-gray-900"
          }`}
        >
          <thead>
            <tr
              className={`${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <th className="p-3 border-b">
                Avatar
              </th>

              <th
                className="text-left p-3 border-b cursor-pointer"
                onClick={() => {
                  if (
                    sortField ===
                    "name"
                  ) {
                    setSortOrder(
                      sortOrder ===
                        "asc"
                        ? "desc"
                        : "asc"
                    );
                  } else {
                    setSortField(
                      "name"
                    );

                    setSortOrder(
                      "asc"
                    );
                  }

                  setCurrentPage(1);
                }}
              >
                Name{" "}
                {sortField ===
                  "name" &&
                  (sortOrder ===
                  "asc"
                    ? "▲"
                    : "▼")}
              </th>

              <th
                className="text-left p-3 border-b cursor-pointer"
                onClick={() => {
                  if (
                    sortField ===
                    "email"
                  ) {
                    setSortOrder(
                      sortOrder ===
                        "asc"
                        ? "desc"
                        : "asc"
                    );
                  } else {
                    setSortField(
                      "email"
                    );

                    setSortOrder(
                      "asc"
                    );
                  }

                  setCurrentPage(1);
                }}
              >
                Email{" "}
                {sortField ===
                  "email" &&
                  (sortOrder ===
                  "asc"
                    ? "▲"
                    : "▼")}
              </th>

              <th
                className="text-left p-3 border-b cursor-pointer"
                onClick={() => {
                  if (
                    sortField ===
                    "role"
                  ) {
                    setSortOrder(
                      sortOrder ===
                        "asc"
                        ? "desc"
                        : "asc"
                    );
                  } else {
                    setSortField(
                      "role"
                    );

                    setSortOrder(
                      "asc"
                    );
                  }

                  setCurrentPage(1);
                }}
              >
                Role{" "}
                {sortField ===
                  "role" &&
                  (sortOrder ===
                  "asc"
                    ? "▲"
                    : "▼")}
              </th>

              <th className="p-3 border-b">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {deletedUsers.map(
              (user) => (
                <tr
                  key={user._id}
                  className={`border-b ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <td className="p-3">
                    <img
                      src="/default-avatar.png"
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>

                  <td className="p-3">
                    {user.name}
                  </td>

                  <td
                    className={`p-3 ${
                      darkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {user.email}
                  </td>

                  <td className="p-3">
                    {user.role}
                  </td>

                  <td className="p-3">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
                      onClick={() =>
                        restoreUser(
                          user._id
                        )
                      }
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div
        className={`rounded-xl shadow p-6 mb-8 mt-8 ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-2xl font-bold mb-6">
          Orders
        </h2>

        {orders.length === 0 ? (
          <p
            className={`${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            No orders found
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map(
              (order) => (
                <div
                  key={order._id}
                  className={`border rounded-lg p-4 ${
                    darkMode
                      ? "border-gray-700 bg-gray-900"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <p>
                    <b>User:</b>{" "}
                    {
                      order.user
                        ?.name
                    }
                  </p>

                  <p>
                    <b>Email:</b>{" "}
                    {
                      order.user
                        ?.email
                    }
                  </p>

                  <p>
                    <b>Service:</b>{" "}
                    {
                      order.service
                        ?.name
                    }
                  </p>

                  <p>
                    <b>Category:</b>{" "}
                    {
                      order.service
                        ?.category
                    }
                  </p>

                  <p>
                    <b>Status:</b>{" "}
                    {order.status}
                  </p>

                  <p>
                    <b>Price:</b> $
                    {order.price}
                  </p>

                  <p className="text-sm mt-2 text-gray-500">
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </p>

                  <div className="flex gap-3 mt-4">
                    {order.status ===
                      "pending" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order._id,
                            "processing"
                          )
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Accept
                      </button>
                    )}

                    {order.status ===
                      "processing" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order._id,
                            "completed"
                          )
                        }
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Complete
                      </button>
                    )}

                    {(
                      order.status ===
                        "pending" ||
                      order.status ===
                        "processing"
                    ) && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order._id,
                            "cancelled"
                          )
                        }
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {deleteUserId && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
        <div
          className={`w-full max-w-md rounded-xl p-6 shadow-xl ${
            darkMode
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-900"
          }`}
        >
          <h2 className="text-xl font-bold mb-3">
            Delete User
          </h2>

          <p
            className={`mb-6 ${
              darkMode
                ? "text-gray-300"
                : "text-gray-600"
            }`}
          >
            Are you sure you want to delete{" "}
            <span className="font-bold">
              {deleteUserName}
            </span>
            ?
          </p>

          <div className="flex justify-end gap-3">
            <button
             onClick={() => {
                setDeleteUserId(null);
                setDeleteUserName("");
             }}
              className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
           >
              Cancel
            </button>

            <button
             onClick={confirmDelete}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
            >
             Delete
            </button>
         </div>
       </div>
     </div>
    )}

    {roleUserId && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div
        className={`w-full max-w-md rounded-xl p-6 shadow-xl ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-bold mb-3">
          Change User Role
        </h2>

        <p
          className={`mb-6 ${
            darkMode
              ? "text-gray-300"
              : "text-gray-600"
          }`}
        >
          Are you sure you want to change the role of{" "}
          <span className="font-bold">
            {roleUserName}
          </span>{" "}
          to{" "}
          <span className="font-bold">
            {newRole}
          </span>
          ?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setRoleUserId(null);
              setRoleUserName("");
              setNewRole("");
            }}
            className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cancel
          </button>

          <button
            onClick={confirmRoleChange}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )}

  {selectedUser && (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={() => setSelectedUser(null)}
    >
      <div
        className={`w-full max-w-md rounded-xl p-6 shadow-xl ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            User Details
          </h2>

          <button
            type="button"
            onClick={() => setSelectedUser(null)}
            className={`rounded-lg px-3 py-1 text-sm ${
              darkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">
              Name
            </p>
            <p className="font-semibold">
              {selectedUser.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>
            <p className="font-semibold">
              {selectedUser.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Role
            </p>
            <p className="font-semibold">
              {selectedUser.role}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Created At
            </p>
            <p className="font-semibold">
              {selectedUser.createdAt
                ? new Date(
                    selectedUser.createdAt
                  ).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => setSelectedUser(null)}
            className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}

    {editingUser && (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            Edit User
          </h2>

         <button
            type="button"
            onClick={() => setEditingUser(null)}
            className={`rounded-lg px-3 py-1 text-sm ${
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
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              darkMode
                ? "border-gray-700 bg-gray-700 text-white"
                : "border-gray-200 bg-gray-50 text-gray-900"
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
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              darkMode
                ? "border-gray-700 bg-gray-700 text-white"
                : "border-gray-200 bg-gray-50 text-gray-900"
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
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              darkMode
                ? "border-gray-700 bg-gray-700 text-white"
                : "border-gray-200 bg-gray-50 text-gray-900"
            }`}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditingUser(null)}
            className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cancel
          </button>

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
                  }
                );

                console.log(
                  "UPDATED USER:",
                  res.data
                );
  
                setUsers((prevUsers) =>
                  prevUsers.map((user) =>
                    user._id === editingUser._id
                      ? res.data.data
                      : user
                  )
               );

                setEditingUser(null);

                alert(
                  "User updated successfully"
                );
              } catch (error: any) {
                console.log(
                  "UPDATE USER ERROR:",
                  error
                );

                alert(
                  error?.response?.data?.message ||
                   "Failed to update user"
                );
              }
            }}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
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