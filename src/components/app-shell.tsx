"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { fmtKey } from "@/lib/helpers";
import { Route } from "@/lib/types";
import {
  IconBell,
  IconBill,
  IconBrand,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClient,
  IconDash,
  IconLogout,
  IconPlus,
  IconSearch,
  IconSettings,
} from "@/components/icons";
import Dashboard from "@/components/views/dashboard";
import CalendarView from "@/components/views/calendar";
import Billing from "@/components/views/billing";
import Clients from "@/components/views/clients";
import Reminders from "@/components/views/reminders";
import ProjectDetail from "@/components/views/project";
import Settings from "@/components/views/settings";
import { Modals, Toasts } from "@/components/modals";

const NAV: { key: Route; label: string; icon: React.ReactNode; badge?: boolean }[] = [
  { key: "dashboard", label: "总览", icon: <IconDash /> },
  { key: "calendar", label: "档期日历", icon: <IconCalendar /> },
  { key: "billing", label: "账单汇总", icon: <IconBill /> },
  { key: "clients", label: "客户信息", icon: <IconClient /> },
  { key: "reminders", label: "提醒中心", icon: <IconBell />, badge: true },
  { key: "settings", label: "设置", icon: <IconSettings /> },
];

function Sidebar() {
  const { route, navigate, reminders, user } = useApp();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  const name = user?.displayName || user?.email || "摄影师";

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <IconBrand />
        </div>
        <div>
          <div className="brand-name">PhotoFlow</div>
          <div className="brand-sub">独立摄影师工作台</div>
        </div>
      </div>
      <nav className="nav">
        {NAV.map((n) => (
          <div
            key={n.key}
            className={"nav-item" + (route === n.key ? " active" : "")}
            onClick={() => navigate(n.key)}
          >
            {n.icon}
            <span>{n.label}</span>
            {n.badge && reminders.length > 0 ? (
              <span className="nav-badge">{reminders.length}</span>
            ) : null}
          </div>
        ))}
      </nav>
      <div className="side-foot">
        {user ? (
          <div className="acct-card">
            <div className="acct-ava">{name.charAt(0).toUpperCase()}</div>
            <div className="acct-meta">
              <div className="acct-name">{name}</div>
              <div className="acct-sub">{user.email}</div>
            </div>
            <button className="acct-out" title="退出登录" onClick={logout}>
              <IconLogout />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function Toolbar() {
  const { cursor, viewMode, selected, search, setSearch, shiftCursor, gotoToday, setViewMode, openNewProject } =
    useApp();
  const y = cursor.getFullYear();
  const m = cursor.getMonth() + 1;
  const title =
    viewMode === "month"
      ? `${y} 年 ${m} 月`
      : viewMode === "week"
      ? `本周 · ${y} 年 ${m} 月`
      : fmtKey(selected);

  return (
    <header className="toolbar">
      <div className="tb-title">{title}</div>
      <div className="tb-nav">
        <button className="icon-btn" title="上一月" onClick={() => shiftCursor(-1)}>
          <IconChevronLeft />
        </button>
        <button className="icon-btn" title="下一月" onClick={() => shiftCursor(1)}>
          <IconChevronRight />
        </button>
        <button className="tb-today" onClick={gotoToday}>
          今天
        </button>
      </div>
      <div className="seg">
        <button className={viewMode === "month" ? "active" : ""} onClick={() => setViewMode("month")}>
          月
        </button>
        <button className={viewMode === "week" ? "active" : ""} onClick={() => setViewMode("week")}>
          周
        </button>
        <button className={viewMode === "day" ? "active" : ""} onClick={() => setViewMode("day")}>
          日
        </button>
      </div>
      <div className="tb-spacer" />
      <div className="search">
        <IconSearch />
        <input
          type="text"
          placeholder="搜索客户…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <button className="btn-primary" onClick={openNewProject}>
        <IconPlus />
        新建项目
      </button>
    </header>
  );
}

function renderView(route: Route) {
  switch (route) {
    case "dashboard":
      return <Dashboard />;
    case "calendar":
      return <CalendarView />;
    case "billing":
      return <Billing />;
    case "clients":
      return <Clients />;
    case "reminders":
      return <Reminders />;
    case "project":
      return <ProjectDetail />;
    case "settings":
      return <Settings />;
    default:
      return <Dashboard />;
  }
}

export default function AppShell() {
  const { hydrated, route, closeAllModals } = useApp();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAllModals();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [closeAllModals]);

  if (!hydrated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper)",
          color: "var(--ink-3)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="brand-mark" style={{ margin: "0 auto 12px" }}>
            <IconBrand />
          </div>
          <div style={{ fontSize: 14 }}>PhotoFlow 加载中…</div>
        </div>
      </div>
    );
  }

  return (
    <div id="app">
      <Sidebar />
      <main className="main">
        {route === "calendar" && <Toolbar />}
        <section
          id={route === "dashboard" ? "view-dashboard" : undefined}
          className="view active"
        >
          {renderView(route)}
        </section>
      </main>
      <Modals />
      <Toasts />
    </div>
  );
}
