"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import API from "../../lib/api";
import { toast } from "sonner";

export default function Login2FA() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email");

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await API.post("/auth/2fa/login", {
        email,
        token,
      });

     console.log("LOGIN 2FA RESPONSE:", res.data);
      console.log("ACCESS TOKEN:", res.data.data.accessToken);

      localStorage.setItem(
        "accessToken",
        res.data.data.accessToken
      );

      console.log(
        "LOCAL STORAGE:",
       localStorage.getItem("accessToken")
     );

     toast.success("Login successful");

      router.push("/profile");

    } catch (err: any) {
      console.log("LOGIN ERROR:", err.response?.data);

      toast.error(
        err.response?.data?.message || "Invalid code"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">

      <form
        onSubmit={handleVerify}
        className="w-[400px] p-8 bg-white rounded-xl shadow"
      >

        <h1 className="text-2xl font-bold mb-6">
          Two Factor Authentication
        </h1>

        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="border w-full p-3 rounded"
        />

        <button
          className="mt-5 w-full bg-blue-600 text-white rounded p-3"
          disabled={loading}
        >
          {loading ? "Checking..." : "Verify"}
        </button>

      </form>

    </div>
  );
}