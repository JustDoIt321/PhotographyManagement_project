"use client";

import { useApp } from "@/lib/store";
import { Project, STATUS, TYPES } from "@/lib/types";
import { fmtKey, keyOf, todayKey } from "@/lib/helpers";
import { MonthGrid } from "@/components/calendar-grid";

const WEEK_CN = ["一", "二", "三", "四", "五", "六", "日"];

function WeekGrid() {
  const { selected, search, projects, openProject } = useApp();
  const base = new Date(selected);
  const dow = (base.getDay() + 6) % 7;
  const mon = new Date(base);
  mon.setDate(base.getDate() - dow);
  const TODAY = todayKey();

  const cols = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    const k = keyOf(d);
    const isToday = k === TODAY;
    const list = projects.filter(
      (p) => p.date === k && (search ? p.client.includes(search) : true)
    );
    cols.push(
      <div key={k} className={"day-col" + (isToday ? " today" : "")}>
        <div className="dc-head">
          <span>{isToday ? "今天 " : ""}{fmtKey(k)}</span>
          <span className="d">周{WEEK_CN[i]}</span>
        </div>
        <div className="day-stack">
          {list.length ? (
            list.map((p: Project) => (
              <div
                key={p.id}
                className="day-card"
                onClick={() => openProject(p.id)}
              >
                <div className="dc-top">
                  <span className="dc-name">{p.client}</span>
                  <span className="dc-time">{p.start}</span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: (TYPES[p.type] || { color: "#999" }).color,
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  {(TYPES[p.type] || { label: p.type }).label} ·{" "}
                  {STATUS[p.status]?.label}
                </div>
                <div className="dc-brief">{p.brief || ""}</div>
              </div>
            ))
          ) : (
            <div className="empty">空档</div>
          )}
        </div>
      </div>
    );
  }

  return <div className="week-grid">{cols}</div>;
}

function DayGrid() {
  const { selected, search, projects, openProject, setViewMode } = useApp();
  const list = projects.filter(
    (p) => p.date === selected && (search ? p.client.includes(search) : true)
  );

  return (
    <div className="panel">
      <div className="h-row">
        <div className="panel-title">{fmtKey(selected)} 当日安排</div>
        <div className="grow" />
        <button className="btn-ghost" onClick={() => setViewMode("month")}>
          回到月视图
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        {list.length ? (
          list.map((p: Project) => (
            <div
              key={p.id}
              className="day-card"
              style={{ marginBottom: 10 }}
              onClick={() => openProject(p.id)}
            >
              <div className="dc-top">
                <span className="dc-name">{p.client}</span>
                <span className="dc-time">
                  {p.start} - {p.end}
                </span>
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: (TYPES[p.type] || { color: "#999" }).color,
                  fontWeight: 600,
                  marginTop: 3,
                }}
              >
                {(TYPES[p.type] || { label: p.type }).label} ·{" "}
                {STATUS[p.status]?.label} · {p.location || ""}
              </div>
              <div className="dc-brief">{p.brief || ""}</div>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span className="badge b-gray">
                  合同：
                  {p.contract === "signed"
                    ? "已签"
                    : p.contract === "sent"
                    ? "已发"
                    : "未签"}
                </span>
                <span className="badge b-amber">
                  已收定金：{p.quote.deposit || 0} 元
                </span>
                {p.balanceDue ? (
                  <span className="badge b-gray">
                    尾款截止：{fmtKey(p.balanceDue)}
                  </span>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="empty">这一天没有安排 · 可点击右上角「新建项目」接单</div>
        )}
      </div>
    </div>
  );
}

function AllProjects() {
  const { projects, openProject } = useApp();
  const list = projects.slice().sort((a, b) => {
    if (a.date === b.date) return a.start < b.start ? -1 : 1;
    return a.date < b.date ? -1 : 1;
  });

  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <div className="panel-title">全部项目 · {list.length} 个</div>
      <div className="panel-sub">按日期排序，点击任意项目查看详情</div>
      <div style={{ marginTop: 10 }}>
        {list.length ? (
          list.map((p: Project) => (
            <div
              key={p.id}
              className="day-card"
              style={{ marginBottom: 8, cursor: "pointer" }}
              onClick={() => openProject(p.id)}
            >
              <div className="dc-top">
                <span className="dc-name">{p.client}</span>
                <span className="dc-time">
                  {fmtKey(p.date)} · {p.start}
                  {p.end ? "-" + p.end : ""}
                </span>
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: (TYPES[p.type] || { color: "#999" }).color,
                  fontWeight: 600,
                  marginTop: 3,
                }}
              >
                {(TYPES[p.type] || { label: p.type }).label} ·{" "}
                {STATUS[p.status]?.label} · {p.location || "地点待定"}
              </div>
            </div>
          ))
        ) : (
          <div className="empty">暂无项目，可点击右上角「新建项目」接单</div>
        )}
      </div>
    </div>
  );
}

export default function CalendarView() {
  const { viewMode } = useApp();
  return (
    <>
      {viewMode === "month" && <MonthGrid />}
      {viewMode === "week" && <WeekGrid />}
      {viewMode === "day" && <DayGrid />}
      {viewMode === "month" && <AllProjects />}
    </>
  );
}
