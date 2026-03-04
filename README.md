# LifeOS Web - 自律功能型应用

基于 Vue3 + Vite 的个人生活管理系统 Web 版本。

## 🚀 功能模块

- **打卡** - 日历视图 + 10 分制评分 + 颜色标记
- **任务** - 级别系统 (小/中/大) + 墨点奖励
- **思记** - 复盘 + 备忘录
- **抽奖** - 转盘抽奖 + 概率系统
- **统计** - 数据图表
- **设置** - 个人配置

## 🛠️ 技术栈

- Vue 3 + Vite
- Pinia (状态管理)
- Vue Router
- Express (后端 API)
- SQLite (数据库)

## 📦 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动后端 API
npm run server

# 构建生产版本
npm run build
```

## 🌐 Vercel 部署

```bash
# 登录 Vercel
vercel login

# 部署
vercel --prod
```

## 📱 API 接口

后端 API 运行在 `/api/*` 路径下：

- `/api/checkin/*` - 打卡相关
- `/api/tasks/*` - 任务相关
- `/api/notes/*` - 思记相关
- `/api/lottery/*` - 抽奖相关
- `/api/profile` - 用户配置
- `/api/feishu/*` - 飞书集成
- `/api/ollama/*` - Ollama AI 集成

## 📄 License

MIT
