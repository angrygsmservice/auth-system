"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import API from "../../lib/api";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email not found");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter a 6 digit code");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", {
        email,
        otp,
      });

      toast.success(
        res.data.message || "OTP verified successfully"
      );

      router.push(
        `/reset-password?email=${email}&otp=${otp}`
      );

    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-200 px-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-gray-100">

        <h1 className="text-3xl font-bold text-center text-gray-800">
          Verify OTP
        </h1>

        <p className="text-center text-gray-500 mt-3 mb-8">
          Enter the 6 digit code sent to your email
        </p>


        <form onSubmit={handleVerify}>

          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value.replace(/\D/g, "")
              )
            }
            placeholder="000000"
            className="w-full text-center text-3xl tracking-[15px] rounded-lg border border-gray-300 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />


          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>


        </form>

      </div>

    </div>
  );
}