"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "../../lib/api";
import AuthGuard from "@/components/AuthGuard";

type LanguageCode = "en" | "uz" | "ru" | "tr" | "ar";

export default function ServicesPage() {
  const [language, setLanguage] =
    useState<LanguageCode>("en");

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [categories, setCategories] =
    useState<any[]>([]);

  const [services, setServices] =
    useState<any[]>([]);

  const [selectedService, setSelectedService] =
    useState<any>(null);

  const [search, setSearch] =
    useState("");

  const [orderData, setOrderData] =
    useState<Record<string, any>>({});

  const [submitting, setSubmitting] =
    useState(false);

  const searchParams =
    useSearchParams();

  const serviceId =
    searchParams.get("service");

  const categoryParam =
    searchParams.get("category");

  const router = useRouter();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  // =====================================================
  // TRANSLATIONS
  // =====================================================

  const translations = {
    en: {
      availableServices: "Available Services",
      chooseService:
        "Choose an available service",

      menu: "Menu",

      imeiService: "IMEI Service",
      serverService: "Server Service",
      rentService: "Rent Service",
      remoteService: "Remote Service",

      profile: "Profile",
      login: "Login",

      close: "Close",

      loginToOrder:
        "Login to Order",

      rentNow:
        "Rent Now",

      orderNow:
        "Order Now",

      selectOption:
        "Select an option",

      required:
        "is required.",

      imei:
        "IMEI",

      imeiPlaceholder:
        "Enter IMEI",

      lockPicture:
        "Lock Picture",

      selectLockPicture:
        "Select Lock Picture",

      uploadImage:
        "Upload Image",

      selectedImage:
        "Selected image",

      notes:
        "Notes",

      notesPlaceholder:
        "Enter notes",

      rentCreated:
        "Rent order created successfully!",

      remoteCreated:
        "Remote order created successfully!",

      orderCreated:
        "Order created successfully!",

      failedOrder:
        "Failed to create order.",

      processing:
        "Processing...",
    },

    uz: {
      availableServices:
        "Mavjud xizmatlar",

      chooseService:
        "Mavjud xizmatlardan birini tanlang",

      menu:
        "Menyu",

      imeiService:
        "IMEI xizmati",

      serverService:
        "Server xizmati",

      rentService:
        "Ijara xizmati",

      remoteService:
        "Masofaviy xizmat",

      profile:
        "Profil",

      login:
        "Kirish",

      close:
        "Yopish",

      loginToOrder:
        "Buyurtma berish uchun kiring",

      rentNow:
        "Hozir ijaraga olish",

      orderNow:
        "Buyurtma berish",

      selectOption:
        "Variantni tanlang",

      required:
        "majburiy.",

      imei:
        "IMEI",

      imeiPlaceholder:
        "IMEI kiriting",

      lockPicture:
        "Lock rasmi",

      selectLockPicture:
        "Lock rasmini tanlang",

      uploadImage:
        "Rasm yuklash",

      selectedImage:
        "Tanlangan rasm",

      notes:
        "Izoh",

      notesPlaceholder:
        "Izoh kiriting",

      rentCreated:
        "Ijara buyurtmasi muvaffaqiyatli yaratildi!",

      remoteCreated:
        "Masofaviy buyurtma muvaffaqiyatli yaratildi!",

      orderCreated:
        "Buyurtma muvaffaqiyatli yaratildi!",

      failedOrder:
        "Buyurtma yaratishda xatolik yuz berdi.",

      processing:
        "Yuborilmoqda...",
    },

    ru: {
      availableServices:
        "Доступные услуги",

      chooseService:
        "Выберите доступную услугу",

      menu:
        "Меню",

      imeiService:
        "Услуги IMEI",

      serverService:
        "Серверные услуги",

      rentService:
        "Аренда",

      remoteService:
        "Удаленный сервис",

      profile:
        "Профиль",

      login:
        "Войти",

      close:
        "Закрыть",

      loginToOrder:
        "Войдите, чтобы заказать",

      rentNow:
        "Арендовать сейчас",

      orderNow:
        "Заказать",

      selectOption:
        "Выберите вариант",

      required:
        "обязательно.",

      imei:
        "IMEI",

      imeiPlaceholder:
        "Введите IMEI",

      lockPicture:
        "Lock изображение",

      selectLockPicture:
        "Выберите Lock изображение",

      uploadImage:
        "Загрузить изображение",

      selectedImage:
        "Выбранное изображение",

      notes:
        "Примечания",

      notesPlaceholder:
        "Введите примечание",

      rentCreated:
        "Заказ на аренду успешно создан!",

      remoteCreated:
        "Удаленный заказ успешно создан!",

      orderCreated:
        "Заказ успешно создан!",

      failedOrder:
        "Не удалось создать заказ.",

      processing:
        "Обработка...",
    },

    tr: {
      availableServices:
        "Mevcut Hizmetler",

      chooseService:
        "Mevcut bir hizmet seçin",

      menu:
        "Menü",

      imeiService:
        "IMEI Hizmeti",

      serverService:
        "Sunucu Hizmeti",

      rentService:
        "Kiralama Hizmeti",

      remoteService:
        "Uzaktan Hizmet",

      profile:
        "Profil",

      login:
        "Giriş",

      close:
        "Kapat",

      loginToOrder:
        "Sipariş vermek için giriş yapın",

      rentNow:
        "Şimdi Kirala",

      orderNow:
        "Sipariş Ver",

      selectOption:
        "Bir seçenek seçin",

      required:
        "zorunludur.",

      imei:
        "IMEI",

      imeiPlaceholder:
        "IMEI girin",

      lockPicture:
        "Lock resmi",

      selectLockPicture:
        "Lock resmi seçin",

      uploadImage:
        "Resim yükle",

      selectedImage:
        "Seçilen resim",

      notes:
        "Notlar",

      notesPlaceholder:
        "Not girin",

      rentCreated:
        "Kiralama siparişi başarıyla oluşturuldu!",

      remoteCreated:
        "Uzaktan sipariş başarıyla oluşturuldu!",

      orderCreated:
        "Sipariş başarıyla oluşturuldu!",

      failedOrder:
        "Sipariş oluşturulamadı.",

      processing:
        "İşleniyor...",
    },

    ar: {
      availableServices:
        "الخدمات المتاحة",

      chooseService:
        "اختر خدمة متاحة",

      menu:
        "القائمة",

      imeiService:
        "خدمة IMEI",

      serverService:
        "خدمة الخادم",

      rentService:
        "خدمة التأجير",

      remoteService:
        "الخدمة عن بُعد",

      profile:
        "الملف الشخصي",

      login:
        "تسجيل الدخول",

      close:
        "إغلاق",

      loginToOrder:
        "تسجيل الدخول للطلب",

      rentNow:
        "استئجار الآن",

      orderNow:
        "اطلب الآن",

      selectOption:
        "اختر خيارًا",

      required:
        "مطلوب.",

      imei:
        "IMEI",

      imeiPlaceholder:
        "أدخل IMEI",

      lockPicture:
        "صورة القفل",

      selectLockPicture:
        "اختر صورة القفل",

      uploadImage:
        "رفع صورة",

      selectedImage:
        "الصورة المحددة",

      notes:
        "ملاحظات",

      notesPlaceholder:
        "أدخل الملاحظات",

      rentCreated:
        "تم إنشاء طلب التأجير بنجاح!",

      remoteCreated:
        "تم إنشاء الطلب عن بُعد بنجاح!",

      orderCreated:
        "تم إنشاء الطلب بنجاح!",

      failedOrder:
        "فشل إنشاء الطلب.",

      processing:
        "جاري المعالجة...",
    },
  };

  const t =
    translations[language];

  // =====================================================
  // LOAD LANGUAGE
  // =====================================================

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem("language");

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/profile");

        setOrderData((prev) => ({
          ...prev,
          userBalance: res.data.data.balance,
        }));
      } catch (error) {
        console.log("BALANCE ERROR:", error);
      }
    };

    fetchProfile();
  }, []);

  // =====================================================
  // FETCH CATEGORIES + SERVICES
  // =====================================================

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const fetchCategories =
    async () => {
      try {
        const res =
          await API.get("/categories");

        setCategories(
          res.data.data
        );
      } catch (error) {
        console.log(
          "GET CATEGORIES ERROR:",
          error
        );
      }
    };

  const fetchServices =
    async () => {
      try {
        const res =
          await API.get("/services");

        console.log(
          "SERVICES:",
          JSON.stringify(
            res.data.data,
            null,
            2
          )
        );

        setServices(
          res.data.data
        );
      } catch (error) {
        console.log(
          "GET SERVICES ERROR:",
          error
        );
      }
    };

  // =====================================================
  // SELECT SERVICE FROM URL
  // =====================================================

  useEffect(() => {
    if (
      serviceId &&
      services.length > 0
    ) {
      const service =
        services.find(
          (item) =>
            item._id === serviceId
        );

      if (service) {
        setSelectedService(
          service
        );
      }
    }
  }, [
    serviceId,
    services,
  ]);

  // =====================================================
  // RENT
  // =====================================================

  const isRentService =
    selectedService?.category ===
    "RENT SERVICE";

  // =====================================================
  // UPDATE ORDER DATA
  // =====================================================

  const updateOrderData = (
    name: string,
    value: any
  ) => {
    setOrderData(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  // =====================================================
  // IMAGE -> BASE64
  // =====================================================

  const fileToBase64 = (
    file: File
  ): Promise<string> => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.readAsDataURL(
          file
        );

        reader.onload = () =>
          resolve(
            String(
              reader.result
            )
          );

        reader.onerror = reject;
      }
    );
  };

  // =====================================================
  // IMAGE FIELD
  // =====================================================

  const handleImageChange =
    async (
      fieldName: string,
      file?: File
    ) => {
      if (!file) return;

      try {
        const base64 =
          await fileToBase64(
            file
          );

        updateOrderData(
          fieldName,
          base64
        );
      } catch (error) {
        console.error(
          "IMAGE ERROR:",
          error
        );
      }
    };

  // =====================================================
  // ORDER
  // =====================================================

  const handleOrder =
    async () => {
      if (
        !selectedService ||
        submitting
      ) {
        return;
      }

      const hasOrderFields =
        Array.isArray(
          selectedService?.orderFields
        ) &&
        selectedService
          .orderFields.length >
          0;

      // =================================================
      // LOGIN
      // =================================================

      if (!token) {
        router.push(
          `/login?service=${selectedService._id}`
        );

        return;
      }

      // =================================================
      // IMEI VALIDATION
      // =================================================

      if (
        selectedService
          ?.orderSettings?.imei
      ) {
        const imei =
          orderData.imei;

        if (
          !imei ||
          String(imei).trim() === ""
        ) {
          alert(
            `${t.imei} ${t.required}`
          );

          return;
        }
      }

      // =================================================
      // CUSTOM FIELD VALIDATION
      // =================================================

      if (hasOrderFields) {
        for (
          const field of
            selectedService.orderFields
        ) {
          const value =
            orderData[
              field.name
            ];

          if (
            field.required &&
            (
              value === undefined ||
              value === null ||
              String(value).trim() === ""
            )
          ) {
            alert(
              `${field.label || field.name} ${t.required}`
            );

            return;
          }
        }
      }

      try {
        setSubmitting(true);

        // ===============================================
        // RENT SERVICE
        // ===============================================

        if (isRentService) {
          const res =
            await API.post(
              "/rent",
              {
                serviceId:
                  selectedService._id,
              }
            );

          console.log(
            "RENT ORDER CREATED:",
            res.data
          );

          setSelectedService(
            null
          );

          setOrderData({});

          router.push(
            "/rent-orders"
          );

          alert(
            t.rentCreated
          );

          return;
        }

        // ===============================================
        // REGULAR / REMOTE ORDER
        // ===============================================

        const res =
          await API.post(
            "/orders",
            {
              serviceId:
                selectedService._id,

              formData: {
                ...orderData,

                lockPictures:
                  Array.isArray(
                    selectedService.lockPictures
                  )
                    ? selectedService.lockPictures
                    : [],
              },
            }
          );

        console.log(
          "ORDER CREATED:",
          res.data
        );

        setSelectedService(
          null
        );

        setOrderData({});

        // ===============================================
        // REMOTE
        // ===============================================

        if (
          selectedService.category ===
          "REMOTE SERVICE"
        ) {
          router.push(
            "/remote-orders"
          );

          alert(
            t.remoteCreated
          );

          return;
        }

        // ===============================================
        // SERVER
        // ===============================================

        if (
          selectedService.category ===
          "SERVER SERVICE"
        ) {
          router.push(
            "/server-orders"
          );

          alert(
            t.orderCreated
          );

          return;
        }

        // ===============================================
        // IMEI / REGULAR
        // ===============================================

        router.push(
          "/imei-orders"
        );

        alert(
          t.orderCreated
        );
      } catch (error) {
        console.log(
          "CREATE ORDER ERROR:",
          error
        );

        alert(
          t.failedOrder
        );
      } finally {
        setSubmitting(false);
      }
    };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <AuthGuard>
      <main
        dir={
          language === "ar"
            ? "rtl"
            : "ltr"
        }
        className="min-h-screen bg-gray-950 text-white"
      >

        {/* =================================================
            NAVBAR
        ================================================= */}

        <nav className="relative border-b border-white/10 bg-[#020817]">

          <div className="flex items-center px-6 py-5 md:px-8">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  setMenuOpen(
                    !menuOpen
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-2xl text-white transition hover:bg-white/10"
                aria-label={
                  t.menu
                }
              >
                {menuOpen
                  ? "✕"
                  : "☰"}
              </button>

              <Image
                src="/wordmark.png"
                alt="AngryGSMService"
                width={220}
                height={60}
                className="h-15 w-auto object-contain"
              />

            </div>

            <div className="ml-auto flex items-center gap-2">

              {/* TELEGRAM */}

              <a
                href="https://t.me/angryunlockservice"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Admin"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-400 transition hover:bg-sky-400/20"
              >
                <span className="text-lg font-bold">
                  ✈
                </span>
              </a>

              {/* WHATSAPP */}

              <a
                href="https://wa.me/998943521234"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Admin"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-400/20 bg-green-400/10 text-green-400 transition hover:bg-green-400/20"
              >
                <span className="text-lg font-bold">
                  ☎
                </span>
              </a>

              {/* BALANCE */}

              <button
                type="button"
                onClick={() => router.push("/deposit")}
                className="rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-semibold text-green-400 transition hover:bg-green-400/20"
              >
                Balance: $
                {Number(
                  orderData.userBalance || 0
                ).toFixed(2)}
              </button>

            </div>

          </div>

          {/* =================================================
              MENU
          ================================================= */}

          {menuOpen && (
            <div className="absolute left-6 top-full z-50 mt-2 w-80 rounded-xl border border-white/10 bg-[#020817] p-4 shadow-2xl md:left-8">

              <div className="flex flex-col gap-2">

                <a
                  href="/services?category=IMEI%20SERVICE"
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                  className={`flex items-center justify-between rounded-lg px-4 py-3 transition ${
                    categoryParam ===
                    "IMEI SERVICE"
                      ? "border border-green-400/30 bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <span>
                    {
                      t.imeiService
                    }
                  </span>

                  {categoryParam ===
                    "IMEI SERVICE" && (
                    <span className="text-green-400">
                      ✓
                    </span>
                  )}
                </a>

                <a
                  href="/services?category=SERVER%20SERVICE"
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                  className={`flex items-center justify-between rounded-lg px-4 py-3 transition ${
                    categoryParam ===
                    "SERVER SERVICE"
                      ? "border border-green-400/30 bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <span>
                    {
                      t.serverService
                    }
                  </span>

                  {categoryParam ===
                    "SERVER SERVICE" && (
                    <span className="text-green-400">
                      ✓
                    </span>
                  )}
                </a>

                <a
                  href="/services?category=RENT%20SERVICE"
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                  className={`flex items-center justify-between rounded-lg px-4 py-3 transition ${
                    categoryParam ===
                    "RENT SERVICE"
                      ? "border border-green-400/40 bg-green-500/10 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <span>
                    {
                      t.rentService
                    }
                  </span>

                  {categoryParam ===
                    "RENT SERVICE" && (
                    <span className="text-green-400">
                      ✓
                    </span>
                  )}
                </a>

                <a
                  href="/services?category=REMOTE%20SERVICE"
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                  className={`flex items-center justify-between rounded-lg px-4 py-3 transition ${
                    categoryParam ===
                    "REMOTE SERVICE"
                      ? "border border-green-400/40 bg-green-500/10 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <span>
                    {
                      t.remoteService
                    }
                  </span>

                  {categoryParam ===
                    "REMOTE SERVICE" && (
                    <span className="text-green-400">
                      ✓
                    </span>
                  )}
                </a>

                <a
                  href="/profile"
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                  className="mt-2 rounded-lg border border-white/10 px-4 py-3 transition hover:bg-white/10"
                >
                  {t.profile}
                </a>

                <a
                  href="/imei-orders"
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                  className="rounded-lg border border-white/10 px-4 py-3 transition hover:bg-white/10"
                >
                  IMEI Orders
                </a>
                <a
                  href="/server-orders"
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                  className="rounded-lg border border-white/10 px-4 py-3 transition hover:bg-white/10"
                >
                  Server Orders
                </a>

                <a
                  href="/rent-orders"
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                  className="rounded-lg border border-white/10 px-4 py-3 transition hover:bg-white/10"
                >
                  Rent Orders
                </a>

                <a
                  href="/remote-orders"
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                  className="rounded-lg border border-white/10 px-4 py-3 transition hover:bg-white/10"
                >
                  Remote Orders
                </a>

              </div>

            </div>
          )}
        </nav>

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="flex justify-center py-8">
          <Image
            src="/logo.png"
            alt="AngryGSMService"
            width={220}
            height={220}
            className="h-44 w-44 object-contain"
          />
        </div>

        {/* =================================================
            SERVICES
        ================================================= */}

        <div className="p-6">

          <div className="space-y-6">

            {categoryParam && (
              <div className="mb-6">
                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search service..."
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>
            )}

            {categories
              .filter(
                (category) =>
                  category.status ===
                    "active" &&
                  category.name ===
                    categoryParam
              )
              .map(
                (category) => (
                  <div
                    key={
                      category._id
                    }
                    className="rounded-xl border border-gray-800 bg-gray-900 p-5"
                  >

                    <h2 className="text-xl font-semibold">
                      {
                        category.name
                      }
                    </h2>

                    <div className="mt-4 space-y-4">

                      {services
                        .filter(
                          (service) =>
                            service.category ===
                              category.name &&
                            service.status ===
                              "active" &&
                            (
                              service.name
                                ?.toLowerCase()
                                .includes(
                                  search.toLowerCase()
                                ) ||
                              service.description
                                ?.toLowerCase()
                                .includes(
                                  search.toLowerCase()
                                )
                            )
                        )
                        .map(
                          (
                            service
                          ) => (
                            <div
                              key={
                                service._id
                              }
                              onClick={() => {
                                setSelectedService(
                                  service
                                );

                                setOrderData(
                                  {}
                                );
                              }}
                              className="group cursor-pointer rounded-xl border border-gray-700 bg-gray-950 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/60 hover:bg-gray-900 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]"
                            >

                              <div className="flex items-center justify-between gap-4">

                                <h3 className="font-semibold">
                                  {
                                    service.name
                                  }
                                </h3>

                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2">

                                <span className="whitespace-nowrap rounded-lg border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-sm font-semibold text-blue-300">
                                  {
                                    service.durationMin
                                  }
                                  –
                                  {
                                    service.durationMax
                                  }{" "}
                                  {
                                    service.durationUnit ||
                                    "minutes"
                                  }
                                </span>

                                <span className="whitespace-nowrap rounded-lg border border-green-400/20 bg-green-400/10 px-3 py-1.5 text-sm font-bold text-green-400">
                                  $
                                  {
                                    service.price
                                  }
                                </span>

                              </div>

                              {service.description && (
                                <p className="mt-1 text-sm text-gray-400">
                                  {
                                    service.description
                                  }
                                </p>
                              )}

                              <div className="mt-4 flex justify-end">

                                <span
                                  onClick={(
                                    e
                                  ) => {
                                    e.stopPropagation();

                                    setSelectedService(
                                      service
                                    );

                                    setOrderData(
                                      {}
                                    );
                                  }}
                                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition group-hover:bg-gray-200"
                                >
                                  {
                                    t.orderNow
                                  }
                                </span>

                              </div>

                            </div>
                          )
                        )}

                    </div>

                  </div>
                )
              )}

          </div>

        </div>

        {/* =================================================
            SERVICE MODAL
        ================================================= */}

        {selectedService && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() =>
              setSelectedService(
                null
              )
            }
          >

            <div
              className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 p-8 shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="grid grid-cols-[1fr_auto_auto] items-start gap-6">

                <h2 className="text-xl font-semibold leading-7">
                  {
                    selectedService.name
                  }
                </h2>

                {selectedService.price >
                0 ? (
                  <div className="whitespace-nowrap text-2xl font-bold text-white">
                    $
                    {
                      selectedService.price
                    }
                  </div>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={() =>
                    setSelectedService(
                      null
                    )
                  }
                  className="text-xl text-gray-400 hover:text-white"
                  aria-label={
                    t.close
                  }
                >
                  ✕
                </button>

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              {selectedService.description && (
                <p className="mt-4 text-sm text-gray-400">
                  {
                    selectedService.description
                  }
                </p>
              )}

              {/* =================================================
                  LOCK PICTURES
              ================================================= */}

              {!isRentService &&
                Array.isArray(
                  selectedService.lockPictures
                ) &&
                selectedService
                  .lockPictures.length >
                  0 && (
                  <div className="mt-6">

                    <h3 className="mb-3 text-sm font-semibold text-gray-300">
                      {
                        t.lockPicture
                      }
                    </h3>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

                      {selectedService.lockPictures.map(
                        (
                          picture: string,
                          index: number
                        ) => (
                          <div
                            key={`${picture}-${index}`}
                            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-950"
                          >

                            <img
                              src={
                                picture
                              }
                              alt={`Lock picture ${index + 1}`}
                              className="h-40 w-full object-cover transition duration-200 hover:scale-105"
                            />

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

              {/* =================================================
                  GLOBAL IMEI
              ================================================= */}

              {selectedService
                ?.orderSettings
                ?.imei && (
                <div className="mt-6">

                  <label className="mb-2 block text-sm font-medium text-gray-300">

                    {t.imei}

                    <span className="ml-1 text-red-400">
                      *
                    </span>

                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      orderData.imei ||
                      ""
                    }
                    onChange={(e) =>
                      updateOrderData(
                        "imei",
                        e.target.value
                      )
                    }
                    placeholder={
                      t.imeiPlaceholder
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-gray-500"
                  />

                </div>
              )}

              {/* =================================================
                  GLOBAL IMAGE
              ================================================= */}

              {selectedService
                ?.orderSettings
                ?.image && (
                <div className="mt-6">

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    {
                      t.uploadImage
                    }
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange(
                        "image",
                        e.target.files?.[0]
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-gray-300 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black"
                  />

                  {orderData.image && (
                    <div className="mt-4">

                      <p className="mb-2 text-xs text-gray-400">
                        {
                          t.selectedImage
                        }
                      </p>

                      <img
                        src={
                          orderData.image
                        }
                        alt="Uploaded"
                        className="max-h-64 rounded-lg border border-gray-700 object-contain"
                      />

                    </div>
                  )}

                </div>
              )}

              {/* =================================================
                  GLOBAL NOTES
              ================================================= */}

              {selectedService
                ?.orderSettings
                ?.notes && (
                <div className="mt-6">

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    {
                      t.notes
                    }
                  </label>

                  <textarea
                    value={
                      orderData.notes ||
                      ""
                    }
                    onChange={(e) =>
                      updateOrderData(
                        "notes",
                        e.target.value
                      )
                    }
                    placeholder={
                      t.notesPlaceholder
                    }
                    rows={4}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-gray-500"
                  />

                </div>
              )}

              {/* =================================================
                  CUSTOM ORDER FIELDS
              ================================================= */}

              {Array.isArray(
                selectedService.orderFields
              ) &&
                selectedService
                  .orderFields.length >
                  0 && (
                  <div className="mt-6 space-y-4">

                    {selectedService.orderFields.map(
                      (
                        field: any
                      ) => (
                        <div
                          key={
                            field.name
                          }
                        >

                          <label className="mb-2 block text-sm font-medium text-gray-300">

                            {
                              field.label ||
                              field.name
                            }

                            {field.required && (
                              <span className="ml-1 text-red-400">
                                *
                              </span>
                            )}

                          </label>

                          {/* TEXTAREA */}

                          {field.type ===
                          "textarea" ? (

                            <textarea
                              value={
                                orderData[
                                  field.name
                                ] ||
                                ""
                              }
                              onChange={(
                                e
                              ) =>
                                updateOrderData(
                                  field.name,
                                  e.target.value
                                )
                              }
                              placeholder={
                                field.placeholder ||
                                ""
                              }
                              rows={4}
                              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-gray-500"
                            />

                          ) : field.type ===
                            "select" ? (

                            <select
                              value={
                                orderData[
                                  field.name
                                ] ||
                                ""
                              }
                              onChange={(
                                e
                              ) =>
                                updateOrderData(
                                  field.name,
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-gray-500"
                            >

                              <option value="">
                                {
                                  field.placeholder ||
                                  t.selectOption
                                }
                              </option>

                              {(
                                field.options ||
                                []
                              ).map(
                                (
                                  option: string
                                ) => (
                                  <option
                                    key={
                                      option
                                    }
                                    value={
                                      option
                                    }
                                  >
                                    {
                                      option
                                    }
                                  </option>
                                )
                              )}

                            </select>

                          ) : field.type ===
                            "image" ? (

                            <div>

                              <input
                                type="file"
                                accept="image/*"
                                onChange={(
                                  e
                                ) =>
                                  handleImageChange(
                                    field.name,
                                    e.target.files?.[0]
                                  )
                                }
                                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-gray-300 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black"
                              />

                              {orderData[
                                field.name
                              ] && (
                                <img
                                  src={
                                    orderData[
                                      field.name
                                    ]
                                  }
                                  alt={
                                    field.label ||
                                    field.name
                                  }
                                  className="mt-4 max-h-64 rounded-lg border border-gray-700 object-contain"
                                />
                              )}

                            </div>

                          ) : (

                            <input
                              type={
                                field.type ===
                                "number"
                                  ? "number"
                                  : "text"
                              }
                              value={
                                orderData[
                                  field.name
                                ] ||
                                ""
                              }
                              onChange={(
                                e
                              ) =>
                                updateOrderData(
                                  field.name,
                                  e.target.value
                                )
                              }
                              placeholder={
                                field.placeholder ||
                                ""
                              }
                              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-gray-500"
                            />

                          )}

                        </div>
                      )
                    )}

                  </div>
                )}

              {/* =================================================
                  ORDER BUTTON
              ================================================= */}

              <div className="mt-8">

                <button
                  onClick={
                    handleOrder
                  }
                  disabled={
                    submitting
                  }
                  className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {submitting
                    ? t.processing
                    : !token
                      ? t.loginToOrder
                      : isRentService
                        ? t.rentNow
                        : t.orderNow}

                </button>

              </div>

            </div>

          </div>
        )}

      </main>
    </AuthGuard>
  );
}