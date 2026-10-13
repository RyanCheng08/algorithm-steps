# 技术设计与数据约定

## 技术选择

本地静态网站，HTML、CSS、原生 JavaScript ES Modules，无框架和外部 CDN 依赖。Node.js 内置 HTTP 服务用于启动；生产源码即可作为静态资源。使用浏览器 localStorage 保存个人进度，JSON 导入导出用于备份。无需安装 npm 第三方依赖。

选择简单、可读、可离线使用的实现。网站不依赖模型服务。Java 代码由课程数据中的同一份方法定义生成可下载源码，用本地 JDK 编译验证，避免讲解代码与下载代码分叉。

## 文件职责

```text
index.html               页面入口
assets/styles.css        响应式界面
src/app.js               导航、页面与交互
src/state.js             状态、校验、复习、备份
src/algorithms.js        纯函数生成演示步骤
src/data/lessons.js      12 节课程与 36 道随堂题
src/data/questions.js    LeetCode 候选题元数据
scripts/serve.mjs        本地服务器与可选本地 PDF 端点
scripts/build-java.mjs   从课程生成 Java 源码
java/AlgorithmLab.java   可下载的参考方法
java/AlgorithmLabTest.java Java 行为验证
tests/                  Node 内置测试
docs/                   需求、课程、题单和交付记录
```

## 课程契约

`lessons.js` 导出 `lessons` 数组和 `futureModules` 数组。课程字段：

```js
{
  id, number, title, subtitle, module, minutes,
  prerequisites: ['array'],
  source: { chapter: '第4章 数组与链表', section: '4.1 数组', bookPages: [64,68], pdfPages: [70,74], note: '原创辅助讲解' },
  objectives: ['...'], scenario: '...',
  sections: [{ title: '...', paragraphs: ['...'] }],
  pitfall: '...',
  java: { code: 'public static int ...', explanation: '...', method: 'sum' },
  simulation: { kind: 'sum', values: [3,1,4,2,5], target: 4 },
  quiz: [{ id: 'sum-1', type: 'choice', prompt: '...', options: ['...'], answer: 0, explanation: '...', misconception: '循环边界', hints: ['...','...'] },
         { id: 'sum-2', type: 'fill', prompt: '...', answer: ['<','i < nums.length'], explanation: '...', misconception: '...', hints: ['...'] }],
  challenge: { title: '...', prompt: '...', steps: ['...'], hints: ['...'], tests: [{ input: '...', expected: '...' }], javaMethod: 'sum' }
}
```

固定 ID：`algorithm,array,sum,max,linear,complexity,binary,boundary,selection,bubble,insertion,two-pointers`。

演示种类：`array,sum,max,count,linear,binary,boundary,selection,bubble,insertion,moveZeroes`。算法课复用 sum，复杂度课用 count 计数。演示步骤包括 `values, active, sorted, variables, message, codeMatch, comparisons, writes, reads`，不执行用户提供代码。整数输入允许 -99～99、最多 12 个元素；留空可测试空数组，最大值和下标访问给出前置条件提示。二分输入须非递减，错误时提示，不能静默排序改变用户数据。

Java 方法只用标准库和基础语法，`public static`，方法名每课唯一。算法步骤与 Java 方法逐一核对，课程文本的参考行号需要从最终代码确认。

`futureModules` 字段：`id,title,description,topics`。只展示规划状态，不能链接到空白课页。

## 题单契约

`questions.js` 导出 `questions` 数组，每题：`id`（数字题号）、`title`、`difficulty`（简单/中等）、`topic`、`url`、`summary`（原创一句学习目的）、`prerequisites`（首版 lesson id 数组）、`futurePrerequisites`（后续概念名称数组）、`extraPrerequisites`（补充知识字符串数组）、`stage`（ready/planned）、`recommendation`（主练/挑战）、`hint`、`verifiedAt`、`verification`（核验范围字符串）。首版 8 道题的额外前置写入 `extraPrerequisites`，不能误写入后续课程字段；其余 40 道标记为 planned。

榜单来源只标记已核对的成员关系。不能仅凭题目知名度标记属于 Hot100。题目可公开阅读不等于已验证无需登录提交或会员条件，核验范围在文档明确。

## 状态与备份

根对象 `version:1, lessons:{}, exercises:{}, problems:{}, notes:{}, lastLesson, updatedAt`，存储键 `algo-steps-v1`。题目状态包含本轮答案 `answer`、正误 `correct`、提示次数 `hints`、查看答案标记 `revealed`、本轮错误次数 `mistakes`、累计尝试 `attempts` 和作答时间 `answeredAt`；课程保存阅读标记、复习间隔阶段和到期时间。状态中只接纳已知课程/题目 ID，禁止任意键合并。导入验证版本、类型、大小、日期、枚举值，先验证再替换，并支持取消。`mistakes` 与 `attempts` 按非负整数校验，均不得超过 1000000，导出导入应完整保留。

“练习通过”由当前全部题目答对决定；“独立通过”额外要求当前轮每题提示数 `hints` 和错误数 `mistakes` 为零，且揭晓标记 `revealed` 为 false；未设置的字段按无相关记录处理。答错后页面显示解析，随后订正不能把这一轮算作独立通过。`resetRound` 清除本轮答案、作答时间、提示、揭晓与错误次数，保留累计尝试、阅读标记和复习安排。`submitAnswer` 返回的 `correct` 是本次回答的布尔结果，`correctCount` 单独表示本课答对数量，避免两者同名覆盖。

复习计算使用注入时间的纯函数。首次练习全对安排一天后复习。正常到期复习推进至 3、7、14 天前，要求全课答对，且每题 `answeredAt` 都不早于本次 `nextReviewAt`；不能用上轮残留答案满足新的复习轮次。未到期反复提交不推进阶段。答错设置立即复习与 `errorReview`，订正完成后按当前阶段重新安排，不晋级。最近答对可以从当前错题中移出，但保留本轮错误次数与累计尝试。

渲染用户笔记与导入文字时转义 HTML，不能执行注入内容。localStorage 写入失败保留内存状态并向用户显示可导出备份提示。

## 教材访问

优先通过本地服务器的固定 `/textbook.pdf` 端点打开原始 PDF 的指定页。端点只映射配置的单一文件，不开放任意本地路径读取；不会复制 PDF 进项目。没有 PDF 的设备仍可学习全部课程，界面提供官网章节入口与来源页码。

## 验证

Node 内置测试覆盖算法正确性与关键步骤、内容引用完整性、导入拒绝与复习时间边界。Java 程序覆盖空数组、负数、重复值、目标不存在和各种排序输入。浏览器实际验证导航、练习、刷新保留、备份、题目筛选及桌面/窄屏布局。HTTP 服务只绑定 127.0.0.1，路径解析限制在本站目录，拒绝目录穿越和隐藏配置文件。

## 静态发布

`npm run build` 按精确文件清单生成 `dist/`，不包含本地服务、PDF、笔记备份或临时文件。Pages 使用静态 `api/textbook` 声明本地教材不可用；相对资源 URL 与 hash 路由支持仓库子路径。Actions 使用 Node.js 22 和 Temurin JDK 17 验证后发布，配置与权限见 [部署说明](DEPLOYMENT.md)。
