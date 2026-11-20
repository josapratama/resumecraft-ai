import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Sparkles,
  User,
  Lock,
  ArrowRight,
  CheckCircle2,
  Shield,
  FileCheck2,
  FileText,
  Zap,
  Award,
  ChevronLeft,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type Mode = "login" | "register";

export default function Login() {
  const [, navigate] = useLocation();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authHubConfig, setAuthHubConfig] = useState<{
    enabled: boolean;
    authhub_url: string;
    client_id: string;
  } | null>(null);
  const utils = trpc.useUtils();

  useEffect(() => {
    fetch("/api/auth/authhub/config")
      .then((r) => r.json())
      .then((data) => {
        if (data?.enabled) setAuthHubConfig(data);
      })
      .catch(() => {});
  }, []);

  const handleAuthHubLogin = () => {
    if (!authHubConfig) return;
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("authhub_sso_state", state);
    const params = new URLSearchParams({
      client_id: authHubConfig.client_id,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: "code",
      state,
      scope: "openid profile email roles permissions",
    });
    window.location.href = `${authHubConfig.authhub_url}/oauth/authorize?${params.toString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error(t("auth.valid_req", "Username dan password wajib diisi"));
      return;
    }
    if (username.trim().length < 3) {
      toast.error(t("auth.valid_user_len", "Username minimal 3 karakter"));
      return;
    }
    if (password.length < 6) {
      toast.error(t("auth.valid_pass_len", "Password minimal 6 karakter"));
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body: Record<string, string> = {
        username: username.trim(),
        password,
      };
      if (mode === "register" && name.trim()) body.name = name.trim();

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? t("auth.auth_failed", "Autentikasi gagal. Silakan periksa kembali data Anda."));
        return;
      }

      await utils.auth.me.invalidate();
      toast.success(
        mode === "login"
          ? t("auth.welcome_login_toast", "Selamat datang kembali di ResumeCraft AI!")
          : t("auth.welcome_reg_toast", "Akun berhasil dibuat! Selamat datang di Studio CV.")
      );
      navigate("/");
    } catch {
      toast.error(t("auth.network_error_toast", "Terjadi kendala jaringan. Silakan coba sesaat lagi."));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setUsername("");
    setPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center lg:p-0">
      <div className="min-h-screen flex flex-col lg:flex-row w-full">
        {/* Left Pane: Branding & Value Showcase (Desktop) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border-r border-neutral-800/80 p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t("auth.back_to_home", "Kembali ke Beranda")}
              </button>
              <LanguageSwitcher />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">
                  ResumeCraft <span className="text-red-500">AI</span>
                </span>
                <span className="block text-[11px] text-neutral-400 font-medium">
                  {t("landing_page.tagline", "Studio Pembuat CV & Dokumen Karir Standar ATS")}
                </span>
              </div>
            </div>
          </div>

          {/* Middle: Feature Highlights */}
          <div className="relative z-10 space-y-6 my-auto py-8">
            <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 rounded-full px-3 py-1">
              <Award className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-semibold text-red-300">
                {t("auth.hero_badge", "Standar Lolos Screening HRD & ATS Indonesia & Global")}
              </span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              {t("auth.hero_title_1", "Tingkatkan Peluang Panggilan Wawancara Kerja Anda hingga")}{" "}
              <span className="bg-gradient-to-r from-red-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                {t("auth.hero_title_highlight", "3.8x Lebih Tinggi.")}
              </span>
            </h2>

            <p className="text-sm text-neutral-400 leading-relaxed max-w-lg">
              {t("auth.hero_desc", "ResumeCraft AI merancang format resume profesional yang mudah dibaca oleh software sistem ATS maupun HRD. Dilengkapi optimasi kata kunci AI, generator surat lamaran kerja, serta draf email siap kirim.")}
            </p>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                  <FileText className="w-4 h-4" />
                  <span>{t("auth.perk_templates_title", "29 Template ATS")}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {t("auth.perk_templates_desc", "Format A4 & Letter presisi dengan visual page-break cetak.")}
                </p>
              </div>

              <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Zap className="w-4 h-4" />
                  <span>{t("auth.perk_star_title", "Formula STAR AI")}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {t("auth.perk_star_desc", "Ubah poin pengalaman biasa menjadi pencapaian berdampak tinggi.")}
                </p>
              </div>

              <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <FileCheck2 className="w-4 h-4" />
                  <span>{t("auth.perk_cl_title", "Surat Lamaran Kerja")}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {t("auth.perk_cl_desc", "25 format surat lamaran otomatis tersinkronisasi dari data CV.")}
                </p>
              </div>

              <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                  <Shield className="w-4 h-4" />
                  <span>{t("auth.perk_watermark_title", "Bebas Watermark")}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {t("auth.perk_watermark_desc", "Ekspor PDF & Word (.docx) jernih 100% tanpa watermark.")}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="relative z-10 pt-6 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
            <span>© {new Date().getFullYear()} ResumeCraft AI</span>
            <span>{t("auth.supported_by", "Didukung AuthHub SSO & AI Architecture")}</span>
          </div>
        </div>

        {/* Right Pane: Auth Card Form */}
        <div className="flex-1 bg-white text-neutral-900 flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-10 min-h-screen">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Mobile Header Link */}
            <div className="flex lg:hidden items-center justify-between pb-2 border-b border-neutral-100">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                <ChevronLeft className="w-4 h-4" />
                {t("auth.back_to_home", "Kembali ke Beranda")}
              </button>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                {mode === "login"
                  ? t("auth.login_title", "Masuk ke Studio CV")
                  : t("auth.register_title", "Mulai Akun Baru")}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
                {mode === "login"
                  ? t("auth.login_subtitle", "Akses seluruh resume, surat lamaran kerja, dan template ATS Anda.")
                  : t("auth.register_subtitle", "Buat akun dalam beberapa detik untuk mendesain CV profesional gratis.")}
              </p>
            </div>

            {/* Mode Switcher Pills */}
            <div className="flex p-1 bg-neutral-100 rounded-xl">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  mode === "login"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {t("auth.tab_signin", "Masuk (Sign In)")}
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  mode === "register"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {t("auth.tab_signup", "Daftar Akun")}
              </button>
            </div>

            {/* AuthHub SSO Button (if enabled) */}
            {authHubConfig?.enabled && (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAuthHubLogin}
                  className="w-full flex items-center justify-center gap-2.5 border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-semibold py-2.5 h-11 rounded-xl transition-all shadow-xs"
                >
                  <Shield className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">
                    {t("auth.sso_btn", "Masuk via AuthHub SSO (YubiKey / PIN)")}
                  </span>
                </Button>

                <div className="relative flex items-center justify-center pt-1">
                  <div className="border-t border-neutral-200 w-full" />
                  <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                    {t("auth.or_local", "atau akun lokal")}
                  </span>
                  <div className="border-t border-neutral-200 w-full" />
                </div>
              </div>
            )}

            {/* Standard Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    {t("auth.fullname_label", "Nama Lengkap")}
                  </Label>
                  <div className="relative mt-1.5">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Pratama Saputra"
                      className="pl-10 h-11 border-neutral-300 focus:border-neutral-900 rounded-xl text-sm"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  {t("auth.username_label", "Username")}
                </Label>
                <div className="relative mt-1.5">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nama_pengguna"
                    className="pl-10 h-11 border-neutral-300 focus:border-neutral-900 rounded-xl text-sm"
                    autoComplete="username"
                    required
                    minLength={3}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    {t("auth.password_label", "Kata Sandi")}
                  </Label>
                  {mode === "login" && (
                    <span className="text-[11px] text-neutral-400">Min. 6 Karakter</span>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Minimal 6 karakter" : "••••••••"}
                    className="pl-10 h-11 border-neutral-300 focus:border-neutral-900 rounded-xl text-sm"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                    minLength={mode === "register" ? 6 : undefined}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl h-11 font-bold text-xs sm:text-sm mt-3 shadow-md"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    <span>{mode === "login" ? t("status.processing", "Memproses...") : t("status.processing", "Memproses...")}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>
                      {mode === "login"
                        ? t("auth.submit_login", "Masuk ke Studio ResumeCraft")
                        : t("auth.submit_register", "Buat Akun Sekarang")}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Quick Benefits Guarantee */}
            <div className="pt-4 border-t border-neutral-100 space-y-2">
              {[
                "Akses langsung 29 template CV standar ATS teruji",
                "Fitur AI resume polish, koreksi EYD, dan skor kecocokan lowongan",
                "Ekspor PDF A4 & Letter tajam tanpa watermark selamanya",
              ].map((perk) => (
                <div key={perk} className="flex items-center gap-2 text-xs text-neutral-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            {/* Switch Mode Prompt */}
            <div className="text-center pt-2">
              <p className="text-xs text-neutral-500">
                {mode === "login"
                  ? t("auth.dont_have_account", "Belum memiliki akun?")
                  : t("auth.already_have_account", "Sudah memiliki akun sebelumnya?")}{" "}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "login" ? "register" : "login")}
                  className="font-bold text-neutral-900 hover:text-red-600 underline transition-colors"
                >
                  {mode === "login"
                    ? t("auth.tab_signup", "Daftar Akun Baru")
                    : t("auth.tab_signin", "Masuk di Sini")}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
