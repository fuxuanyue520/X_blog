# 秋兰以为佩 - 个人技术博客

这是一个基于 [Astro](https://astro.build/) 构建的现代化个人技术博客。追求简约、深邃与沉浸式的阅读体验。项目采用响应式设计，完美适配桌面端与移动端，并内置了丰富的功能模块，适合用于记录技术心得、生活感悟和项目展示。

![Project Preview](/public/images/image.png)

## ✨ 核心特色

- **极致性能**：基于 Astro 静态站点生成 (SSG)，零 JavaScript 运行时开销（除了交互组件），首屏加载极快，SEO 友好。
- **现代化设计**：
  - **深色模式**：默认采用深色主题，提供舒适的沉浸式阅读体验。
  - **响应式布局**：精心调优的移动端与桌面端适配，侧边栏自动隐藏/显示。
  - **平滑过渡**：支持 View Transitions API，页面切换流畅丝滑。
- **丰富组件**：
  - **个人卡片**：展示头像、昵称、个性签名及社交链接。
  - **文章目录**：自动生成文章目录 (TOC)，支持点击跳转。
  - **数据统计**：实时展示文章数量、标签数量等站点统计信息。
  - **视频支持**：内置自定义视频播放器，支持 MP4 播放。
- **强大技术栈**：
  - **核心框架**: Astro 4.0
  - **UI 组件**: React 18 (用于交互组件)
  - **样式系统**: Tailwind CSS (原子化 CSS)
  - **图标系统**: Iconify (海量图标支持)
  - **类型安全**: TypeScript 全面覆盖

## 🛠️ 目录结构

```text
├── public/              # 静态资源 (图片、视频、favicon 等)
├── src/
│   ├── components/      # UI 组件
│   │   ├── widgets/     # 侧边栏小组件 (ProfileCard, StatsCard 等)
│   │   ├── ArticleCard.astro  # 文章列表卡片
│   │   ├── Navbar.astro       # 顶部导航栏
│   │   └── ...
│   ├── content/         # 内容集合
│   │   ├── posts/       # Markdown 文章源文件
│   │   └── config.ts    # 内容集合 Schema 定义
│   ├── layouts/         # 页面布局 (BaseLayout, PageLayout)
│   ├── pages/           # 路由页面 (index, about, posts/[...slug])
│   └── styles/          # 全局样式
├── astro.config.mjs     # Astro 配置文件
├── tailwind.config.mjs  # Tailwind 配置文件
└── package.json         # 项目依赖与脚本
```

## 🚀 快速开始

### 1. 环境准备

确保你的本地环境已安装：

- [Node.js](https://nodejs.org/) (推荐 v18 或 v20+)
- 包管理器 (npm, yarn, 或 pnpm)

### 2. 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/fuxuanyue520/blog.git
cd blog

# 2. 安装依赖
npm install
# 或者使用 pnpm
# pnpm install

# 3. 可选：配置数据库连接
cp .env.example .env

# 4. 启动开发服务器
npm run dev
# 访问 http://localhost:4321
```

### 3. 构建发布

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

> 当前项目已启用 Astro SSR 以支持后台登录，因此部署目标需要支持服务端运行能力。当前配置已接入 Netlify Adapter，也可按需切换到其他 Astro SSR 平台。

## 🔐 后台管理系统

项目现已内置一个最小可用的后台登录系统。

- **登录地址**: `/admin/login`
- **后台首页**: `/admin`
- **默认用户名**: `admin`
- **默认密码**: `admin123`

### 密码与会话安全

- 默认管理员账号会在首次启动时自动写入数据库
- 密码不会明文保存，而是以带盐 `scrypt` 哈希形式存储
- 登录成功后会写入 `HttpOnly` 会话 Cookie
- 会话记录保存在数据库中的 `admin_sessions` 表

### 数据库配置

项目默认使用本地 SQLite 文件数据库，无需额外配置：

- **默认数据库文件**: `data/admin.db`
- **默认行为**: 应用启动时自动创建库表并初始化管理员账号

如果你想改用 Turso / LibSQL 远程数据库，可在 `.env` 中配置：

```env
LIBSQL_URL=libsql://your-database.turso.io
LIBSQL_AUTH_TOKEN=your-token
```

### 注意事项

- 首次登录后，建议尽快把默认账号密码改成你自己的
- `data/` 已加入 `.gitignore`，本地数据库文件不会被提交
- 如果你部署到 Netlify，请在平台环境变量中配置 `LIBSQL_URL` 与 `LIBSQL_AUTH_TOKEN`

## ⚙️ 个性化配置指南

### 1. 修改个人信息 (头像/昵称/社交链接)

个人信息主要集中在 **左侧边栏的个人卡片** 中。

- **文件位置**: `src/components/widgets/ProfileCard.astro`
- **如何修改**:
  - **头像**: 将你的头像图片放入 `public/` 目录 (例如 `avatar.jpg`)，然后在 `ProfileCard.astro` 中修改 `<img>` 标签的 `src` 属性。
  - **昵称**: 修改 `<h2>` 标签内的文本。
  - **签名**: 修改 `<p>` 标签内的文本。
  - **社交链接**: 修改底部的 `<a>` 标签，替换 `href` 为你的 GitHub、Bilibili 或 邮箱地址。

### 2. 修改导航栏菜单

- **文件位置**: `src/components/Navbar.astro`
- **如何修改**: 找到 `navItems` 数组或对应的 `<a>` 标签，修改链接文本和 `href` 路径。

### 3. 更换 Banner 图片

首页顶部的 Banner 图片可以在组件中替换。

- **文件位置**: `src/components/Banner.astro`
- **如何修改**: 替换 `src` 属性引用的图片路径 (建议放在 `public/` 下)。

## 📝 撰写文章

文章内容存储在 `src/content/posts/` 目录下，支持 Markdown 和 MDX 格式。

### 1. 创建文章

在 `src/content/posts/` 下新建一个 `.md` 文件，例如 `my-first-post.md`。

### 2. 填写 Frontmatter

文件头部必须包含 Frontmatter 信息，用于定义文章元数据：

```markdown
---
title: "我的第一篇文章"
description: "这是文章的简短描述，会显示在列表卡片中"
publishedAt: "2023-12-22"
updatedAt: "2023-12-23" # 可选
category: "tech" # 必填，可选值: tech (技术), essay (随笔), project (项目), other (其他)
tags: ["Astro", "Blog"] # 标签列表
coverImage: "/images/cover.jpg" # 可选，文章封面图
isPinned: false # 是否置顶
draft: false # 是否为草稿 (true 则不会在生产环境显示)
---

这里是文章正文...
```

### 3. 使用图片和视频

- **图片**: 将图片放在 `public/images/` (需自行创建) 下，在 Markdown 中使用 `![描述](/images/my-pic.jpg)` 引用。
- **视频**: 将视频放在 `public/videos/` 下，可以使用 HTML 标签或自定义组件引入。

## 🎨 样式定制

项目使用 Tailwind CSS 进行样式管理。

- **全局颜色/字体**: 修改 `tailwind.config.mjs` 中的 `theme.extend` 配置。
- **全局 CSS**: 修改 `src/styles/global.css` (如果存在) 或直接在 Layout 中引入的样式。

## 🤝 贡献与支持

如果你喜欢这个项目，欢迎 Star ⭐️ 或提交 PR！
