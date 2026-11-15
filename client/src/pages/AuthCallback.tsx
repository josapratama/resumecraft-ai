import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Sparkles, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { t } = useI18n();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDesc = params.get("error_description");

    if (error) {
      setStatus("error");
      setErrorMessage(errorDesc || error || "Otorisasi SSO dibatalkan atau ditolak.");
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage("Kode otorisasi dari AuthHub tidak ditemukan.");
      return;
    }

    const savedState = sessionStorage.getItem("authhub_sso_state");
    sessionStorage.removeItem("authhub_sso_state");
    if (savedState && state && savedState !== state) {
      setStatus("error");
      setErrorMessage("Validasi keamanan CSRF (state) gagal. Silakan coba login kembali.");
      return;
    }

    const exchangeCode = async () => {
      try {
        const res = await fetch("/api/auth/authhub/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok) {
          setStatus("error");
          setErrorMessage(data?.error || "Gagal mengautentikasi dengan AuthHub SSO.");
          return;
        }

        await utils.auth.me.invalidate();
        setStatus("success");
        setTimeout(() => {
          navigate("/");
        }, 800);
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Terjadi kesalahan jaringan saat menukar token.");
      }
    };

    exchangeCode();
  }, [navigate, utils]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 text-center border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 mx-auto flex items-center justify-center shadow-md">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {status === "loading" && (
          <div className="space-y-3">
            <Spinner className="w-8 h-8 text-red-600 mx-auto" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {t("auth.sso_verifying", "Memverifikasi Kredensial AuthHub...")}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t("auth.sso_wait", "Sedang mengautentikasi sesi Anda melalui Single Sign-On.")}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {t("auth.sso_success", "Login Berhasil!")}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t("auth.sso_redirecting", "Mengalihkan ke dashboard...")}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-red-600 dark:text-red-400">
              {t("auth.sso_failed", "Login AuthHub Gagal")}
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-3">
              {errorMessage}
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("auth.back_to_login", "Kembali ke Halaman Login")}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
