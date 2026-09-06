"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import {
  ContractStatus,
  Project,
  ProjectStatus,
  ProjectType,
  STATUS,
  STEP_LIST,
  TYPES,
} from "@/lib/types";
import { fmtKey } from "@/lib/helpers";
import { IconBack, IconCheck, IconEdit, IconPlus, IconTrash } from "@/components/icons";

const STATUS_BADGE: Record<ProjectStatus, string> = {
  pending: "b-gray",
  booked: "b-amber",
  shot: "b-gray",
  delivering: "b-amber",
  done: "b-ok",
};

function statusBadge(p: Project) {
  const s = STATUS[p.status];
  return <span className={"badge " + STATUS_BADGE[p.status]}>{s.label}</span>;
}

function ProjectView({ p }: { p: Project }) {
  const { back, openDeleteConfirm, setEditing, toggleChecklist } = useApp();
  const t = TYPES[p.type] || { label: p.type, color: "#999" };
  const step = STATUS[p.status].step;
  const contractTxt =
    p.contract === "signed" ? "已签署" : p.contract === "sent" ? "已发送待签署" : "未发起";

  return (
    <>
      <div className="back-row">
        <button className="btn-ghost" onClick={back}>
          <IconBack /> 返回
        </button>
        <div className="panel-title" style={{ marginBottom: 0 }}>
          项目详情
        </div>
        <div className="grow" />
        <button className="btn-danger-ghost" onClick={openDeleteConfirm}>
          <IconTrash /> 删除项目
        </button>
        <button className="btn-ghost" onClick={() => setEditing(true)}>
          <IconEdit /> 编辑项目
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="hero-card">
            <div className="hero-top">
              <div
                className="hero-type"
                style={{ background: t.color + "1f", color: t.color }}
              >
                {t.label.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div className="hero-name">{p.client}</div>
                <div className="hero-meta">
                  <span>{t.label}</span>
                  <span>
                    {fmtKey(p.date)} · {p.start}-{p.end}
                  </span>
                  <span>{p.location || "地点待定"}</span>
                  {statusBadge(p)}
                </div>
              </div>
            </div>
            <div className="steps">
              {STEP_LIST.map((s, i) => {
                const cls = i < step ? "done" : i === step ? "current" : "";
                return (
                  <div key={s} className={"step " + cls}>
                    <div className="s-bar" />
                    <div className="s-dot">{i < step ? <IconCheck /> : ""}</div>
                    <div className="s-label">{s}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-title">拍摄要求</div>
            <div
              style={{
                fontSize: "13.5px",
                color: "var(--ink-2)",
                marginTop: 8,
                lineHeight: 1.7,
              }}
            >
              {p.brief || "暂无要求备注"}
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="h-row">
              <div className="panel-title" style={{ marginBottom: 0 }}>
                拍摄准备清单
              </div>
              <div className="grow" />
              <span style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
                勾选后状态自动保存
              </span>
            </div>
            <div className="check-list">
              {p.checklist.length ? (
                p.checklist.map((c, i) => (
                  <label
                    key={i}
                    className={"cl-item" + (c.d ? " done-t" : "")}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={c.d}
                      onChange={(e) => toggleChecklist(p.id, i, e.target.checked)}
                    />
                    {c.t}
                  </label>
                ))
              ) : (
                <div className="empty" style={{ padding: 14 }}>
                  暂无准备清单，可点右上角「编辑项目」按实际情况添加
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="detail-side">
          <div className="panel">
            <div className="panel-title">报价与合同</div>
            <div className="kv" style={{ marginTop: 10 }}>
              <div className="kv-item">
                <div className="k">报价状态</div>
                <div className="v">{p.status === "pending" ? "待客户确认" : "已确认"}</div>
              </div>
              <div className="kv-item">
                <div className="k">合同</div>
                <div className="v">{contractTxt}</div>
              </div>
              {p.quoteValid ? (
                <div className="kv-item">
                  <div className="k">报价有效期</div>
                  <div className="v">{fmtKey(p.quoteValid)} 前</div>
                </div>
              ) : null}
              {p.depositDue ? (
                <div className="kv-item">
                  <div className="k">定金截止</div>
                  <div className="v">{fmtKey(p.depositDue)}</div>
                </div>
              ) : null}
              {p.balanceDue ? (
                <div className="kv-item">
                  <div className="k">尾款截止</div>
                  <div className="v">{fmtKey(p.balanceDue)}</div>
                </div>
              ) : null}
              {p.deliverDue ? (
                <div className="kv-item">
                  <div className="k">交片截止</div>
                  <div className="v">{fmtKey(p.deliverDue)}</div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-title">账单</div>
            <div className="money-block">
              <div className="money">
                <div className="m-label">合同金额</div>
                <div className="m-num">{p.quote.amount || "待定"} 元</div>
              </div>
              <div className="money">
                <div className="m-label">已收定金</div>
                <div className="m-num" style={{ color: "var(--ok)" }}>
                  {p.quote.deposit || 0} 元
                </div>
              </div>
              <div className="money">
                <div className="m-label">待收尾款</div>
                <div className="m-num" style={{ color: "var(--amber-deep)" }}>
                  {p.quote.balance || 0} 元
                </div>
              </div>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-title">自动提醒</div>
            <div
              style={{
                fontSize: "12.5px",
                color: "var(--ink-2)",
                marginTop: 8,
                lineHeight: 1.7,
              }}
            >
              {p.prepareDays ? `拍摄前 ${p.prepareDays} 天 · 准备提醒` : ""}
              {p.prepareDays ? <br /> : null}
              {p.balanceDue ? `${fmtKey(p.balanceDue)} · 尾款到期提醒` : ""}
              {p.balanceDue ? <br /> : null}
              {p.deliverDue ? `${fmtKey(p.deliverDue)} · 交片截止提醒` : ""}
              {p.deliverDue ? <br /> : null}
              {p.quoteValid ? `${fmtKey(p.quoteValid)} · 报价到期提醒` : ""}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProjectEdit({ p }: { p: Project }) {
  const { clients, back, setEditing, saveProjectEdit, setCursor, setSelected, toast } =
    useApp();
  const ci = clients.find((c) => c.name === p.client);

  const [client, setClient] = useState(p.client);
  const [type, setType] = useState<ProjectType>(p.type);
  const [date, setDate] = useState(p.date);
  const [start, setStart] = useState(p.start);
  const [end, setEnd] = useState(p.end);
  const [location, setLocation] = useState(p.location);
  const [status, setStatus] = useState<ProjectStatus>(p.status);
  const [brief, setBrief] = useState(p.brief);
  const [amount, setAmount] = useState(String(p.quote.amount ?? ""));
  const [deposit, setDeposit] = useState(String(p.quote.deposit ?? ""));
  const [contract, setContract] = useState<ContractStatus>(p.contract);
  const [quoteValid, setQuoteValid] = useState(p.quoteValid || "");
  const [depositDue, setDepositDue] = useState(p.depositDue || "");
  const [balanceDue, setBalanceDue] = useState(p.balanceDue || "");
  const [deliverDue, setDeliverDue] = useState(p.deliverDue || "");
  const [prepareDays, setPrepareDays] = useState(String(p.prepareDays ?? 0));
  const [wechat, setWechat] = useState(ci?.wechat || "");
  const [phone, setPhone] = useState(ci?.phone || "");
  const [email, setEmail] = useState(ci?.email || "");
  const [checklist, setChecklist] = useState(p.checklist.map((c) => ({ ...c })));
  const [newItem, setNewItem] = useState("");

  const amt = parseFloat(amount) || 0;
  const dep = parseFloat(deposit) || 0;

  const save = () => {
    saveProjectEdit(
      p.id,
      {
        client: client.trim() || p.client,
        type,
        date: date || p.date,
        start: start || "09:00",
        end,
        location: location.trim(),
        status,
        brief: brief.trim(),
        quote: { amount: amt, deposit: dep, balance: Math.max(amt - dep, 0) },
        contract,
        quoteValid: quoteValid || null,
        depositDue: depositDue || null,
        balanceDue: balanceDue || null,
        deliverDue: deliverDue || null,
        prepareDays: parseInt(prepareDays, 10) || 0,
        checklist,
      },
      { wechat: wechat.trim(), phone: phone.trim(), email: email.trim() }
    );
    const d = new Date(date || p.date);
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelected(date || p.date);
    setEditing(false);
    toast("已保存项目修改");
  };

  const inputCls = {
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    fontFamily: "inherit",
    color: "var(--ink)",
    background: "var(--card)",
    outline: "none",
    width: "100%",
  } as const;

  const fLabel = (t: string) => (
    <label style={{ display: "block", fontSize: 12, color: "var(--ink-2)", fontWeight: 600, marginBottom: 5 }}>
      {t}
    </label>
  );

  return (
    <>
      <div className="back-row">
        <button className="btn-ghost" onClick={back}>
          <IconBack /> 返回
        </button>
        <div className="panel-title" style={{ marginBottom: 0 }}>
          编辑项目
        </div>
        <div className="grow" />
        <button className="btn-ghost" onClick={() => setEditing(false)}>
          取消
        </button>
        <button className="btn-primary" onClick={save}>
          保存修改
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="panel">
            <div className="panel-title">基本信息</div>
            <div className="f-row">
              <div className="f-item" style={{ flex: 2 }}>
                {fLabel("客户姓名")}
                <input type="text" value={client} onChange={(e) => setClient(e.target.value)} style={inputCls} />
              </div>
              <div className="f-item">
                {fLabel("拍摄类型")}
                <select value={type} onChange={(e) => setType(e.target.value as ProjectType)} style={inputCls}>
                  {Object.keys(TYPES).map((k) => (
                    <option key={k} value={k}>
                      {TYPES[k as ProjectType].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="f-row">
              <div className="f-item">
                {fLabel("拍摄日期")}
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputCls} />
              </div>
              <div className="f-item">
                {fLabel("开始时间")}
                <input type="time" value={start} onChange={(e) => setStart(e.target.value)} style={inputCls} />
              </div>
              <div className="f-item">
                {fLabel("结束时间")}
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} style={inputCls} />
              </div>
            </div>
            <div className="f-row">
              <div className="f-item" style={{ flex: 2 }}>
                {fLabel("拍摄地点")}
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={inputCls} />
              </div>
              <div className="f-item">
                {fLabel("项目状态")}
                <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} style={inputCls}>
                  {Object.keys(STATUS).map((k) => (
                    <option key={k} value={k}>
                      {STATUS[k as ProjectStatus].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="f-row">
              <div className="f-item">
                {fLabel("客户微信")}
                <input type="text" value={wechat} onChange={(e) => setWechat(e.target.value)} placeholder="微信号" style={inputCls} />
              </div>
              <div className="f-item">
                {fLabel("手机号")}
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="138****8888" style={inputCls} />
              </div>
              <div className="f-item">
                {fLabel("邮箱")}
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" style={inputCls} />
              </div>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-title">拍摄要求</div>
            <div style={{ marginTop: 10 }}>
              <textarea
                rows={3}
                placeholder="风格、服装、道具、特殊要求…"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                style={{ ...inputCls, resize: "vertical" }}
              />
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-title">拍摄准备清单</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 10 }}>
              {checklist.map((c, i) => (
                <div key={i} className="cl-item" style={{ cursor: "default" }}>
                  <input
                    type="checkbox"
                    checked={c.d}
                    onChange={(e) =>
                      setChecklist((prev) => {
                        const next = prev.slice();
                        next[i] = { ...next[i], d: e.target.checked };
                        return next;
                      })
                    }
                  />
                  <input
                    type="text"
                    className="cl-text"
                    value={c.t}
                    onChange={(e) =>
                      setChecklist((prev) => {
                        const next = prev.slice();
                        next[i] = { ...next[i], t: e.target.value };
                        return next;
                      })
                    }
                    style={{
                      flex: 1,
                      border: "1px solid var(--line)",
                      borderRadius: 6,
                      padding: "5px 8px",
                      fontFamily: "inherit",
                      fontSize: "12.5px",
                    }}
                  />
                  <button
                    className="btn-ghost"
                    style={{ padding: "3px 9px", fontSize: 12 }}
                    onClick={() =>
                      setChecklist((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                type="text"
                placeholder="新增准备事项…"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                style={{
                  flex: 1,
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  padding: "7px 10px",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              />
              <button
                className="btn-ghost"
                onClick={() => {
                  const v = newItem.trim();
                  if (!v) return;
                  setChecklist((prev) => [...prev, { t: v, d: false }]);
                  setNewItem("");
                }}
              >
                <IconPlus /> 添加
              </button>
            </div>
          </div>
        </div>

        <div className="detail-side">
          <div className="panel">
            <div className="panel-title">报价与合同</div>
            <div className="f-row">
              <div className="f-item">
                {fLabel("报价金额（元）")}
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputCls} />
              </div>
              <div className="f-item">
                {fLabel("已收定金（元）")}
                <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} style={inputCls} />
              </div>
            </div>
            <div className="f-row">
              <div className="f-item">
                {fLabel("合同状态")}
                <select value={contract} onChange={(e) => setContract(e.target.value as ContractStatus)} style={inputCls}>
                  <option value="none">未发起</option>
                  <option value="sent">已发送待签署</option>
                  <option value="signed">已签署</option>
                </select>
              </div>
              <div className="f-item">
                {fLabel("报价有效期")}
                <input type="date" value={quoteValid} onChange={(e) => setQuoteValid(e.target.value)} style={inputCls} />
              </div>
            </div>
            <div className="f-row">
              <div className="f-item">
                {fLabel("定金截止")}
                <input type="date" value={depositDue} onChange={(e) => setDepositDue(e.target.value)} style={inputCls} />
              </div>
              <div className="f-item">
                {fLabel("尾款截止")}
                <input type="date" value={balanceDue} onChange={(e) => setBalanceDue(e.target.value)} style={inputCls} />
              </div>
            </div>
            <div className="f-row">
              <div className="f-item">
                {fLabel("交片截止")}
                <input type="date" value={deliverDue} onChange={(e) => setDeliverDue(e.target.value)} style={inputCls} />
              </div>
              <div className="f-item">
                {fLabel("准备提前提醒（天）")}
                <input type="number" value={prepareDays} onChange={(e) => setPrepareDays(e.target.value)} style={inputCls} />
              </div>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-title">账单（自动计算）</div>
            <div className="money-block">
              <div className="money">
                <div className="m-label">合同金额</div>
                <div className="m-num">{amt} 元</div>
              </div>
              <div className="money">
                <div className="m-label">已收定金</div>
                <div className="m-num" style={{ color: "var(--ok)" }}>
                  {dep} 元
                </div>
              </div>
              <div className="money">
                <div className="m-label">待收尾款</div>
                <div className="m-num" style={{ color: "var(--amber-deep)" }}>
                  {Math.max(amt - dep, 0)} 元
                </div>
              </div>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--ink-3)", marginTop: 8 }}>
              待收尾款 = 报价金额 − 已收定金，输入时自动更新。
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProjectDetail() {
  const { projects, currentProject, editing } = useApp();
  const p = projects.find((x) => x.id === currentProject);
  if (!p) {
    return (
      <div className="panel">
        <div className="empty">项目不存在</div>
      </div>
    );
  }
  return editing ? <ProjectEdit p={p} /> : <ProjectView p={p} />;
}
