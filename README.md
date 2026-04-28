# 秋兰以为佩 · 博客

> 在学习与迷茫之间 · 探索 · 记录 · 沉淀

<div align="center">

![Astro](https://img.shields.io/badge/Astro-4.0-red.svg?style=for-the-badge&logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC.svg?style=for-the-badge&logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Node.js-Standalone-339933.svg?style=for-the-badge&logo=node.js)

[预览](#) · [文档](#) · [部署](#)

</div>

---

## 📜 项目概述

这是一个基于 **Astro 4.0** 构建的现代化个人博客系统，融合了极简主义设计理念与前沿的技术栈。

> "扈江离与辟芷兮，纫秋兰以为佩。" —— 《离骚》

在这个充满算法与数据的世界里，我们试图寻找某种平衡。不只是代码的搬运工，更是逻辑构建的爱好者。

### ✨ 核心特性

- 🚀 **Astro 4.0** - 下一代静态站点生成器
- 🎨 **深色模式** - 优雅的深色主题，支持自动切换
- 📱 **响应式设计** - 完美适配移动端与桌面端
- 🔐 **安全认证** - 基于 Session 的管理员认证系统
- 📄 **Markdown 增强** - 自定义指令与 Admonitions 支持
- 🖼️ **OCR 集成** - 智能识别奖状与文档内容
- 🎯 **性能优化** - 内置缓存机制与代码分割
- 🎭 **页面过渡动画** - 流畅的交互体验

---

## 🏗️ 技术架构

### 前端技术栈

```
┌─────────────────────────────────────────────────────────┐
│                     Astro 4.0                            │
├─────────────────────────────────────────────────────────┤
│  React 18  │  TailwindCSS 3  │  TypeScript 5           │
├─────────────────────────────────────────────────────────┤
│  MDX       │  PaddleOCR      │  PDF.js                 │
└─────────────────────────────────────────────────────────┘
```

### 后端服务

- **Node.js Server** - 独立运行模式
- **MySQL 8.0** - 关系型数据库
- **Session 管理** - 7 天有效期
- **密码加密** - scrypt 算法 + 盐值

### 核心依赖

| 类别       | 技术选型                    | 版本             |
| ---------- | --------------------------- | ---------------- |
| **框架**   | Astro                       | ^4.0.0           |
| **UI**     | React + TailwindCSS         | ^18.2.0 / ^3.0.0 |
| **数据库** | mysql2                      | ^3.22.3          |
| **OCR**    | onnxruntime-web + PaddleOCR | ^1.24.3          |
| **PDF**    | pdfjs-dist                  | ^5.6.205         |
| **图标**   | Remix Icon + Phosphor       | Latest           |
| **工具**   | date-fns, clsx, gray-matter | Latest           |

---

## 🎨 设计语言

### 色彩系统

```css
Primary:   #06b6d4 (Cyan)
Dark:      #0f172a → #1e293b (渐变深色)
Glow:      0 0 10px rgba(6, 182, 212, 0.5)
```

### 字体排印

- **Sans**: Inter, Noto Sans SC
- **Serif**: Noto Serif SC
- **Mono**: JetBrains Mono

### 视觉元素

- 🎬 **背景视频** - 动态渐变效果
- ✨ **微光阴影** - 主题色光晕
- 🎭 **过渡动画** - Fade/Slide/Scale 三种模式
- 📐 **极简卡片** - 毛玻璃效果

---

## 📁 项目结构

```
X_blog/
├── src/
│   ├── components/        # UI 组件
│   │   ├── admin/         # 管理后台组件
│   │   └── widgets/       # 功能组件
│   ├── layouts/           # 布局模板
│   ├── lib/               # 核心库
│   │   ├── vendor/        # 第三方库封装
│   │   └── *.ts           # 业务逻辑
│   ├── pages/             # 页面路由
│   │   ├── admin/         # 管理后台
│   │   └── api/           # API 端点
│   ├── scripts/           # 客户端脚本
│   ├── styles/            # 全局样式
│   └── types/             # TypeScript 类型
├── public/                # 静态资源
│   ├── ocr/               # OCR 模型
│   ├── videos/            # 视频资源
│   └── images/            # 图片资源
├── scripts/               # Python 脚本
└── dist/                  # 构建输出
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- MySQL >= 8.0
- Python >= 3.8 (可选，用于 OCR 脚本)

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件：

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=blog
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:4321`

### 生产构建

```bash
npm run build
npm run start
```

---

## 🗄️ 数据库设计

### 核心表结构

#### admin_users

```sql
CREATE TABLE admin_users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(512) NOT NULL,
  password_salt VARCHAR(512) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL
);
```

#### admin_sessions

```sql
CREATE TABLE admin_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  token_hash VARCHAR(512) NOT NULL,
  expires_at VARCHAR(40) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES admin_users(id)
);
```

#### articles / awards / documents

- 支持 Markdown 内容存储
- 元数据（分类、标签、时间）
- 附件管理

---

## 🔐 安全机制

### 密码加密

```typescript
// scrypt 密钥派生
const { salt, hash } = hashPassword(password);
// 64 字节派生密钥 + 16 字节随机盐
```

### Session 管理

```typescript
// 7 天有效期
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
// Token 哈希存储
const tokenHash = hashSessionToken(token);
```

### 安全实践

- ✅ 密码加盐哈希
- ✅ Session Token 随机生成
- ✅ SQL 参数化查询
- ✅ HTTPS Cookie 传输
- ✅ 敏感操作身份验证

---

## 🎯 核心功能

### 1. 文章管理

- Markdown 解析与渲染
- 自定义 Frontmatter
- 分类与标签系统
- 代码高亮与 Admonitions

### 2. 奖项展示

- OCR 智能识别
- 自动提取关键信息
- 时间线展示
- 高清图片预览

### 3. 文档解析

- PDF 文件解析
- 内容提取与索引
- 搜索功能

### 4. 缓存系统

```typescript
// 5 分钟 TTL
const DEFAULT_TTL = 5 * 60 * 1000;
// 自动过期清理
clearExpiredCache();
```

---

## 🧪 OCR 功能

### 技术选型

- **PaddleOCR v5** - 轻量级 OCR 引擎
- **ONNX Runtime** - 跨平台推理
- **RapidOCR** - 快速识别

### 使用示例

```python
# Python OCR 脚本
from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()
result, _ = ocr(image_path)
```

### 支持场景

- ✅ 奖状证书识别
- ✅ 文档内容提取
- ✅ 多语言支持
- ✅ 高精度识别

---

## 📦 部署指南

### Node.js 服务器

```bash
# 构建
npm run build

# 启动
npm run start
```

### 环境变量配置

确保生产环境配置正确的数据库连接信息。

### 反向代理（可选）

使用 Nginx 或 Caddy 进行反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4321;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🛠️ 开发规范

### 代码风格

- TypeScript Strict 模式
- ESLint + Prettier 格式化
- 组件命名：PascalCase
- 文件命名：kebab-case

### Git 提交

```bash
git commit -m "类型：描述"

# 类型说明
feat:     新功能
fix:      修复 bug
docs:     文档更新
style:    代码格式
refactor: 重构
test:     测试
chore:    构建/工具
```

---

## 📄 许可证

本项目采用 **MIT** 许可证。

---

## 🤝 保持联系

- 📧 Email: 2417275843@qq.com
- 💻 GitHub: [@fuxuanyue520](https://github.com/fuxuanyue520)
- 🌐 博客：[秋兰以为佩](#)

---

<div align="center">

**"代码如诗，架构如韵"**

Made with ❤️ by 秋兰以为佩

</div>
