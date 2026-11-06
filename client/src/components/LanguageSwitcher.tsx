import React, { useState, useRef, useEffect } from "react";
import { useI18n, SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/i18n";
import { Globe, Check, ChevronDown } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold shadow-2xs transition-all"
        aria-label="Change Language"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span className="uppercase tracking-wider">{locale}</span>
        <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg py-1 z-50">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
            Pilih Bahasa
          </div>
          {SUPPORTED_LOCALES.map(item => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLocale(item.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between transition-colors ${
                locale === item.code
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              <span>{item.label}</span>
              {locale === item.code && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
