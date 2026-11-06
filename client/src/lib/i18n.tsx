import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
import ja from "@/locales/ja.json";

export type SupportedLocale = "id" | "en" | "ja";

export interface LocaleOption {
  code: SupportedLocale;
  label: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: "id", label: "Bahasa Indonesia" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
];

const dictionaries: Record<SupportedLocale, Record<string, any>> = {
  id,
  en,
  ja,
};

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (loc: SupportedLocale) => void;
  t: (path: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "id",
  setLocale: () => {},
  t: (path: string, fallback?: string) => fallback || path,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("resumecraft_locale");
      if (saved && (saved === "id" || saved === "en" || saved === "ja")) {
        return saved as SupportedLocale;
      }
    }
    return "id";
  });

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("resumecraft_locale", newLocale);
      document.documentElement.lang = newLocale;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let current: any = dictionaries[locale] || dictionaries.id;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to English
        let fallbackVal: any = dictionaries.en;
        for (const fbKey of keys) {
          if (fallbackVal && typeof fallbackVal === "object" && fbKey in fallbackVal) {
            fallbackVal = fallbackVal[fbKey];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        return typeof fallbackVal === "string" ? fallbackVal : fallback || path;
      }
    }

    return typeof current === "string" ? current : fallback || path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  return useContext(I18nContext);
}
