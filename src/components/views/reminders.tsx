"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Reminder } from "@/lib/types";
import { fmtKey, todayKey } from "@/lib/helpers";
import { IconInfo, IconWarn } from "@/components/icons";

export default function Reminders() {
  const { reminders, openProject, navigate } = useApp();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const TODAY = todayKey();

  const groups = { overdue: [] as Reminder[], today: [] as Reminder[], soon: [] as Reminder[] };
  reminders.forEach((r) => {
    if (r.when < TODAY) groups.overdue.push(r);
    else if (r.when === TODAY) groups.today.push(r);
    else groups.soon.push(r);
  });
  groups.soon.sort((a, b) => (a.when < b.when ? -1 : 1));

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const item = (r: Reminder) => {
    const warn = r.kind === "balance" || r.kind === "quote";
    const whenTxt =
      r.when === TODAY
        ? "今天"
        : r.when < TODAY
        ? `已过期 · ${fmtKey(r.when)}`
        : fmtKey(r.when);
    return (
      <div
        key={r.kind + r.when + r.pid}
        className="rm-item"
        onClick={() =>
          r.pid.startsWith("client:") ? navigate("clients") : openProject(r.pid)
        }
      >
        <div className={"rm-ic " + (warn ? "warn" : "info")}>
          {warn ? <IconWarn /> : <IconInfo />}
        </div>
        <div className="rm-body">
          <div className="rm-title">{r.title}</div>
          <div className="rm-desc">{r.desc}</div>
          <div className="rm-when">{whenTxt}</div>
        </div>
        <div className="rm-link">
          {r.kind === "birthday" ? "查看客户" : "查看项目"}
        </div>
      </div>
    );
  };

  const block = (key: string, title: string, arr: Reminder[]) => {
    if (!arr.length) return null;
    const isCollapsed = collapsed.has(key);
    return (
      <div className="rm-group" key={key}>
        <div
          className="rm-group-title"
          onClick={() => toggle(key)}
          title="点击折叠/展开"
        >
          {title}
          <span className="cnt">{arr.length}</span>
          <span className="grp-toggle">{isCollapsed ? "▸" : "▾"}</span>
        </div>
        {!isCollapsed && (
          <div className="rm-group-body">{arr.map(item)}</div>
        )}
      </div>
    );
  };

  return (
    <div className="panel">
      <div className="panel-title">提醒中心</div>
      <div className="panel-sub">
        提醒由项目数据自动生成：拍摄准备、报价到期、尾款截止、交片截止。当前仅站内通知。
      </div>
      <div style={{ marginTop: 14 }}>
        {block("overdue", "已过期", groups.overdue)}
        {block("today", "今天", groups.today)}
        {block("soon", "即将到来", groups.soon)}
        {!reminders.length && (
          <div className="empty">没有待办提醒，档期干净。</div>
        )}
      </div>
    </div>
  );
}
