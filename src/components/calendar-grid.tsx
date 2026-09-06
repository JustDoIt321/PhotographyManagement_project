"use client";

import { useApp } from "@/lib/store";
import { Project, STATUS, TYPES } from "@/lib/types";
import { pad, todayKey } from "@/lib/helpers";

export function byDate(projects: Project[], k: string): Project[] {
  return projects.filter((p) => p.date === k);
}

export function Slot({ p }: { p: Project }) {
  const { openProject } = useApp();
  const t = TYPES[p.type] || { label: p.type, color: "#999" };
  return (
    <div className="slot" onClick={() => openProject(p.id)}>
      <span className="cbar" style={{ background: t.color }} />
      <span className="s-name">{p.client}</span>
      <span className="s-time">
        {p.start}
        {p.end ? "-" + p.end : ""}
      </span>
      <span className="s-state">{STATUS[p.status]?.label || p.status}</span>
    </div>
  );
}

const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export function MonthGrid({
  compact = false,
  onDayClick,
}: {
  compact?: boolean;
  onDayClick?: (k: string) => void;
}) {
  const { cursor, search, projects } = useApp();
  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const first = new Date(y, m, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const TODAY = todayKey();

  const cells = [];
  for (let i = 0; i < 42; i++) {
    let dayNum: number;
    let cls = "cal-cell";
    let cellYear = y;
    let cellMonth = m;
    if (i < startDow) {
      dayNum = prevDays - startDow + i + 1;
      cls += " other";
      if (m === 0) {
        cellYear = y - 1;
        cellMonth = 11;
      } else cellMonth = m - 1;
    } else if (i >= startDow + daysInMonth) {
      dayNum = i - startDow - daysInMonth + 1;
      cls += " other";
      if (m === 11) {
        cellYear = y + 1;
        cellMonth = 0;
      } else cellMonth = m + 1;
    } else {
      dayNum = i - startDow + 1;
    }
    const k = `${cellYear}-${pad(cellMonth + 1)}-${pad(dayNum)}`;
    const isToday = k === TODAY;
    const list = byDate(projects, k).filter((p) =>
      search ? p.client.includes(search) : true
    );

    cells.push(
      <div
        key={k + "-" + i}
        className={cls}
        {...(compact
          ? {
              onClick: () => onDayClick?.(k),
              style: { cursor: "pointer" },
              title: `查看 ${k} 档期`,
            }
          : {})}
      >
        <span className="viewfinder" />
        <div className={"cal-date" + (isToday ? " today" : "")}>
          <span className="dot">{dayNum}</span>
          {isToday && (
            <span
              style={{
                fontSize: "10px",
                color: "var(--amber-deep)",
                fontWeight: 700,
              }}
            >
              今天
            </span>
          )}
        </div>
        <div className="slot-list">
          {compact
            ? list.map((p) => (
                <span
                  key={p.id}
                  className="cdot"
                  style={{ background: (TYPES[p.type] || { color: "#999" }).color }}
                  title={p.client}
                />
              ))
            : list.map((p) => <Slot key={p.id} p={p} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="cal-wrap">
      <div className="cal-head">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className={"cal-grid" + (compact ? " compact" : "")}>{cells}</div>
      {search && !compact ? (
        <div
          style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)" }}
        >
          搜索「{search}」的结果
        </div>
      ) : null}
    </div>
  );
}
