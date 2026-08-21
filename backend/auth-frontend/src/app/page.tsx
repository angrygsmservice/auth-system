"use client";

import { useEffect, useState } from "react";

type LanguageCode = "en" | "uz" | "ru" | "tr" | "ar";

type Language = {
  code: LanguageCode;
  name: string;
  flag: string;
};

export default function Home() {
  const [language, setLanguage] =
    useState<LanguageCode>("en");

  const [menuOpen, setMenuOpen] = useState(false);

  // =========================
  // LOAD SAVED LANGUAGE
  // =========================

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

  // =========================
  // CHANGE LANGUAGE
  // =========================

  const changeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // =========================
  // LANGUAGES
  // =========================

  const languages: Language[] = [
    {
      code: "en",
      name: "English",
      flag: "🇬🇧",
    },
    {
      code: "uz",
      name: "O‘zbek",
      flag: "🇺🇿",
    },
    {
      code: "ru",
      name: "Русский",
      flag: "🇷🇺",
    },
    {
      code: "tr",
      name: "Türkçe",
      flag: "🇹🇷",
    },
    {
      code: "ar",
      name: "العربية",
      flag: "🇸🇦",
    },
  ];

  // =========================
  // TRANSLATIONS
  // =========================

  const translations = {
    en: {
      language: "🇬🇧 English",
      login: "Login",
      profile: "Profile",

      welcome: "Welcome to AngryGSMService",

      title: "Professional GSM & Mobile Services",

      description:
        "Fast, reliable and professional solutions for GSM, IMEI and mobile device services. Get the service you need with trusted support.",

      telegram: "Join Our Telegram",
      whatsapp: "Join Our WhatsApp",
      admin: "Contact Admin",

      services: "Our Services",

      imei: "IMEI Service",
      imeiDesc:
        "Professional device and IMEI related services.",

      rent: "Rent Service",
      rentDesc:
        "Professional device rental and related services.",

      server: "Server Service",
      serverDesc:
        "Server based services and account management.",

      remote: "Remote Service",
      remoteDesc:
        "Fast remote assistance and professional service.",

      menu: "Menu",
    },

    uz: {
      language: "🇺🇿 O‘zbek",
      login: "Kirish",
      profile: "Profil",

      welcome: "AngryGSMService'ga xush kelibsiz",

      title: "Professional GSM va mobil xizmatlar",

      description:
        "GSM, IMEI va mobil qurilmalar uchun tezkor, ishonchli va professional xizmatlar.",

      telegram: "Telegram kanalimizga qo‘shiling",
      whatsapp: "WhatsApp kanalimizga qo‘shiling",
      admin: "Admin bilan bog‘lanish",

      services: "Bizning xizmatlarimiz",

      imei: "IMEI xizmati",
      imeiDesc:
        "Qurilmalar va IMEI bilan bog‘liq professional xizmatlar.",

      rent: "Ijara xizmati",
      rentDesc:
        "Professional qurilma ijarasi va tegishli xizmatlar.",

      server: "Server xizmati",
      serverDesc:
        "Server xizmatlari va akkauntlarni boshqarish.",

      remote: "Masofaviy xizmat",
      remoteDesc:
        "Tezkor masofaviy yordam va professional xizmat.",

      menu: "Menyu",
    },

    ru: {
      language: "🇷🇺 Русский",
      login: "Войти",
      profile: "Профиль",

      welcome: "Добро пожаловать в AngryGSMService",

      title:
        "Профессиональные GSM и мобильные услуги",

      description:
        "Быстрые, надежные и профессиональные решения для GSM, IMEI и мобильных устройств.",

      telegram: "Наш Telegram",
      whatsapp: "Наш WhatsApp",
      admin: "Связаться с администратором",

      services: "Наши услуги",

      imei: "Услуги IMEI",
      imeiDesc:
        "Профессиональные услуги для устройств и IMEI.",

      rent: "Аренда",
      rentDesc:
        "Профессиональная аренда устройств и сопутствующие услуги.",

      server: "Серверные услуги",
      serverDesc:
        "Серверные услуги и управление аккаунтами.",

      remote: "Удаленный сервис",
      remoteDesc:
        "Быстрая удаленная помощь и профессиональный сервис.",

      menu: "Меню",
    },

    tr: {
      language: "🇹🇷 Türkçe",
      login: "Giriş",
      profile: "Profil",

      welcome: "AngryGSMService'e Hoş Geldiniz",

      title:
        "Profesyonel GSM ve Mobil Hizmetler",

      description:
        "GSM, IMEI ve mobil cihazlar için hızlı, güvenilir ve profesyonel çözümler.",

      telegram: "Telegram Kanalımıza Katılın",
      whatsapp: "WhatsApp Kanalımıza Katılın",
      admin: "Yöneticiyle İletişime Geç",

      services: "Hizmetlerimiz",

      imei: "IMEI Hizmeti",
      imeiDesc:
        "Cihazlar ve IMEI ile ilgili profesyonel hizmetler.",

      rent: "Kiralama Hizmeti",
      rentDesc:
        "Profesyonel cihaz kiralama ve ilgili hizmetler.",

      server: "Sunucu Hizmeti",
      serverDesc:
        "Sunucu tabanlı hizmetler ve hesap yönetimi.",

      remote: "Uzaktan Hizmet",
      remoteDesc:
        "Hızlı uzaktan destek ve profesyonel hizmet.",

      menu: "Menü",
    },

    ar: {
      language: "🇸🇦 العربية",
      login: "تسجيل الدخول",
      profile: "الملف الشخصي",

      welcome: "مرحبًا بكم في AngryGSMService",

      title:
        "خدمات GSM والهواتف المحمولة الاحترافية",

      description:
        "حلول سريعة وموثوقة واحترافية لخدمات GSM وIMEI والأجهزة المحمولة.",

      telegram: "انضم إلى قناتنا على Telegram",
      whatsapp: "انضم إلى قناتنا على WhatsApp",
      admin: "تواصل مع المسؤول",

      services: "خدماتنا",

      imei: "خدمة IMEI",
      imeiDesc:
        "خدمات احترافية متعلقة بالأجهزة وأرقام IMEI.",

      rent: "خدمة التأجير",
      rentDesc:
        "تأجير الأجهزة بشكل احترافي والخدمات ذات الصلة.",

      server: "خدمة الخادم",
      serverDesc:
        "خدمات تعتمد على الخوادم وإدارة الحسابات.",

      remote: "الخدمة عن بُعد",
      remoteDesc:
        "مساعدة سريعة عن بُعد وخدمة احترافية.",

      menu: "القائمة",
    },
  };

  const t = translations[language];

  return (
    <main
      dir={language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-gray-950 text-white"
    >
      {/* =========================
          TOP INFORMATION BAR
      ========================= */}

      <div className="w-full border-b border-white/10 bg-[#020817]">
        <div className="flex w-full items-center justify-between px-4 py-3">

          {/* LEFT */}

          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              📞 +998943521234
            </span>

            <span className="hidden items-center gap-2 sm:flex">
              ✉️ angrygsmservice@gmail.com
            </span>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-5">

            {/* CURRENCY */}

            <button
              type="button"
              className="text-white transition hover:text-blue-400"
            >
              $
            </button>

            {/* LANGUAGE */}

            <div className="relative group">

              <button
                type="button"
                className="flex items-center gap-2 text-white transition hover:text-blue-400"
              >
                {t.language}

                <span>⌄</span>
              </button>

              <div className="invisible absolute right-0 top-full z-50 mt-2 max-h-96 w-56 overflow-y-auto rounded-lg border border-white/10 bg-[#020817] opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">

                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() =>
                      changeLanguage(lang.code)
                    }
                    className={`w-full px-4 py-3 text-left transition hover:bg-white/10 ${
                      lang.code === language
                        ? "bg-white/10"
                        : ""
                    }`}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="relative flex items-center justify-between border-b border-white/10 bg-[#020817] px-6 py-5 md:px-8">

        {/* LOGO */}

        <h1 className="text-2xl font-bold">
          AngryGSMService
        </h1>

        {/* DESKTOP MENU */}

        <div className="hidden items-center gap-4 md:flex">

          <a
            href="/login"
            className="rounded-lg border border-white/40 px-5 py-2 transition hover:bg-white/10"
          >
            {t.login}
          </a>

          <a
            href="/profile"
            className="rounded-lg border border-white/40 px-5 py-2 transition hover:bg-white/10"
          >
            {t.profile}
          </a>

        </div>

        {/* MOBILE HAMBURGER */}

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-2xl transition hover:bg-white/10 md:hidden"
          aria-label={t.menu}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* MOBILE MENU */}

        {menuOpen && (
          <div className="absolute left-0 right-0 top-full z-50 border-b border-white/10 bg-[#020817] px-6 py-5 shadow-2xl md:hidden">

            <div className="flex flex-col gap-3">

              {/* LOGIN */}

              <a
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-white/20 px-4 py-3 transition hover:bg-white/10"
              >
                {t.login}
              </a>

              {/* PROFILE */}

              <a
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-white/20 px-4 py-3 transition hover:bg-white/10"
              >
                {t.profile}
              </a>

              <a
                href="/services"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-white/20 px-4 py-3 transition hover:bg-white/10"
              >
                Available Services
               </a>

              {/* LANGUAGE TITLE */}

              <div className="mt-2 border-t border-white/10 pt-4">

                <p className="mb-3 text-sm text-gray-400">
                  {t.language}
                </p>

                <div className="grid grid-cols-2 gap-2">

                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        changeLanguage(lang.code);
                        setMenuOpen(false);
                      }}
                      className={`rounded-lg px-3 py-3 text-left transition hover:bg-white/10 ${
                        lang.code === language
                          ? "bg-white/10"
                          : ""
                      }`}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}

                </div>
              </div>

            </div>
          </div>
        )}
      </nav>

      {/* =========================
          HERO
      ========================= */}

      <section className="flex min-h-[70vh] items-center justify-center px-6">

        <div className="max-w-4xl text-center">

          {/* WELCOME */}

          <p className="mb-4 font-semibold uppercase tracking-wider text-blue-500">
            {t.welcome}
          </p>

          {/* TITLE */}

          <h2 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            {t.title}
          </h2>

          {/* DESCRIPTION */}

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            {t.description}
          </p>

          {/* BUTTONS */}

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            {/* TELEGRAM */}
            <a
              href="https://t.me/angrygsmservice"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-700"
            >
              {t.telegram}
            </a>

            {/* WHATSAPP */}
            <a
              href="https://www.whatsapp.com/channel/0029VbDK6xqInlqL1NBqqE3w"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-green-600 px-7 py-3 font-semibold transition hover:bg-green-700"
            >
              {t.whatsapp}
            </a>

            {/* ADMIN */}
            <a
              href="https://t.me/angryunlockservice"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-700 px-7 py-3 font-semibold transition hover:bg-gray-800"
            >
              {t.admin}
            </a>

          </div>
        </div>
      </section>

      {/* =========================
          SERVICES
      ========================= */}

      <section
        id="services"
        className="px-6 pb-20 md:px-8"
      >
        <div className="mx-auto max-w-6xl">

          <h2 className="mb-10 text-center text-3xl font-bold">
            {t.services}
          </h2>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">

            {/* IMEI */}

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">

              <h3 className="mb-3 text-xl font-bold">
                {t.imei}
              </h3>

              <p className="text-gray-400">
                {t.imeiDesc}
              </p>

            </div>

            {/* RENT */}

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">

              <h3 className="mb-3 text-xl font-bold">
                {t.rent}
              </h3>

              <p className="text-gray-400">
                {t.rentDesc}
              </p>

            </div>

            {/* SERVER */}

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">

              <h3 className="mb-3 text-xl font-bold">
                {t.server}
              </h3>

              <p className="text-gray-400">
                {t.serverDesc}
              </p>

            </div>

            {/* REMOTE */}

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">

              <h3 className="mb-3 text-xl font-bold">
                {t.remote}
              </h3>

              <p className="text-gray-400">
                {t.remoteDesc}
              </p>

            </div>

          </div>
        </div>
      </section>
    </main>
  );
}