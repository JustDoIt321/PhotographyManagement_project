"use client";

import { useApp } from "@/lib/store";
import { TYPES } from "@/lib/types";
import { fmtKey } from "@/lib/helpers";

const COLORS = [
  "#D97E2E",
  "#4E6E82",
  "#5E8FC9",
  "#9A7FC0",
  "#C4535E",
  "#4E9E81",
  "#7A8C5C",
  "#B98A5A",
];

export default function Clients() {
  const { projects, clients, openClientModal } = useApp();

  const agg: Record<
    string,
    { name: string; n: number; total: number; last: string; type: string }
  > = {};
  projects.forEach((p) => {
    if (!agg[p.client])
      agg[p.client] = { name: p.client, n: 0, total: 0, last: p.date, type: p.type };
    agg[p.client].n++;
    agg[p.client].total += p.quote.amount || 0;
    if (p.date > agg[p.client].last) {
      agg[p.client].last = p.date;
      agg[p.client].type = p.type;
    }
  });
  const names = Object.keys(agg).sort((a, b) => agg[b].total - agg[a].total);
  const clientByName = (name: string) => clients.find((c) => c.name === name);

  return (
    <div className="panel">
      <div className="panel-title">客户信息</div>
      <div className="panel-sub">
        从项目自动汇总；点击任意客户可编辑微信、手机、邮箱、生日、备注。累计消费按合同金额计算。
      </div>
      <table>
        <thead>
          <tr>
            <th>客户</th>
            <th>生日</th>
            <th>联系方式</th>
            <th style={{ textAlign: "right" }}>项目数</th>
            <th style={{ textAlign: "right" }}>累计消费（元）</th>
            <th style={{ textAlign: "right" }}>最近拍摄</th>
            <th>标签</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name, idx) => {
            const c = agg[name];
            const ci = clientByName(name);
            const tag =
              c.n > 1 ? (
                <span
                  className="tag"
                  style={{ borderColor: "var(--amber)", color: "var(--amber-deep)" }}
                >
                  复购 {c.n} 单
                </span>
              ) : (
                <span className="tag">首单</span>
              );
            const bday = ci && ci.birthday ? (
              <span style={{ fontSize: "11.5px", color: "var(--ink-2)" }}>
                {fmtKey(ci.birthday)}
              </span>
            ) : (
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>未填</span>
            );
            const parts: React.ReactNode[] = [];
            if (ci?.wechat)
              parts.push(
                <span key="w" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  微信 {ci.wechat}
                </span>
              );
            if (ci?.phone)
              parts.push(
                <span key="p" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  {ci.phone}
                </span>
              );
            if (ci?.email)
              parts.push(
                <span key="e" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  {ci.email}
                </span>
              );
            const contact = parts.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {parts}
              </div>
            ) : (
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>未填</span>
            );

            return (
              <tr
                key={name}
                className="rowlink"
                style={{ cursor: "pointer" }}
                title="点击编辑客户信息"
                onClick={() => openClientModal(name)}
              >
                <td>
                  <div className="client-chip">
                    <div
                      className="chip-ava"
                      style={{ background: COLORS[idx % COLORS.length] }}
                    >
                      {name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{name}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>
                        {(TYPES[c.type as keyof typeof TYPES] || { label: c.type })
                          .label}{" "}
                        客户
                      </div>
                    </div>
                  </div>
                </td>
                <td>{bday}</td>
                <td>{contact}</td>
                <td className="num">{c.n}</td>
                <td className="num">{c.total}</td>
                <td className="num">{fmtKey(c.last)}</td>
                <td>{tag}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
