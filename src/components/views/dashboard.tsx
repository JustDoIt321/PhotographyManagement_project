"use client";

import { useApp } from "@/lib/store";
import { Project, Reminder, STATUS, TYPES } from "@/lib/types";
import { fmtKey, pad, todayKey } from "@/lib/helpers";
import { MonthGrid } from "@/components/calendar-grid";
import { IconInfo, IconWarn } from "@/components/icons";

export default function Dashboard() {
  const {
    projects,
    expenses,
    reminders,
    cursor,
    navigate,
    openProject,
    setSelected,
    setViewMode,
    setBillFilter,
  } = useApp();

  const mp = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}`;
  let incomeMonth = 0;
  let amountMonth = 0;
  projects.forEach((p) => {
    if (p.date.indexOf(mp) === 0) {
      incomeMonth += p.quote.deposit || 0;
      amountMonth += p.quote.amount || 0;
    }
  });
  let expMonth = 0;
  expenses.forEach((e) => {
    if (e.date.indexOf(mp) === 0) expMonth += e.amount;
  });

  const TODAY = todayKey();
  const todayProjs = projects.filter((p) => p.date === TODAY);
  const todayRms = reminders.filter((r) => r.when === TODAY);

  return (
    <>
      <div className="dash-kpis">
        <div
          className="dash-kpi"
          style={{ cursor: "pointer" }}
          title="查看收入明细"
          onClick={() => {
            setBillFilter("income");
            navigate("billing");
          }}
        >
          <div className="dk-label">本月收入</div>
          <div className="dk-num" style={{ color: "var(--ok)" }}>
            {incomeMonth}
          </div>
          <div className="dk-note">元 · 已到账（{amountMonth} 元合同额）</div>
        </div>
        <div
          className="dash-kpi"
          style={{ cursor: "pointer" }}
          title="查看支出明细"
          onClick={() => {
            setBillFilter("expense");
            navigate("billing");
          }}
        >
          <div className="dk-label">本月支出</div>
          <div className="dk-num" style={{ color: "var(--amber-deep)" }}>
            {expMonth}
          </div>
          <div className="dk-note">元 · 已支出</div>
        </div>
        <div className="dash-kpi">
          <div className="dk-label">待处理提醒</div>
          <div className="dk-num" style={{ color: "var(--danger)" }}>
            {reminders.length}
          </div>
          <div className="dk-note">条待办</div>
        </div>
      </div>

      <div className="dash-row2">
        <div className="dash-cal dash-panel">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div>
              <div className="dp-title">档期日历</div>
              <div className="dp-sub">
                {cursor.getFullYear()} 年 {cursor.getMonth() + 1} 月 ·
                点击日期查看当天
              </div>
            </div>
            <button
              className="btn-ghost"
              style={{ flex: "0 0 auto" }}
              onClick={() => navigate("calendar")}
            >
              去日历
            </button>
          </div>
          <div
            style={{
              marginTop: 10,
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <MonthGrid
              compact
              onDayClick={(k) => {
                setSelected(k);
                setViewMode("day");
                navigate("calendar");
              }}
            />
          </div>
        </div>

        <div className="dash-right">
          <div className="dash-panel">
            <div className="dp-title">今日拍摄项目</div>
            <div className="dp-sub">
              {fmtKey(TODAY)} · 共 {todayProjs.length} 场
            </div>
            <div className="dp-body">
              {todayProjs.length ? (
                todayProjs.map((p: Project) => (
                  <div
                    key={p.id}
                    className="day-card"
                    style={{ marginBottom: 8, cursor: "pointer" }}
                    onClick={() => openProject(p.id)}
                  >
                    <div className="dc-top">
                      <span className="dc-name">{p.client}</span>
                      <span className="dc-time">
                        {p.start}
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
                <div className="empty" style={{ padding: 16 }}>
                  今日无拍摄安排
                </div>
              )}
            </div>
          </div>

          <div className="dash-panel" style={{ flex: 1 }}>
            <div className="dp-title">待办提醒项</div>
            <div className="dp-sub">今日到期 · 共 {todayRms.length} 条</div>
            <div className="dp-body">
              {todayRms.length ? (
                todayRms.map((r: Reminder) => {
                  const warn = r.kind === "balance" || r.kind === "quote";
                  return (
                    <div
                      key={r.kind + r.when + r.pid}
                      className="rm-item"
                      style={{ marginBottom: 8, cursor: "pointer" }}
                      onClick={() =>
                        r.pid.startsWith("client:")
                          ? navigate("clients")
                          : openProject(r.pid)
                      }
                    >
                      <div className={"rm-ic " + (warn ? "warn" : "info")}>
                        {warn ? <IconWarn /> : <IconInfo />}
                      </div>
                      <div className="rm-body">
                        <div className="rm-title">{r.title}</div>
                        <div className="rm-desc">{r.desc}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty" style={{ padding: 16 }}>
                  今日没有待办提醒
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
