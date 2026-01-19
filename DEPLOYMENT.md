# 🚀 MyESA 博客部署指南

本文档详细介绍如何将博客项目部署到生产环境。

---

## 部署架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   阿里云 ESA    │────▶│     Render      │────▶│     Turso       │
│  Pages (前端)   │     │   (后端 API)    │     │   (数据库)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 一、Turso 数据库部署

### 1. 安装 Turso CLI
```bash
# Windows (PowerShell)
irm get.turso.tech/cli | iex

# 或使用 npm
npm install -g turso
```

### 2. 登录 Turso
```bash
turso auth signup   # 注册账号
turso auth login    # 登录
```

### 3. 创建数据库
```bash
turso db create myesa-blog
```

### 4. 获取连接信息
```bash
# 获取数据库 URL
turso db show myesa-blog --url

# 创建 Token
turso db tokens create myesa-blog
```

### 5. 记录以下信息
```
TURSO_DATABASE_URL=libsql://myesa-blog-xxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOixxxxxxxxxx
```

---

## 二、Render 后端部署

### 1. 准备后端代码
确保 `backend/` 目录包含以下文件：
- `package.json` - 包含 `start` 脚本
- `src/index.ts` - 入口文件
- `.env.example` - 环境变量示例

### 2. 推送到 GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/YOUR_USERNAME/myesa-blog-backend.git
git push -u origin main
```

### 3. 在 Render 创建服务
1. 访问 [render.com](https://render.com)
2. 点击 **New** → **Web Service**
3. 连接 GitHub 仓库
4. 配置：
   - **Name**: `myesa-blog-api`
   - **Region**: `Singapore` (距离中国最近)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 4. 设置环境变量
在 Render Dashboard → Environment 中添加：
```
TURSO_DATABASE_URL=libsql://myesa-blog-xxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOixxxxxxxxxx
PORT=3000
```

### 5. 部署完成
Render 会自动部署，你将获得一个 URL：
```
https://myesa-blog-api.onrender.com
```

### 6. 设置 Cron Job 保活
Render 免费版会在 15 分钟无活动后休眠，配置唤醒：
1. 访问 [cron-job.org](https://cron-job.org)
2. 创建任务，每 10 分钟访问 `https://myesa-blog-api.onrender.com/health`

---

## 三、阿里云 ESA Pages 前端部署

### 1. 构建前端
```bash
cd frontend

# 设置生产环境 API 地址
echo "VITE_API_URL=https://myesa-blog-api.onrender.com" > .env.production

# 构建
npm run build
```

### 2. 登录阿里云 ESA 控制台
1. 访问 [ESA 控制台](https://esa.console.aliyun.com/)
2. 进入 **Pages** → **站点列表**

### 3. 创建新站点
1. 点击 **创建站点**
2. 选择 **从 GitHub 导入** 或 **手动上传**

#### 方式一：从 GitHub 导入（推荐）
1. 授权 GitHub 访问
2. 选择仓库
3. 配置构建设置：
   - **框架预设**: `Vite`
   - **构建命令**: `npm run build`
   - **输出目录**: `dist`
   - **环境变量**: 
     ```
     VITE_API_URL=https://myesa-blog-api.onrender.com
     ```

#### 方式二：手动上传
1. 本地执行 `npm run build`
2. 将 `dist/` 目录打包为 zip
3. 上传到 ESA Pages

### 4. 配置域名（可选）
1. 在站点设置中点击 **自定义域名**
2. 添加你的域名
3. 配置 DNS CNAME 记录

### 5. 部署完成
你将获得一个 ESA 域名：
```
https://myesa-blog.8a5362ec.er.aliyun-esa.net
```

---

## 四、环境变量汇总

### 前端 (.env.production)
```bash
VITE_API_URL=https://myesa-blog-api.onrender.com
```

### 后端 (.env)
```bash
TURSO_DATABASE_URL=libsql://myesa-blog-xxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOixxxxxxxxxx
PORT=3000
```

---

## 五、验证部署

### 1. 检查后端健康
```bash
curl https://myesa-blog-api.onrender.com/health
# 返回: {"status":"ok","timestamp":"..."}
```

### 2. 检查前端
访问 ESA Pages URL，确认页面正常加载。

### 3. 检查 API 连接
在浏览器控制台检查是否有 CORS 或网络错误。

---

## 六、常见问题

### Q: Render 冷启动太慢？
A: 免费版会休眠，首次访问需等待 30-60 秒。可升级付费版或使用 cron-job 保活。

### Q: ESA Pages 构建失败？
A: 检查 `package.json` 中的 Node 版本，ESA 默认使用 Node 18。

### Q: 数据库连接失败？
A: 确认 Turso Token 未过期，URL 格式正确。

---

## 七、一键部署脚本

```bash
# deploy.sh
#!/bin/bash

echo "🔨 构建前端..."
cd frontend
npm run build

echo "📦 打包 dist..."
zip -r dist.zip dist/

echo "✅ 完成！请上传 dist.zip 到 ESA Pages"
```

---

祝部署顺利！🎉
