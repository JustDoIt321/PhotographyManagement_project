"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AppData,
  BillFilter,
  Client,
  DEFAULT_SETTINGS,
  Expense,
  Project,
  Route,
  SEED_EXPENSES,
  SEED_PROJECTS,
  Settings,
  ViewMode,
} from "./types";
import {
  applyTheme,
  buildReminders,
  deriveClients,
  migrateProjects,
  monthRange,
  pad,
  readLocalData,
  syncClientContact,
  todayKey,
  writeLocalData,
  keyOf,
} from "./helpers";

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
}

export interface ContactInput {
  wechat: string;
  phone: string;
  email: string;
}

export interface AppContextValue {
  // user
  user: CurrentUser | null;
  supabaseEnabled: boolean;
  hydrated: boolean;
  // data
  projects: Project[];
  expenses: Expense[];
  clients: Client[];
  settings: Settings;
  reminders: ReturnType<typeof buildReminders>;
  // ui
  route: Route;
  viewMode: ViewMode;
  cursor: Date;
  selected: string;
  search: string;
  billRangeKey: string;
  billFrom: string;
  billTo: string;
  billFilter: BillFilter;
  editing: boolean;
  currentProject: string | null;
  backTarget: Route | null;
  // modals
  newProjectOpen: boolean;
  expenseModal: string | null;
  clientModal: string | null;
  confirmDeleteOpen: boolean;
  toasts: { id: number; msg: string }[];
  // navigation
  navigate: (r: Route) => void;
  openProject: (id: string) => void;
  back: () => void;
  shiftCursor: (delta: number) => void;
  gotoToday: () => void;
  setViewMode: (m: ViewMode) => void;
  setSearch: (s: string) => void;
  setSelected: (d: string) => void;
  setCursor: (d: Date) => void;
  setBillRange: (key: string) => void;
  setBillRangeKey: (key: string) => void;
  setBillFrom: (d: string) => void;
  setBillTo: (d: string) => void;
  setBillFilter: (f: BillFilter) => void;
  setEditing: (v: boolean) => void;
  // modal controls
  openNewProject: () => void;
  closeNewProject: () => void;
  openExpenseModal: (id: string | null) => void;
  closeExpenseModal: () => void;
  openClientModal: (name: string) => void;
  closeClientModal: () => void;
  openDeleteConfirm: () => void;
  closeDeleteConfirm: () => void;
  closeAllModals: () => void;
  toast: (msg: string) => void;
  // data actions
  createProject: (p: Project, contact: ContactInput) => void;
  saveProjectEdit: (id: string, patch: Partial<Project>, contact: ContactInput) => void;
  deleteProject: (id: string) => void;
  toggleChecklist: (id: string, index: number, done: boolean) => void;
  addChecklistItem: (id: string, text: string) => void;
  removeChecklistItem: (id: string, index: number) => void;
  addExpense: (e: Expense) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  saveClient: (name: string, patch: Partial<Client>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setTheme: (key: string) => void;
  setCustomColor: (color: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function defaultData(): AppData {
  const projects = migrateProjects(SEED_PROJECTS as unknown[]);
  return {
    projects,
    expenses: SEED_EXPENSES.slice(),
    settings: { ...DEFAULT_SETTINGS },
    clients: deriveClients(projects, null),
  };
}

async function fetchCloud(userId: string): Promise<Partial<AppData> | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("app_state")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.data as Partial<AppData>) ?? null;
}

async function pushCloud(userId: string, state: AppData): Promise<void> {
  const supabase = createClient();
  await supabase.from("app_state").upsert({
    user_id: userId,
    data: state,
    updated_at: new Date().toISOString(),
  });
}

export function AppProvider({
  userId,
  email,
  displayName,
  children,
}: {
  userId: string;
  email: string;
  displayName: string;
  children: ReactNode;
}) {
  const supabaseEnabled = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return !!url && !url.includes("placeholder");
  }, []);

  const user = useMemo<CurrentUser>(
    () => ({ id: userId, email, displayName }),
    [userId, email, displayName]
  );

  const [data, setData] = useState<AppData>(() => {
    if (typeof window === "undefined") return defaultData();
    const local = readLocalData();
    if (!local) return defaultData();
    const projects = migrateProjects(local.projects);
    return {
      projects,
      expenses: local.expenses,
      settings: { ...DEFAULT_SETTINGS, ...local.settings },
      clients: deriveClients(projects, local.clients),
    };
  });
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);
  const dataRef = useRef(data);
  const cloudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UI state
  const [route, setRoute] = useState<Route>("dashboard");
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<Date>(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string>(() => todayKey());
  const [search, setSearch] = useState("");
  const [billRangeKey, setBillRangeKey] = useState("month");
  const [billFrom, setBillFrom] = useState(() => {
    const r = monthRange(cursor);
    return r.from;
  });
  const [billTo, setBillTo] = useState(() => {
    const r = monthRange(cursor);
    return r.to;
  });
  const [billFilter, setBillFilter] = useState<BillFilter>("all");
  const [editing, setEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [backTarget, setBackTarget] = useState<Route | null>(null);

  // modals
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [expenseModal, setExpenseModal] = useState<string | null>(null);
  const [clientModal, setClientModal] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // toasts
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  // Hydration: cloud first (localStorage 已在 useState 初始化时读取)
  useEffect(() => {
    if (!supabaseEnabled) {
      hydratedRef.current = true;
      const t = setTimeout(() => setHydrated(true), 0);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    (async () => {
      try {
        const cloud = await fetchCloud(userId);
        if (cancelled) return;
        if (cloud) {
          const cProjects = migrateProjects(
            Array.isArray(cloud.projects) ? cloud.projects : []
          );
          let next: AppData = {
            projects: cProjects,
            expenses: Array.isArray(cloud.expenses) ? cloud.expenses : [],
            settings: { ...DEFAULT_SETTINGS, ...(cloud.settings || {}) },
            clients: deriveClients(
              cProjects,
              Array.isArray(cloud.clients) ? cloud.clients : []
            ),
          };
          if (!next.projects.length) {
            next = {
              ...next,
              projects: dataRef.current.projects,
              clients: deriveClients(
                dataRef.current.projects,
                dataRef.current.clients
              ),
            };
          }
          dataRef.current = next;
          setData(next);
          writeLocalData(next);
        } else {
          await pushCloud(userId, dataRef.current);
        }
      } catch {
        /* offline or placeholder */
      }
      hydratedRef.current = true;
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change (only after hydration to avoid racing cloud load)
  useEffect(() => {
    dataRef.current = data;
    if (!hydratedRef.current) return;
    writeLocalData(data);
    if (supabaseEnabled) {
      if (cloudTimer.current) clearTimeout(cloudTimer.current);
      cloudTimer.current = setTimeout(() => {
        pushCloud(userId, data).catch(() => {});
      }, 600);
    }
  }, [data, supabaseEnabled, userId]);

  // Theme
  useEffect(() => {
    applyTheme(data.settings);
  }, [data.settings]);

  const reminders = useMemo(
    () => buildReminders(data.projects, data.clients, data.settings),
    [data.projects, data.clients, data.settings]
  );

  /* ===== navigation ===== */
  const navigate = useCallback((r: Route) => {
    setRoute(r);
    setEditing(false);
    if (r !== "project") setCurrentProject(null);
  }, []);

  const openProject = useCallback(
    (id: string) => {
      setBackTarget((prev) => (route === "project" ? prev : route));
      setCurrentProject(id);
      setEditing(false);
      setRoute("project");
    },
    [route]
  );

  const back = useCallback(() => {
    const t = backTarget || "calendar";
    setBackTarget(null);
    setCurrentProject(null);
    setEditing(false);
    setRoute(t);
  }, [backTarget]);

  const shiftCursor = useCallback(
    (delta: number) => {
      if (viewMode === "month") {
        setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
      } else if (viewMode === "week") {
        const d = new Date(selected);
        d.setDate(d.getDate() + delta * 7);
        setSelected(keyOf(d));
        setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
      } else {
        const d = new Date(selected);
        d.setDate(d.getDate() + delta);
        setSelected(keyOf(d));
        setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    },
    [viewMode, selected]
  );

  const gotoToday = useCallback(() => {
    const t = new Date();
    setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelected(todayKey());
  }, []);

  const setBillRange = useCallback(
    (key: string) => {
      setBillRangeKey(key);
      if (key === "month") {
        const r = monthRange(cursor);
        setBillFrom(r.from);
        setBillTo(r.to);
      } else if (key === "3m") {
        const d = new Date();
        d.setMonth(d.getMonth() - 3);
        setBillFrom(
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
        );
        setBillTo(todayKey());
      } else if (key === "year") {
        const y = new Date().getFullYear();
        setBillFrom(`${y}-01-01`);
        setBillTo(`${y}-12-31`);
      } else {
        setBillFrom("");
        setBillTo("");
      }
    },
    [cursor]
  );

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const closeAllModals = useCallback(() => {
    setNewProjectOpen(false);
    setExpenseModal(null);
    setClientModal(null);
    setConfirmDeleteOpen(false);
  }, []);

  /* ===== data actions ===== */
  const createProject = useCallback((p: Project, contact: ContactInput) => {
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, p],
      clients: syncClientContact(
        prev.clients,
        p.client,
        contact.wechat,
        contact.phone,
        contact.email
      ),
    }));
  }, []);

  const saveProjectEdit = useCallback(
    (id: string, patch: Partial<Project>, contact: ContactInput) => {
      setData((prev) => {
        const projects = prev.projects.map((p) => {
          if (p.id !== id) return p;
          const next = { ...p, ...patch } as Project;
          const amount = next.quote?.amount ?? 0;
          const deposit = next.quote?.deposit ?? 0;
          next.quote = { ...next.quote, balance: Math.max(amount - deposit, 0) };
          return next;
        });
        const target = projects.find((p) => p.id === id);
        const clients = target
          ? syncClientContact(
              prev.clients,
              target.client,
              contact.wechat,
              contact.phone,
              contact.email
            )
          : prev.clients;
        return { ...prev, projects, clients };
      });
    },
    []
  );

  const deleteProject = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, []);

  const toggleChecklist = useCallback(
    (id: string, index: number, done: boolean) => {
      setData((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => {
          if (p.id !== id || !p.checklist[index]) return p;
          const checklist = p.checklist.slice();
          checklist[index] = { ...checklist[index], d: done };
          return { ...p, checklist };
        }),
      }));
    },
    []
  );

  const addChecklistItem = useCallback((id: string, text: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id
          ? { ...p, checklist: [...(p.checklist || []), { t: text, d: false }] }
          : p
      ),
    }));
  }, []);

  const removeChecklistItem = useCallback((id: string, index: number) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== id) return p;
        const checklist = (p.checklist || []).slice();
        checklist.splice(index, 1);
        return { ...p, checklist };
      }),
    }));
  }, []);

  const addExpense = useCallback((e: Expense) => {
    setData((prev) => ({ ...prev, expenses: [...prev.expenses, e] }));
  }, []);

  const updateExpense = useCallback((id: string, patch: Partial<Expense>) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  }, []);

  const saveClient = useCallback((name: string, patch: Partial<Client>) => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => (c.name === name ? { ...c, ...patch } : c)),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const setTheme = useCallback((key: string) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: key,
        customColor: key === "custom" ? prev.settings.customColor : null,
      },
    }));
  }, []);

  const setCustomColor = useCallback((color: string) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, theme: "custom", customColor: color },
    }));
  }, []);

  const value: AppContextValue = {
    user,
    supabaseEnabled,
    hydrated,
    projects: data.projects,
    expenses: data.expenses,
    clients: data.clients,
    settings: data.settings,
    reminders,
    route,
    viewMode,
    cursor,
    selected,
    search,
    billRangeKey,
    billFrom,
    billTo,
    billFilter,
    editing,
    currentProject,
    backTarget,
    newProjectOpen,
    expenseModal,
    clientModal,
    confirmDeleteOpen,
    toasts,
    navigate,
    openProject,
    back,
    shiftCursor,
    gotoToday,
    setViewMode,
    setSearch,
    setSelected,
    setCursor,
    setBillRange,
    setBillRangeKey,
    setBillFrom,
    setBillTo,
    setBillFilter,
    setEditing,
    openNewProject: () => setNewProjectOpen(true),
    closeNewProject: () => setNewProjectOpen(false),
    openExpenseModal: (id) => setExpenseModal(id ?? ""),
    closeExpenseModal: () => setExpenseModal(null),
    openClientModal: (name) => setClientModal(name),
    closeClientModal: () => setClientModal(null),
    openDeleteConfirm: () => setConfirmDeleteOpen(true),
    closeDeleteConfirm: () => setConfirmDeleteOpen(false),
    closeAllModals,
    toast,
    createProject,
    saveProjectEdit,
    deleteProject,
    toggleChecklist,
    addChecklistItem,
    removeChecklistItem,
    addExpense,
    updateExpense,
    deleteExpense,
    saveClient,
    updateSettings,
    setTheme,
    setCustomColor,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
