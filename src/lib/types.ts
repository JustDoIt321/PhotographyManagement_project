export type ProjectType = "lingzheng" | "hunli" | "xiezhen" | "shangpai" | "family";
export type ProjectStatus = "pending" | "booked" | "shot" | "delivering" | "done";
export type ContractStatus = "none" | "sent" | "signed";
export type ViewMode = "month" | "week" | "day";
export type BillFilter = "all" | "income" | "expense";
export type Route =
  | "dashboard"
  | "calendar"
  | "billing"
  | "clients"
  | "reminders"
  | "project"
  | "settings";

export interface ChecklistItem {
  t: string;
  d: boolean;
}

export interface Quote {
  amount: number;
  deposit: number;
  balance: number;
}

export interface Project {
  id: string;
  client: string;
  type: ProjectType;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string;
  location: string;
  status: ProjectStatus;
  brief: string;
  checklist: ChecklistItem[];
  quote: Quote;
  contract: ContractStatus;
  depositDue: string | null;
  balanceDue: string | null;
  prepareDays: number;
  deliverDue: string | null;
  quoteValid?: string | null;
}

export interface Expense {
  id: string;
  date: string;
  cat: string;
  note: string;
  amount: number;
}

export interface Client {
  name: string;
  phone: string;
  wechat: string;
  email: string;
  birthday: string;
  note: string;
}

export interface Settings {
  theme: string;
  remindDays: number;
  birthdayDays: number;
  customColor: string | null;
}

export interface Reminder {
  kind: string;
  when: string;
  title: string;
  desc: string;
  pid: string;
}

export interface AppData {
  projects: Project[];
  expenses: Expense[];
  settings: Settings;
  clients: Client[];
}

export const TYPES: Record<ProjectType, { label: string; color: string }> = {
  lingzheng: { label: "领证跟拍", color: "#E8A44F" },
  hunli: { label: "婚礼跟拍", color: "#C4535E" },
  xiezhen: { label: "个人写真", color: "#5E8FC9" },
  shangpai: { label: "商拍", color: "#4E9E81" },
  family: { label: "全家福", color: "#9A7FC0" },
};

export const STATUS: Record<ProjectStatus, { label: string; step: number }> = {
  pending: { label: "待确认", step: 0 },
  booked: { label: "已签约", step: 1 },
  shot: { label: "已拍摄", step: 2 },
  delivering: { label: "交付中", step: 3 },
  done: { label: "已完成", step: 4 },
};

export const STEP_LIST = ["待确认", "签约", "拍摄", "交付", "完成"];

export const EXPENSE_CATS = ["器材租赁", "器材", "场地", "差旅", "外包", "其他"];

export interface ThemeDef {
  name: string;
  amber: string;
  deep: string;
  soft: string;
}

export const THEMES: Record<string, ThemeDef> = {
  vivid: { name: "活力落日", amber: "#FF7A45", deep: "#E85A2B", soft: "#FFE7DC" },
  berry: { name: "莓果粉", amber: "#FF5E8A", deep: "#E03A68", soft: "#FFE1EA" },
  teal: { name: "薄荷青", amber: "#18B39B", deep: "#0E8977", soft: "#DCF5EF" },
  sky: { name: "晴空蓝", amber: "#4E8BFF", deep: "#2F63D6", soft: "#E2EBFF" },
  gold: { name: "蜜桃金", amber: "#F5A623", deep: "#D9881A", soft: "#FFF1D9" },
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "vivid",
  remindDays: 2,
  birthdayDays: 7,
  customColor: null,
};

export const SEED_PROJECTS: Project[] = [
  {
    id: "p1",
    client: "张倩倩 & 李明",
    type: "lingzheng",
    date: "2026-09-08",
    start: "09:00",
    end: "12:00",
    location: "江边公园",
    status: "booked",
    brief: "中式 + 便装两套，外景为主，需要反光板；重点拍领证盖章瞬间",
    checklist: [
      { t: "确认服装两套已备", d: false },
      { t: "准备反光板、备用电池", d: false },
      { t: "核对客户到场时间", d: false },
    ],
    quote: { amount: 1299, deposit: 300, balance: 999 },
    contract: "signed",
    depositDue: "2026-09-06",
    balanceDue: "2026-09-20",
    prepareDays: 3,
    deliverDue: null,
  },
  {
    id: "p2",
    client: "王雨桐",
    type: "hunli",
    date: "2026-09-13",
    start: "14:00",
    end: "21:00",
    location: "君悦酒店宴会厅",
    status: "booked",
    brief: "订婚宴跟拍，晚宴环节多需闪光灯；家人合影清单发我；出片 40 张精修",
    checklist: [
      { t: "确认酒店灯光与入场时间", d: false },
      { t: "闪光灯设备充电", d: false },
      { t: "打印家人合影清单", d: false },
    ],
    quote: { amount: 2599, deposit: 800, balance: 1799 },
    contract: "signed",
    depositDue: "2026-09-10",
    balanceDue: "2026-09-25",
    prepareDays: 3,
    deliverDue: null,
  },
  {
    id: "p3",
    client: "陈小姐",
    type: "xiezhen",
    date: "2026-09-20",
    start: "15:00",
    end: "18:00",
    location: "棚内 + 天台",
    status: "pending",
    brief: "日系胶片风，三套服装；天台拍黄昏光，需要带 LED 灯",
    checklist: [],
    quote: { amount: 899, deposit: 0, balance: 899 },
    contract: "none",
    depositDue: null,
    balanceDue: "2026-09-20",
    prepareDays: 2,
    deliverDue: null,
    quoteValid: "2026-09-12",
  },
  {
    id: "p4",
    client: "蜜糖婚礼",
    type: "hunli",
    date: "2026-09-26",
    start: "07:30",
    end: "22:00",
    location: "云顶酒店 + 老宅",
    status: "booked",
    brief: "双机位婚礼跟拍：接亲 + 仪式 + 晚宴；需要稳定器，提前一天踩点",
    checklist: [
      { t: "双机位设备清单", d: false },
      { t: "提前一天踩点老宅", d: false },
      { t: "备用存储卡 ×4", d: false },
    ],
    quote: { amount: 6999, deposit: 2000, balance: 4999 },
    contract: "signed",
    depositDue: "2026-09-15",
    balanceDue: "2026-10-03",
    prepareDays: 3,
    deliverDue: null,
  },
  {
    id: "p5",
    client: "星火传媒",
    type: "shangpai",
    date: "2026-09-15",
    start: "10:00",
    end: "17:00",
    location: "棚内（器材自备）",
    status: "pending",
    brief: "产品商拍，24 款杯子；白底 + 场景两套；需要灯光搭建，报价含后期基础调色",
    checklist: [],
    quote: { amount: 4599, deposit: 0, balance: 4599 },
    contract: "none",
    depositDue: null,
    balanceDue: "2026-09-15",
    prepareDays: 2,
    deliverDue: null,
    quoteValid: "2026-09-01",
  },
  {
    id: "p6",
    client: "刘先生",
    type: "lingzheng",
    date: "2026-09-08",
    start: "09:00",
    end: "11:00",
    location: "民政局",
    status: "pending",
    brief: "领证跟拍，简约纪实风；预算 800 左右，正在询价",
    checklist: [],
    quote: { amount: 0, deposit: 0, balance: 0 },
    contract: "none",
    depositDue: null,
    balanceDue: null,
    prepareDays: 0,
    deliverDue: null,
  },
  {
    id: "p7",
    client: "赵阿姨全家",
    type: "family",
    date: "2026-09-04",
    start: "10:00",
    end: "12:00",
    location: "植物园",
    status: "delivering",
    brief: "四世同堂全家福，12 人；需要梯子拍大合影，出片 20 张",
    checklist: [],
    quote: { amount: 899, deposit: 899, balance: 0 },
    contract: "signed",
    depositDue: null,
    balanceDue: null,
    prepareDays: 0,
    deliverDue: "2026-09-10",
  },
  {
    id: "p8",
    client: "周设计师",
    type: "xiezhen",
    date: "2026-09-29",
    start: "14:00",
    end: "17:00",
    location: "待定",
    status: "pending",
    brief: "个人写真，复古港风；微信刚聊，AI 正在抽取要求",
    checklist: [],
    quote: { amount: 0, deposit: 0, balance: 0 },
    contract: "none",
    depositDue: null,
    balanceDue: null,
    prepareDays: 0,
    deliverDue: null,
  },
  {
    id: "p9",
    client: "林先生 & 陈小姐",
    type: "lingzheng",
    date: "2026-09-05",
    start: "09:00",
    end: "11:00",
    location: "民政局",
    status: "booked",
    brief: "领证跟拍，简约纪实风；早点到场，拍完在门口花坛取景",
    checklist: [{ t: "确认客户到场时间", d: false }],
    quote: { amount: 899, deposit: 300, balance: 599 },
    contract: "signed",
    depositDue: "2026-09-03",
    balanceDue: "2026-09-05",
    prepareDays: 1,
    deliverDue: null,
  },
];

export const SEED_EXPENSES: Expense[] = [
  { id: "e1", date: "2026-09-02", cat: "器材租赁", note: "闪光灯套装 ×2", amount: 600 },
  { id: "e2", date: "2026-09-06", cat: "场地", note: "棚拍租金（半天）", amount: 400 },
  { id: "e3", date: "2026-09-10", cat: "差旅", note: "婚礼踩点油费", amount: 180 },
  { id: "e4", date: "2026-09-15", cat: "器材", note: "备用存储卡 ×2", amount: 260 },
  { id: "e5", date: "2026-09-18", cat: "外包", note: "后期修片外包", amount: 500 },
  { id: "e6", date: "2026-09-25", cat: "场地", note: "商拍棚租全天", amount: 800 },
];
