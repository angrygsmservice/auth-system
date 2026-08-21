"use client";

import { useEffect, useState } from "react";
import API from "../../lib/api";
import AuthGuard from "@/components/AuthGuard";

export default function RemoteOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRemoteOrders();
  }, []);

  const fetchRemoteOrders = async () => {
    try {
      setLoading(true);

      const res = await API.get("/orders");

      const remoteOrders = (res.data.data || []).filter(
        (order: any) =>
          order.service?.category === "REMOTE SERVICE"
      );

      setOrders(remoteOrders);
    } catch (error) {
      console.log("GET REMOTE ORDERS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "border-green-800 bg-green-950 text-green-400";

      case "pending":
        return "border-yellow-800 bg-yellow-950 text-yellow-400";

      case "processing":
        return "border-blue-800 bg-blue-950 text-blue-400";

      case "cancelled":
      case "canceled":
        return "border-red-800 bg-red-950 text-red-400";

      default:
        return "border-gray-700 bg-gray-800 text-gray-300";
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950 p-6 text-white">
        <div className="mx-auto max-w-5xl">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Remote Orders
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Manage your remote service orders
            </p>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
              <p className="text-gray-400">
                Loading remote orders...
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && orders.length === 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-2xl">
                📡
              </div>

              <h2 className="text-lg font-semibold">
                No Remote Orders
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                You don't have any remote service orders yet.
              </p>
            </div>
          )}

          {/* ORDERS */}
          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const status =
                  order.status?.toLowerCase() || "unknown";

                return (
                  <div
                    key={order._id}
                    className="rounded-xl border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-700"
                  >
                    {/* TOP */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">
                          {order.service?.name || "Remote Service"}
                        </h2>

                        {order.service?.description && (
                          <p className="mt-1 text-sm text-gray-400">
                            {order.service.description}
                          </p>
                        )}
                      </div>

                      {/* STATUS */}
                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusStyle(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="mt-5 grid gap-4 border-t border-gray-800 pt-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Order ID
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-300">
                          {order._id}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Created
                        </p>

                        <div className="mt-5 border-t border-gray-800 pt-4">
                          <button
                            onClick={() =>
                              window.location.href = `/remote-orders/${order._id}`
                            }
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-gray-600 hover:bg-gray-700"
                         >
                            View Details
                          </button>
                        </div>

                        <p className="mt-1 text-sm text-gray-300">
                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}1