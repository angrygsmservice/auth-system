"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "../../../lib/api";
import AuthGuard from "@/components/AuthGuard";

export default function RemoteOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await API.get("/orders");

      const foundOrder = (res.data.data || []).find(
        (item: any) =>
          item._id === orderId &&
          item.service?.category === "REMOTE SERVICE"
      );

      setOrder(foundOrder || null);
    } catch (error) {
      console.log("GET REMOTE ORDER ERROR:", error);
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
        <div className="mx-auto max-w-3xl">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              Remote Order Details
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              View information about your remote service order
            </p>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
              <p className="text-gray-400">
                Loading order...
              </p>
            </div>
          ) : !order ? (
            /* NOT FOUND */
            <div className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-center">
              <p className="text-red-400">
                Remote order not found.
              </p>
            </div>
          ) : (
            /* ORDER DETAILS */
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              {/* SERVICE */}
              <div>
                <h2 className="text-xl font-semibold">
                  {order.service?.name || "Remote Service"}
                </h2>

                {order.service?.description && (
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    {order.service.description}
                  </p>
                )}
              </div>

              {/* DETAILS */}
              <div className="mt-6 space-y-5 border-t border-gray-800 pt-6">
                {/* ORDER ID */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Order ID
                  </p>

                  <p className="mt-1 break-all text-sm text-gray-300">
                    {order._id}
                  </p>
                </div>

                {/* STATUS */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status || "unknown"}
                  </span>
                </div>

                {/* PRICE */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Price
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    ${order.service?.price ?? 0}
                  </p>
                </div>

                {/* DURATION */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Duration
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    {order.service?.duration ?? 0}{" "}
                    {order.service?.durationUnit ?? "hours"}
                  </p>
                </div>

                {/* CATEGORY */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Service Category
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    {order.service?.category || "REMOTE SERVICE"}
                  </p>
                </div>

                {/* CREATED */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Created
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    {order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleString()
                      : "—"}
                  </p>
                </div>

                {/* UPDATED */}
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Last Updated
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    {order.updatedAt
                      ? new Date(
                          order.updatedAt
                        ).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}