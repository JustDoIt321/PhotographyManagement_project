import {
  AppData,
  Client,
  DEFAULT_SETTINGS,
  Expense,
  Project,
  Reminder,
  Settings,
  THEMES,
  TYPES,
} from "./types";

export const LS_PROJECTS = "yuepai-projects-v3";
export const LS_EXP = "yuepai-expenses-v1";
export const LS_SETTINGS = "yuepai-settings-v1";
export const LS_CLIENTS = "yuepai-clients-v1";

export const pad = (n: number): string => (n < 10 ? "0" + n : "" + n);

export const keyOf = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayKey = (): string => keyOf(new Date());

/** 某个月份的起止日期（用于账单汇总默认范围） */
export function monthRange(cursor: Date): { from: string; to: string } {
  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  return {
    from: `${y}-${pad(m + 1)}-01`,
    to: `${y}-${pad(m + 1)}-${pad(last)}`,
  };
}

/** '2026-09-08' -> '9月8日' */
export const fmtKey = (k: string): string => {
  const p = k.split("-");
  if (p.length < 3) return k;
  return `${parseInt(p[1], 10)}月${parseInt(p[2], 10)}日`;
};

export const esc = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"]/g, (c) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!;
  });

export function tintColor(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  if (isNaN(n)) return hex;
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  const nr = Math.round(r + (255 - r) * amount);
  const ng = Math.round(g + (255 - g) * amount);
  const nb = Math.round(b + (255 - b) * amount);
  return "#" + ((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1);
}

export function shadeColor(hex: string, percent: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  if (isNaN(n)) return hex;
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  const nr = Math.max(0, Math.min(255, Math.round((r * (100 + percent)) / 100)));
  const ng = Math.max(0, Math.min(255, Math.round((g * (100 + percent)) / 100)));
  const nb = Math.max(0, Math.min(255, Math.round((b * (100 + percent)) / 100)));
  return "#" + ((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1);
}

/** 兼容旧「工作室版」存档：旧状态映射 + 剔除成员字段 + 规范化报价 */
const STATUS_MIGRATE: Record<string, string> = {
  lead: "pending",
  quoted: "pending",
  preparing: "booked",
};
const VALID_STATUS = new Set(["pending", "booked", "shot", "delivering", "done"]);

export function migrateProjects(list: unknown[]): Project[] {
  return list
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const p = raw as Record<string, unknown>;
      let status = (p.status as string) || "pending";
      if (STATUS_MIGRATE[status]) status = STATUS_MIGRATE[status];
      if (!VALID_STATUS.has(status)) status = "pending";
      if ("crew" in p) delete p.crew;

      let quote = p.quote as Record<string, unknown> | null | undefined;
      if (!quote || typeof quote !== "object") {
        quote = { amount: 0, deposit: 0, balance: 0 };
      }
      const amount =
        typeof quote.amount === "number"
          ? quote.amount
          : parseFloat(String(quote.amount ?? "")) || 0;
      const deposit =
        typeof quote.deposit === "number"
          ? quote.deposit
          : parseFloat(String(quote.deposit ?? "")) || 0;
      quote.amount = amount;
      quote.deposit = deposit;
      quote.balance = Math.max(amount - deposit, 0);
      p.quote = quote;

      if (!Array.isArray(p.checklist)) p.checklist = [];
      p.status = status;
      return p as unknown as Project;
    })
    .filter(Boolean) as Project[];
}

export function deriveClients(
  projects: Project[],
  saved: Client[] | null
): Client[] {
  const agg: Record<string, Client> = {};
  projects.forEach((p) => {
    if (!agg[p.client])
      agg[p.client] = {
        name: p.client,
        phone: "",
        wechat: "",
        email: "",
        birthday: "",
        note: "",
      };
  });
  if (Array.isArray(saved)) {
    saved.forEach((c) => {
      if (agg[c.name]) {
        agg[c.name].phone = c.phone || "";
        agg[c.name].wechat = c.wechat || "";
        agg[c.name].email = c.email || "";
        agg[c.name].birthday = c.birthday || "";
        agg[c.name].note = c.note || "";
      }
    });
  }
  if (agg["张倩倩 & 李明"] && !agg["张倩倩 & 李明"].birthday)
    agg["张倩倩 & 李明"].birthday = "1995-09-10";
  return Object.keys(agg).map((k) => agg[k]);
}

export function syncClientContact(
  clients: Client[],
  name: string,
  wechat: string,
  phone: string,
  email: string
): Client[] {
  const idx = clients.findIndex((c) => c.name === name);
  if (idx < 0) {
    return [...clients, { name, phone, wechat, email, birthday: "", note: "" }];
  }
  const next = clients.slice();
  const c = { ...next[idx] };
  if (wechat) c.wechat = wechat;
  if (phone) c.phone = phone;
  if (email) c.email = email;
  next[idx] = c;
  return next;
}

export function buildReminders(
  projects: Project[],
  clients: Client[],
  settings: Settings
): Reminder[] {
  const list: Reminder[] = [];
  const add = (
    kind: string,
    when: string,
    title: string,
    desc: string,
    pid: string
  ) => list.push({ kind, when, title, desc, pid });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const TODAY = keyOf(today);

  projects.forEach((p) => {
    if (!p.date) return;
    const t = TYPES[p.type] || { label: p.type, color: "#999" };
    const pd = p.prepareDays || settings.remindDays;
    if (p.status !== "done" && p.status !== "delivering" && pd) {
      const d = new Date(p.date);
      d.setDate(d.getDate() - pd);
      add(
        "prepare",
        keyOf(d),
        `拍摄准备提醒：${p.client}（${t.label}）`,
        `${p.date} 拍摄，准备清单待执行`,
        p.id
      );
    }
    if (p.quoteValid) {
      add(
        "quote",
        p.quoteValid,
        `报价即将到期：${p.client}（${t.label}）`,
        `报价 ${p.quote.amount} 元，客户尚未确认，可跟进一次`,
        p.id
      );
    }
    if (p.balanceDue) {
      add(
        "balance",
        p.balanceDue,
        `尾款截止：${p.client}（${t.label}）`,
        `尾款 ${p.quote.balance} 元，截止 ${fmtKey(p.balanceDue)}`,
        p.id
      );
    }
    if (p.deliverDue) {
      add(
        "deliver",
        p.deliverDue,
        `交片截止：${p.client}（${t.label}）`,
        `成片需在 ${fmtKey(p.deliverDue)} 前交付`,
        p.id
      );
    }
  });

  clients.forEach((c) => {
    if (!c.birthday) return;
    const parts = c.birthday.split("-");
    if (parts.length < 3) return;
    let bday = `${today.getFullYear()}-${parts[1]}-${parts[2]}`;
    if (bday < TODAY) bday = `${today.getFullYear() + 1}-${parts[1]}-${parts[2]}`;
    const diff = Math.round(
      (new Date(bday).getTime() - today.getTime()) / 86400000
    );
    if (diff >= 0 && diff <= settings.birthdayDays) {
      add(
        "birthday",
        bday,
        `客户生日提醒：${c.name}`,
        diff === 0
          ? `今天是 ${c.name} 的生日，可发送祝福或赠礼`
          : `${c.name} 将在 ${diff} 天后过生日（${fmtKey(bday)}），可提前准备祝福`,
        `client:${c.name}`
      );
    }
  });

  return list;
}

export function applyTheme(settings: Settings): void {
  if (typeof document === "undefined") return;
  const t = THEMES[settings.theme] || THEMES.vivid;
  let amber = t.amber;
  let deep = t.deep;
  let soft = t.soft;
  if (settings.theme === "custom" && settings.customColor) {
    amber = settings.customColor;
    deep = shadeColor(amber, -22);
    soft = amber + "26";
  }
  const root = document.documentElement;
  root.style.setProperty("--amber", amber);
  root.style.setProperty("--amber-deep", deep);
  root.style.setProperty("--amber-soft", soft);
  root.style.setProperty("--paper", tintColor(amber, 0.9));
  root.style.setProperty("--line", tintColor(amber, 0.82));
  root.style.setProperty("--body", tintColor(amber, 0.8));
  root.style.setProperty("--body-2", tintColor(amber, 0.68));
  root.style.setProperty("--body-line", tintColor(amber, 0.55));
  document.body.setAttribute("data-theme", settings.theme);
}

export function readLocalData(): AppData | null {
  if (typeof window === "undefined") return null;
  try {
    let projects: Project[] | null = null;
    let expenses: Expense[] | null = null;
    let settings: Settings = { ...DEFAULT_SETTINGS };
    let clients: Client[] = [];

    const sp = localStorage.getItem(LS_PROJECTS);
    if (sp) {
      const arr = JSON.parse(sp);
      if (Array.isArray(arr) && arr.length) projects = arr;
    }
    const se = localStorage.getItem(LS_EXP);
    if (se) {
      const arr = JSON.parse(se);
      if (Array.isArray(arr)) expenses = arr;
    }
    const ss = localStorage.getItem(LS_SETTINGS);
    if (ss) {
      const o = JSON.parse(ss);
      if (o && typeof o === "object") settings = { ...settings, ...o };
    }
    const sc = localStorage.getItem(LS_CLIENTS);
    if (sc) {
      const arr = JSON.parse(sc);
      if (Array.isArray(arr)) clients = arr;
    }

    if (!projects && !expenses) return null;
    return {
      projects: projects ?? [],
      expenses: expenses ?? [],
      settings,
      clients,
    };
  } catch {
    return null;
  }
}

export function writeLocalData(d: AppData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_PROJECTS, JSON.stringify(d.projects));
    localStorage.setItem(LS_EXP, JSON.stringify(d.expenses));
    localStorage.setItem(LS_SETTINGS, JSON.stringify(d.settings));
    localStorage.setItem(LS_CLIENTS, JSON.stringify(d.clients));
  } catch {
    /* ignore quota errors */
  }
}
