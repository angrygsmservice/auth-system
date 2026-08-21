"use client";

import { useEffect, useState } from "react";
import API from "../../lib/api";
import AuthGuard from "@/components/AuthGuard";

export default function ServerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/server");

      console.log("SERVER ORDERS:", res.data);

      setOrders(res.data.data);
    } catch (error) {
      console.log("GET SERVER ORDERS ERROR:", error);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black px-6 py-8 text-white">
        <h1 className="text-2xl font-bold">Server Orders</h1>

        <p className="mt-1 text-sm text-gray-400">
          Your server service orders
        </p>

        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="group cursor-pointer rounded-xl border border-gray-700 bg-gray-950 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/60 hover:bg-gray-900 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]"
            > 
              <h2 className="font-semibold">
                {order.service?.name}
              </h2>

              {order.service?.description && (
                <p className="mt-1 text-sm text-gray-400">
                  {order.service.description}
                </p>
              )}

              <p className="mt-2 text-sm text-gray-400">
                Status: {order.status.toUpperCase()}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}