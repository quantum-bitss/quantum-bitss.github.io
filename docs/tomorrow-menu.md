# 明天也要好好吃饭

独立静态页：`public/tomorrow/`，发布路径 `/tomorrow/`。主页不展示入口，通过网址访问；页面设置 `noindex, nofollow`，请求搜索引擎不收录。此设置不提供身份验证，知道网址的人仍可访问。沿用现有 GitHub Pages 工作流，无新增运行依赖。

- `index.html`：中文页面与文案。
- `style.css`：独立样式，适配手机、桌面和减少动态效果设置。
- `menu.mjs`：餐厅、菜品、咖啡及搭配规则。
- `app.mjs`：日期切换、确认和浏览器本地保存。

同一天选择两家不同餐厅，盛香亭再在三种粉中随机选择。有前一天菜单时，避开前一天的餐厅组合，包括午晚餐对调。重新抽取也避开当前餐厅组合。咖啡独立随机选择。不存在前一天记录时，不推测实际用餐。

使用设备当地日期。菜单自动保存到当前浏览器的 localStorage，最多保留 60 天记录，不跨设备同步。确认后刷新仍保留；主动重新抽取会替换菜单并取消确认。切回隔夜页面时更新日期。存储不可用时显示提示并保留当前会话的菜单。

验证规则：

```sh
node --test tests/tomorrow-menu.test.mjs
```

独立预览（打开 http://localhost:4173/tomorrow/）：

```sh
python3 -m http.server 4173 --directory public
```

完整站点构建使用项目现有的 `npm run build`。构建产物应包含 `out/tomorrow/index.html`、`style.css`、`app.mjs` 和 `menu.mjs`。
