# 秋兰以为佩

基于 [Astro](https://astro.build/) 构建的个人博客与内容展示项目，面向文章发布、作品展示与后台内容维护场景。项目采用服务端渲染架构，集成博客内容管理、荣誉墙展示、后台登录、奖项资料录入与 OCR 辅助识别等能力，适合作为个人站点或课程项目的实现基础。

![项目预览](./public/images/image.png)

## 项目简介

本项目以个人博客为核心，围绕内容发布与个人展示构建完整站点能力，主要包括以下部分：

- 博客首页、归档页、分类页、标签页与文章详情页
- 响应式界面与深色主题阅读体验
- 基于 Astro Content Collection 的文章管理方式
- 后台登录与会话控制
- 荣誉墙展示、检索与分类浏览
- 奖项图片或 PDF 上传、服务端 OCR 识别与信息辅助录入
- 基于 LibSQL / SQLite 的数据存储方案

## 主要功能

### 1. 内容展示

- 支持 Markdown / MDX 文章编写
- 支持文章分类、标签、归档与分页浏览
- 支持文章目录、卡片列表、站点基础统计等页面组件
- 支持图片与视频资源展示

### 2. 后台管理

- 提供后台登录与会话校验能力
- 提供文档管理入口，用于统一查看内容集合中的文章
- 提供荣誉墙管理页面，支持新增、编辑、删除与筛选

### 3. 荣誉墙与 OCR 录入

- 支持按荣誉类型、年份、级别与关键词筛选
- 支持上传图片或 PDF 证书文件
- 服务端会对上传文件进行预处理，并调用 OCR 脚本输出候选识别结果
- 支持从识别结果中辅助填写竞赛名称、奖项名称等结构化信息

## 技术栈

### 前端与站点框架

- Astro 4
- React 18
- Tailwind CSS
- TypeScript
- astro-icon

### 内容与渲染

- Astro Content Collections
- MDX
- `remark-directive`

### 服务端与数据层

- `@libsql/client`
- SQLite / LibSQL
- Node.js SSR
- Netlify Adapter

### 文件处理与 OCR

- `sharp`
- `pdfjs-dist`
- `@napi-rs/canvas`
- `onnxruntime-web`
- Python `RapidOCR`

## 目录结构

```text
.
├── public/                     # 静态资源与 OCR 模型文件
├── scripts/                    # 服务端调用的辅助脚本
├── src/
│   ├── components/             # 页面组件与后台壳组件
│   ├── content/
│   │   └── posts/              # Markdown / MDX 文章内容
│   ├── layouts/                # 页面布局
│   ├── lib/                    # 业务逻辑、数据库、鉴权与 OCR 处理
│   ├── pages/                  # 路由页面与 API 路由
│   └── styles/                 # 全局样式
├── astro.config.mjs            # Astro 配置
├── netlify.toml                # Netlify 构建配置
├── package.json                # 依赖与脚本定义
└── README.md
```

## 运行要求

### Node.js 环境

- 建议使用 Node.js 20 或以上版本
- 可使用 `npm` 或 `pnpm` 作为包管理器

### Python 环境

OCR 功能依赖 Python 运行时。若仅使用博客展示与后台基础能力，可不启用 OCR；若需要使用奖项识别功能，请准备可用的 Python 环境，并确保命令行中可执行 `python`。

建议安装以下 Python 依赖：

```bash
pip install numpy opencv-python rapidocr_onnxruntime
```

如果本地 Python 路径不在默认环境变量中，可通过环境变量 `PYTHON_PATH` 指定解释器路径。

## 本地开发

### 1. 安装依赖

```bash
git clone https://github.com/fuxuanyue520/blog.git
cd blog
npm install
```

如需使用 `pnpm`，可执行：

```bash
pnpm install
```

### 2. 配置环境变量

项目提供了 `.env.example` 作为环境变量模板：

```env
LIBSQL_URL=
LIBSQL_AUTH_TOKEN=
```

默认情况下，未配置远程数据库时，项目会自动在本地 `data/` 目录下创建 SQLite 数据库文件，无需额外初始化。

### 3. 启动开发服务

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:4321
```

## 构建与部署

### 本地构建

```bash
npm run build
```

项目使用 Astro 的服务端输出模式，构建产物位于 `dist/`，部署目标需要支持 SSR 运行。

### Netlify 部署

当前仓库已提供 `netlify.toml`，默认构建配置如下：

- 构建命令：`pnpm run build`
- 发布目录：`dist`
- Node 版本：`20`

如果部署时使用远程 LibSQL / Turso 数据库，请在平台环境变量中配置：

```env
LIBSQL_URL=libsql://your-database.turso.io
LIBSQL_AUTH_TOKEN=your-token
```

## 后台说明

### 登录入口

- 登录页：`/admin/login`
- 后台首页：`/admin`

当前后台首页会重定向至：

- 文档管理：`/admin/documents`

### 默认管理员账户

项目首次启动时会自动初始化管理员账户：

- 用户名：`admin`
- 密码：`admin123`

密码以带盐哈希形式存储，不以明文保存。登录成功后，系统将通过 `HttpOnly` Cookie 维护会话。

出于安全考虑，建议在首次部署后尽快替换默认登录凭据。

## 荣誉墙数据说明

荣誉墙相关数据存储于数据库 `award_certificates` 表中，当前结构化字段主要包括：

- `honor_type`
- `competition_name`
- `award_name`
- `award_year`
- `award_level`
- `description`
- `image_name`
- `image_mime_type`
- `image_base64`

系统已包含旧数据兼容迁移逻辑，可在应用初始化时自动补齐部分字段并修正历史表结构。

## 文章编写

文章内容位于 `src/content/posts/` 目录，支持 Markdown 与 MDX。

示例 Frontmatter：

```markdown
---
title: "文章标题"
description: "文章摘要"
publishedAt: "2024-01-01"
updatedAt: "2024-01-02"
category: "tech"
tags: ["Astro", "Blog"]
coverImage: "/images/cover.jpg"
isPinned: false
draft: false
---

正文内容
```

说明：

- `updatedAt` 为可选字段
- `draft: true` 表示文章在生产环境中不公开展示
- 图片建议放置在 `public/images/` 目录中引用

## 自定义与二次开发

若需继续调整站点内容或界面，通常可从以下位置开始：

- `src/components/Navbar.astro`：顶部导航
- `src/components/widgets/`：侧边栏组件
- `src/pages/`：页面路由
- `src/styles/global.css`：全局样式
- `src/content/posts/`：文章内容

## 说明

本项目当前同时包含博客展示与后台管理能力，适合作为个人主页、课程展示项目或个人作品站的基础模板使用。如需进一步扩展，可继续补充用户管理、文件上传存储、评论系统或更完整的后台编辑能力。
