import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Sparkles, User, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

type Mode = "login" | "register";

export default function Login() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!username.trim() || !password.trim()) {
      toast.error("Username and password are required");
      return;
    }
    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
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
        toast.error(data.error ?? "Authentication failed");
        return;
      }

      await utils.auth.me.invalidate();
      toast.success(mode === "login" ? "Welcome back to ResumeCraft AI!" : "Account created successfully!");
      navigate("/");
    } catch {
      toast.error("Network error. Please try again.");
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
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 mx-auto flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            ResumeCraft <span className="text-red-600">AI</span>
          </h1>
          <p className="text-xs text-neutral-500">
            {mode === "login"
              ? "Sign in to manage and download your resumes"
              : "Create an account to start crafting your ATS-friendly resume"}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 sm:p-8 border border-neutral-200 bg-white rounded-2xl shadow-sm">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-neutral-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "register"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Full Name
                </Label>
                <div className="relative mt-1.5">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-9 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Username
              </Label>
              <div className="relative mt-1.5">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="pl-9 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  autoComplete="username"
                  required
                  minLength={3}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Minimum 6 characters" : "••••••••"}
                  className="pl-9 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  minLength={mode === "register" ? 6 : undefined}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl h-11 font-semibold text-xs sm:text-sm mt-2 shadow-xs"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  <span>{mode === "login" ? "Signing In..." : "Creating Account..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span>{mode === "login" ? "Sign In to Studio" : "Create My Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Quick Perks */}
          <div className="mt-6 pt-5 border-t border-neutral-100 space-y-2">
            {[
              "Free instant access to 25 ATS templates",
              "AI writing enhancements & ATS match score",
            ].map(perk => (
              <div key={perk} className="flex items-center gap-2 text-[11px] text-neutral-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Back Link */}
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-xs text-neutral-400 hover:text-neutral-700"
          >
            ← Back to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
