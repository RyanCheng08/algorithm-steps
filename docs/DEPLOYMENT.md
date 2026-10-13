# GitHub Actions 与 Pages 发布

## 发布目标

独立公开仓库：`RyanCheng08/algorithm-steps`。网站地址以 GitHub Pages 部署输出为准，预期为 `https://ryancheng08.github.io/algorithm-steps/`。

仓库仅包含算法网站的源码、原创学习内容、测试、参考 Java、开发文档与页面截图，不包含父级学习工作区、原教材 PDF、学习记录备份、临时文件或编译产物。父级私有备份仓库保持原有设置。

## 构建与发布流程

工作流为 [pages.yml](../.github/workflows/pages.yml)。推送 `main` 自动触发；也可在 Actions 页面手动运行。Pull Request 只做构建验证，不发布站点。

1. 使用 Node.js 22 执行 JavaScript、课程内容、学习记录和构建规则测试。
2. 从课程生成 Java 源码，检查生成结果与已提交版本一致。
3. 使用 Temurin JDK 17 编译并运行 Java 边界测试。
4. `npm run build` 生成 `dist/`。
5. 通过官方 Pages artifact 与 deploy actions 发布构建产物。

项目不依赖第三方 npm 包，因此没有依赖安装步骤。Actions 固定到官方仓库的完整提交 SHA；只有部署任务具备 `pages: write` 与 `id-token: write` 权限，不需要单独保存个人访问令牌。

采用 GitHub 官方的[自定义 Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。仓库 Settings → Pages 的构建来源应设为 **GitHub Actions**。

## 静态发布边界

构建使用精确文件允许清单，仅发布页面、样式、前端模块、参考 Java 下载与静态教材状态。源码中的资源链接均相对于站点目录，支持 `/algorithm-steps/` 这样的项目子路径；课程路由使用 URL hash，刷新课程地址不会要求服务器提供动态路由。

在线版不能访问用户电脑中的 PDF。教材卡片保留章节、书内/PDF 页码与 Hello 算法官网入口。本地 `npm start` 仍能通过只读接口打开本机原书；构建产物不包含教材文件或本地服务器。

在线版的笔记和进度仍保存在当前浏览器，不会上传到 GitHub。线上地址与 `127.0.0.1:4173` 的存储相互独立，需要从原地址导出 JSON，再在新地址导入。GitHub Pages 同一域名下的页面共享浏览器存储来源；本应用使用自己的存储键，不把源码推送等同于学习记录同步。

## 后续更新

在本项目仓库内修改课程或代码后，执行 `npm run check` 和 `npm run build`，检查差异，再提交并推送 `main`。Actions 成功构建及部署后，线上版本随之更新。不要提交 `dist/`、`tmp/`、`.class`、`.env`、PDF 或个人学习备份。

发布成功与否以对应提交的 Actions build/deploy 结果和线上 HTTP 验证为准，仅推送成功不代表发布完成。
