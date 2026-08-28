"use client";

import { useCallback, useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import API from "@/lib/api";

interface RentOrder {
  _id: string;

  user: {
    _id: string;
    name: string;
    email?: string;
  };

  service: {
    _id: string;
    name: string;
    description?: string;
    price: number;
    durationMin?: number;
    durationMax?: number;
    durationUnit?: string;
  };


  price: number;
  duration: number;
  durationUnit: string;

  startTime: string;
  endTime: string | null;

  activatedAt?: string | null;
  cancelledAt?: string | null;

  status: "pending" | "active" | "completed" | "cancelled";

  adminReply?: string;

  credentials?: {
    login: string;
    password: string;
    note: string;
  };

  createdAt: string;
  updatedAt: string;
}

export default function RentOrdersPage() {
  const [orders, setOrders] = useState<RentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<RentOrder["status"] | "all">("all");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] =
    useState<RentOrder | null>(null);

  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // =========================================================
  // GET ALL RENT ORDERS
  // =========================================================

  // =========================================================
  // GET ALL RENT ORDERS
  // =========================================================

  const fetchRentOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/rent");

      setOrders(response.data.data || []);
    } catch (err) {
      console.error("FETCH RENT ORDERS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Rent ordersni olishda xatolik"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRentOrders();
  }, [fetchRentOrders]);

  const copyOrderId = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);

      setCopiedOrderId(orderId);

      setTimeout(() => {
        setCopiedOrderId(null);
      }, 1500);
    } catch (err) {
      console.error("COPY ORDER ID ERROR:", err);
    }
  };


  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (
    orderId: string,
    newStatus: RentOrder["status"]
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to change the order status to "${formatStatus(
        newStatus
      )}"?`
    );

   if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(orderId);
      setError("");

      const response = await API.put(
        `/rent/${orderId}/status`,
        {
          status: newStatus,
        }
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                ...response.data.data,
              }
            : order
        )
      );
    } catch (err) {
      console.error("UPDATE RENT STATUS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Statusni yangilashda xatolik"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================================
  // OPEN ORDER MODAL
  // =========================================================

  const openOrderModal = (order: RentOrder) => {
    setSelectedOrder(order);
    setError("");
  };
  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusClasses = (
    status: RentOrder["status"]
  ) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "completed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const formatStatus = (
    status: RentOrder["status"]
  ) => {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const formatDateTime = (date: string | null | undefined) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  const filteredOrders = orders.filter((order) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      (order.service?.name || "").toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================================================
  // UI
  // =========================================================

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950 p-6 text-white">

        <h1 className="text-2xl font-bold">
          Rent Orders
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Manage rent service orders
        </p>

        <div className="mt-6 flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, email or service..."
            className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-gray-500"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as RentOrder["status"] | "all"
              )
            }
            className="w-48 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none focus:border-gray-500"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={fetchRentOrders}
            disabled={loading}
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-3 text-sm text-gray-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>

        {/* ERROR */}

        {error && !selectedOrder && (
          <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900">

          {/* LOADING */}

          {loading && (
            <div className="p-6 text-sm text-gray-400">
              Loading rent orders...
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            orders.length === 0 && (
              <div className="p-6 text-sm text-gray-400">
                No rent orders found.
              </div>
            )}

            {!loading &&
              !error &&
              orders.length > 0 &&
              filteredOrders.length === 0 && (
                <div className="p-6 text-sm text-gray-400">
                  No orders match your search.
                </div>
              )}

          {/* ORDERS */}
          {!loading && filteredOrders.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="border-b border-gray-800 bg-gray-950">

                  <tr>

                    <th className="px-4 py-3">
                      Order ID
                    </th>

                    <th className="px-4 py-3">
                      User
                   </th>

                    <th className="px-4 py-3">
                      Service
                    </th>

                    <th className="px-4 py-3">
                      Price
                    </th>

                    <th className="px-4 py-3">
                      Duration
                    </th>

                    <th className="px-4 py-3">
                      Start
                   </th>

                    <th className="px-4 py-3">
                      End
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.map((order) => (

                    <tr
                      key={order._id}
                      className="border-b border-gray-800"
                    >

                      {/* ORDER ID */}

                      <td className="px-4 py-4">

                        <div className="flex items-center gap-2">

                          <div className="max-w-[140px] truncate font-mono text-xs text-gray-400">
                            {order._id}
                          </div>

                          <button
                            type="button"
                            onClick={() => copyOrderId(order._id)}
                            className="shrink-0 rounded-md border border-gray-700 px-2 py-1 text-xs text-gray-400 transition hover:bg-gray-800 hover:text-white"
                          >
                            {copiedOrderId === order._id ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </td>

                      {/* USER */}

                      <td className="px-4 py-4">

                        <div className="font-medium">
                          {order.user.name}
                        </div>

                        <div className="text-xs text-gray-500">
                          {order.user.email}
                        </div>

                      </td>

                      {/* SERVICE */}

                      <td className="px-4 py-4">
                        {order.service.name}
                      </td>

                      {/* PRICE */}

                      <td className="px-4 py-4">
                         ${order.price.toLocaleString()}
                      </td>

                      {/* DURATION */}

                      <td className="px-4 py-4">
                        {order.duration}{" "}
                        {order.durationUnit}
                      </td>

                      {/* START */}

                      <td className="px-4 py-4 text-gray-300">
                         {formatDateTime(order.startTime)}
                      </td>

                      {/* END */}

                      <td className="px-4 py-4 text-gray-300">
                         {formatDateTime(order.endTime)}
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">

                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                            order.status
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </span>

                        {updatingId ===
                          order._id && (
                          <span className="ml-2 text-xs text-gray-500">
                            Updating...
                          </span>
                        )}

                      </td>

                      {/* ACTION */}

                      <td className="px-4 py-4">

                        <button
                          onClick={() =>
                            openOrderModal(order)
                          }
                          className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-gray-200"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          

        {/* =====================================================
            ORDER MODAL
        ====================================================== */}

        {selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <div
              className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Rent Order
                  </h2>

                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-xs text-gray-500">
                      {selectedOrder._id}
                    </p>

                    <button
                      type="button"
                      onClick={() => copyOrderId(selectedOrder._id)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      {copiedOrderId === selectedOrder._id
                        ? "Copied"
                        : "Copy"}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeOrderModal}
                  className="text-xl text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* ORDER INFO */}

              <div className="mt-6 rounded-lg border border-gray-800 bg-gray-950 p-4">
                <div className="grid grid-cols-2 gap-4">

                  {/* USER */}
                  <div>
                    <p className="text-xs text-gray-500">
                      User
                    </p>

                    <p className="mt-1 font-medium">
                      {selectedOrder.user.name}
                    </p>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 text-sm">
                      {selectedOrder.user.email}
                    </p>
                  </div>

                  {/* SERVICE */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Service
                    </p>

                    <p className="mt-1 font-medium">
                      {selectedOrder.service.name}
                    </p>
                  </div>

                  {/* PRICE */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Price
                    </p>

                    <p className="mt-1 font-medium">
                      ${selectedOrder.price.toLocaleString()}
                    </p>
                  </div>

                  {/* DURATION */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Duration
                    </p>

                    <p className="mt-1">
                      {selectedOrder.duration}{" "}
                      {selectedOrder.durationUnit}
                    </p>
                  </div>

                  {/* STATUS */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Status
                    </p>

                    <p className="mt-1">
                      {formatStatus(selectedOrder.status)}
                    </p>
                  </div>

                  {/* START */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Start
                    </p>

                    <p className="mt-1 text-sm text-gray-300">
                      {formatDateTime(selectedOrder.startTime)}
                    </p>
                  </div>

                  {/* END */}
                  <div>
                    <p className="text-xs text-gray-500">
                      End
                    </p>

                    <p className="mt-1 text-sm text-gray-300">
                      {selectedOrder.endTime
                        ? formatDateTime(selectedOrder.endTime)
                        : "Waiting for admin"}
                    </p>
                  </div>

                </div>
              </div>

              {/* ADMIN REPLY */}

              {selectedOrder.adminReply && (
                <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">

                  <p className="text-xs uppercase tracking-wide text-blue-400">
                    Admin Reply
                  </p>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-200">
                    {selectedOrder.adminReply}
                  </p>

                 </div>
               )}

               {/* MODAL ERROR */}

               {error && (
                 <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">
                   {error}
                 </div>
               )}

              {/* MODAL ERROR */}

              {error && (
                <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}