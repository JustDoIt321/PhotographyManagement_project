# PhotoFlow · 独立摄影师工作台

面向独立摄影师的一站式工作台：档期日历、账单汇总、客户信息、提醒中心、项目详情、主题设置。由原单文件 HTML 应用整体迁移而来，采用 Next.js 全栈架构，账号与数据通过 Supabase 云端同步。

## 技术栈

- **框架**：Next.js 16（App Router）+ TypeScript + Tailwind CSS v4
- **认证**：Supabase Auth（邮箱 + 密码）
- **数据**：Supabase 单表 `app_state`（JSON 快照）+ RLS 按用户隔离
- **鉴权路由**：`src/proxy.ts`（未登录跳 `/login`）
- **客户端云同步**：`src/lib/store.tsx`（localStorage 缓存 + 600ms 防抖 upsert）

## 目录结构

```
src/
  app/            # 页面：/（工作台）、/login、globals.css、layout.tsx
  components/     # 外壳、视图（总览/日历/账单/客户/提醒/项目/设置）、弹窗、图标
  lib/            # types、helpers、store（状态层）、supabase 客户端
  proxy.ts        # 鉴权中间件（Next.js 16 的 proxy 约定）
supabase/
  schema.sql      # app_state 建表 + RLS 策略
```

## 本地开发

```bash
npm install
cp .env.local.example .env.local   # 填入真实的 Supabase URL / anon key
npm run dev
```

打开 `http://localhost:3000`，未登录会自动跳转 `/login`，注册或登录后进入工作台。首次登录（云端无数据时）会把本地示例数据推上云。

## Supabase 建表

在 Supabase 控制台 → SQL Editor 中一次性执行 `supabase/schema.sql`，会创建：

- `app_state` 表（`user_id` 主键 + `data` JSONB + `updated_at`）
- 开启 RLS，并建立 select / insert / update 三条「仅本人」策略

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL（自托管或云端） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key（可公开，数据由 RLS 保护） |

> 本地开发用 `.env.local`；线上部署时在平台（Zeabur）的项目环境变量里配置同名的两个变量。

## 部署到 Zeabur

1. 把本目录推到 GitHub 仓库（`.gitignore` 已排除 `.env*`，密钥不会入库）。
2. 在 Zeabur 新建项目 → 选择该 GitHub 仓库；Zeabur 会通过 nixpacks 自动识别 Next.js（构建 `npm run build`，启动 `npm run start`）。
3. 在项目「Variables」中添加两个环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署完成后，把 Zeabur 分配的域名填到 Supabase → Authentication → URL Configuration 的 Site URL（及 Redirect URLs），用于邮箱验证与登录回调。
5. 如需自托管 Supabase：可在 Zeabur 使用 Supabase 模板，或参照官方文档自建后，把 `NEXT_PUBLIC_SUPABASE_URL` 指向自托管地址即可，表结构同样执行 `supabase/schema.sql`。

## 账号说明

- 注册采用「邮箱 + 密码」，密码至少 6 位。
- 若 Supabase 开启了邮箱验证，注册后会收到确认邮件，需完成验证再登录；个人自用可在 Supabase → Authentication → Providers → Email 里关闭「Confirm email」以简化首次注册。
- 数据按 `auth.uid()` 隔离，每个账号只读写自己的项目、账单、客户与设置。

## 迁移说明

数据层沿用原单文件应用的 localStorage key（`yuepai-projects-v3` 等），并在加载时做了旧「工作室版」存档的兼容迁移（旧状态 `lead/quoted/preparing` 自动映射到新五状态）。因此老用户在相同域名下升级时，本地数据可无缝衔接。
