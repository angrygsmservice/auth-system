"use client";

import { useEffect, useState } from "react";
import API from "../../../lib/api";
import AuthGuard from "@/components/AuthGuard";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
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

      console.log("========== ADMIN ORDERS ==========");
      console.log("RESPONSE:", res.data);
      console.log("DATA IS ARRAY:", Array.isArray(res.data?.data));
      console.log("TOTAL:", res.data?.data?.length);

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      console.log("ORDERS DATA:", data);

      setOrders(data);
    } catch (error: any) {
      console.error("GET ADMIN ORDERS ERROR:", error);
      console.error("ERROR RESPONSE:", error?.response?.data);

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
    if (!order) {
      return "Unknown Service";
    }

    if (
      order.service &&
      typeof order.service === "object"
    ) {
      return (
        order.service.name ||
        order.service.title ||
        order.service.serviceName ||
        "Unknown Service"
      );
    }

    if (typeof order.service === "string") {
      return order.service;
    }

    return "Unknown Service";
  };

  // =====================================================
  // CATEGORY
  // =====================================================

  const getCategory = (order: any) => {
    if (!order) {
      return "UNKNOWN CATEGORY";
    }

    if (
      order.service &&
      typeof order.service === "object"
    ) {
      return (
        order.service.category ||
        order.service.type ||
        "UNKNOWN CATEGORY"
      );
    }

    return order.category || "UNKNOWN CATEGORY";
  };

  // =====================================================
  // PRICE
  // =====================================================

  const getPrice = (order: any) => {
    if (
      order?.price !== undefined &&
      order?.price !== null
    ) {
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

  const getStatus = (order: any) => {
    return order?.status || "pending";
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status: string) => {
    switch (
      String(status || "").toLowerCase()
    ) {
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
  // USER NAME
  // =====================================================

  const getUserName = (order: any) => {
    if (!order?.user) {
      return "Unknown User";
    }

    if (typeof order.user === "object") {
      return (
        order.user.name ||
        order.user.email ||
        "Unknown User"
      );
    }

    return String(order.user);
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
    if (
      value === null ||
      value === undefined
    ) {
      return "-";
    }

    if (typeof value === "object") {
      return JSON.stringify(
        value,
        null,
        2
      );
    }

    return String(value);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-950 p-6 text-white">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Orders
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage all customer orders
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-2">

              <span className="text-sm text-gray-400">
                Total Orders:
              </span>

              <span className="ml-2 font-bold text-white">
                {orders.length}
              </span>

            </div>

            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

          </div>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

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

        {/* =====================================================
            CONTENT
        ===================================================== */}

        {loading ? (

          <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">

            <p className="text-gray-400">
              Loading orders...
            </p>

          </div>

        ) : orders.length === 0 ? (

          <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">

            <p className="text-gray-300">
              No orders found.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              API returned 0 orders.
            </p>

          </div>

        ) : (

          /* =====================================================
              ALL ORDERS
          ===================================================== */

          <div className="mt-8 space-y-4">

            {orders.map(
              (order: any, index: number) => (

                <div
                  key={
                    order?._id ||
                    `order-${index}`
                  }
                  onClick={() =>
                    setSelectedOrder(order)
                  }
                  className="cursor-pointer rounded-xl border border-gray-800 bg-gray-900 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/60 hover:bg-gray-800"
                >

                  {/* =====================================================
                      TOP
                  ===================================================== */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                      <h2 className="break-words text-lg font-semibold text-white">
                        {getServiceName(order)}
                      </h2>

                      <p className="mt-1 text-sm text-gray-400">
                        Customer:{" "}
                        {getUserName(order)}
                      </p>

                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase ${getStatusClass(
                        getStatus(order)
                      )}`}
                    >
                      {getStatus(order)}
                    </span>

                  </div>

                  {/* =====================================================
                      INFO
                  ===================================================== */}

                  <div className="mt-5 flex flex-wrap gap-3">

                    <span className="rounded-lg border border-green-400/20 bg-green-400/10 px-3 py-1.5 text-sm font-bold text-green-400">
                      ${getPrice(order)}
                    </span>

                    <span className="rounded-lg border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-sm text-blue-300">
                      {getCategory(order)}
                    </span>

                    <span className="rounded-lg border border-purple-400/20 bg-purple-400/10 px-3 py-1.5 text-sm text-purple-300">
                      #{index + 1}
                    </span>

                  </div>

                  {/* =====================================================
                      DATE
                  ===================================================== */}

                  <p className="mt-4 text-xs text-gray-500">
                    {order?.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleString()
                      : "-"}
                  </p>

                </div>

              )
            )}

          </div>
        )}

        {/* =====================================================
            ORDER DETAILS MODAL
        ===================================================== */}

        {selectedOrder && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() =>
              setSelectedOrder(null)
            }
          >

            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* =====================================================
                  MODAL HEADER
              ===================================================== */}

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <h2 className="break-words text-xl font-bold text-white">
                    {getServiceName(
                      selectedOrder
                    )}
                  </h2>

                  <p className="mt-1 break-all text-sm text-gray-400">
                    Order ID:{" "}
                    {selectedOrder?._id || "-"}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                  className="shrink-0 rounded-lg px-3 py-2 text-xl text-gray-400 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>

              </div>

              {/* =====================================================
                  BASIC INFORMATION
              ===================================================== */}

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
                    ${getPrice(
                      selectedOrder
                    )}
                  </p>

                </div>

                {/* STATUS */}

                <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Status
                  </p>

                  <select
                    value={
                      selectedOrder?.status ||
                      "pending"
                    }
                    onChange={(e) => {
                      setSelectedOrder({
                        ...selectedOrder,
                        status:
                          e.target.value,
                      });
                    }}
                    className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  >
                    {selectedOrder?.orderType === "rent" ? (
                      <>
                        <option value="pending">
                          Pending
                        </option>

                        <option value="active">
                          Active
                        </option>

                        <option value="completed">
                          Completed
                        </option>

                        <option value="cancelled">
                          Cancelled
                        </option>
                       </>
                     ) : (
                       <>
                        <option value="pending">
                          Pending
                        </option>

                        <option value="processing">
                          Processing
                        </option>

                        <option value="completed">
                          Completed
                        </option>

                        <option value="cancelled">
                          Cancelled
                        </option>
                      </>
                    )}

                  </select>

                </div>

                {/* USER */}

                <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Customer
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {selectedOrder?.user?.name ||
                      "-"}
                  </p>

                  <p className="mt-1 break-all text-sm text-gray-400">
                    {selectedOrder?.user?.email ||
                      "-"}
                  </p>

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

              {/* =====================================================
                  SERVICE ID
              ===================================================== */}

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

              {/* =====================================================
                  RENT ORDER INFORMATION
              ===================================================== */}

              {selectedOrder?.orderType === "rent" && (
                <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950 p-4">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Rent Information
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">

                    {/* DURATION */}

                    <div>
                      <p className="text-xs text-gray-500">
                        Duration
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {selectedOrder?.duration ?? "-"}{" "}
                        {selectedOrder?.durationUnit ?? ""}
                      </p>
                    </div>

                    {/* START TIME */}

                    <div>
                      <p className="text-xs text-gray-500">
                        Start Time
                      </p>

                      <p className="mt-1 text-sm text-white">
                        {selectedOrder?.startTime
                          ? new Date(
                              selectedOrder.startTime
                            ).toLocaleString()
                          : "-"}
                      </p>
                    </div>

                    {/* END TIME */}

                    <div>
                      <p className="text-xs text-gray-500">
                        End Time
                      </p>

                      <p className="mt-1 text-sm text-white">
                        {selectedOrder?.endTime
                          ? new Date(
                              selectedOrder.endTime
                            ).toLocaleString()
                          : "-"}
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {/* =====================================================
                  RENT CREDENTIALS
              ===================================================== */}

              {selectedOrder?.orderType === "rent" && (
                <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950 p-4">

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Rent Credentials
                  </p>

                  {/* LOGIN */}

                  <div className="mt-4">
                    <label className="text-xs text-gray-500">
                      Login
                    </label>

                    <input
                      type="text"
                      value={
                        selectedOrder?.credentials?.login || ""
                      }
                      onChange={(e) => {
                        setSelectedOrder({
                          ...selectedOrder,
                          credentials: {
                            ...selectedOrder.credentials,
                            login: e.target.value,
                          },
                        });
                      }}
                      placeholder="Enter login"
                      className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                    />
                  </div>

                  {/* PASSWORD */}

                  <div className="mt-4">
                    <label className="text-xs text-gray-500">
                      Password
                    </label>

                    <input
                      type="text"
                      value={
                        selectedOrder?.credentials?.password || ""
                      }
                      onChange={(e) => {
                        setSelectedOrder({
                          ...selectedOrder,
                          credentials: {
                            ...selectedOrder.credentials,
                            password: e.target.value,
                          },
                        });
                      }}
                      placeholder="Enter password"
                      className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                    />
                  </div>

                  {/* NOTE */}

                  <div className="mt-4">
                    <label className="text-xs text-gray-500">
                      Note
                    </label>

                    <textarea
                      value={
                        selectedOrder?.credentials?.note || ""
                      }
                      onChange={(e) => {
                        setSelectedOrder({
                          ...selectedOrder,
                          credentials: {
                            ...selectedOrder.credentials,
                            note: e.target.value,
                          },
                        });
                      }}
                      placeholder="Additional note..."
                      rows={4}
                      className="mt-2 w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                    />
                  </div>

                </div>
              )}

              {/* =====================================================
                  ORDER INFORMATION
              ===================================================== */}

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
                              {formatFieldName(
                                key
                              )}
                            </p>

                            <p className="mt-1 break-words whitespace-pre-wrap text-sm font-medium text-white">
                              {formatValue(
                                value
                              )}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              {/* =====================================================
                  LOCK PICTURES
              ===================================================== */}

              <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950 p-4">

                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Lock Pictures
                </p>

                {selectedOrder?.lockPictures?.length >
                0 ? (

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    {selectedOrder.lockPictures.map(
                      (
                        picture: string,
                        index: number
                      ) => (

                        <img
                          key={index}
                          src={`http://localhost:3000${picture}`}
                          alt={`Lock picture ${
                            index + 1
                          }`}
                          className="w-full rounded-lg border border-gray-800 object-cover"
                        />

                      )
                    )}

                  </div>

                ) : (

                  <p className="mt-2 text-sm text-gray-500">
                    No lock pictures.
                  </p>

                )}

              </div>

              {/* =====================================================
                  ADMIN REPLY
              ===================================================== */}

              <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950 p-4">

                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Admin Reply
                </p>

                <textarea
                  value={
                    selectedOrder?.adminReply ||
                    ""
                  }
                  onChange={(e) => {
                    setSelectedOrder({
                      ...selectedOrder,
                      adminReply:
                        e.target.value,
                    });
                  }}
                  placeholder="Write a reply to the customer..."
                  rows={5}
                  className="mt-3 w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-3 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                />

              </div>

              {/* =====================================================
                  CANCEL REASON
              ===================================================== */}

              {selectedOrder?.cancelReason && (

                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                  <p className="text-xs uppercase tracking-wide text-red-400">
                    Cancel Reason
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-red-300">
                    {selectedOrder.cancelReason}
                  </p>

                </div>

              )}

              {/* =====================================================
                  SAVE
              ===================================================== */}

              <button
                type="button"
                onClick={async () => {

                  try {

                    console.log("SELECTED ORDER BEFORE SAVE:", selectedOrder);
                    console.log("CREDENTIALS BEFORE SAVE:", selectedOrder?.credentials);
                    console.log("LOGIN:", selectedOrder?.credentials?.login);
                    console.log("PASSWORD:", selectedOrder?.credentials?.password);
                    console.log("NOTE:", selectedOrder?.credentials?.note);

                    console.log(
                      "BEFORE SAVE:",
                      {
                        id: selectedOrder?._id,
                        status:
                          selectedOrder?.status,
                        adminReply:
                          selectedOrder?.adminReply,
                      }
                    );

                    const res = await API.put(
                      `/admin/orders/${selectedOrder._id}/status`,
                      {
                        status: selectedOrder.status,
                        adminReply: selectedOrder.adminReply || "",

                        ...(selectedOrder.orderType === "rent"
                          ? {
                              login:
                                selectedOrder.credentials?.login || "",

                              password:
                                selectedOrder.credentials?.password || "",

                              note:
                                selectedOrder.credentials?.note || "",
                            }
                          : {}),
                      }
                    );

                    console.log(
                      "STATUS UPDATED:",
                      res.data
                    );

                    const updatedOrder =
                      res.data?.data;

                    if (updatedOrder) {
                      setOrders(
                        (prevOrders) =>
                          prevOrders.map(
                            (order) =>
                              order._id === selectedOrder._id
                                ? updatedOrder
                                : order
                          )
                      );

                      setSelectedOrder(null);
                   }

                  } catch (error: any) {

                    console.error(
                      "UPDATE STATUS ERROR:",
                      error
                    );

                    console.error(
                      "ERROR RESPONSE:",
                      error?.response?.data
                    );

                  }

                }}
                className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Save Status
              </button>

              {/* =====================================================
                  CLOSE
              ===================================================== */}

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="mt-3 w-full rounded-lg bg-white px-4 py-3 font-semibold text-black hover:bg-gray-200"
              >
                Close
              </button>

            </div>

          </div>

        )}

      </main>
    </AuthGuard>
  );
}