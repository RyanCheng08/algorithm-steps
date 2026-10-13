# 练习来源、选题规则与 LeetCode 题单

版本：首版课程配套规划；核验日期：**2026-10-13（Asia/Shanghai）**。

目标学习者：能阅读简单 Java，并能写循环和数组操作；尚未系统学习算法与数据结构。

## 练习来源与标注

网站采用三类内容，并明确区分来源：

| 类型 | 用途 | 标注方式 |
| --- | --- | --- |
| 教材例题与算法 | 理解标准算法，回到《Hello 算法》原章节阅读 | 教材名称、章节、书内页码、PDF 页码 |
| 配套原创练习／教材变式 | 预测、填空、找错、独立实现，补齐从阅读到编写代码的过程 | 明确标记原创或变式，说明对应知识点 |
| LeetCode 精选 | 学完专题后独立应用，练习边界处理 | 官方题号、标题、难度、原题链接、前置知识、核验日期 |

LeetCode 在本站只保存题目元数据、原创简短学习目的及学习提示。完整题意、约束、示例、Java 提交模板以官方题页为准，不复制完整题干或题解。首版通过官方链接练习，完成情况由学习者手动记录；不抓取用户提交历史，不代替 LeetCode 评测。

候选来源范围是[编程基础 0 到 1](https://leetcode.cn/studyplan/programming-skills/)、[LeetCode 热题 100](https://leetcode.cn/studyplan/top-100-liked/)、[面试经典 150 题](https://leetcode.cn/studyplan/top-interview-150/)，另从官方题库补充与教材直接对应的基础题。**本题单按知识点重新组织，不要求整套刷题；未逐题核实榜单成员关系，因此不在题目卡片上声称某题属于某套榜单。**

## 选题与解锁规则

1. 先看前置知识，再参考“简单／中等”标签。没有学过递归的学习者，不因“简单”而被要求完成树题。
2. 每个专题先完成本站短练习和独立编程练习，再安排 1～2 道主练题；其余作为巩固或选做挑战。
3. 同题号只保留一个条目；跨专题题可以有多个前置知识，但不重复计数。
4. 本文共 **48 道唯一题目：首版可用 8 道，后续规划 40 道；简单 32 道，中等 16 道**。首版可用表示链接、学习目标与课程关联可展示，不表示网站内有在线 Java 评测或完整题解。
5. 后续规划题必须标记“对应课程尚未开放”，不作为首版学习完成的条件。
6. 首版 8 题中的 485、35、977 为选做挑战。卡片显示额外知识，不把其官方简单标签等同于“学完本课就应当会”。
7. 优先选择可公开阅读题干的题目。此次核验为公开网页阅读：确认题号、题名、难度和题意可访问；**没有登录用户账号执行提交，没有验证账号会员权益，不能承诺未来访问条件不变**。页面里的企业锁图标也不等于题目本身锁定。

## 首版 8 道：数组、查找、排序与双指针

以下各行的题名链接即核验用官方来源，难度均为“简单”。“关联课程”是首版稳定 lesson id。

| 题号与官方链接 | 原创学习目的 | 关联课程 | 安排与额外前置 |
| --- | --- | --- | --- |
| [1929. 数组串联](https://leetcode.cn/problems/concatenation-of-array/) | 用下标偏移将一段数据写入新数组的两个区间。 | `array` | 首版主练；需要创建新数组，理解 `i + n` 与新数组长度。 |
| [1480. 一维数组的动态和](https://leetcode.cn/problems/running-sum-of-1d-array/) | 把一次总和计算改为保存每一步的累计结果。 | `array`, `sum` | 首版主练；补充“前缀和”的名称，重点仍是累加器和写入下标。 |
| [485. 最大连续 1 的个数](https://leetcode.cn/problems/max-consecutive-ones/) | 同时维护当前连续段长度与已经见过的最长段。 | `array`, `max` | 首版选做挑战；额外理解遇到 0 时重置当前计数，不能只统计所有 1。 |
| [704. 二分查找](https://leetcode.cn/problems/binary-search/) | 把有序区间逐步缩小，找出目标位置或明确返回未找到。 | `linear`, `complexity`, `binary` | 首版主练；先完成二分的边界短练习，题目要求对数时间。 |
| [35. 搜索插入位置](https://leetcode.cn/problems/search-insert-position/) | 将“是否存在目标”扩展成“目标应该处在什么位置”。 | `binary`, `boundary` | 首版选做挑战；额外学习第一个不小于目标的位置，理解可能返回数组长度。 |
| [27. 移除元素](https://leetcode.cn/problems/remove-element/) | 使用读写位置把需要保留的数据压到数组前段。 | `array`, `two-pointers` | 首版主练；理解逻辑长度与物理长度不同，评测只关注返回长度及前段内容。 |
| [283. 移动零](https://leetcode.cn/problems/move-zeroes/) | 把非零元素稳定地写到前方，再处理剩余位置。 | `array`, `two-pointers` | 首版主练；原地修改且保持非零元素相对顺序。 |
| [977. 有序数组的平方](https://leetcode.cn/problems/squares-of-a-sorted-array/) | 比较两端绝对值，理解平方后原来的大小顺序为何会变化。 | `array`, `selection`, `two-pointers` | 首版选做挑战；排序可作基线，线性进阶需补充相向双指针和从后向前填新数组。 |

算法直觉 `algorithm`、复杂度 `complexity`、简单排序 `selection/bubble/insertion` 不强行各配一道 LeetCode 题。先用本站原创练习检查理解，避免为了题数引入尚未学过的技巧。977 的排序基线也不意味着在原题规模下推荐二次时间排序作为最终方案。

## 后续 40 道：按专题开放

下表各题均为“后续规划”，仅在对应教学内容完成后开放为正式练习。表内前置知识是学习条件，不代表首版已经讲授。

### 链表（4 道）

| 题号与官方链接 | 难度 | 原创学习目的 | 前置知识与安排 |
| --- | --- | --- | --- |
| [206. 反转链表](https://leetcode.cn/problems/reverse-linked-list/) | 简单 | 改变连接方向，同时保留尚未处理的后续节点。 | 对象引用、`ListNode`、`null`；先迭代，递归为选做。 |
| [21. 合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/) | 简单 | 每次接入较小节点，维护已合并部分的尾部。 | 链表遍历、哨兵节点、有序合并。 |
| [83. 删除排序链表中的重复元素](https://leetcode.cn/problems/remove-duplicates-from-sorted-list/) | 简单 | 利用相邻关系跳过重复节点。 | 已排序含义、修改 `next`、空链表。 |
| [141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/) | 简单 | 通过访问记录或不同移动速度识别重复到达的节点。 | 引用身份比较；哈希集合基线或快慢指针补充，选做挑战。 |

### 栈与队列（4 道）

| 题号与官方链接 | 难度 | 原创学习目的 | 前置知识与安排 |
| --- | --- | --- | --- |
| [20. 有效的括号](https://leetcode.cn/problems/valid-parentheses/) | 简单 | 用最后打开、最先关闭的规则处理嵌套。 | 字符遍历、栈、空栈判断。 |
| [232. 用栈实现队列](https://leetcode.cn/problems/implement-queue-using-stacks/) | 简单 | 借助两次顺序反转得到先进先出的行为。 | 栈、队列、类与方法；均摊复杂度为额外进阶。 |
| [225. 用队列实现栈](https://leetcode.cn/problems/implement-stack-using-queues/) | 简单 | 重排队列，使最近加入的元素先被取出。 | 队列、栈、类与方法；与 232 二选一作补充。 |
| [155. 最小栈](https://leetcode.cn/problems/min-stack/) | 中等 | 保存辅助状态，让删除后仍能快速获得最小值。 | 栈、同步维护辅助栈、重复最小值处理。 |

### 哈希与计数（4 道）

| 题号与官方链接 | 难度 | 原创学习目的 | 前置知识与安排 |
| --- | --- | --- | --- |
| [217. 存在重复元素](https://leetcode.cn/problems/contains-duplicate/) | 简单 | 用集合记录已经遇到的数据。 | `HashSet`、查找与插入；作为哈希入门。 |
| [1. 两数之和](https://leetcode.cn/problems/two-sum/) | 简单 | 将寻找搭档转化成查询已见过的互补值。 | 双层循环基线、`HashMap`；注意同一位置不能使用两次。 |
| [242. 有效的字母异位词](https://leetcode.cn/problems/valid-anagram/) | 简单 | 比较字符出现次数，而不是比较排列顺序。 | 字符下标、频次数组；Unicode 进阶不作为基础要求。 |
| [383. 赎金信](https://leetcode.cn/problems/ransom-note/) | 简单 | 用频次余额判断材料是否足够。 | 频次统计、逐次扣减；作为 242 的选做变式。 |

### 二叉树（6 道）

| 题号与官方链接 | 难度 | 原创学习目的 | 前置知识与安排 |
| --- | --- | --- | --- |
| [104. 二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/) | 简单 | 将左右子树的结果合并成整棵树的结果。 | `TreeNode`、递归终止条件、递归返回值。 |
| [226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/) | 简单 | 在每个节点重复同一种局部连接变换。 | 树的递归遍历、交换引用。 |
| [94. 二叉树的中序遍历](https://leetcode.cn/problems/binary-tree-inorder-traversal/) | 简单 | 严格按指定顺序收集节点。 | 递归、列表；显式栈迭代作为进阶。 |
| [102. 二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/) | 中等 | 用队列把节点按层组织起来。 | 队列、BFS、每层节点数量。 |
| [101. 对称二叉树](https://leetcode.cn/problems/symmetric-tree/) | 简单 | 比较成镜像位置的两个节点及其子结构。 | 双节点递归、空节点配对。 |
| [543. 二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/) | 简单 | 区分向父节点返回的深度与全局最长路径。 | 后序递归、边数与节点数差异；选做挑战。 |

### 堆与选择（3 道）

| 题号与官方链接 | 难度 | 原创学习目的 | 前置知识与安排 |
| --- | --- | --- | --- |
| [703. 数据流中的第 K 大元素](https://leetcode.cn/problems/kth-largest-element-in-a-stream/) | 简单 | 持续保留最大的若干元素，以处理新加入的数据。 | 最小堆、`PriorityQueue`、类状态、重复值。 |
| [215. 数组中的第K个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/) | 中等 | 比较完整排序、堆与划分选择的不同成本。 | 堆作比较基线，正式进阶需学习划分与快速选择；见下方约束说明。 |
| [347. 前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/) | 中等 | 先统计次数，再根据次数选择元素。 | 哈希计数、堆；更严格进阶需桶或选择方法；见核验说明。 |

215 当前官方题页明确要求 `O(n)`，不能把 `O(n log k)` 堆方案描述成满足全部题目要求。教学时说明随机快速选择为期望线性、最坏二次；如讨论严格最坏线性，要另讲确定性选择方法，不给出错误复杂度承诺。347 官方进阶要求优于 `O(n log n)`，不能把所有 `k` 下的堆方案都宣称为严格更优。

### 图与搜索（4 道）

| 题号与官方链接 | 难度 | 原创学习目的 | 前置知识与安排 |
| --- | --- | --- | --- |
| [733. 图像渲染](https://leetcode.cn/problems/flood-fill/) | 简单 | 从一个网格位置出发访问相连的同类位置。 | 二维数组、DFS 或 BFS、边界与访问标记。 |
| [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/) | 中等 | 每次遍历处理一个连通区域，再统计区域数量。 | 网格搜索、访问去重。 |
| [994. 腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/) | 中等 | 同时从多个起点按层推进传播过程。 | 队列、BFS、多源初始化、不可达情况。 |
| [207. 课程表](https://leetcode.cn/problems/course-schedule/) | 中等 | 从依赖关系中判断是否存在阻碍完成的循环。 | 有向图、邻接表、入度与拓扑排序；专题挑战。 |

### 分治与回溯（5 道）

| 题号与官方链接 | 难度 | 原创学习目的 | 前置知识与安排 |
| --- | --- | --- | --- |
| [50. Pow(x, n)](https://leetcode.cn/problems/powx-n/) | 中等 | 把指数规模减半，复用子问题结果。 | 递归或迭代分治、奇偶性、负指数、Java `long` 防止取反溢出。 |
| [78. 子集](https://leetcode.cn/problems/subsets/) | 中等 | 用选择与不选择构造所有组合结果。 | 递归树、路径复制、撤销选择。 |
| [77. 组合](https://leetcode.cn/problems/combinations/) | 中等 | 增加大小约束，并避免重复选择相同组合。 | 回溯、起始下标、可选剪枝。 |
| [46. 全排列](https://leetcode.cn/problems/permutations/) | 中等 | 区分排列与组合，记录哪些元素已被选用。 | 回溯、访问状态、结果复制。 |
| [22. 括号生成](https://leetcode.cn/problems/generate-parentheses/) | 中等 | 在构造过程中提早排除不可能合法的前缀。 | 回溯、左右括号计数、合法性约束；专题挑战。 |

### 动态规划（6 道）

| 题号与官方链接 | 难度 | 原创学习目的 | 前置知识与安排 |
| --- | --- | --- | --- |
| [509. 斐波那契数](https://leetcode.cn/problems/fibonacci-number/) | 简单 | 从重复递归过渡到按顺序保存和复用结果。 | 递推、初始条件；不是单纯记公式。 |
| [70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs/description/) | 简单 | 按最后一步分类，再合并方案数量。 | 状态含义、递推、初始化。 |
| [746. 使用最小花费爬楼梯](https://leetcode.cn/problems/min-cost-climbing-stairs/) | 简单 | 将累计方案数改为比较到达成本。 | 一维状态、最小值转移、起点与顶部的区别。 |
| [198. 打家劫舍](https://leetcode.cn/problems/house-robber/) | 中等 | 在相邻位置不能同时选择的限制下比较两种决策。 | 一维动态规划、选择与不选择。 |
| [62. 不同路径](https://leetcode.cn/problems/unique-paths/) | 中等 | 把一维递推扩展成二维表格。 | 二维数组、边界初始化、递推顺序。 |
| [322. 零钱兑换](https://leetcode.cn/problems/coin-change/) | 中等 | 从较小金额构建最优结果，并表示不可达状态。 | 完全背包直觉、状态转移、哨兵与溢出防护；专题挑战。 |

### 贪心（4 道）

| 题号与官方链接 | 难度 | 原创学习目的 | 前置知识与安排 |
| --- | --- | --- | --- |
| [455. 分发饼干](https://leetcode.cn/problems/assign-cookies/) | 简单 | 使用刚好够用的资源满足当前需求。 | 排序、双指针、交换论证直觉。 |
| [860. 柠檬水找零](https://leetcode.cn/problems/lemonade-change/) | 简单 | 在当前可行选择中保留后续更有用的资源。 | 计数状态、分类讨论、贪心选择理由。 |
| [121. 买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/) | 简单 | 边扫描边保留过去的最优买入条件。 | 最小值维护、先后顺序、不能获利时的边界。 |
| [55. 跳跃游戏](https://leetcode.cn/problems/jump-game/) | 中等 | 维护当前能够覆盖的最远范围。 | 贪心不变量、可达位置检查；专题挑战。 |

## 核验记录与维护

- 48 道题均已在本轮访问官方来源核对题号、标题和难度。47 道成功读取中文官方题目正文；347 的中文题页多次超时，改由[官方英文题页](https://leetcode.com/problems/top-k-frequent-elements/)核对题号、难度、内容，由[官方排序题单](https://leetcode.cn/problem-list/sorting/)核对中文标题，未把超时写成成功。
- 所有题名链接为官方目标；上文首版 8 道的中文题页均已成功读取。核验不涉及本机账号登录、Java 在线提交、通过率、会员状态或题单成员关系。
- 题单开放前再次确认前置课程；元数据变化时更新 `verifiedAt` 与 `verification`。访问失败时保留原题号，说明待复查，不能静默跳到同名非官方页面。
- LeetCode 手动记录“已完成”与本站随堂练习“答对”分别存储。阅读题解、使用提示、独立完成应允许区分，不能仅凭点击原题链接记为完成。
- 每道原创编程练习准备参考方法、正常用例和边界用例，以行为判断正确性。首版 Java 在本地运行，不把网页选择题评分描述成 Java 代码已经通过测试。
