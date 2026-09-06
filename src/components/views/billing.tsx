"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Expense, Project, TYPES } from "@/lib/types";
import { fmtKey, tintColor, todayKey } from "@/lib/helpers";
import { IconPlus, IconTrash } from "@/components/icons";

const PC = [
  "#FF7A45",
  "#FF5E8A",
  "#18B39B",
  "#4E8BFF",
  "#8A5CF0",
  "#F5A623",
  "#3CA66B",
  "#E34E8B",
  "#22A3C4",
  "#7A68E0",
  "#2E9E5B",
  "#F0802E",
];

function Ring({
  segs,
  title,
  val,
  showPlus,
  hoverIdx,
  onHover,
}: {
  segs: { label: string; val: number; color: string }[];
  title: string;
  val: number;
  showPlus: boolean;
  hoverIdx: number | null;
  onHover: (i: number | null) => void;
}) {
  const total = segs.reduce((s, p) => s + p.val, 0);
  if (total <= 0) {
    return (
      <div className="empty" style={{ padding: 26 }}>
        该时间段暂无收支数据
      </div>
    );
  }
  const CX = 120;
  const CY = 120;
  const C = 2 * Math.PI * 74;
  const arcs: {
    label: string;
    val: number;
    color: string;
    dash: string;
    off: string;
  }[] = [];
  let acc = 0;
  for (const p of segs) {
    const len = (p.val / total) * C;
    arcs.push({
      ...p,
      dash: `${len.toFixed(1)} ${C.toFixed(1)}`,
      off: (-acc).toFixed(1),
    });
    acc += len;
  }
  return (
    <svg
      className="circ-svg"
      width="196"
      height="196"
      viewBox="0 0 240 240"
      style={{ display: "block" }}
    >
      <circle
        cx={CX}
        cy={CY}
        r="74"
        fill="none"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="24"
      />
      {arcs.map((p, i) => (
        <circle
          key={i}
          cx={CX}
          cy={CY}
          r="74"
          fill="none"
          stroke={p.color}
          strokeWidth={hoverIdx === i ? 33 : 24}
          strokeDasharray={p.dash}
          strokeDashoffset={p.off}
          transform={`rotate(-90 ${CX} ${CY})`}
          className="dseg"
          style={{ opacity: hoverIdx === null || hoverIdx === i ? 0.95 : 0.5 }}
          onMouseEnter={() => onHover(i)}
          onMouseLeave={() => onHover(null)}
        >
          <title>
            {p.label} · {p.val} 元 · {Math.round((p.val / total) * 100)}%
          </title>
        </circle>
      ))}
      <text
        x={CX}
        y={CY - 8}
        textAnchor="middle"
        fontSize="13"
        fill="#8A969E"
      >
        {title}
      </text>
      <text
        x={CX}
        y={CY + 18}
        textAnchor="middle"
        fontSize="21"
        fontWeight="700"
        fill="#1E2A33"
      >
        {showPlus && val >= 0 ? "+" : ""}
        {val}
      </text>
    </svg>
  );
}

export default function Billing() {
  const {
    projects,
    expenses,
    billFrom,
    billTo,
    billFilter,
    billRangeKey,
    setBillRange,
    setBillRangeKey,
    setBillFrom,
    setBillTo,
    setBillFilter,
    openProject,
    openExpenseModal,
    deleteExpense,
  } = useApp();

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const TODAY = todayKey();

  const inRange = (date: string) => {
    if (!date) return false;
    if (billFrom && date < billFrom) return false;
    if (billTo && date > billTo) return false;
    return true;
  };

  const rangeLabel = () => {
    if (!billFrom && !billTo) return "全部时间";
    if (billFrom && billTo) return `${fmtKey(billFrom)} 至 ${fmtKey(billTo)}`;
    return billFrom ? `从 ${fmtKey(billFrom)}` : `至 ${fmtKey(billTo)}`;
  };

  const sum = { amount: 0, paid: 0, pending: 0, overdue: 0 };
  const rows: {
    p: Project;
    amount: number;
    paid: number;
    pend: number;
    overdue: boolean;
    badge: string;
    bs: string;
  }[] = [];

  projects.forEach((p) => {
    if (!inRange(p.date)) return;
    sum.amount += p.quote.amount || 0;
    sum.paid += p.quote.deposit || 0;
    const pend = p.quote.balance || 0;
    sum.pending += pend;
    const overdue = p.status === "pending" && !!p.quoteValid && p.quoteValid < TODAY;
    if (overdue) sum.overdue += p.quote.amount || 0;
    let badge: string;
    let bs: string;
    if (p.status === "done") {
      badge = "已结清";
      bs = "b-ok";
    } else if (overdue) {
      badge = "报价已过期";
      bs = "b-red";
    } else if (p.status === "pending") {
      badge = "待签约";
      bs = "b-gray";
    } else if (pend > 0) {
      badge = "待收尾款";
      bs = "b-amber";
    } else {
      badge = "已收齐";
      bs = "b-ok";
    }
    rows.push({
      p,
      amount: p.quote.amount || 0,
      paid: p.quote.deposit || 0,
      pend,
      overdue,
      badge,
      bs,
    });
  });

  let expTotal = 0;
  const expList: Expense[] = [];
  expenses.forEach((e) => {
    if (!inRange(e.date)) return;
    expTotal += e.amount;
    expList.push(e);
  });

  const income = sum.paid;
  const net = income - expTotal;
  const total = income + expTotal;
  const barTotal =
    billFilter === "income" ? income : billFilter === "expense" ? expTotal : total;

  // ring segments
  const colorUsed = new Set<string>();
  const nextColor = (base?: string) => {
    if (base && !colorUsed.has(base)) {
      colorUsed.add(base);
      return base;
    }
    for (const c of PC) {
      if (!colorUsed.has(c)) {
        colorUsed.add(c);
        return c;
      }
    }
    const fb = tintColor(PC[0], 0.18);
    colorUsed.add(fb);
    return fb;
  };

  let segs: { label: string; val: number; color: string }[] = [];
  let ringTitle: string;
  let ringVal: number;
  if (billFilter === "income") {
    projects.forEach((p) => {
      if (inRange(p.date) && (p.quote.deposit || 0) > 0) {
        const t = TYPES[p.type] || { label: p.type, color: "#999" };
        segs.push({
          val: p.quote.deposit || 0,
          color: nextColor(t.color),
          label: `${p.client} · ${t.label}`,
        });
      }
    });
    ringTitle = "收入构成";
    ringVal = income;
  } else if (billFilter === "expense") {
    expList.forEach((e) => {
      if (e.amount > 0) {
        segs.push({
          val: e.amount,
          color: nextColor(),
          label: `${e.cat} · ${e.note || ""}`,
        });
      }
    });
    ringTitle = "支出构成";
    ringVal = expTotal;
  } else {
    segs = [
      { val: income, color: "#3E7C4F", label: "收入（已收）" },
      { val: expTotal, color: "#FF8A4C", label: "支出" },
    ];
    ringTitle = "实际净收入";
    ringVal = net;
  }
  segs = segs.sort((a, b) => b.val - a.val);
  const ringTotal = segs.reduce((s, p) => s + p.val, 0);

  // bar items
  const items: {
    kind: "in" | "ex";
    p?: Project;
    e?: Expense;
    amt: number;
  }[] = [];
  if (billFilter !== "expense") {
    projects.forEach((p) => {
      if (inRange(p.date) && (p.quote.deposit || 0) > 0)
        items.push({ kind: "in", p, amt: p.quote.deposit || 0 });
    });
  }
  if (billFilter !== "income") {
    expList.forEach((e) => items.push({ kind: "ex", e, amt: e.amount }));
  }
  items.sort((a, b) => b.amt - a.amt);
  const maxAmt = items.length ? items[0].amt : 0;

  const shortcut = (k: string, label: string) => (
    <button
      key={k}
      className="btn-ghost bill-range"
      onClick={() => setBillRange(k)}
      style={
        billRangeKey === k
          ? {
              borderColor: "var(--amber)",
              color: "var(--amber-deep)",
              fontWeight: 600,
            }
          : undefined
      }
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="h-row" style={{ flexWrap: "wrap", gap: 10 }}>
          <div className="panel-title" style={{ marginBottom: 0 }}>
            汇总时间段
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {shortcut("month", "本月")}
            {shortcut("3m", "近 3 个月")}
            {shortcut("year", "今年")}
            {shortcut("all", "全部")}
          </div>
          <div className="grow" />
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
              从
            </span>
            <input
              type="date"
              value={billFrom}
              onChange={(e) => {
                setBillFrom(e.target.value);
                setBillRangeKey("custom");
              }}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "5px 8px",
                fontFamily: "inherit",
                fontSize: "12.5px",
                color: "var(--ink)",
                background: "var(--card)",
                width: 120,
              }}
            />
            <span style={{ fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
              至
            </span>
            <input
              type="date"
              value={billTo}
              onChange={(e) => {
                setBillTo(e.target.value);
                setBillRangeKey("custom");
              }}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "5px 8px",
                fontFamily: "inherit",
                fontSize: "12.5px",
                color: "var(--ink)",
                background: "var(--card)",
                width: 120,
              }}
            />
          </div>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi ok">
          <div className="k-label">期间收入（已收）</div>
          <div className="k-num">{income}</div>
          <div className="k-note">元 · 定金与全款到账</div>
        </div>
        <div className="kpi amber">
          <div className="k-label">期间支出</div>
          <div className="k-num">{expTotal}</div>
          <div className="k-note">元 · 共 {expList.length} 笔</div>
        </div>
        <div
          className="kpi"
          style={{
            borderColor: net >= 0 ? "rgba(62,124,79,.4)" : "rgba(217,126,46,.4)",
          }}
        >
          <div className="k-label">实际净收入</div>
          <div
            className="k-num"
            style={{ color: net >= 0 ? "var(--ok)" : "var(--danger)" }}
          >
            {net >= 0 ? "+" : ""}
            {net}
          </div>
          <div className="k-note">元 · 收入 − 支出</div>
        </div>
        <div className="kpi danger">
          <div className="k-label">逾期应收</div>
          <div className="k-num">{sum.overdue}</div>
          <div className="k-note">元 · 过期报价需跟进</div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="h-row" style={{ flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="panel-title">收支结构 · {rangeLabel()}</div>
            <div className="panel-sub">
              收入与支出占比；明细按金额从大到小排列，条长表示占比。
            </div>
          </div>
          <div className="grow" />
          <div className="bill-filter">
            <button
              className={billFilter === "all" ? "active" : ""}
              onClick={() => setBillFilter("all")}
            >
              全部
            </button>
            <button
              className={billFilter === "income" ? "active" : ""}
              onClick={() => setBillFilter("income")}
            >
              仅收入
            </button>
            <button
              className={billFilter === "expense" ? "active" : ""}
              onClick={() => setBillFilter("expense")}
            >
              仅支出
            </button>
          </div>
          <button
            className="btn-primary"
            style={{ padding: "6px 12px", fontSize: "12.5px" }}
            onClick={() => openExpenseModal(null)}
          >
            <IconPlus />
            添加支出
          </button>
        </div>

        <div className="circ-row" style={{ marginTop: 14 }}>
          <div style={{ flex: "0 0 auto", textAlign: "center" }}>
            <Ring
              segs={segs}
              title={ringTitle}
              val={ringVal}
              showPlus={billFilter === "all"}
              hoverIdx={hoverIdx}
              onHover={setHoverIdx}
            />
          </div>

          {segs.length ? (
            <div className="circ-legend">
              {segs.map((p, i) => (
                <div
                  key={i}
                  className="circ-item"
                  style={{ opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.42 }}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  <span className="c-sw" style={{ background: p.color }} />
                  <span className="c-name">{p.label}</span>
                  <span
                    className="c-num"
                    style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)" }}
                  >
                    {ringTotal ? Math.round((p.val / ringTotal) * 100) : 0}%
                  </span>
                </div>
              ))}
              {billFilter === "all" ? (
                <div
                  className="circ-item"
                  style={{
                    marginTop: 4,
                    borderTop: "1px dashed var(--line)",
                    paddingTop: 8,
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>收支比</span>
                  <span className="c-num" style={{ fontSize: 13 }}>
                    {expTotal > 0 ? (income / expTotal).toFixed(2) : "—"}
                  </span>
                  <span className="c-pct">收/支</span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div style={{ flex: 1, minWidth: 300 }}>
            <div className="bar-list">
              {items.length ? (
                items.map((it) => {
                  const pct = barTotal ? Math.round((it.amt / barTotal) * 100) : 0;
                  const w = maxAmt ? Math.round((it.amt / maxAmt) * 100) : 0;
                  if (it.kind === "in" && it.p) {
                    const t = TYPES[it.p.type] || { label: it.p.type };
                    return (
                      <div
                        key={"in" + it.p.id}
                        className="bar-row"
                        style={{ cursor: "pointer" }}
                        title="查看项目"
                        onClick={() => openProject(it.p!.id)}
                      >
                        <span className="bar-name">
                          {it.p.client} · {t.label}
                        </span>
                        <span
                          className="bar-tag"
                          style={{
                            borderColor: "rgba(62,124,79,.45)",
                            color: "var(--ok)",
                          }}
                        >
                          收入
                        </span>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              width: w + "%",
                              background:
                                "linear-gradient(90deg,#3E7C4F,#5FA368)",
                            }}
                          />
                        </div>
                        <span className="bar-amt">¥{it.amt}</span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--ink-3)",
                            width: 38,
                            textAlign: "right",
                            flex: "0 0 38px",
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={"ex" + it.e!.id}
                      className="bar-row exp-row"
                      title="点击编辑支出"
                      onClick={() => openExpenseModal(it.e!.id)}
                    >
                      <span className="bar-name">
                        {it.e!.cat} · {it.e!.note}
                      </span>
                      <span
                        className="bar-tag"
                        style={{
                          borderColor: "rgba(217,126,46,.45)",
                          color: "var(--amber-deep)",
                        }}
                      >
                        支出
                      </span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: w + "%",
                            background:
                              "linear-gradient(90deg,#D97E2E,#E8A44F)",
                          }}
                        />
                      </div>
                      <span className="bar-amt">¥{it.amt}</span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--ink-3)",
                          width: 38,
                          textAlign: "right",
                          flex: "0 0 38px",
                        }}
                      >
                        {pct}%
                      </span>
                      <button
                        className="exp-del"
                        title="删除支出"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteExpense(it.e!.id);
                        }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="empty" style={{ padding: 16 }}>
                  该筛选下暂无收支明细
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-title">项目账单明细 · {rangeLabel()}</div>
        <div className="panel-sub">
          金额单位：元；数据由项目自动汇总，新建、编辑或改状态后实时更新。
        </div>
        {rows.length ? (
          <table>
            <thead>
              <tr>
                <th>客户</th>
                <th>类型</th>
                <th style={{ textAlign: "right" }}>合同金额</th>
                <th style={{ textAlign: "right" }}>已收</th>
                <th style={{ textAlign: "right" }}>待收</th>
                <th style={{ textAlign: "right" }}>到期</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const t = TYPES[r.p.type] || { label: r.p.type, color: "#999" };
                return (
                  <tr
                    key={r.p.id}
                    className="rowlink"
                    onClick={() => openProject(r.p.id)}
                  >
                    <td>{r.p.client}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: t.color + "1f", color: t.color }}
                      >
                        {t.label}
                      </span>
                    </td>
                    <td className="num">{r.amount}</td>
                    <td className="num" style={{ color: "var(--ok)", fontWeight: 600 }}>
                      {r.paid}
                    </td>
                    <td className="num">{r.pend}</td>
                    <td className="num">
                      {r.p.balanceDue
                        ? fmtKey(r.p.balanceDue)
                        : r.p.quoteValid
                        ? `报价 ${fmtKey(r.p.quoteValid)} 到期`
                        : "—"}
                    </td>
                    <td>
                      <span className={"badge " + r.bs}>{r.badge}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty">该时间段内没有拍摄项目</div>
        )}
      </div>
    </>
  );
}
