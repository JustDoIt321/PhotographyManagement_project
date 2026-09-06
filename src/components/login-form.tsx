"use client";

import { useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconBrand } from "@/components/icons";

type Mode = "login" | "register";

const ic = "h-[18px] w-[18px] text-zinc-400";

function MailIcon() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h3l1.5 4L7.5 9.5a12 12 0 0 0 6 6l1.5-2 4 1.5V18a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.9-3.4 3.7-5 7-5s6.1 1.6 7 5" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg className="h-[18px] w-[18px] text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg className="h-[18px] w-[18px] text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.5 6.3A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.6M6.5 6.6A16 16 0 0 0 2.5 12S6 18 12 18c1.4 0 2.7-.3 3.8-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-zinc-600">
        {label}
        {icon}
      </label>
      <div className="relative">{children}</div>
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-4 pr-4 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#FF7A45] focus:bg-white focus:ring-2 focus:ring-[#FF7A45]/15";

function translateError(m?: string): string {
  const s = m || "";
  if (/invalid login credentials/i.test(s)) return "账号或密码错误";
  if (/already registered/i.test(s) || /user already registered/i.test(s))
    return "该邮箱已注册，请直接登录";
  if (/password should be at least/i.test(s)) return "密码至少 6 位";
  if (/unable to validate email/i.test(s) || /invalid email/i.test(s))
    return "邮箱格式不正确";
  if (/email not confirmed/i.test(s)) return "邮箱尚未验证，请先查收验证邮件";
  return s || "操作失败，请稍后重试";
}

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  // 登录字段
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  // 注册字段
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showRegPwd, setShowRegPwd] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const id = identifier.trim();
    if (!id) {
      setError("请输入邮箱 / 用户名 / 手机号");
      return;
    }
    if (loginPassword.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    try {
      let loginEmail = id;
      // 非邮箱（用户名 / 手机号）→ 先用后端函数解析出邮箱
      if (!id.includes("@")) {
        const { data, error: rpcErr } = await supabase.rpc("resolve_identifier", {
          identifier: id,
        });
        if (rpcErr || !data) {
          setError("账号或密码错误");
          setLoading(false);
          return;
        }
        loginEmail = data as string;
      }
      const { error: err } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (err) {
        setError(translateError(err.message));
        setLoading(false);
        return;
      }
      window.location.replace("/");
    } catch {
      setError("登录失败，请稍后重试");
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const em = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("请输入正确的邮箱地址");
      return;
    }
    if (regPassword.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    if (regPassword !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: em,
        password: regPassword,
        options: {
          data: {
            username: username.trim(),
            phone: phone.trim(),
            name: username.trim() || em.split("@")[0],
          },
        },
      });
      if (err) {
        setError(translateError(err.message));
        setLoading(false);
        return;
      }
      if (data.session) {
        window.location.replace("/");
        return;
      }
      setError("注册成功，请查收邮箱完成验证后再登录");
      setMode("login");
      setLoading(false);
    } catch {
      setError("注册失败，请稍后重试");
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{
        background:
          "linear-gradient(155deg, #FFF7EF 0%, #FFE7D6 45%, #FFC9A3 100%)",
      }}
    >
      {/* 装饰光斑 */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "#FFB27A" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{ background: "#FF8A4C" }}
      />

      <div className="relative w-full max-w-lg">
        <div className="rounded-3xl bg-white/90 p-10 shadow-[0_24px_60px_-15px_rgba(200,90,40,0.35)] backdrop-blur">
          {/* 品牌 */}
          <div className="mb-8 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{ background: "linear-gradient(135deg,#FF7A45,#E85A2B)" }}
            >
              <IconBrand size={24} />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-900">PhotoFlow</div>
              <div className="text-[13px] text-zinc-500">独立摄影师工作台</div>
            </div>
          </div>

          {/* 登录 / 注册 切换 */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={
                  "rounded-lg py-2 text-sm font-medium transition " +
                  (mode === m
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700")
                }
              >
                {m === "login" ? "登录" : "注册"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <Field label="账号" icon={<UserIcon />}>
                <input
                  className={inputBase}
                  placeholder="邮箱 / 用户名 / 手机号"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </Field>
              <Field label="密码" icon={<LockIcon />}>
                <input
                  className={inputBase + " pr-11"}
                  type={showLoginPwd ? "text" : "password"}
                  placeholder="至少 6 位"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPwd((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-400 hover:text-zinc-600"
                >
                  {showLoginPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </Field>

              {error && (
                <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#FF7A45,#E85A2B)" }}
              >
                {loading ? "登录中…" : "登录"}
              </button>

              <p className="text-center text-[13px] text-zinc-400">
                还没有账号？{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-medium text-[#E85A2B] hover:underline"
                >
                  立即注册
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <Field label="邮箱（必填）" icon={<MailIcon />}>
                <input
                  className={inputBase}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </Field>
              <Field label="用户名（选填）" icon={<UserIcon />}>
                <input
                  className={inputBase}
                  placeholder="例如：小林摄影"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Field>
              <Field label="手机号（选填）" icon={<PhoneIcon />}>
                <input
                  className={inputBase}
                  type="tel"
                  placeholder="例如：13800000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </Field>
              <Field label="密码" icon={<LockIcon />}>
                <input
                  className={inputBase + " pr-11"}
                  type={showRegPwd ? "text" : "password"}
                  placeholder="至少 6 位"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPwd((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-400 hover:text-zinc-600"
                >
                  {showRegPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </Field>
              <Field label="确认密码" icon={<LockIcon />}>
                <input
                  className={inputBase}
                  type="password"
                  placeholder="再次输入密码"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>

              {error && (
                <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#FF7A45,#E85A2B)" }}
              >
                {loading ? "注册中…" : "创建账号"}
              </button>

              <p className="text-center text-[13px] text-zinc-400">
                已有账号？{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-medium text-[#E85A2B] hover:underline"
                >
                  去登录
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
