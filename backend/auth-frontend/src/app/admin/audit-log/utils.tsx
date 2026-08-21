import type { Activity } from "./types";

import {
  Trash2,
  Pencil,
  LogIn,
  Plus,
  RotateCcw,
} from "lucide-react";


export const getActionStyle = (
  action: Activity["action"],
  darkMode: boolean
) => {
  switch (action) {
    case "delete":
      return darkMode
        ? "bg-red-900 text-red-300"
        : "bg-red-100 text-red-700";

    case "restore":
      return darkMode
        ? "bg-purple-900 text-purple-300"
        : "bg-purple-100 text-purple-700";

    case "update":
      return darkMode
        ? "bg-yellow-900 text-yellow-300"
        : "bg-yellow-100 text-yellow-700";

    case "login":
      return darkMode
        ? "bg-green-900 text-green-300"
        : "bg-green-100 text-green-700";

    case "create":
      return darkMode
        ? "bg-blue-900 text-blue-300"
        : "bg-blue-100 text-blue-700";

    default:
      return darkMode
        ? "bg-gray-700 text-gray-300"
        : "bg-gray-100 text-gray-700";
  }
};


export const getActionIcon = (
  action: Activity["action"]
) => {
  switch (action) {
    case "delete":
      return <Trash2 size={14} />;

    case "restore":
      return <RotateCcw size={14} />;

    case "update":
      return <Pencil size={14} />;

    case "login":
      return <LogIn size={14} />;

    case "create":
      return <Plus size={14} />;

    default:
      return null;
  }
};


export const DATE_LOCALE = "en-GB";

export const ITEMS_PER_PAGE = 10;