import { lessons, futureModules } from './data/lessons.js';
import { questions } from './data/questions.js';
import { makeTrace, parseValues, parseTarget } from './algorithms.js';
import { STORAGE_KEY, createState, checkAnswer, lessonResult, touchLesson, recordHelp, submitAnswer, resetRound, dueLessons, stats, validateBackup } from './state.js';

const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icons = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  route: '<path d="M5 5h14M5 12h14M5 19h14"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/>',
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>',
  review: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-4v5l3 2"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  book: '<path d="M12 5v16M3 3h5l4 2 4-2h5v16h-5l-4 2-4-2H3z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>',
};
const icon = name => `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;
const lessonById = id => lessons.find(l => l.id === id);
const formatDate = value => value ? new Date(value).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }) : '尚未安排';
const routeLink = (lesson, tab = 'reading') => `#/lesson/${lesson.id}?tab=${tab}`;
let state = createState();
let storageWarning = '';
let recoveryRaw = null;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { state = validateBackup(JSON.parse(raw), lessons, questions); }
    catch { recoveryRaw = raw; storageWarning = '已有记录无法读取，原始记录仍保留。请先导出原始记录；当前学习暂存于本次页面，导入有效备份后恢复自动保存。'; }
  }
} catch { storageWarning = '浏览器暂不允许保存记录。本次学习仍可使用，请在离开前导出备份。'; }
let currentRoute = '';
let lab = null;
let pendingImport = null;
let textbookAvailable = false;
let toastTimer;
let filters = { search: '', stage: 'ready', difficulty: 'all', topic: 'all', status: 'all' };

function persist() {
  state.updatedAt = new Date().toISOString();
  if (recoveryRaw !== null) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { storageWarning = '浏览器保存失败，记录暂存在当前页面。请导出备份后再离开。'; showToast(storageWarning); }
}
function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
}
function download(filename, body, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportState() {
  download(`算法拾级-学习备份-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2));
  showToast('已导出学习记录与笔记。请保留下载的 JSON 文件。');
}
const badge = (text, style = 'muted') => `<span class="badge badge-${style}">${escapeHtml(text)}</span>`;
function lessonStatus(lesson) {
  const result = lessonResult(state, lesson);
  if (result.independent) return badge('独立通过', 'green');
  if (result.allCorrect) return badge('练习通过', 'green');
  if (state.lessons[lesson.id]?.readAt) return badge('已阅读', 'orange');
  if (state.lessons[lesson.id]?.lastSeenAt) return badge('学习中', 'orange');
  return badge('未开始');
}
function suggestedLesson() {
  const recent = lessonById(state.lastLesson);
  if (recent && !lessonResult(state, recent).allCorrect) return recent;
  return lessons.find(l => !lessonResult(state, l).allCorrect) || lessons[0];
}
function shell(content, active, breadcrumb) {
  const nav = [['home', '/', '我的学习'], ['route', '/roadmap', '学习路线'], ['code', '/practice', '练习题单'], ['review', '/review', '复习与笔记']];
  const count = stats(state, lessons);
  return `<div class="app-shell">
    <aside class="sidebar"><a href="#/" class="brand" aria-label="算法拾级首页"><span class="brand-mark"><i></i><i></i><i></i></span><span class="brand-copy"><strong>算法拾级</strong><small>一步一步，理解算法</small></span></a>
    <div class="sidebar-label">学习工作台</div><nav class="nav-list" aria-label="主导航">${nav.map(([name, url, label]) => `<a class="nav-link ${active === name ? 'active' : ''}" href="#${url}" ${active === name ? 'aria-current="page"' : ''}><span class="nav-icon">${icon(name)}</span><span>${label}</span>${name === 'review' && count.due ? `<span class="nav-count">${count.due}</span>` : ''}</a>`).join('')}</nav>
    <div class="sidebar-course"><span class="eyebrow">正在学习</span><strong>Java 算法入门</strong><p>从数组出发，建立解题直觉。</p><div class="progress-track"><div class="progress-fill" style="width:${count.passed / lessons.length * 100}%"></div></div><small>${count.passed} / ${lessons.length} 课练习通过</small></div>
    <div class="sidebar-footer">${icon('book')}<div><strong>Hello 算法 · 配套学习</strong><small>本地记录 · 随时导出备份</small></div></div></aside>
    <main class="main" id="main-content" tabindex="-1"><header class="topbar"><div class="breadcrumb">学习空间 <span>/</span> ${escapeHtml(breadcrumb)}</div><div class="top-actions"><span class="badge badge-green">Java 学习路线</span><button class="btn btn-ghost btn-small" data-action="export">${icon('download')} 导出记录</button><button class="btn btn-ghost btn-small" data-action="import">导入备份</button></div></header>
    ${storageWarning ? `<div class="notice notice-warning">${escapeHtml(storageWarning)}${recoveryRaw !== null ? '<button class="btn btn-small" data-action="recover">导出原始记录</button>' : ''}</div>` : ''}
    <div class="page">${content}</div><footer class="footer">算法拾级 · 基于《Hello 算法》的个人学习实践 <span>先理解，再动手。</span></footer></main></div>`;
}

function courseCard(lesson) {
  return `<a class="course-card" href="${routeLink(lesson)}"><div class="course-meta"><span class="course-number">${String(lesson.number).padStart(2, '0')}</span>${lessonStatus(lesson)}</div><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.subtitle)}</p><div class="course-footer"><span>${lesson.minutes} 分钟 · ${lesson.quiz.length} 道练习</span>${icon('arrow')}</div></a>`;
}

function homePage() {
  const counts = stats(state, lessons);
  const next = suggestedLesson();
  const due = dueLessons(state, lessons);
  const startIndex = lessons.findIndex(l => l.id === next.id);
  return shell(`<div class="hero"><div class="hero-copy"><span class="hero-kicker"><span class="status-dot"></span> HELLO, ALGORITHM</span><h1>一步一步，<br>把算法学明白<span class="accent-dot">。</span></h1><p>从一组数字开始，在每一次观察、推演和练习中，<br class="desktop-only">把“看懂了”变成“我会了”。</p><div class="hero-actions"><a class="btn btn-primary" href="${routeLink(next)}">${state.lastLesson ? '继续学习' : '开始第一课'} ${icon('arrow')}</a><a class="btn btn-ghost" href="#/roadmap">查看学习路线</a></div><div class="hero-footnote">12 节基础课 <span>·</span> Java 代码 <span>·</span> 可交互实验</div></div>
    <div class="hero-art" aria-label="数组查找示意图"><div class="art-label">把抽象，变成看得见的步骤</div><div class="hero-array">${[2, 5, 8, 12, 16].map((v, i) => `<div class="hero-array-item"><span class="hero-index">${i}</span><span class="hero-cell ${i === 2 ? 'current' : ''}">${v}</span>${i === 2 ? '<span class="array-pointer">↑<small>mid</small></span>' : ''}</div>`).join('')}</div><div class="hero-caption"><span class="code-token">target = 12</span><span>比较一次，缩小一半范围。</span></div><div class="art-note"><span>01 / 03</span> 观察 → 推演 → 理解</div></div></div>
    <div class="stats-grid">${[[counts.read, '已阅读课程', '阅读是第一步', 'book'], [counts.passed, '练习通过', '用练习检验理解', 'check'], [counts.independent, '独立通过', '本轮无提示且一次答对', 'code'], [counts.due, '待复习课程', '让理解留得更久', 'review']].map(([n, label, note, ico]) => `<div class="stat-card"><div class="stat-label">${label}${icon(ico)}</div><strong class="stat-value">${n}<small>${label === '待复习课程' ? '课' : `/ ${lessons.length}`}</small></strong><span class="small muted">${note}</span></div>`).join('')}</div>
    <div class="dashboard-grid"><section class="panel continue-card"><div class="panel-header"><span class="eyebrow">${state.lastLesson ? '接着上次，往前一步' : '你的第一步'}</span>${badge(next.module, 'green')}</div><h2>${String(next.number).padStart(2, '0')} <span>${escapeHtml(next.title)}</span></h2><p>${escapeHtml(next.objectives[0])}</p><div class="continue-bottom"><span class="small muted">约 ${next.minutes} 分钟 · 阅读 + 实验 + 练习</span><a class="btn btn-secondary btn-small" href="${routeLink(next)}">进入课程 ${icon('arrow')}</a></div></section>
    <section class="panel review-card"><div class="panel-header"><span class="eyebrow">温故知新</span>${icon('review')}</div><h2>${due.length ? `${due.length} 节课，等你回顾` : '给理解一点时间'}</h2><p>${due.length ? '从错题和到期内容开始，看看哪些已经能独立完成。' : '完成随堂练习后，这里会安排复习。每一次独立回想，都让知识更牢固。'}</p><a class="text-link" href="#/review">查看复习与笔记 ${icon('arrow')}</a></section></div>
    <section><div class="section-heading"><div><span class="eyebrow">循序渐进</span><h2>从这里继续探索</h2></div><a class="text-link" href="#/roadmap">全部 12 节课 ${icon('arrow')}</a></div><div class="course-grid">${lessons.slice(startIndex, startIndex + 3).map(courseCard).join('')}</div></section>
    <div class="notice learning-note">${icon('book')}<div><strong>一条适合起步的路线</strong><p>先学数组与查找，再理解排序。链表、树、图和动态规划已列入后续路线，当前先把基础走稳。</p></div></div>`, 'home', '我的学习');
}

function roadmapPage() {
  const modules = [...new Set(lessons.map(l => l.module))];
  return shell(`<div class="page-heading"><span class="eyebrow">LEARNING PATH</span><h1>每一小步，都算数。</h1><p>按先修知识逐步前进，也可以随时回到已经学过的地方。</p></div>
    ${modules.map((module, i) => `<section class="roadmap-group"><div class="section-heading"><h2><span class="muted">0${i + 1}</span> ${escapeHtml(module)}</h2>${badge('现在可以学习', 'green')}</div><div class="roadmap-list">${lessons.filter(l => l.module === module).map(l => `<a href="${routeLink(l)}" class="roadmap-item"><div class="roadmap-number">${String(l.number).padStart(2, '0')}</div><div class="roadmap-detail"><h3>${escapeHtml(l.title)}</h3><p>${escapeHtml(l.subtitle)}</p><small>前置：${l.prerequisites.map(id => escapeHtml(lessonById(id)?.title)).join('、') || '会读写简单 Java 即可'}</small></div><div class="roadmap-status">${lessonStatus(l)}<small>${l.minutes} 分钟</small></div>${icon('arrow')}</a>`).join('')}</div></section>`).join('')}
    <div class="section-heading"><div><span class="eyebrow">接下来的旅程</span><h2>基础之后，继续向前</h2></div>${badge('后续规划')}</div><div class="future-grid">${futureModules.map(m => `<article class="future-card"><h3>${escapeHtml(m.title)}</h3><p>${escapeHtml(m.description)}</p><div class="small muted">${m.topics.map(escapeHtml).join(' · ')}</div></article>`).join('')}</div>`, 'route', '学习路线');
}

function sourceCard(lesson) {
  const source = lesson.source;
  return `<div class="source-card"><span class="eyebrow">回到教材</span><h3>${escapeHtml(source.chapter)}</h3><p>${escapeHtml(source.section)}</p><p class="small">书内第 ${source.bookPages.join('、')} 页<br>PDF 第 ${source.pdfPages.join('、')} 页</p>${textbookAvailable ? `<a class="btn btn-secondary btn-small" href="./textbook.pdf#page=${source.pdfPages[0]}" target="_blank" rel="noopener">打开原书 ${icon('external')}</a>` : '<p class="small muted">此版本未连接本地 PDF。可阅读官方在线教材，或按上面的页码对照你自己的 PDF。</p>'}<a class="text-link small" href="https://www.hello-algo.com/" target="_blank" rel="noopener">Hello 算法官网 ${icon('external')}</a><p class="small muted">${escapeHtml(source.note)}</p></div>`;
}
function notesEditor(lesson) {
  return `<div class="note-card"><label class="field-label" for="note-${lesson.id}">用自己的话记下来</label><p class="small muted">试着解释：这个算法解决什么问题？最容易写错哪一步？</p><textarea class="note-input" id="note-${lesson.id}" data-note="${lesson.id}" maxlength="10000" rows="5" placeholder="例如：二分查找每次排除一段区间，关键是保证目标仍可能在剩余范围里……">${escapeHtml(state.notes[lesson.id] || '')}</textarea><small class="muted" id="note-status-${lesson.id}">${state.notes[lesson.id] ? '笔记已保存在当前浏览器' : '输入后自动保存在当前浏览器'}</small></div>`;
}
function readingTab(lesson) {
  return `<div class="reading-layout"><article class="reading-main"><section class="panel objectives"><span class="eyebrow">学完这节，你将能够</span><ul>${lesson.objectives.map(o => `<li>${icon('check')}<span>${escapeHtml(o)}</span></li>`).join('')}</ul></section><section class="reading-section scenario"><span class="eyebrow">从一个小问题开始</span><h2>先想一想</h2><p>${escapeHtml(lesson.scenario)}</p></section>${lesson.sections.map(s => `<section class="reading-section"><h2>${escapeHtml(s.title)}</h2>${s.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}</section>`).join('')}<div class="notice notice-warning"><strong>容易卡住的地方</strong><p>${escapeHtml(lesson.pitfall)}</p></div>${notesEditor(lesson)}<div class="lesson-bottom"><button class="btn btn-secondary" data-action="read" data-lesson="${lesson.id}">${state.lessons[lesson.id]?.readAt ? '已标记阅读完成 ✓' : '标记阅读完成'}</button><a class="btn btn-primary" href="${routeLink(lesson, 'lab')}">动手推演 ${icon('arrow')}</a></div></article><aside class="reading-aside">${sourceCard(lesson)}<div class="panel small"><strong>这一课的学习节奏</strong><ol class="learning-steps"><li>理解问题和思路</li><li>单步操作实验</li><li>完成 3 道短练习</li><li>独立写一遍 Java</li></ol><p class="muted">阅读完成和练习通过分别记录。</p></div></aside></div>`;
}

function initLab(lesson) {
  if (lab?.lessonId === lesson.id) return;
  const sim = lesson.simulation;
  lab = { lessonId: lesson.id, values: [...sim.values], target: sim.target ?? 0, step: 0, error: '', frames: [] };
  try { lab.frames = makeTrace(sim.kind, lab.values, lab.target); } catch (error) { lab.error = error.message; }
}
function codeBlock(lesson, frame) {
  let highlighted = false;
  const lines = lesson.java.code.split('\n');
  return `<div class="code-block"><div class="code-title"><span>Java · ${escapeHtml(lesson.java.method)}</span><button class="btn btn-small btn-ghost" data-action="copy-code" data-lesson="${lesson.id}">复制代码</button></div><pre aria-label="Java 参考代码"><code>${lines.map((line, i) => {
    const match = lesson.id === 'algorithm' ? frame?.codeMatch?.replaceAll('nums', 'prices') : frame?.codeMatch;
    const current = !highlighted && match && !line.trim().startsWith('//') && line.includes(match);
    if (current) highlighted = true;
    return `<span class="code-line ${current ? 'is-current' : ''}"><span class="code-number" aria-hidden="true">${i + 1}</span><span class="code-text">${escapeHtml(line) || ' '}</span></span>`;
  }).join('')}</code></pre></div>`;
}
function labTab(lesson) {
  initLab(lesson);
  const frame = lab.frames[lab.step];
  const hasTarget = ['array', 'linear', 'binary', 'boundary'].includes(lesson.simulation.kind);
  return `<div class="panel"><div class="panel-header"><div><span class="eyebrow">亲手推演</span><h2>让每一步，都看得见。</h2></div>${badge('可前进 · 可回退', 'green')}</div><form id="lab-form" class="lab-toolbar" data-lesson="${lesson.id}"><div class="field field-grow"><label class="field-label" for="lab-values">数组（逗号分隔，最多 12 个整数；留空测试空数组）</label><input class="field-input" id="lab-values" name="values" value="${escapeHtml(lab.values.join(', '))}" autocomplete="off"></div>${hasTarget ? `<div class="field"><label class="field-label" for="lab-target">${lesson.simulation.kind === 'array' ? '读取下标' : '目标值'}</label><input class="field-input" id="lab-target" name="target" type="number" min="-99" max="99" value="${lab.target}"></div>` : ''}<button class="btn btn-primary" type="submit">应用数据</button></form><div class="preset-row"><span class="small muted">试试这些数据：</span>${[['default', '默认'], ['duplicates', '重复值'], ['single', '一个元素'], ['empty', '空数组']].map(([id, name]) => `<button class="btn btn-ghost btn-small" data-action="preset" data-preset="${id}" data-lesson="${lesson.id}">${name}</button>`).join('')}</div>
    ${lab.error ? `<div class="notice notice-warning" role="alert">${escapeHtml(lab.error)}</div>` : ''}<div id="lab-content">${frame ? labFrame(lesson, frame) : '<div class="empty-state">请调整数据后再开始推演。</div>'}</div></div>
    <div class="notice"><strong>理解计数的含义</strong><p>“检查”统计关键的元素比较或目标检查，“写入”统计数组槽位赋值。循环条件、临时变量等不在该计数内。演示速度由操作决定，不代表实际运行时间。</p><p class="small">${escapeHtml(lesson.java.explanation)}</p></div><div class="lesson-bottom"><span class="small muted">演示按预设算法生成；Java 代码可下载到本地执行。</span><a class="btn btn-primary" href="${routeLink(lesson, 'quiz')}">检验一下理解 ${icon('arrow')}</a></div>`;
}
function labFrame(lesson, frame) {
  return `<div class="lab-grid"><div class="visual-panel"><div class="array-stage" aria-label="数组状态">${frame.values.length ? frame.values.map((v, i) => `<div class="array-cell ${frame.active.includes(i) ? 'is-active-cell' : ''} ${frame.sorted.includes(i) ? 'is-sorted-cell' : ''}"><span class="array-value">${v}</span><span class="array-index">[${i}]</span><span class="cell-state">${frame.active.includes(i) ? '当前' : frame.sorted.includes(i) ? '已处理' : ''}</span></div>`).join('') : '<div class="empty-state">空数组 [ ]</div>'}</div><div class="lab-variables">${Object.entries(frame.variables).map(([k, v]) => `<span class="variable-chip"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></span>`).join('')}</div><div class="step-message" aria-live="polite"><span class="eyebrow">这一步发生了什么</span><p>${escapeHtml((lesson.id === 'algorithm' ? frame.message.replaceAll('nums', 'prices') : frame.message))}</p>${frame.result !== undefined ? `<span class="badge badge-green">结果：${escapeHtml(Array.isArray(frame.result) ? `[${frame.result.join(', ')}]` : frame.result)}</span>` : ''}</div><div class="metrics-row"><div class="metric"><strong>${frame.reads}</strong><span>读取 / 访问</span></div><div class="metric"><strong>${frame.comparisons}</strong><span>元素检查</span></div><div class="metric"><strong>${frame.writes}</strong><span>数组写入</span></div></div><div class="step-controls"><button class="btn btn-ghost btn-small" data-action="lab-reset">重置</button><button class="btn btn-secondary btn-small" data-action="lab-prev" ${lab.step === 0 ? 'disabled' : ''}>上一步</button><span class="step-counter">${lab.step + 1} / ${lab.frames.length}</span><button class="btn btn-primary btn-small" data-action="lab-next" ${lab.step >= lab.frames.length - 1 ? 'disabled' : ''}>下一步 ${icon('arrow')}</button></div></div>${codeBlock(lesson, frame)}</div>`;
}

function quizCard(lesson, q, i) {
  const progress = state.exercises[q.id] ?? {};
  const answered = !!progress.answeredAt;
  const correctAnswer = q.type === 'choice' ? q.options[q.answer] : (Array.isArray(q.answer) ? q.answer[0] : q.answer);
  return `<article class="quiz-card" id="question-${q.id}"><div class="panel-header"><span class="quiz-number">练习 ${i + 1} / ${lesson.quiz.length}</span>${badge(q.type === 'choice' ? '思考与预测' : '补全关键一步')}${answered ? badge(progress.correct ? '回答正确' : '再想一想', progress.correct ? 'green' : 'orange') : ''}</div><h3>${escapeHtml(q.prompt)}</h3><form class="quiz-form" data-lesson="${lesson.id}" data-question="${q.id}">${q.type === 'choice' ? `<div class="quiz-options">${q.options.map((o, index) => `<label class="quiz-option ${String(progress.answer) === String(index) ? 'is-selected' : ''}"><input type="radio" name="answer" value="${index}" ${String(progress.answer) === String(index) ? 'checked' : ''} required><span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(o)}</span></label>`).join('')}</div>` : `<label class="field-label" for="answer-${q.id}">你的答案</label><input id="answer-${q.id}" class="answer-input" name="answer" maxlength="1000" placeholder="输入一个值或题目要求的代码片段" value="${escapeHtml(progress.answer || '')}" required autocomplete="off">`}<div class="quiz-actions"><button type="submit" class="btn btn-primary btn-small">${answered ? '重新提交' : '提交答案'}</button><button type="button" class="btn btn-ghost btn-small" data-action="hint" data-lesson="${lesson.id}" data-question="${q.id}" ${(progress.hints || 0) >= q.hints.length ? 'disabled' : ''}>${progress.hints ? '再给一点提示' : '给我一点提示'}</button><button type="button" class="btn btn-ghost btn-small" data-action="reveal" data-lesson="${lesson.id}" data-question="${q.id}">查看答案</button></div></form>${progress.hints ? `<div class="quiz-hints">${q.hints.slice(0, progress.hints).map((h, index) => `<p><strong>提示 ${index + 1}</strong> ${escapeHtml(h)}</p>`).join('')}</div>` : ''}${answered || progress.revealed ? `<div class="quiz-feedback ${answered && !progress.correct ? 'notice-warning' : 'notice-success'}" role="status">${progress.revealed ? `<p><strong>参考答案：</strong>${escapeHtml(correctAnswer)}</p>` : ''}<p>${escapeHtml(q.explanation)}</p>${answered && !progress.correct ? `<small>关注这个知识点：${escapeHtml(q.misconception)}</small>` : ''}${progress.hints || progress.revealed || progress.mistakes ? '<small>本轮有提示、解析或订正记录，答对后记为“练习通过”。独立复习时可重新开始一轮。</small>' : ''}</div>` : ''}</article>`;
}
function quizTab(lesson) {
  const result = lessonResult(state, lesson);
  return `<div class="panel quiz-summary"><div><span class="eyebrow">把理解，变成自己的答案</span><h2>${result.correct} / ${result.total} 道回答正确</h2><p>${result.independent ? '本轮独立通过。过段时间再回来，试试还能否自己完成。' : result.allCorrect ? '本轮练习通过。重新开始一轮，不看提示或答案、一次答对全部题目后，记为独立通过。' : '先自己思考，再逐级查看提示。答错的题会加入复习。'}</p></div><button class="btn btn-secondary btn-small" data-action="reset-round" data-lesson="${lesson.id}">重新开始本轮</button></div><div class="quiz-list">${lesson.quiz.map((q, i) => quizCard(lesson, q, i)).join('')}</div><div class="lesson-bottom"><span class="small muted">本节短练习为原创辅助练习 · 阅读进度独立记录</span><a class="btn btn-primary" href="${routeLink(lesson, 'challenge')}">试着独立写出来 ${icon('arrow')}</a></div>`;
}
function challengeTab(lesson) {
  const c = lesson.challenge;
  const related = questions.filter(q => q.stage === 'ready' && q.prerequisites.includes(lesson.id));
  return `<div class="challenge-grid"><article class="panel"><span class="eyebrow">独立编程 · 本地 Java</span><h2>${escapeHtml(c.title)}</h2><p>${escapeHtml(c.prompt)}</p><h3>你可以这样开始</h3><ol class="checklist">${c.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol><h3>用这些情况检查结果</h3><div class="table-scroll"><table class="test-table"><thead><tr><th>输入</th><th>预期结果</th></tr></thead><tbody>${c.tests.map(t => `<tr><td><code>${escapeHtml(t.input)}</code></td><td><code>${escapeHtml(t.expected)}</code></td></tr>`).join('')}</tbody></table></div><details><summary>需要一点实现提示</summary>${c.hints.map(h => `<p>${escapeHtml(h)}</p>`).join('')}</details><details><summary>查看 Java 参考实现</summary>${codeBlock(lesson)}</details><div class="notice"><p>请在本地 Java 环境独立实现并运行。本站提供参考方法与边界测试，不会在浏览器里执行你写的 Java。</p><p><code>javac -encoding UTF-8 AlgorithmLab.java AlgorithmLabTest.java</code><br><code>java AlgorithmLabTest</code></p><div class="button-row"><a class="btn btn-secondary btn-small" href="./java/AlgorithmLab.java" download>下载参考源码</a><a class="btn btn-secondary btn-small" href="./java/AlgorithmLabTest.java" download>下载自检用例</a></div></div><button class="btn btn-primary" data-action="challenge-done" data-lesson="${lesson.id}">${state.lessons[lesson.id]?.challengeDone ? '已记录：我已在本地完成 ✓' : '记录：我已在本地完成'}</button><p class="small muted">这是你的自我记录，不表示网站或 LeetCode 已评测通过。</p></article><aside><div class="panel"><h3>接着练一练</h3><p class="small muted">先完成本节，再按前置知识选择对应题目。</p>${related.length ? related.map(q => `<a class="related-problem" href="${q.url}" target="_blank" rel="noopener"><strong>${q.id}. ${escapeHtml(q.title)} ${icon('external')}</strong><p>${escapeHtml(q.summary)}</p>${badge(q.recommendation || '主练')}</a>`).join('') : '<p>这一课先把独立任务写好。到后续专题，再开始 LeetCode 练习。</p>'}<a class="text-link" href="#/practice">查看完整题单 ${icon('arrow')}</a></div></aside></div>`;
}

function lessonPage(id, tab) {
  const lesson = lessonById(id);
  if (!lesson) return shell('<div class="empty-state"><h1>没有找到这节课</h1><a class="btn btn-primary" href="#/roadmap">回到学习路线</a></div>', 'route', '课程');
  touchLesson(state, lesson.id); persist();
  const tabs = [['reading', '讲解'], ['lab', '实验与代码'], ['quiz', '随堂练习'], ['challenge', '编程挑战']];
  const activeTab = tabs.some(([id]) => id === tab) ? tab : 'reading';
  const missing = lesson.prerequisites.filter(id => !state.lessons[id]?.readAt);
  const index = lessons.indexOf(lesson);
  const contents = { reading: readingTab, lab: labTab, quiz: quizTab, challenge: challengeTab };
  return shell(`<div class="lesson-heading"><div class="lesson-meta"><a href="#/roadmap" class="text-link">← 学习路线</a>${badge(lesson.module, 'green')}${lessonStatus(lesson)}</div><span class="eyebrow">LESSON ${String(lesson.number).padStart(2, '0')} / 12</span><h1>${escapeHtml(lesson.title)}</h1><p>${escapeHtml(lesson.subtitle)}</p><div class="small muted">约 ${lesson.minutes} 分钟 · Java · ${lesson.quiz.length} 道随堂练习</div></div>${missing.length ? `<div class="notice small">建议先了解：${missing.map(id => `<a href="${routeLink(lessonById(id))}">${escapeHtml(lessonById(id).title)}</a>`).join('、')}。如果已经熟悉，可以直接继续。</div>` : ''}<nav class="tabs" aria-label="课程学习环节">${tabs.map(([id, text]) => `<a class="tab ${id === activeTab ? 'is-active' : ''}" href="${routeLink(lesson, id)}" ${id === activeTab ? 'aria-current="page"' : ''}>${text}${id === 'quiz' ? `<span>${lessonResult(state, lesson).correct}/${lesson.quiz.length}</span>` : ''}</a>`).join('')}</nav><div class="lesson-body">${contents[activeTab](lesson)}</div><div class="lesson-nav">${index > 0 ? `<a class="text-link" href="${routeLink(lessons[index - 1])}">← ${escapeHtml(lessons[index - 1].title)}</a>` : '<span></span>'}${index < lessons.length - 1 ? `<a class="text-link" href="${routeLink(lessons[index + 1])}">${escapeHtml(lessons[index + 1].title)} →</a>` : '<a class="text-link" href="#/review">回顾所学 →</a>'}</div>`, 'route', lesson.title);
}

function filteredQuestions() {
  const search = filters.search.trim().toLowerCase();
  return questions.filter(q => (filters.stage === 'all' || q.stage === filters.stage) && (filters.difficulty === 'all' || q.difficulty === filters.difficulty) && (filters.topic === 'all' || q.topic === filters.topic) && (filters.status === 'all' || (state.problems[q.id]?.status || 'unstarted') === filters.status) && (!search || `${q.id} ${q.title} ${q.summary}`.toLowerCase().includes(search)));
}
function problemsContent() {
  const list = filteredQuestions();
  return `<div class="problem-list-header"><span class="small muted">符合条件的题目 ${list.length} 道</span><span class="small muted">完成状态由你手动记录</span></div><div class="problem-list">${list.length ? list.map(q => {
    const missing = q.prerequisites.filter(id => !lessonResult(state, lessonById(id)).allCorrect);
    return `<article class="problem-card"><div class="problem-heading"><a href="${q.url}" target="_blank" rel="noopener"><span class="problem-id">${q.id}</span><h3>${escapeHtml(q.title)}</h3>${icon('external')}</a><div class="problem-meta">${badge(q.difficulty, q.difficulty === '简单' ? 'green' : 'orange')}${badge(q.topic)}${badge(q.stage === 'ready' ? (q.recommendation || '主练') : '后续课程')}</div></div><p>${escapeHtml(q.summary)}</p><div class="problem-prerequisites">${q.stage === 'planned' ? `后续先修：${q.futurePrerequisites.map(escapeHtml).join('、')}。对应课程尚未开放。` : missing.length ? `建议先完成：${missing.map(id => `<a href="${routeLink(lessonById(id))}">${escapeHtml(lessonById(id).title)}</a>`).join('、')}` : '相关课程练习已通过，可以尝试独立解题。'}${q.extraPrerequisites?.length ? `<p>补充知识：${q.extraPrerequisites.map(escapeHtml).join('；')}</p>` : ''}</div><details><summary>解题前，想一想</summary><p>${escapeHtml(q.hint)}</p></details><div class="problem-actions"><a class="btn btn-secondary btn-small" href="${q.url}" target="_blank" rel="noopener">到 LeetCode 练习 ${icon('external')}</a><label class="small muted">我的记录 <select data-problem="${q.id}" aria-label="${escapeHtml(q.title)}完成状态">${[['unstarted', '未开始'], ['trying', '尝试中'], ['done', '已完成（自记）']].map(([v, text]) => `<option value="${v}" ${(state.problems[q.id]?.status || 'unstarted') === v ? 'selected' : ''}>${text}</option>`).join('')}</select></label><span class="small muted">来源：LeetCode · 核验 ${escapeHtml(q.verifiedAt)}</span></div></article>`;
  }).join('') : '<div class="empty-state"><h3>没有匹配的题目</h3><p>试试更换关键词，或将阶段筛选改为“全部候选”。</p></div>'}</div>`;
}
function practicePage() {
  const select = (id, label, options) => `<div class="field"><label class="field-label" for="filter-${id}">${label}</label><select class="field-input" id="filter-${id}" data-filter="${id}">${options.map(([value, name]) => `<option value="${escapeHtml(value)}" ${filters[id] === value ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}</select></div>`;
  return shell(`<div class="page-heading"><span class="eyebrow">PRACTICE WITH PURPOSE</span><h1>让每一道题，都有来处。</h1><p>48 道精选候选题，按先修知识安排。当前先练 8 道基础题，逐步走向更远的专题。</p></div><div class="notice"><strong>先完成短练习，再独立做题。</strong> 从基础公开题、Hot 100 与面试经典 150 的候选范围中选题，按课程重新组织。官网负责提交与评测，本站记录你的学习过程。</div><div class="panel filters"><div class="field field-grow"><label class="field-label" for="problem-search">查找题目</label><input class="field-input" id="problem-search" type="search" placeholder="题号、题名或知识点" value="${escapeHtml(filters.search)}"></div>${select('stage', '学习阶段', [['ready', '首版 8 道'], ['planned', '后续规划'], ['all', '全部候选']])}${select('topic', '专题', [['all', '全部专题'], ...[...new Set(questions.map(q => q.topic))].map(t => [t, t])])}${select('difficulty', '难度', [['all', '全部难度'], ['简单', '简单'], ['中等', '中等']])}${select('status', '我的记录', [['all', '全部状态'], ['unstarted', '未开始'], ['trying', '尝试中'], ['done', '已完成']])}</div><div id="problem-results">${problemsContent()}</div>`, 'code', '练习题单');
}

function reviewPage() {
  const due = dueLessons(state, lessons);
  const wrong = lessons.flatMap(l => l.quiz.filter(q => state.exercises[q.id]?.answeredAt && !state.exercises[q.id].correct).map(q => ({ lesson: l, question: q })));
  const started = lessons.filter(l => state.lessons[l.id]?.lastSeenAt || state.notes[l.id]);
  return shell(`<div class="page-heading"><span class="eyebrow">MAKE IT YOUR OWN</span><h1>回想一次，理解更深一点。</h1><p>从错题里找到下一步，把自己的理解写下来。复习间隔依次为 1、3、7、14 天。</p></div><div class="dashboard-grid"><section class="panel"><div class="panel-header"><h2>现在需要复习</h2>${badge(`${due.length} 节课`, 'orange')}</div>${due.length ? `<div class="review-list">${due.map(l => `<div class="review-item"><div><strong>${escapeHtml(l.title)}</strong><p class="small muted">${state.lessons[l.id].errorReview ? '本课有待巩固的错题' : `计划复习：${formatDate(state.lessons[l.id].nextReviewAt)}`}</p></div><button class="btn btn-secondary btn-small" data-action="start-review" data-lesson="${l.id}">开始复习</button></div>`).join('')}</div>` : '<div class="empty-state"><span class="empty-icon">✓</span><h3>暂时没有到期复习</h3><p>完成随堂练习后，下一次复习会出现在这里。</p><a class="text-link" href="#/roadmap">去学习一小节 →</a></div>'}</section><section class="panel"><div class="panel-header"><h2>值得再想一想</h2>${badge(`${wrong.length} 道错题`)}</div>${wrong.length ? `<div class="review-list">${wrong.map(({ lesson, question }) => `<a class="review-item" href="${routeLink(lesson, 'quiz')}"><div><strong>${escapeHtml(question.misconception)}</strong><p class="small muted">${escapeHtml(lesson.title)} · ${escapeHtml(question.prompt)}</p></div>${icon('arrow')}</a>`).join('')}</div>` : '<div class="empty-state"><h3>错题也是学习的路标</h3><p>答错后，这里会记录对应知识点。最近一次答对后，会从当前错题中移出。</p></div>'}</section></div>
    <div class="section-heading"><div><span class="eyebrow">自己的话，最有力量</span><h2>课程笔记与复习安排</h2></div><span class="small muted">${started.length} 节已开始的课程</span></div>${started.length ? `<div class="note-grid">${started.map(l => `<article class="panel"><div class="panel-header"><a class="text-link" href="${routeLink(l)}"><strong>${escapeHtml(l.title)}</strong></a>${lessonStatus(l)}</div><p class="small muted">下次复习：${formatDate(state.lessons[l.id]?.nextReviewAt)}</p>${notesEditor(l)}<button class="btn btn-ghost btn-small" data-action="start-review" data-lesson="${l.id}">主动复习这一课</button></article>`).join('')}</div>` : '<div class="panel empty-state"><p>开始课程后，你的笔记会自动汇集到这里。</p></div>'}<div class="panel backup-panel"><div><h3>学习记录，由你保管</h3><p class="small muted">记录保存在当前浏览器，不会自动同步到其他设备。更换设备前请导出备份。</p></div><div class="button-row"><button class="btn btn-secondary btn-small" data-action="export">导出备份</button><button class="btn btn-ghost btn-small" data-action="import">导入备份</button><button class="btn btn-ghost btn-small" data-action="clear-confirm">清空本地记录</button></div></div>`, 'review', '复习与笔记');
}

function render() {
  const url = new URL(location.hash.slice(1) || '/', 'http://app.local');
  const path = url.pathname;
  const previous = currentRoute;
  currentRoute = path;
  let content;
  if (path === '/') content = homePage();
  else if (path === '/roadmap') content = roadmapPage();
  else if (path === '/practice') content = practicePage();
  else if (path === '/review') content = reviewPage();
  else if (path.startsWith('/lesson/')) content = lessonPage(decodeURIComponent(path.slice(8)), url.searchParams.get('tab'));
  else content = shell('<div class="empty-state"><h1>这里还没有内容</h1><a class="btn btn-primary" href="#/">回到我的学习</a></div>', 'home', '页面未找到');
  $('#app').innerHTML = content;
  document.title = `${path.startsWith('/lesson/') ? lessonById(path.slice(8))?.title || '课程' : { '/': '我的学习', '/roadmap': '学习路线', '/practice': '练习题单', '/review': '复习与笔记' }[path] || '学习空间'} · 算法拾级`;
  if (path !== previous) window.scrollTo(0, 0);
}
function refreshQuestion(lesson, q) {
  const card = $(`#question-${q.id}`);
  card.outerHTML = quizCard(lesson, q, lesson.quiz.indexOf(q));
  const summary = $('.quiz-summary');
  if (summary) {
    const wrapper = document.createElement('div'); wrapper.innerHTML = quizTab(lesson); summary.outerHTML = wrapper.querySelector('.quiz-summary').outerHTML;
  }
  const tabCount = $('.tabs a[href*="tab=quiz"] span');
  if (tabCount) tabCount.textContent = `${lessonResult(state, lesson).correct}/${lesson.quiz.length}`;
  const statusBadges = document.querySelectorAll('.lesson-meta > .badge');
  if (statusBadges.length > 1) statusBadges[1].outerHTML = lessonStatus(lesson);
  const count = stats(state, lessons);
  const sidebarCount = $('.sidebar-course > small');
  if (sidebarCount) sidebarCount.textContent = `${count.passed} / ${lessons.length} 课练习通过`;
  const fill = $('.sidebar-course .progress-fill');
  if (fill) fill.style.width = `${count.passed / lessons.length * 100}%`;
  const reviewLink = $('.nav-link[href="#/review"]');
  if (reviewLink) { const old = reviewLink.querySelector('.nav-count'); if (old) old.remove(); if (count.due) reviewLink.insertAdjacentHTML('beforeend', `<span class="nav-count">${count.due}</span>`); }
}
function updateLab(lesson) { const frame = lab.frames[lab.step]; if (frame && $('#lab-content')) $('#lab-content').innerHTML = labFrame(lesson, frame); }
function openDialog(title, content, confirmText, action) {
  const dialog = $('#backup-dialog');
  dialog.innerHTML = `<h2 id="dialog-title">${escapeHtml(title)}</h2><p>${escapeHtml(content)}</p><div class="dialog-actions"><button class="btn btn-secondary" data-action="dialog-cancel">取消</button><button class="btn btn-primary" data-action="${action}">${escapeHtml(confirmText)}</button></div>`;
  dialog.showModal();
}

document.addEventListener('click', async event => {
  if (event.target.closest('.skip-link')) { event.preventDefault(); $('#main-content').focus(); return; }
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const lesson = lessonById(button.dataset.lesson || lab?.lessonId);
  const q = lesson?.quiz.find(q => q.id === button.dataset.question);
  if (action === 'export') exportState();
  if (action === 'import') $('#import-file').click();
  if (action === 'recover') download('算法拾级-原始记录.json', recoveryRaw);
  if (action === 'dialog-cancel') { $('#backup-dialog').close(); pendingImport = null; }
  if (action === 'import-confirm' && pendingImport) { state = pendingImport; pendingImport = null; recoveryRaw = null; storageWarning = ''; persist(); $('#backup-dialog').close(); render(); showToast('备份已导入，学习记录与笔记已恢复。'); }
  if (action === 'clear-confirm') openDialog('清空本地学习记录？', '将清除当前浏览器中的课程、练习、题单与笔记。建议先导出备份。此操作不会删除项目文件。', '确认清空', 'clear');
  if (action === 'clear') { state = createState(); recoveryRaw = null; storageWarning = ''; persist(); $('#backup-dialog').close(); render(); showToast('本地学习记录已清空。'); }
  if (action === 'read' && lesson) { state.lessons[lesson.id] = { ...state.lessons[lesson.id], readAt: new Date().toISOString() }; persist(); button.textContent = '已标记阅读完成 ✓'; const badges = document.querySelectorAll('.lesson-meta > .badge'); if (badges.length > 1) badges[1].outerHTML = lessonStatus(lesson); showToast('阅读已记录。接着试试实验和练习。'); }
  if (action === 'challenge-done' && lesson) { state.lessons[lesson.id] = { ...state.lessons[lesson.id], challengeDone: !state.lessons[lesson.id]?.challengeDone }; persist(); button.textContent = state.lessons[lesson.id].challengeDone ? '已记录：我已在本地完成 ✓' : '记录：我已在本地完成'; }
  if ((action === 'hint' || action === 'reveal') && q) { recordHelp(state, q, action === 'reveal'); persist(); refreshQuestion(lesson, q); }
  if ((action === 'reset-round' || action === 'start-review') && lesson) { resetRound(state, lesson); persist(); if (action === 'start-review') { location.hash = routeLink(lesson, 'quiz').slice(1); } else render(); showToast('已开始新一轮，本轮提示与答案已重置。'); }
  if (['lab-next', 'lab-prev', 'lab-reset'].includes(action) && lab) { lab.step = action === 'lab-reset' ? 0 : Math.max(0, Math.min(lab.frames.length - 1, lab.step + (action === 'lab-next' ? 1 : -1))); updateLab(lesson); }
  if (action === 'preset' && lesson) {
    const presets = { default: lesson.simulation.values, duplicates: [1, 2, 2, 4, 4], single: [5], empty: [] };
    lab.values = [...presets[button.dataset.preset]]; lab.step = 0;
    if (lesson.simulation.kind === 'array') lab.target = 0;
    try { lab.frames = makeTrace(lesson.simulation.kind, lab.values, lab.target); lab.error = ''; } catch (error) { lab.frames = []; lab.error = error.message; }
    $('.lesson-body').innerHTML = labTab(lesson);
  }
  if (action === 'copy-code' && lesson) {
    try { await navigator.clipboard.writeText(lesson.java.code); showToast('Java 代码已复制。'); } catch { showToast('浏览器未允许复制，请在代码区手动选择并复制。'); }
  }
});

document.addEventListener('submit', event => {
  const form = event.target;
  if (form.id === 'lab-form') {
    event.preventDefault();
    const lesson = lessonById(form.dataset.lesson);
    try {
      const values = parseValues(form.elements.values.value);
      const target = form.elements.target ? parseTarget(form.elements.target.value) : lab.target;
      const frames = makeTrace(lesson.simulation.kind, values, target);
      lab = { lessonId: lesson.id, values, target, frames, step: 0, error: '' };
      $('.lesson-body').innerHTML = labTab(lesson);
    } catch (error) { showToast(error.message); const existing = $('#lab-validation'); if (existing) existing.remove(); const warning = document.createElement('p'); warning.id = 'lab-validation'; warning.className = 'notice notice-warning'; warning.setAttribute('role', 'alert'); warning.textContent = error.message + ' 本次输入未应用，图示仍为上一次有效数据。'; form.after(warning); }
  }
  if (form.classList.contains('quiz-form')) {
    event.preventDefault();
    const lesson = lessonById(form.dataset.lesson);
    const q = lesson.quiz.find(q => q.id === form.dataset.question);
    const answer = new FormData(form).get('answer');
    if (answer === null || !String(answer).trim()) return;
    submitAnswer(state, lesson, q, answer); persist(); refreshQuestion(lesson, q);
  }
});
document.addEventListener('input', event => {
  const element = event.target;
  if (element.dataset.note) {
    state.notes[element.dataset.note] = element.value; persist();
    const status = $(`#note-status-${element.dataset.note}`);
    if (status) status.textContent = storageWarning ? '本次暂存，请导出备份' : '已自动保存在当前浏览器';
  }
  if (element.id === 'problem-search') { filters.search = element.value; $('#problem-results').innerHTML = problemsContent(); }
});
document.addEventListener('change', event => {
  const element = event.target;
  if (element.dataset.filter) { filters[element.dataset.filter] = element.value; $('#problem-results').innerHTML = problemsContent(); }
  if (element.dataset.problem) { state.problems[element.dataset.problem] = { status: element.value, updatedAt: new Date().toISOString() }; persist(); $('#problem-results').innerHTML = problemsContent(); showToast('已更新你的练习记录。'); }
});
$('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 2 * 1024 * 1024) throw new Error('备份超过 2 MB，请选择本站导出的学习记录文件。');
    const parsed = JSON.parse(await file.text());
    pendingImport = validateBackup(parsed, lessons, questions);
    openDialog('导入这份学习备份？', `包含 ${Object.keys(pendingImport.lessons).length} 节课程记录、${Object.keys(pendingImport.notes).length} 篇笔记。确认后将替换当前浏览器的学习记录。`, '确认导入并替换', 'import-confirm');
  } catch (error) { pendingImport = null; showToast(error instanceof SyntaxError ? '文件不是有效的 JSON，现有记录未修改。' : error.message); }
  event.target.value = '';
});
$('#backup-dialog').addEventListener('cancel', () => { pendingImport = null; });
window.addEventListener('hashchange', render);
render();
fetch('./api/textbook').then(r => r.ok ? r.json() : null).then(data => {
  if (data?.available) { textbookAvailable = true; if (currentRoute.startsWith('/lesson/')) render(); }
}).catch(() => {});
