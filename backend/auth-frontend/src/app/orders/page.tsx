"use client";

import { useEffect, useState } from "react";
import API from "../../lib/api";
import AuthGuard from "@/components/AuthGuard";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET ALL ORDERS
  // =====================================================

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/admin/orders");

      console.log("========== FULL ADMIN RESPONSE ==========");
      console.log(JSON.stringify(res.data, null, 2));

      console.log("========== ADMIN ORDERS RESPONSE ==========");
      console.log(res.data);

      const allOrders = Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      console.log("ALL ORDERS:", allOrders);
      console.log("TOTAL ORDERS:", allOrders.length);

      console.log(
        "========== FIRST ORDER FULL =========="
      );

      console.log(
        JSON.stringify(allOrders[0], null, 2)
      );

      console.log(
        "========== ALL SERVICES =========="
      );

      console.log(
        allOrders.map((order: any) => ({
          id: order._id,
          service: order.service,
          serviceName: order.service?.name,
          category: order.service?.category,
          price: order.price,
          status: order.status,
        }))
      );

      setOrders(allOrders);
          } catch (error: any) {
            console.error("GET ADMIN ORDERS ERROR:", error);

            console.error(
              "ERROR RESPONSE:",
               error?.response?.data
            );

            setError(
              error?.response?.data?.message ||
                "Failed to load orders"
            );
          } finally {
            setLoading(false);
          }
        };

  // =====================================================
  // SERVICE NAME
  // =====================================================

  const getServiceName = (order: any) => {
    if (
      order?.service &&
      typeof order.service === "object"
    ) {
      return order.service.name || "Unknown Service";
    }

    return "Unknown Service";
  };

  // =====================================================
  // CATEGORY
  // =====================================================

  const getCategory = (order: any) => {
    if (
      order?.service &&
      typeof order.service === "object"
    ) {
      return (
        order.service.category ||
        "UNKNOWN CATEGORY"
      );
    }

    return "UNKNOWN CATEGORY";
  };

  // =====================================================
  // PRICE
  // =====================================================

  const getPrice = (order: any) => {
    if (order?.price !== undefined && order?.price !== null) {
      return order.price;
    }

    if (
      order?.service &&
      typeof order.service === "object" &&
      order.service.price !== undefined &&
      order.service.price !== null
    ) {
      return order.service.price;
    }

    return 0;
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-400/20 bg-green-400/10 text-green-400";

      case "processing":
        return "border-blue-400/20 bg-blue-400/10 text-blue-400";

      case "cancelled":
        return "border-red-400/20 bg-red-400/10 text-red-400";

      case "pending":
      default:
        return "border-yellow-400/20 bg-yellow-400/10 text-yellow-400";
    }
  };

  // =====================================================
  // FORMAT FIELD NAME
  // =====================================================

  const formatFieldName = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/^./, (str) =>
        str.toUpperCase()
      );
  };

  // =====================================================
  // FORMAT VALUE
  // =====================================================

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return "-";
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950 p-6 text-white">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Admin Orders
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              All customer orders
            </p>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-2">
            <span className="text-sm text-gray-400">
              Total:
            </span>

            <span className="ml-2 font-bold text-white">
              {orders.length}
            </span>
          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchOrders}
              className="mt-3 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">

            <p className="text-gray-400">
              Loading orders...
            </p>

          </div>
        ) : orders.length === 0 ? (

          /* =================================================
              NO ORDERS
          ================================================= */

          <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">

            <p className="text-gray-400">
              No orders found.
            </p>

            <button
              type="button"
              onClick={fetchOrders}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200"
            >
              Refresh
            </button>

          </div>

        ) : (

          /* =================================================
              ORDERS
          ================================================= */

          <div className="mt-8 space-y-4">

            {orders.map((order: any) => (

              <div
                key={order._id}
                onClick={() =>
                  setSelectedOrder(order)
                }
                className="cursor-pointer rounded-xl border border-gray-800 bg-gray-900 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:bg-gray-800"
              >

                {/* =================================================
                    TOP
                ================================================= */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div className="min-w-0">

                    <h2 className="text-lg font-semibold text-white">
                      {getServiceName(order)}
                    </h2>

                    {order?.service?.description && (
                      <p className="mt-1 text-sm text-gray-400">
                        {order.service.description}
                      </p>
                    )}

                  </div>

                  {/* STATUS */}

                  {order?.status && (
                    <span
                      className={`w-fit rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  )}

                </div>

                {/* =================================================
                    INFO
                ================================================= */}

                <div className="mt-5 flex flex-wrap gap-3">

                  {/* PRICE */}

                  <span className="rounded-lg border border-green-400/20 bg-green-400/10 px-3 py-1.5 text-sm font-bold text-green-400">
                    ${getPrice(order)}
                  </span>

                  {/* CATEGORY */}

                  <span className="rounded-lg border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-sm text-blue-300">
                    {getCategory(order)}
                  </span>

                  {/* USER */}

                  {order?.user && (
                    <span className="rounded-lg border border-purple-400/20 bg-purple-400/10 px-3 py-1.5 text-sm text-purple-300">
                      {order.user.name ||
                        order.user.email ||
                        "User"}
                    </span>
                  )}

                </div>

                {/* =================================================
                    DATE
                ================================================= */}

                <p className="mt-4 text-xs text-gray-500">
                  {order?.createdAt
                    ? new Date(
                        order.createdAt
                      ).toLocaleString()
                    : "-"}
                </p>

              </div>

            ))}

          </div>
        )}

        {/* =================================================
            ORDER DETAILS MODAL
        ================================================= */}

        {selectedOrder && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() =>
              setSelectedOrder(null)
            }
          >

            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-xl font-bold text-white">
                    {getServiceName(
                      selectedOrder
                    )}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Order Details
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                  className="text-2xl text-gray-400 hover:text-white"
                >
                  ×
                </button>

              </div>

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                {/* SERVICE */}

                <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Service
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {getServiceName(
                      selectedOrder
                    )}
                  </p>

                </div>

                {/* CATEGORY */}

                <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Category
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {getCategory(
                      selectedOrder
                    )}
                  </p>

                </div>

                {/* PRICE */}

                <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Price
                  </p>

                  <p className="mt-2 text-lg font-bold text-green-400">
                    ${getPrice(selectedOrder)}
                  </p>

                </div>

                {/* STATUS */}

                <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Status
                  </p>

                  <p className="mt-2 font-semibold uppercase text-white">
                    {selectedOrder?.status ||
                      "-"}
                  </p>

                </div>

                {/* USER */}

                <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    User
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {selectedOrder?.user?.name ||
                      "-"}
                  </p>

                  {selectedOrder?.user?.email && (
                    <p className="mt-1 break-all text-sm text-gray-400">
                      {selectedOrder.user.email}
                    </p>
                  )}

                </div>

                {/* CREATED */}

                <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Created
                  </p>

                  <p className="mt-2 text-sm text-white">
                    {selectedOrder?.createdAt
                      ? new Date(
                          selectedOrder.createdAt
                        ).toLocaleString()
                      : "-"}
                  </p>

                </div>

              </div>

              {/* =================================================
                  ORDER ID
              ================================================= */}

              <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950 p-4">

                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Order ID
                </p>

                <p className="mt-2 break-all text-sm text-white">
                  {selectedOrder?._id || "-"}
                </p>

              </div>

              {/* =================================================
                  SERVICE ID
              ================================================= */}

              <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950 p-4">

                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Service ID
                </p>

                <p className="mt-2 break-all text-sm text-white">
                  {typeof selectedOrder?.service ===
                  "object"
                    ? selectedOrder?.service?._id ||
                      "-"
                    : selectedOrder?.service ||
                      "-"}
                </p>

              </div>

              {/* =================================================
                  FORM DATA
              ================================================= */}

              {selectedOrder?.formData &&
                typeof selectedOrder.formData ===
                  "object" &&
                Object.keys(
                  selectedOrder.formData
                ).length > 0 && (

                  <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950 p-4">

                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Order Information
                    </p>

                    <div className="mt-4 space-y-3">

                      {Object.entries(
                        selectedOrder.formData
                      ).map(
                        ([key, value]) => (

                          <div
                            key={key}
                            className="border-b border-gray-800 pb-3 last:border-0"
                          >

                            <p className="text-xs text-gray-500">
                              {formatFieldName(key)}
                            </p>

                            <p className="mt-1 break-words whitespace-pre-wrap text-sm font-medium text-white">
                              {formatValue(value)}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              {/* =================================================
                  ADMIN REPLY
              ================================================= */}

              {selectedOrder?.adminReply && (

                <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950 p-4">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Admin Reply
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-white">
                    {selectedOrder.adminReply}
                  </p>

                  {selectedOrder?.repliedAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(
                        selectedOrder.repliedAt
                      ).toLocaleString()}
                    </p>
                  )}

                </div>

              )}

              {/* =================================================
                  CANCEL REASON
              ================================================= */}

              {selectedOrder?.cancelReason && (

                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                  <p className="text-xs uppercase tracking-wide text-red-400">
                    Cancel Reason
                  </p>

                  <p className="mt-2 text-sm text-red-300">
                    {selectedOrder.cancelReason}
                  </p>

                </div>

              )}

              {/* =================================================
                  CLOSE
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="mt-6 w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                Close
              </button>

            </div>

          </div>

        )}

      </div>
    </AuthGuard>
  );
}