"use client";

import { useEffect, useState } from "react";
import API from "../../lib/api";

export default function DepositPage() {
      const [balance, setBalance] = useState(0);
      const [amount, setAmount] = useState("");

      useEffect(() => {
        const getProfile = async () => {
          try {
            const res = await API.get("/users/profile");
            setBalance(res.data.data.balance || 0);
          } catch (error) {
            console.log("DEPOSIT PROFILE ERROR:", error);
          }
        };

        getProfile();
      }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-8 text-center">

        <h1 className="text-3xl font-bold mb-4">
          Deposit
        </h1>

        <p className="text-gray-400">
          Add balance to your account
        </p>

        <p className="mt-2 text-lg font-semibold">
          Balance: ${balance.toFixed(2)}
        </p>

        <p className="mt-4 text-lg text-gray-300">
          Current Balance: ${balance.toFixed(2)}
        </p>

        <div className="mt-6">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="5"
            step="0.01"
            placeholder="Enter amount"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Deposit
        </button>

      </div>
    </main>
  );
}
