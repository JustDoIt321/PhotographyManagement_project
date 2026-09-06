"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("请输入邮箱");
      return;
    }
    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    try {
      if (mode === "register") {
        if (password !== confirm) {
          setError("两次输入的密码不一致");
          setLoading(false);
          return;
        }
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() } },
        });
        if (err) {
          setError(err.message);
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
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) {
          setError(err.message);
          setLoading(false);
          return;
        }
        window.location.replace("/");
      }
    } catch {
      setError("操作失败，请稍后重试");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500";
  const labelCls = "mb-1 block text-xs font-semibold text-zinc-600";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-6">
          <h1 className="text-xl font-bold">PhotoFlow</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {mode === "login" ? "登录独立摄影师工作台" : "注册 PhotoFlow 账号"}
          </p>
        </div>

        <div className="mb-4">
          <label className={labelCls}>邮箱</label>
          <input
            type="email"
            className={inputCls}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="mb-4">
          <label className={labelCls}>密码</label>
          <input
            type="password"
            className={inputCls}
            placeholder="至少 6 位"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        {mode === "register" && (
          <>
            <div className="mb-4">
              <label className={labelCls}>确认密码</label>
              <input
                type="password"
                className={inputCls}
                placeholder="再次输入密码"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>昵称（可选）</label>
              <input
                type="text"
                className={inputCls}
                placeholder="例如：小林摄影"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
        >
          {loading ? "处理中…" : mode === "login" ? "登录" : "注册"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="mt-4 w-full text-center text-sm text-zinc-500 hover:text-amber-600"
        >
          {mode === "login" ? "没有账号？去注册" : "已有账号？去登录"}
        </button>
      </form>
    </div>
  );
}
