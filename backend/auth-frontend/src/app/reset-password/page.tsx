"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import API from "../../lib/api";

export default function ResetPasswordPage() {

  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }


    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
     const res = await API.post("/auth/reset-password", {
     email,
      otp,
      newPassword,
    });

    toast.success(
      res.data.message || "Password reset successfully"
    );


    router.push("/login");

    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        "Password reset failed"
      );
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-200 px-4">


      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">


        <h1 className="text-3xl font-bold text-center text-gray-800">
          Reset Password
        </h1>


        <p className="text-center text-gray-500 mt-3 mb-8">
          Enter your new password
        </p>



        <form onSubmit={handleReset}>


          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e)=>setNewPassword(e.target.value)}
            className="w-full rounded-lg border p-3 mb-4"
          />


          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
          />



          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700"
          >
            Reset Password
          </button>


        </form>


      </div>


    </div>
  );
}