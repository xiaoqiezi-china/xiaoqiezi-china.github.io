# DST 静态宣传页

纯静态、零构建的两页站点，可直接托管在 GitHub Pages / Cloudflare Pages / 任意静态服务器。

## 页面

| 文件 | 内容 |
| --- | --- |
| `index.html` | 首页：打字机轮换标题 + 生态简介 + 仓库导航 + 路线图 |
| `dpcl/index.html` | DPCL 使用教程（按 `DPCL.md` 重构为分步教程） |
| `css/style.css` | 首页设计系统（颜色/字体/间距令牌，深色模式） |
| `css/doc.css` | 教程页扩展样式（目录、步骤、图片灯箱、代码块） |
| `js/main.js` | 打字机、主题切换、滚动入场、导航高亮 |
| `js/doc.js` | 教程页目录定位、阅读进度、图片放大、复制 |
| `assets/shots/` | 教程截图（WebP，来源 `notes/_assets`） |

## 本地预览

直接双击 `index.html` 即可（全部为相对路径）。需要 http 环境时：

```bash
python -m http.server 8080    # 然后访问 http://127.0.0.1:8080
```

## 打字机内容修改

文案集中在 `js/main.js` 顶部的 `TYPE_POOL` 数组，按三类维护：

- **单项池**：'开源，体验，AI' … '真的有人用吗'，按给定顺序循环；
- **序列池**：6 句「X 是世界上最好的语言.Y」，命中后从第一句顺序播完（定义在 `POINT1_INDEX / POINT1_LEN`）；
- **低权重**：`LOW_WEIGHT` 集合内的短句出现频率更低，避免被抢走注意力。

## 部署

推送到 `main` 分支后，仓库 Settings → Pages → Source 选择 **GitHub Actions**，`pages.yml` 会自动发布。

## 注意

- 网站不使用任何 emoji，图标全部为内联 SVG；
- 无外部 CDN 依赖，离线可打开；
- `_work/` 为一次性脚本，不会被发布。
