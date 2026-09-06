"use client";

import { useApp } from "@/lib/store";
import { THEMES } from "@/lib/types";
import { shadeColor, tintColor } from "@/lib/helpers";

const PBASE = [
  "#FF7A45",
  "#FF5E8A",
  "#18B39B",
  "#4E8BFF",
  "#8A5CF0",
  "#F5A623",
  "#3CA66B",
  "#C4535E",
];

export default function Settings() {
  const { settings, setTheme, setCustomColor, updateSettings, toast } = useApp();

  const paletteGrid: { color: string }[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < PBASE.length; c++) {
      let colr: string;
      if (r === 0) colr = tintColor(PBASE[c], 0.82);
      else if (r === 1) colr = tintColor(PBASE[c], 0.6);
      else if (r === 2) colr = tintColor(PBASE[c], 0.36);
      else if (r === 3) colr = PBASE[c];
      else if (r === 4) colr = shadeColor(PBASE[c], -22);
      else colr = shadeColor(PBASE[c], -42);
      paletteGrid.push({ color: colr });
    }
  }

  const customActive = settings.theme === "custom";
  const customColor = settings.customColor || "#D97E2E";

  return (
    <div className="settings-grid">
      <div className="setting-block">
        <div className="sb-title">主题颜色</div>
        <div className="sb-sub">选择界面强调色，实时生效并保存</div>
        <div className="theme-cards">
          {Object.keys(THEMES).map((k) => {
            const t = THEMES[k];
            return (
              <div
                key={k}
                className={"theme-card" + (settings.theme === k ? " active" : "")}
                onClick={() => {
                  setTheme(k);
                  toast("已切换主题：" + t.name);
                }}
              >
                <div
                  className="tc-swatch"
                  style={{
                    background: `linear-gradient(135deg,${t.amber},${t.deep})`,
                  }}
                />
                <div className="tc-name">{t.name}</div>
                <div className="tc-hex">{t.amber}</div>
              </div>
            );
          })}
          <div
            className={"theme-card" + (customActive ? " active" : "")}
            onClick={() => setTheme("custom")}
          >
            <div
              className="tc-swatch"
              style={{
                background: `linear-gradient(135deg,${customColor},${shadeColor(
                  customColor,
                  -22
                )})`,
              }}
            />
            <div className="tc-name">自定义颜色</div>
            <div className="tc-hex">{customActive ? customColor : "选择色盘"}</div>
          </div>
        </div>

        {customActive && (
          <>
            <div className="palette-hint">
              从色盘直接选取自定义强调色（每列同色相，自上而下由浅到深）：
            </div>
            <div className="custom-grid">
              {paletteGrid.map((p, i) => (
                <div
                  key={i}
                  className={
                    "cp-cell" +
                    (customColor.toLowerCase() === p.color.toLowerCase()
                      ? " sel"
                      : "")
                  }
                  style={{ background: p.color }}
                  title={p.color}
                  onClick={() => setCustomColor(p.color)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="setting-block">
        <div className="sb-title">提醒设置</div>
        <div className="sb-sub">控制档期和客户生日的提前提醒时间</div>
        <div className="sb-row">
          <span className="sb-label">档期提前提醒</span>
          <span className="sb-desc">拍摄前多少天在提醒中心生成准备提醒</span>
          <span className="sb-ctrl">
            <select
              value={settings.remindDays}
              onChange={(e) => {
                updateSettings({ remindDays: parseInt(e.target.value, 10) });
                toast("档期提前提醒：" + e.target.value + " 天");
              }}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "6px 10px",
                fontFamily: "inherit",
                fontSize: "12.5px",
              }}
            >
              {[1, 2, 3, 5, 7].map((d) => (
                <option key={d} value={d}>
                  提前 {d} 天
                </option>
              ))}
            </select>
          </span>
        </div>
        <div className="sb-row">
          <span className="sb-label">客户生日提醒</span>
          <span className="sb-desc">
            客户生日前多少天提醒（需在客户信息中填写生日）
          </span>
          <span className="sb-ctrl">
            <select
              value={settings.birthdayDays}
              onChange={(e) => {
                updateSettings({ birthdayDays: parseInt(e.target.value, 10) });
                toast("生日提前提醒：" + e.target.value + " 天");
              }}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "6px 10px",
                fontFamily: "inherit",
                fontSize: "12.5px",
              }}
            >
              {[3, 7, 14, 30].map((d) => (
                <option key={d} value={d}>
                  提前 {d} 天
                </option>
              ))}
            </select>
          </span>
        </div>
      </div>
    </div>
  );
}
