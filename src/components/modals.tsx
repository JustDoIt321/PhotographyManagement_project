"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { EXPENSE_CATS, Project, ProjectType, TYPES } from "@/lib/types";
import { todayKey } from "@/lib/helpers";

const fieldStyle: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13,
  fontFamily: "inherit",
  color: "var(--ink)",
  background: "var(--card)",
  outline: "none",
  width: "100%",
};

function FLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 12,
        color: "var(--ink-2)",
        fontWeight: 600,
        marginBottom: 5,
      }}
    >
      {children}
    </label>
  );
}

function Mask({ children }: { children: React.ReactNode }) {
  return (
    <div className="modal-mask open">
      <div className="modal">{children}</div>
    </div>
  );
}

function NewProjectModal() {
  const { closeNewProject, createProject, setCursor, setSelected, setViewMode, navigate, toast } =
    useApp();
  const [client, setClient] = useState("");
  const [type, setType] = useState<ProjectType>("lingzheng");
  const [date, setDate] = useState(todayKey());
  const [start, setStart] = useState("09:00");
  const [location, setLocation] = useState("");
  const [wechat, setWechat] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState("");
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState(false);

  const save = () => {
    if (!client.trim() || !date) {
      setErr(true);
      return;
    }
    const amt = parseInt(amount, 10) || 0;
    const p: Project = {
      id: "np" + Date.now(),
      client: client.trim(),
      type,
      date,
      start: start || "09:00",
      end: "",
      location: location.trim() || "地点待定",
      status: "pending",
      brief: brief.trim() || "暂无要求备注",
      checklist: [],
      quote: { amount: amt, deposit: 0, balance: amt },
      contract: "none",
      depositDue: null,
      balanceDue: null,
      prepareDays: 0,
      deliverDue: null,
    };
    createProject(p, { wechat: wechat.trim(), phone: phone.trim(), email: email.trim() });
    closeNewProject();
    const d = new Date(date);
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelected(date);
    setViewMode("month");
    navigate("calendar");
    toast("已创建项目：" + client.trim());
  };

  return (
    <Mask>
      <h3>新建拍摄项目</h3>
      <div className="f-row">
        <div className="f-item" style={{ flex: 2 }}>
          <FLabel>客户姓名 *</FLabel>
          <input
            type="text"
            placeholder="例如：张倩倩 & 李明"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            style={fieldStyle}
            autoFocus
          />
        </div>
        <div className="f-item">
          <FLabel>拍摄类型 *</FLabel>
          <select value={type} onChange={(e) => setType(e.target.value as ProjectType)} style={fieldStyle}>
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
          <FLabel>拍摄日期 *</FLabel>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={fieldStyle} />
        </div>
        <div className="f-item">
          <FLabel>开始时间</FLabel>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} style={fieldStyle} />
        </div>
      </div>
      <div className="f-item">
        <FLabel>拍摄地点</FLabel>
        <input type="text" placeholder="例如：江边公园 / 酒店宴会厅" value={location} onChange={(e) => setLocation(e.target.value)} style={fieldStyle} />
      </div>
      <div className="f-row">
        <div className="f-item">
          <FLabel>客户微信</FLabel>
          <input type="text" placeholder="微信号" value={wechat} onChange={(e) => setWechat(e.target.value)} style={fieldStyle} />
        </div>
        <div className="f-item">
          <FLabel>手机号</FLabel>
          <input type="text" placeholder="138****8888" value={phone} onChange={(e) => setPhone(e.target.value)} style={fieldStyle} />
        </div>
        <div className="f-item">
          <FLabel>邮箱</FLabel>
          <input type="text" placeholder="example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
        </div>
      </div>
      <div className="f-item">
        <FLabel>拍摄要求</FLabel>
        <textarea rows={2} placeholder="风格、服装、道具、特殊要求…" value={brief} onChange={(e) => setBrief(e.target.value)} style={{ ...fieldStyle, resize: "vertical" }} />
      </div>
      <div className="f-item">
        <FLabel>报价金额（元）</FLabel>
        <input type="number" placeholder="例如：1299" value={amount} onChange={(e) => setAmount(e.target.value)} style={fieldStyle} />
      </div>
      {err && <div className="err" style={{ display: "block" }}>请填写客户姓名和拍摄日期</div>}
      <div className="modal-actions">
        <button className="btn-ghost" onClick={closeNewProject}>取消</button>
        <button className="btn-primary" onClick={save}>创建项目</button>
      </div>
    </Mask>
  );
}

function ExpenseModal({ id }: { id: string }) {
  const { expenses, closeExpenseModal, addExpense, updateExpense, toast } = useApp();
  const isEdit = id !== "";
  const existing = isEdit ? expenses.find((e) => e.id === id) : null;
  const [date, setDate] = useState(existing?.date || todayKey());
  const [cat, setCat] = useState(existing?.cat || "器材租赁");
  const [note, setNote] = useState(existing?.note || "");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [err, setErr] = useState(false);

  const save = () => {
    const amt = parseFloat(amount);
    if (!date || !note.trim() || !amt || amt <= 0) {
      setErr(true);
      return;
    }
    if (isEdit && existing) {
      updateExpense(id, { date, cat, note: note.trim(), amount: amt });
      toast("支出已更新");
    } else {
      addExpense({ id: "e" + Date.now(), date, cat, note: note.trim(), amount: amt });
      toast("支出已添加");
    }
    closeExpenseModal();
  };

  return (
    <Mask>
      <h3>{isEdit ? "编辑支出" : "新增支出"}</h3>
      <div className="f-row">
        <div className="f-item">
          <FLabel>日期 *</FLabel>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={fieldStyle} />
        </div>
        <div className="f-item">
          <FLabel>分类</FLabel>
          <select value={cat} onChange={(e) => setCat(e.target.value)} style={fieldStyle}>
            {EXPENSE_CATS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="f-item">
        <FLabel>说明 *</FLabel>
        <input type="text" placeholder="例如：闪光灯套装租金" value={note} onChange={(e) => setNote(e.target.value)} style={fieldStyle} />
      </div>
      <div className="f-item">
        <FLabel>金额（元）*</FLabel>
        <input type="number" placeholder="例如：600" value={amount} onChange={(e) => setAmount(e.target.value)} style={fieldStyle} />
      </div>
      {err && <div className="err" style={{ display: "block" }}>请填写说明和金额</div>}
      <div className="modal-actions">
        <button className="btn-ghost" onClick={closeExpenseModal}>取消</button>
        <button className="btn-primary" onClick={save}>保存支出</button>
      </div>
    </Mask>
  );
}

function ClientModal({ name }: { name: string }) {
  const { clients, closeClientModal, saveClient, toast } = useApp();
  const c = clients.find((x) => x.name === name);
  const [phone, setPhone] = useState(c?.phone || "");
  const [birthday, setBirthday] = useState(c?.birthday || "");
  const [wechat, setWechat] = useState(c?.wechat || "");
  const [email, setEmail] = useState(c?.email || "");
  const [note, setNote] = useState(c?.note || "");

  const save = () => {
    saveClient(name, {
      phone: phone.trim(),
      wechat: wechat.trim(),
      email: email.trim(),
      birthday,
      note: note.trim(),
    });
    closeClientModal();
    toast("客户信息已保存");
  };

  return (
    <Mask>
      <h3>编辑客户 · {name}</h3>
      <div className="f-item">
        <FLabel>客户姓名</FLabel>
        <input type="text" value={name} disabled style={{ ...fieldStyle, background: "var(--paper)", color: "var(--ink-3)" }} />
      </div>
      <div className="f-row">
        <div className="f-item">
          <FLabel>联系电话</FLabel>
          <input type="text" placeholder="例如：138****8888" value={phone} onChange={(e) => setPhone(e.target.value)} style={fieldStyle} />
        </div>
        <div className="f-item">
          <FLabel>生日</FLabel>
          <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} style={fieldStyle} />
        </div>
      </div>
      <div className="f-row">
        <div className="f-item">
          <FLabel>微信</FLabel>
          <input type="text" placeholder="微信号" value={wechat} onChange={(e) => setWechat(e.target.value)} style={fieldStyle} />
        </div>
        <div className="f-item">
          <FLabel>邮箱</FLabel>
          <input type="text" placeholder="example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
        </div>
      </div>
      <div className="f-item">
        <FLabel>备注</FLabel>
        <textarea rows={2} placeholder="偏好、禁忌、复购记录…" value={note} onChange={(e) => setNote(e.target.value)} style={{ ...fieldStyle, resize: "vertical" }} />
      </div>
      <div className="modal-actions">
        <button className="btn-ghost" onClick={closeClientModal}>取消</button>
        <button className="btn-primary" onClick={save}>保存</button>
      </div>
    </Mask>
  );
}

function DeleteConfirmModal() {
  const { projects, currentProject, closeDeleteConfirm, deleteProject, navigate, toast } = useApp();
  const p = projects.find((x) => x.id === currentProject);

  const confirm = () => {
    if (currentProject) deleteProject(currentProject);
    closeDeleteConfirm();
    navigate("calendar");
    toast("项目已删除");
  };

  return (
    <Mask>
      <h3>删除项目</h3>
      <div style={{ fontSize: "13.5px", color: "var(--ink-2)", lineHeight: 1.7 }}>
        确定要删除「{p?.client}」这个项目吗？删除后不可恢复。
      </div>
      <div className="modal-actions" style={{ marginTop: 18 }}>
        <button className="btn-ghost" onClick={closeDeleteConfirm}>取消</button>
        <button className="btn-danger" onClick={confirm}>确认删除</button>
      </div>
    </Mask>
  );
}

export function Modals() {
  const { newProjectOpen, expenseModal, clientModal, confirmDeleteOpen } = useApp();
  return (
    <>
      {newProjectOpen && <NewProjectModal />}
      {expenseModal !== null && <ExpenseModal key={expenseModal} id={expenseModal} />}
      {clientModal !== null && <ClientModal key={clientModal} name={clientModal} />}
      {confirmDeleteOpen && <DeleteConfirmModal />}
    </>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div id="toast-root">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="dot" />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

