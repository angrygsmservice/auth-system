"use client";

import { createContext, useContext, useEffect, useState } from "react";

type DarkModeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const DarkModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");

    if (saved) {
      setDarkMode(saved === "true");
    }

    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;

    setDarkMode(newMode);

    localStorage.setItem("darkMode", String(newMode));
  };

  if (!mounted) {
    return null;
  }

  return (
    <DarkModeContext.Provider
      value={{ darkMode, toggleDarkMode }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);