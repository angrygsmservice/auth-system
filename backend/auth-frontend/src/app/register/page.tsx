"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (!name || !email || !password) {
        throw new Error("All fields are required");
      }

      const url = "/api/v1/auth/register";

      console.log("REGISTER URL:", url);

      console.log("REGISTER URL:", url);
      console.log("REGISTER REQUEST START");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      console.log(
        "RESPONSE STATUS:",
        response.status
      );

      const data = await response.json();

      console.log(
        "BACKEND RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message || "Register failed"
        );
      }

      toast.success(data.message);

      router.push("/login");

    } catch (err: any) {
      console.error(
        "REGISTER ERROR:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong.";

      setError(message);
      toast.error(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-200 px-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-gray-100">

        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl text-white shadow-lg">
            👤
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Create your new account
        </p>

        <form onSubmit={handleRegister}>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>

          <div className="relative">
            <User
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 transition duration-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="block text-sm font-medium text-gray-700 mt-6 mb-2">
            Email
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
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 transition duration-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="block text-sm font-medium text-gray-700 mt-6 mb-2">
            Password
          </label>

          <div className="relative">
            <Lock
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-20 transition duration-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>

                <span>Creating...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </button>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}

            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              Login
            </Link>
          </p>

        </form>

      </div>

    </div>
  );
}

