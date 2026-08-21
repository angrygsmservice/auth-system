"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import API from "../../lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await API.post("/auth/forgot-password", {
        email,
      });

      toast.success(
        res.data.message || "Password reset email has been sent."
      );

      router.push(`/verify-otp?email=${email}`);

    } catch (err: any) {
      console.log(err);
      console.log(err.response?.data);
      console.log("DATA:", err.response?.data);

      toast.error(
        err.response?.data?.message ||
          "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-200 px-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-gray-100">

        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl text-white shadow-lg">
            🔑
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800">
          Forgot Password
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Enter your email to receive a password reset code.
        </p>

        <form onSubmit={handleForgotPassword}>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>

        </form>

      </div>

    </div>
  );
}