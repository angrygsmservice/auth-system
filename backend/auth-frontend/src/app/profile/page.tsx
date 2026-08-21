"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../lib/api";
import { toast } from "sonner";

import {
  ArrowUpTrayIcon,
  PencilSquareIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import { useDarkMode } from "@/context/DarkModeContext";

type LanguageCode = "en" | "uz" | "ru" | "tr" | "ar";

export default function ProfilePage() {
  const router = useRouter();

  const { darkMode, toggleDarkMode } = useDarkMode();

  const [language, setLanguage] = useState<LanguageCode>("en");

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);

  // =========================================================
  // TRANSLATIONS
  // =========================================================

  const translations = {
    en: {
      profile: "My Profile",
      profileDesc: "Manage your account settings and security.",
      balance: "Balance",

      lightMode: "☀️ Light Mode",
      darkMode: "🌙 Dark Mode",

      changePhoto: "Change Photo",

      accountInfo: "Account Information",
      role: "Role",
      email: "Email",
      userId: "User ID",
      created: "Created",

      profileInfo: "Profile Information",
      fullName: "Full Name",

      twoFactor: "Two-Factor Authentication",
      enabled: "Enabled",
      disabled: "Disabled",

      currentPassword: "Current Password",
      newPassword: "New Password",

      uploadAvatar: "Upload Avatar",
      saveChanges: "Save Changes",

      changePassword: "Change Password",
      changing: "Changing...",

      securityDesc:
        "Protect your account with Google Authenticator.",

      setup2FA: "Setup Two-Factor Authentication",
      verify2FA: "Verify Two-Factor Authentication",

      authCode: "Google Authenticator code",

      logout: "Logout",

      profileUpdated:
        "Profile updated successfully.",

      profileUpdateFailed:
        "Failed to update profile.",

      selectImage:
        "Please select an image.",

      avatarUploaded:
        "Avatar uploaded successfully.",

      avatarUploadFailed:
        "Failed to upload avatar.",

      fillFields:
        "Please fill in all fields.",

      passwordChanged:
        "Password changed successfully.",

      passwordChangeFailed:
        "Failed to change password.",

      qrCreated:
        "QR Code created!",

      twoFactorEnabled:
        "2FA enabled successfully!",

      verificationFailed:
        "Verification failed.",

      setupError:
        "An error occurred.",
    },

    uz: {
      profile: "Mening profilim",
      profileDesc:
        "Hisob sozlamalari va xavfsizlikni boshqaring.",
      balance: "Balans",

      lightMode: "☀️ Yorug‘ rejim",
      darkMode: "🌙 Qorong‘i rejim",

      changePhoto: "Rasmni o‘zgartirish",

      accountInfo: "Hisob ma’lumotlari",
      role: "Rol",
      email: "Email",
      userId: "Foydalanuvchi ID",
      created: "Yaratilgan",

      profileInfo: "Profil ma’lumotlari",
      fullName: "To‘liq ism",

      twoFactor: "Ikki bosqichli autentifikatsiya",
      enabled: "Yoqilgan",
      disabled: "O‘chirilgan",

      currentPassword: "Joriy parol",
      newPassword: "Yangi parol",

      uploadAvatar: "Avatarni yuklash",
      saveChanges: "O‘zgarishlarni saqlash",

      changePassword: "Parolni o‘zgartirish",
      changing: "O‘zgartirilmoqda...",

      securityDesc:
        "Google Authenticator yordamida hisobingizni himoya qiling.",

      setup2FA:
        "Ikki bosqichli autentifikatsiyani sozlash",

      verify2FA:
        "Ikki bosqichli autentifikatsiyani tasdiqlash",

      authCode:
        "Google Authenticator kodi",

      logout: "Chiqish",

      profileUpdated:
        "Profil muvaffaqiyatli yangilandi.",

      profileUpdateFailed:
        "Profilni yangilashda xatolik.",

      selectImage:
        "Iltimos, rasm tanlang.",

      avatarUploaded:
        "Avatar muvaffaqiyatli yuklandi.",

      avatarUploadFailed:
        "Avatarni yuklashda xatolik.",

      fillFields:
        "Barcha maydonlarni to‘ldiring.",

      passwordChanged:
        "Parol muvaffaqiyatli o‘zgartirildi.",

      passwordChangeFailed:
        "Parolni o‘zgartirishda xatolik.",

      qrCreated:
        "QR kod yaratildi!",

      twoFactorEnabled:
        "2FA muvaffaqiyatli yoqildi!",

      verificationFailed:
        "Tasdiqlashda xatolik.",

      setupError:
        "Xatolik yuz berdi.",
    },

    ru: {
      profile: "Мой профиль",
      profileDesc:
        "Управляйте настройками аккаунта и безопасностью.",
      balance: "Баланс",

      lightMode: "☀️ Светлая тема",
      darkMode: "🌙 Темная тема",

      changePhoto: "Изменить фото",

      accountInfo: "Информация об аккаунте",
      role: "Роль",
      email: "Email",
      userId: "ID пользователя",
      created: "Создан",

      profileInfo: "Информация профиля",
      fullName: "Полное имя",

      twoFactor: "Двухфакторная аутентификация",
      enabled: "Включена",
      disabled: "Отключена",

      currentPassword: "Текущий пароль",
      newPassword: "Новый пароль",

      uploadAvatar: "Загрузить аватар",
      saveChanges: "Сохранить изменения",

      changePassword: "Изменить пароль",
      changing: "Изменение...",

      securityDesc:
        "Защитите свой аккаунт с помощью Google Authenticator.",

      setup2FA:
        "Настроить двухфакторную аутентификацию",

      verify2FA:
        "Подтвердить двухфакторную аутентификацию",

      authCode:
        "Код Google Authenticator",

      logout: "Выйти",

      profileUpdated:
        "Профиль успешно обновлен.",

      profileUpdateFailed:
        "Не удалось обновить профиль.",

      selectImage:
        "Пожалуйста, выберите изображение.",

      avatarUploaded:
        "Аватар успешно загружен.",

      avatarUploadFailed:
        "Не удалось загрузить аватар.",

      fillFields:
        "Заполните все поля.",

      passwordChanged:
        "Пароль успешно изменен.",

      passwordChangeFailed:
        "Не удалось изменить пароль.",

      qrCreated:
        "QR-код создан!",

      twoFactorEnabled:
        "2FA успешно включена!",

      verificationFailed:
        "Ошибка подтверждения.",

      setupError:
        "Произошла ошибка.",
    },

    tr: {
      profile: "Profilim",
      profileDesc:
        "Hesap ayarlarınızı ve güvenliğinizi yönetin.",
      balance: "Bakiye",

      lightMode: "☀️ Açık Mod",
      darkMode: "🌙 Koyu Mod",

      changePhoto: "Fotoğrafı Değiştir",

      accountInfo: "Hesap Bilgileri",
      role: "Rol",
      email: "E-posta",
      userId: "Kullanıcı ID",
      created: "Oluşturulma",

      profileInfo: "Profil Bilgileri",
      fullName: "Ad Soyad",

      twoFactor: "İki Faktörlü Kimlik Doğrulama",
      enabled: "Etkin",
      disabled: "Devre Dışı",

      currentPassword: "Mevcut Şifre",
      newPassword: "Yeni Şifre",

      uploadAvatar: "Avatar Yükle",
      saveChanges: "Değişiklikleri Kaydet",

      changePassword: "Şifreyi Değiştir",
      changing: "Değiştiriliyor...",

      securityDesc:
        "Google Authenticator ile hesabınızı koruyun.",

      setup2FA:
        "İki Faktörlü Kimlik Doğrulamayı Ayarla",

      verify2FA:
        "İki Faktörlü Kimlik Doğrulamayı Doğrula",

      authCode:
        "Google Authenticator kodu",

      logout: "Çıkış Yap",

      profileUpdated:
        "Profil başarıyla güncellendi.",

      profileUpdateFailed:
        "Profil güncellenemedi.",

      selectImage:
        "Lütfen bir resim seçin.",

      avatarUploaded:
        "Avatar başarıyla yüklendi.",

      avatarUploadFailed:
        "Avatar yüklenemedi.",

      fillFields:
        "Lütfen tüm alanları doldurun.",

      passwordChanged:
        "Şifre başarıyla değiştirildi.",

      passwordChangeFailed:
        "Şifre değiştirilemedi.",

      qrCreated:
        "QR kodu oluşturuldu!",

      twoFactorEnabled:
        "2FA başarıyla etkinleştirildi!",

      verificationFailed:
        "Doğrulama başarısız.",

      setupError:
        "Bir hata oluştu.",
    },

    ar: {
      profile: "ملفي الشخصي",
      profileDesc:
        "إدارة إعدادات حسابك وأمانك.",
      balance: "الرصيد",

      lightMode: "☀️ الوضع الفاتح",
      darkMode: "🌙 الوضع الداكن",

      changePhoto: "تغيير الصورة",

      accountInfo: "معلومات الحساب",
      role: "الدور",
      email: "البريد الإلكتروني",
      userId: "معرف المستخدم",
      created: "تاريخ الإنشاء",

      profileInfo: "معلومات الملف الشخصي",
      fullName: "الاسم الكامل",

      twoFactor: "المصادقة الثنائية",
      enabled: "مفعّلة",
      disabled: "معطّلة",

      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",

      uploadAvatar: "رفع الصورة",
      saveChanges: "حفظ التغييرات",

      changePassword: "تغيير كلمة المرور",
      changing: "جارٍ التغيير...",

      securityDesc:
        "احمِ حسابك باستخدام Google Authenticator.",

      setup2FA: "إعداد المصادقة الثنائية",

      verify2FA: "تأكيد المصادقة الثنائية",

      authCode: "رمز Google Authenticator",

      logout: "تسجيل الخروج",

      profileUpdated:
        "تم تحديث الملف الشخصي بنجاح.",

      profileUpdateFailed:
        "فشل تحديث الملف الشخصي.",

      selectImage:
        "يرجى اختيار صورة.",

      avatarUploaded:
        "تم رفع الصورة بنجاح.",

      avatarUploadFailed:
        "فشل رفع الصورة.",

      fillFields:
        "يرجى ملء جميع الحقول.",

      passwordChanged:
        "تم تغيير كلمة المرور بنجاح.",

      passwordChangeFailed:
        "فشل تغيير كلمة المرور.",

      qrCreated:
        "تم إنشاء رمز QR!",

      twoFactorEnabled:
        "تم تفعيل المصادقة الثنائية بنجاح!",

      verificationFailed:
        "فشل التحقق.",

      setupError:
        "حدث خطأ.",
    },
  };

  const t = translations[language];

  // =========================================================
  // LOAD LANGUAGE
  // =========================================================

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");

    if (
      savedLanguage === "en" ||
      savedLanguage === "uz" ||
      savedLanguage === "ru" ||
      savedLanguage === "tr" ||
      savedLanguage === "ar"
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    const getProfile = async () => {
      try {
        const res = await API.get("/users/profile");

        setUser(res.data.data);
        setPreview("");
        setName(res.data.data.name);
      } catch (err) {
        console.log("PROFILE ERROR:", err);
      }
    };

    getProfile();
  }, [router]);

  // =========================================================
  // CLEAN PREVIEW URL
  // =========================================================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  const handleUpdate = async () => {
    try {
      await API.put("/users/profile", {
        name,
      });

      toast.success(t.profileUpdated);

      setUser({
        ...user,
        name,
      });
    } catch {
      toast.error(t.profileUpdateFailed);
    }
  };

  // =========================================================
  // UPLOAD AVATAR
  // =========================================================

  const handleUploadAvatar = async () => {
    if (!file) {
      toast.error(t.selectImage);
      return;
    }

    const formData = new FormData();

    formData.append("avatar", file);

    try {
      const res = await API.post(
        "/users/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(t.avatarUploaded);

      setUser(res.data.data);
      setFile(null);
      setPreview("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          t.avatarUploadFailed
      );
    }
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error(t.fillFields);
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await API.put(
        "/auth/change-password",
        {
          oldPassword,
          newPassword,
        }
      );

      toast.success(
        res.data.message || t.passwordChanged
      );

      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          t.passwordChangeFailed
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // =========================================================
  // SETUP 2FA
  // =========================================================

  const handleSetup2FA = async () => {
    try {
      const res = await API.post("/auth/setup-2fa");

      setQrCode(res.data.data.qrCode);
      setSecret(res.data.data.secret);

      toast.success(t.qrCreated);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          t.setupError
      );
    }
  };

  // =========================================================
  // VERIFY 2FA
  // =========================================================

  const handleVerify2FA = async () => {
    try {
      await API.post("/auth/verify-2fa", {
        token: code,
      });

      toast.success(t.twoFactorEnabled);

      setQrCode("");
      setSecret("");
      setCode("");

      setUser({
        ...user,
        twoFactorEnabled: true,
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          t.verificationFailed
      );
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.log(err);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    router.push("/login");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (!user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode
            ? "bg-gray-900"
            : "bg-gray-100"
        }`}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div
      className={`min-h-screen flex justify-center py-10 px-4 transition-colors duration-300 ${
        darkMode
          ? "bg-gray-900"
          : "bg-gray-100"
      }`}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-lg p-8 transition-colors duration-300 ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-900"
        }`}
      >

        {/* HEADER */}

        <div className="text-center mb-8">

          <h1
            className={`text-3xl font-bold ${
              darkMode
                ? "text-white"
                : "text-gray-700"
            }`}
          >
            {t.profile}
          </h1>

          <p
            className={`mt-2 ${
              darkMode
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            {t.profileDesc}
          </p>

        </div>

        {/* DARK MODE */}

        <div className="flex justify-end mb-6">

          <button
            type="button"
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-lg transition ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {darkMode
              ? t.lightMode
              : t.darkMode}
          </button>

        </div>

        {/* AVATAR */}

        <div className="flex flex-col items-center">

          <label className="relative cursor-pointer group">

            <img
              src={
                preview
                  ? preview
                  : user.avatar
                  ? `http://localhost:3000${user.avatar}`
                  : "https://ui-avatars.com/api/?name=User"
              }
              alt="Avatar"
              className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const selectedFile =
                    e.target.files[0];

                  setFile(selectedFile);

                  setPreview(
                    URL.createObjectURL(
                      selectedFile
                    )
                  );
                }
              }}
            />

            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-semibold">

              <div className="text-center">

                <PencilSquareIcon className="w-7 h-7 mx-auto mb-1" />

                <span className="text-sm">
                  {t.changePhoto}
                </span>

              </div>

            </div>

          </label>

          <h2
            className={`text-2xl font-bold mt-4 ${
              darkMode
                ? "text-white"
                : "text-gray-700"
            }`}
          >
            {user.name}
          </h2>

          <p
            className={`${
              darkMode
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            {user.email}
          </p>

          <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {user.role.toUpperCase()}
          </span>

        </div>

        {/* ACCOUNT INFORMATION */}

        <div className="w-full max-w-md mx-auto mt-8">

          <h3
            className={`text-xl font-semibold border-b pb-2 ${
              darkMode
                ? "text-white border-gray-600"
                : "text-gray-700 border-gray-300"
            }`}
          >
            {t.accountInfo}
          </h3>

          <div className="mt-4 space-y-3">

            {/* ROLE */}

            <div className="flex items-center justify-between gap-4">

              <span
                className={`min-w-[80px] ${
                  darkMode
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {t.role}
              </span>

              <span
                className={`font-semibold text-right ${
                  darkMode
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {user.role.toUpperCase()}
              </span>

            </div>

            {/* EMAIL */}

            <div className="flex items-center justify-between gap-4">

              <span
                className={`min-w-[80px] ${
                  darkMode
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {t.email}
              </span>

              <span
                className={`font-semibold text-right break-all ${
                  darkMode
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {user.email}
              </span>

            </div>

            {/* USER ID */}

            <div className="flex items-center justify-between gap-4">

              <span
                className={`min-w-[80px] ${
                  darkMode
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {t.userId}
              </span>

              <span
                className={`font-semibold text-right ${
                  darkMode
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {user._id.slice(-8)}
              </span>

            </div>

            {/* CREATED */}

            <div className="flex items-center justify-between gap-4">

              <span
                className={`min-w-[80px] ${
                  darkMode
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
              >
                {t.created}
              </span>

              <span
                className={`font-semibold text-right ${
                  darkMode
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {new Date(
                  user.createdAt
                ).toLocaleDateString()}
              </span>

            </div>

          </div>

        </div>

        {/* BALANCE */}

        <div className="flex items-center justify-between gap-4">

          <span
            className={`min-w-[80px] ${
              darkMode
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            {t.balance}
           </span>

           <button
             type="button"
             onClick={() => router.push("/deposit")}
             className={`font-semibold text-right hover:underline ${
               darkMode
                 ? "text-white"
                 : "text-gray-700"
             }`}
           >
             ${Number(user.balance || 0).toFixed(2)}
           </button>

         </div>

        {/* PROFILE INFORMATION */}

        <div className="flex flex-col items-center gap-4 mt-8">

          <h3
            className={`w-full max-w-md text-xl font-semibold border-b pb-2 ${
              darkMode
                ? "text-white border-gray-600"
                : "text-gray-700 border-gray-300"
            }`}
          >
            {t.profileInfo}
          </h3>

          <label
            className={`w-full max-w-md text-sm font-semibold ${
              darkMode
                ? "text-gray-200"
                : "text-gray-700"
            }`}
          >
            {t.fullName}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder={t.fullName}
            className={`w-full max-w-md rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />

          {/* 2FA STATUS */}

          <div className="flex items-center gap-2 mt-2">

            <span
              className={`font-semibold ${
                darkMode
                  ? "text-white"
                  : "text-gray-700"
              }`}
            >
              {t.twoFactor}:
            </span>

            {user.twoFactorEnabled ? (
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                {t.enabled}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                {t.disabled}
              </span>
            )}

          </div>

          {/* CHANGE PASSWORD */}

          <h3
            className={`w-full max-w-md text-xl font-semibold border-b pb-2 mt-8 ${
              darkMode
                ? "text-white border-gray-600"
                : "text-gray-700 border-gray-300"
            }`}
          >
            {t.changePassword}
          </h3>

          <label
            className={`w-full max-w-md text-sm font-semibold ${
              darkMode
                ? "text-gray-300"
                : "text-gray-700"
            }`}
          >
            {t.currentPassword}
          </label>

          <input
            type="password"
            placeholder={t.currentPassword}
            value={oldPassword}
            onChange={(e) =>
              setOldPassword(e.target.value)
            }
            className={`w-full max-w-md rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />

          <label
            className={`w-full max-w-md text-sm font-semibold ${
              darkMode
                ? "text-gray-300"
                : "text-gray-700"
            }`}
          >
            {t.newPassword}
          </label>

          <input
            type="password"
            placeholder={t.newPassword}
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            className={`w-full max-w-md rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />

          {/* BUTTONS */}

          <div className="flex flex-col w-full max-w-md gap-3 mt-4">

            {/* UPLOAD */}

            <button
              type="button"
              onClick={handleUploadAvatar}
              className="py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />

              {t.uploadAvatar}
            </button>

            {/* SAVE */}

            <button
              type="button"
              onClick={handleUpdate}
              className="py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <PencilSquareIcon className="w-5 h-5" />

              {t.saveChanges}
            </button>

            {/* CHANGE PASSWORD */}

            <button
              type="button"
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                  {t.changing}
                </>
              ) : (
                <>
                  <KeyIcon className="w-5 h-5" />

                  {t.changePassword}
                </>
              )}
            </button>

          </div>

          {/* TWO FACTOR */}

          <h3
            className={`w-full max-w-md text-xl font-semibold border-b pb-2 mt-8 ${
              darkMode
                ? "text-white border-gray-600"
                : "text-gray-700 border-gray-300"
            }`}
          >
            {t.twoFactor}
          </h3>

          <p
            className={`w-full max-w-md text-sm ${
              darkMode
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            {t.securityDesc}
          </p>

          <button
            type="button"
            onClick={handleSetup2FA}
            className="mt-4 px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition flex items-center justify-center gap-2"
          >
            <ShieldCheckIcon className="w-5 h-5" />

            {t.setup2FA}
          </button>

          {/* QR CODE */}

          {qrCode && (
            <div className="flex flex-col items-center gap-5 mt-8">

              <img
                src={qrCode}
                alt="QR Code"
                width={220}
                className="rounded-lg bg-white p-2"
              />

              <p
                className={`${
                  darkMode
                    ? "text-gray-200"
                    : "text-gray-700"
                }`}
              >
                Secret: <b>{secret}</b>
              </p>

              <input
                type="text"
                inputMode="numeric"
                placeholder={t.authCode}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value)
                }
                className={`w-full max-w-md rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />

              <button
                type="button"
                onClick={handleVerify2FA}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <ShieldCheckIcon className="w-5 h-5" />

                {t.verify2FA}
              </button>

            </div>
          )}

        </div>

        {/* LOGOUT */}

        <div className="flex justify-center mt-8">

          <button
            type="button"
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-md flex items-center gap-2"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />

            {t.logout}
          </button>

        </div>

      </div>
    </div>
  );
}