# MyESA Blog - 个人博客

## 本项目由[阿里云ESA](https://www.aliyun.com/product/esa)提供加速、计算和保护
![阿里云ESA](https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png)

## 📖 项目简介

这是一个高端、功能丰富的个人博客系统，设计灵感来自 [adnaan.cn](http://www.adnaan.cn)。采用 **Bento UI + 玻璃拟态** 设计风格，部署于阿里云 ESA Pages。

## ✨ 功能特色

### 🎨 视觉设计
- **玻璃拟态 (Glassmorphism)**：半透明毛玻璃卡片效果
- **动态背景**：AI 生成的深空星云/柔和渐变背景
- **明暗主题切换**：一键切换暗色/亮色模式

### 📂 核心功能
| 功能模块 | 描述 |
|---------|------|
| **首页** | 个人信息、音乐播放器、GitHub热力图、关键词云 |
| **项目展示** | 自动同步 GitHub 仓库，展示 ESA 部署链接 |
| **手记功能** | 日记/文案编辑，支持时间排序、点赞 |
| **AI 小助手** | 右下角智能助手，支持多厂商 AI API 配置 |

### 🤖 AI 小助手配置
支持以下 AI 服务商：
- 通义千问 (Qwen)
- DeepSeek
- Kimi (月之暗面)
- 智谱 GLM
- OpenAI
- Anthropic
- Google AI

## 🚀 如何使用 ESA 边缘能力

### 1. 全球 CDN 加速
所有静态资源（JS、CSS、图片）通过 ESA 边缘节点全球分发，确保低延迟访问。

### 2. 边缘函数 (Edge Functions)
- `functions/api/index.ts`：处理 API 请求
- 未来计划：边缘缓存 GitHub 数据、访问量统计

### 3. 路由配置
在 `esa.jsonc` 中配置静态资源和 API 路由规则。

## 🛠️ 技术栈

- **前端**：React + TypeScript + Vite
- **样式**：Tailwind CSS + Framer Motion
- **状态管理**：Zustand
- **图表**：Recharts
- **部署**：阿里云 ESA Pages

## 📦 本地开发

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📋 部署指南

1. 将代码推送到 GitHub
2. 登录 [阿里云 ESA 控制台](https://esa.console.aliyun.com/)
3. 创建 Pages 项目，连接 GitHub 仓库
4. 配置：
   - **根目录**：`ESA_Pages_竞赛项目集/02_MyESA_Blog/frontend`
   - **构建命令**：`npm run build`
   - **输出目录**：`dist`
5. 点击部署

## 📁 项目结构

```
02_MyESA_Blog/
├── frontend/           # 前端代码
│   ├── src/
│   │   ├── assets/     # 图片资源
│   │   ├── components/ # UI 组件
│   │   ├── pages/      # 页面
│   │   ├── store/      # 状态管理
│   │   └── services/   # API 服务
│   └── package.json
├── functions/          # ESA 边缘函数
├── README.md           # 说明文档
└── esa.jsonc           # ESA 配置
```

## 📄 许可证

MIT License
