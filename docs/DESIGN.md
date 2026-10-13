# 界面与交互设计

## 视觉

产品名称为算法拾级。以浅米白页面、白色内容区、深墨绿导航与主按钮为基调，橙色只强调当前步骤和少量行动入口。使用系统中文字体，无外链字体与图库依赖。数组图、轨迹与进度均由页面元素绘制，装饰不能冒充真实学习数据。

桌面保留约 220px 左侧导航，主区限宽 1280px，正文段落控制行长。窄屏导航置于顶部，统计两列、实验一列、题目列表可横向滚动或卡片化。交互使用真实 button、input、select、textarea 元素，标签和键盘焦点可见。

## 页面

首页：推荐下一课、四项独立统计、继续学习与复习入口、当前阶段课程。

路线：12 节可学习课程按起步、查找、排序与迁移分组；后续模块有内容概要和规划标签。课程可自由访问，缺失先修时提示。

课程：顶部编号、标题、目标、教材来源；讲解、实验与代码、随堂练习、编程挑战四个标签页。阅读完成按钮与练习结果独立。每课有上一课/下一课导航。

实验：数据输入、目标或下标、样例按钮、重置；数组格子同时显示值和索引。当前访问、已确认区域分别用文字和颜色提示。前进/后退控制可重复推演；解释区显示本步意义及变量。Java 区高亮能够确认对应关系的行，不伪造逐行执行器。

题单：按专题、首版/后续、难度、记录状态筛选，支持搜索题号与题名。官方链接与手动完成记录分开。缺失先修在题目卡可见。

复习：错题优先，之后为到期课程；所有已开始课程可主动复习。笔记按课编辑，界面保留最近一次保存状态。

备份：导出 JSON；导入先解析与校验，再展示记录规模和覆盖确认。无效文件不影响现有记录。清空记录需专门确认，不与普通重做练习混用。

## 页面样式契约

布局类名：`app-shell,sidebar,brand,brand-mark,brand-copy,nav-list,nav-link,nav-icon,sidebar-footer,main,topbar,breadcrumb,top-actions,page,page-heading,eyebrow,muted,small`。

基础类名：`btn,btn-primary,btn-secondary,btn-ghost,btn-small,icon-btn,badge,badge-green,badge-orange,badge-muted,panel,panel-header,section-heading,empty-state,notice,notice-warning,notice-success,toast,sr-only`。

首页类名：`hero,hero-copy,hero-art,hero-kicker,hero-actions,hero-array,hero-cell,hero-index,hero-caption,stats-grid,stat-card,stat-value,stat-label,dashboard-grid,continue-card,review-card,course-grid,course-card,course-number,course-meta,course-footer,progress-track,progress-fill`。

路线类名：`roadmap-group,roadmap-list,roadmap-item,roadmap-number,roadmap-detail,roadmap-status,future-grid,future-card`。

课程类名：`lesson-heading,lesson-meta,lesson-nav,tabs,tab,is-active,lesson-body,reading-layout,reading-main,reading-aside,objectives,reading-section,source-card,code-block,code-line,code-number,code-text,is-current,lesson-bottom`。

实验类名：`lab-toolbar,field,field-label,field-input,preset-row,lab-grid,visual-panel,array-stage,array-cell,array-value,array-index,is-active-cell,is-sorted-cell,lab-variables,variable-chip,step-message,step-controls,step-counter,metrics-row,metric,prediction-box`。

练习与题单类名：`quiz-list,quiz-card,quiz-number,quiz-options,quiz-option,is-selected,quiz-actions,quiz-feedback,quiz-hints,answer-input,quiz-summary,challenge-grid,checklist,test-table,filters,problem-list,problem-card,problem-heading,problem-meta,problem-actions,problem-prerequisites`。

复习与备份类名：`review-list,review-item,note-grid,note-card,note-input,dialog,dialog-actions,footer`。所有按钮禁用态必须明显，长代码与长路径在各自容器内部滚动，避免撑宽整页。
