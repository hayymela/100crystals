# 结晶百相（Miners）世界观&小说阅读静态内容网站

## 项目概述
基于原创企划《结晶百相》构建的静态小说世界观内容网站，包含完整26章小说正文、世界观百科、角色图鉴、地理设定、势力阵营等内容。

## 技术栈
- HTML5 + CSS3（自定义设计系统） + 原生JavaScript（ES6+）
- 无框架依赖，无后端，全部数据内置JSON
- 支持部署到 Vercel / Cloudflare Pages / GitHub Pages / 任意静态服务器

## 项目结构
```
site/
├── index.html          # 首页
├── novel.html          # 小说阅读页（26章完整正文）
├── worldview.html      # 世界观百科
├── characters.html     # 角色图鉴（24人）
├── geography.html      # 地理设定（世界地图+10城市）
├── factions.html       # 势力阵营（4大势力）
├── about.html          # 关于页面
├── css/
│   └── style.css       # 设计系统（暗紫幽蓝色调，3套主题）
├── js/
│   ├── common.js       # 公共功能（导航/搜索/主题/图片放大/回到顶部）
│   ├── novel.js        # 小说阅读（章节加载/字号行高/进度记忆/键盘导航）
│   ├── characters.js   # 角色图鉴（筛选/弹窗/分组展示）
│   └── geography.js    # 地理页（城市弹窗）
├── data/
│   ├── novel.json      # 26章小说数据（约8万字）
│   ├── characters.json # 24角色完整档案
│   ├── worldview.json  # 世界观设定（灾难/陨星生物/共生者/帕拉里斯）
│   ├── geography.json  # 地理数据（2大陆+10城市）
│   └── factions.json   # 四大势力数据
└── assets/
    ├── logo.png         # 作品Logo
    ├── maps/
    │   └── world_map.png  # 世界地图
    └── characters/      # 角色立绘图片（14张）
```

## 本地预览
```bash
cd site
python -m http.server 8080
# 浏览器访问 http://localhost:8080
```

## 部署方式

### Vercel
1. 将 `site/` 目录上传到 GitHub 仓库
2. 在 Vercel 导入仓库，设置 Output Directory 为 `site`
3. 自动部署，无需构建命令

### Cloudflare Pages
1. 连接 GitHub 仓库
2. Build output directory 设为 `site`
3. 无需构建命令

### GitHub Pages
1. 将 `site/` 目录内容推送到 `gh-pages` 分支
2. 或在仓库设置中开启 GitHub Pages，选择对应分支

### 直接部署
将 `site/` 目录完整上传到任意支持静态文件的服务器即可。

## 功能清单
- [x] 7个页面，导航互相跳转
- [x] 小说26章完整正文（约8万字），不删减
- [x] 暗色/亮色阅读模式，全局切换，localStorage记忆
- [x] 阅读字号4档调节、行高3档调节
- [x] 阅读进度本地保存（localStorage）
- [x] 章节侧边目录导航，上一章/下一章，键盘左右键
- [x] 角色图鉴24人，按阵营/共生物质筛选
- [x] 角色详情弹窗
- [x] 世界地图点击放大（Lightbox）
- [x] 城市点击弹出简介
- [x] 全站搜索（角色名/地名/章节标题）
- [x] 移动端汉堡菜单，完全响应式
- [x] 回到顶部浮动按钮

## 内容来源
全部世界观文本、角色描述、小说正文来自两份PDF源文档：
1. CPTOC企划.pdf（36页，世界观设定）
2. 结晶百相科麦尔岛篇.pdf（208页，26章小说正文）

禁止自行编造设定，保留原作诗歌和对白。
