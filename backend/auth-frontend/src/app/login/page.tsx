"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "../../lib/api";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type LanguageCode = "en" | "uz" | "ru" | "tr" | "ar" | "fa";

const translations = {
  en: {
    welcome: "Welcome Back 👋",
    subtitle: "Sign in to your account",
    email: "Email",
    emailPlaceholder: "Enter your email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    forgot: "Forgot Password?",
    login: "Login",
    loggingIn: "Logging in...",
    noAccount: "Don't have an account?",
    createAccount: "Create Account",
    loginSuccess: "Login successful!",
    loginFailed: "Login failed",
  },

  uz: {
    welcome: "Xush kelibsiz 👋",
    subtitle: "Hisobingizga kiring",
    email: "Email",
    emailPlaceholder: "Email manzilingizni kiriting",
    password: "Parol",
    passwordPlaceholder: "Parolingizni kiriting",
    forgot: "Parolni unutdingizmi?",
    login: "Kirish",
    loggingIn: "Kirilmoqda...",
    noAccount: "Hisobingiz yo‘qmi?",
    createAccount: "Hisob yaratish",
    loginSuccess: "Muvaffaqiyatli kirdingiz!",
    loginFailed: "Kirish amalga oshmadi",
  },

  ru: {
    welcome: "С возвращением 👋",
    subtitle: "Войдите в свой аккаунт",
    email: "Электронная почта",
    emailPlaceholder: "Введите вашу почту",
    password: "Пароль",
    passwordPlaceholder: "Введите ваш пароль",
    forgot: "Забыли пароль?",
    login: "Войти",
    loggingIn: "Вход...",
    noAccount: "Нет аккаунта?",
    createAccount: "Создать аккаунт",
    loginSuccess: "Вход выполнен успешно!",
    loginFailed: "Не удалось войти",
  },

  tr: {
    welcome: "Tekrar Hoş Geldiniz 👋",
    subtitle: "Hesabınıza giriş yapın",
    email: "E-posta",
    emailPlaceholder: "E-posta adresinizi girin",
    password: "Şifre",
    passwordPlaceholder: "Şifrenizi girin",
    forgot: "Şifrenizi mi unuttunuz?",
    login: "Giriş Yap",
    loggingIn: "Giriş yapılıyor...",
    noAccount: "Hesabınız yok mu?",
    createAccount: "Hesap Oluştur",
    loginSuccess: "Giriş başarılı!",
    loginFailed: "Giriş başarısız",
  },

  ar: {
    welcome: "مرحبًا بعودتك 👋",
    subtitle: "قم بتسجيل الدخول إلى حسابك",
    email: "البريد الإلكتروني",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    password: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    forgot: "هل نسيت كلمة المرور؟",
    login: "تسجيل الدخول",
    loggingIn: "جارٍ تسجيل الدخول...",
    noAccount: "ليس لديك حساب؟",
    createAccount: "إنشاء حساب",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    loginFailed: "فشل تسجيل الدخول",
  },

  fa: {
    welcome: "خوش آمدید 👋",
    subtitle: "وارد حساب خود شوید",
    email: "ایمیل",
    emailPlaceholder: "ایمیل خود را وارد کنید",
    password: "رمز عبور",
    passwordPlaceholder: "رمز عبور خود را وارد کنید",
    forgot: "رمز عبور را فراموش کرده‌اید؟",
    login: "ورود",
    loggingIn: "در حال ورود...",
    noAccount: "حساب کاربری ندارید؟",
    createAccount: "ایجاد حساب",
    loginSuccess: "ورود با موفقیت انجام شد!",
    loginFailed: "ورود ناموفق بود",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service");

  const [language, setLanguage] = useState<LanguageCode>("en");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Home page'da tanlangan tilni olish
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");

    if (
      savedLanguage === "en" ||
      savedLanguage === "uz" ||
      savedLanguage === "ru" ||
      savedLanguage === "tr" ||
      savedLanguage === "ar" ||
      savedLanguage === "fa"
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  const t = translations[language];

  const handleLogin = async (e: React.FormEvent) => {
    console.log("HANDLE LOGIN ISHLADI");

    e.preventDefault();

    setLoading(true);

    try {
      console.log("LOGIN CLICK");
      console.log(API.defaults.baseURL);

      const res = await API.post("/auth/login", {
        email: email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);
      console.log("ACCESS TOKEN:", res.data.data?.accessToken || res.data.accessToken);
      console.log("SERVICE ID:", serviceId);

      console.log(
        "ACCESS TOKEN TEST:",
        res.data.data?.accessToken || res.data.accessToken
      );

      if (res.data.data?.requiresTwoFactor) {
        console.log("2FA REQUIRED");

        router.push(`/login-2fa?email=${email}`);
        return;
      }

      const accessToken =
        res.data.data?.accessToken ||
        res.data.accessToken;

      console.log("ACCESS TOKEN:", accessToken);

      localStorage.setItem("accessToken", accessToken);

      console.log(
        "SAVED TOKEN:",
        localStorage.getItem("accessToken")
      );

      toast.success(t.loginSuccess);
      
      router.push("/services");
    } catch (error: any) {
      console.log("LOGIN ERROR:", error);

      console.log(
        "LOGIN ERROR RESPONSE:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message || t.loginFailed
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-200 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-gray-100">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl text-white shadow-lg">
            🔐
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-800">
          {t.welcome}
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-500 mt-2 mb-8">
          {t.subtitle}
        </p>

        <form
        onSubmit={(e) => {
          console.log("FORM SUBMIT ISHLADI");
          handleLogin(e);
        }}
      >

          {/* Email */}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.email}
          </label>

          <div className="relative">
            <Mail
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <label className="block text-sm font-medium text-gray-700 mt-6 mb-2">
            {t.password}
          </label>

          <div className="relative">
            <Lock
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Show / Hide Password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end mt-3 mb-4">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              {t.forgot}
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={false}
            className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? t.loggingIn : t.login}
          </button>

          {/* Register */}
          <p className="mt-6 text-center text-gray-700">
            {t.noAccount}{" "}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              {t.createAccount}
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}