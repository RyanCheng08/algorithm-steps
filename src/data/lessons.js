// 教材提供知识主线；本文件的中文讲解、情境与随堂题为原创辅助内容。
// Java 参考方法是生成 java/AlgorithmLab.java 的唯一来源。
export const lessons = [
  {
    id: 'algorithm', number: 1, title: '算法与输入输出',
    subtitle: '从一张购物清单开始，把做事的方法说清楚。', module: '建立直觉', minutes: 15,
    prerequisites: [],
    source: { chapter: '第 1 章 初识算法', section: '算法的基本认识', bookPages: [9], pdfPages: [15], note: '教材概念为阅读主线；购物清单、讲解和练习为原创辅助。' },
    objectives: ['区分输入、处理步骤和输出', '把一个任务写成能够执行的有限步骤', '理解同一需求可以有不同实现'],
    scenario: '购物清单记录了每件商品的价格。收银时需要把它们加起来，清单为空时总价应为 0。如何把这件事交给程序？',
    sections: [
      { title: '先把问题说清楚', paragraphs: ['算法是解决一类问题的具体步骤。这里的输入是一组价格，输出是一个总价。价格统一用整数分记录，例如 350 表示 3.50 元，避免在入门时同时处理小数精度。', '题目约定数组不为 null，价格非负，累加结果不超出 int 的范围。先约定这些条件，才能判断某个输出是否正确。空清单也属于合法输入。'] },
      { title: '让步骤可以被执行', paragraphs: ['准备一个总价，最初为 0。从第一件商品开始，把它的价格加入总价；每件商品只处理一次，全部处理完后返回总价。每一步都有明确动作，也有明确结束条件。', '输入 [12, 8, 5] 时，总价依次变为 12、20、25。演示中的方块是数据，变化的 total 是程序暂存的状态；不要把最终答案与中途状态混为一谈。'] },
      { title: '先检查小例子，再扩大问题', paragraphs: ['可以先手算两件商品的总价，再检查只有一件和没有商品时的结果。如果没有商品，不进入循环，初始值 0 就是答案。', '有 n 件商品时需要访问 n 次，总工作量随 n 增长，记为 O(n)。目前只要理解“商品越多，检查越多”；复杂度课会展开。只有少量变量，额外空间为 O(1)。'] },
    ],
    pitfall: '先明确输出是什么。题目要求总价时，返回商品数量虽然也是一个整数，却没有完成同一项任务。',
    java: { method: 'totalPrice', explanation: '数组引用非 null，价格非负且总价在 int 范围内。total 保存已处理商品的总价；空清单返回 0。时间 O(n)，额外空间 O(1)。', code: `public static int totalPrice(int[] prices) {
    int total = 0;
    for (int i = 0; i < prices.length; i++) {
        total += prices[i];
    }
    return total;
}` },
    simulation: { kind: 'sum', values: [12, 8, 5], target: 0 },
    quiz: [
      { id: 'algorithm-1', type: 'choice', prompt: '函数接收一组商品价格，并返回总价。下面哪一项属于输出？', options: ['商品价格数组', '所有商品的价格之和', '数组中的第一个价格', '循环变量的名字'], answer: 1, explanation: '输入是待处理的数据，输出是任务要求的结果；这里是价格之和。', misconception: '混淆输入和输出', hints: ['想一想调用者最终需要从函数得到什么。', '区分“交给函数的数据”和“函数交回的结果”。'] },
      { id: 'algorithm-2', type: 'choice', prompt: '清单 [6, 3, 4] 中，前两件商品处理完后，total 是多少？', options: ['6', '13', '9', '3'], answer: 2, explanation: '中途状态只包含已经处理的商品：6 + 3 = 9。最后一件还没有加入。', misconception: '把中途状态当作最终结果', hints: ['先确定哪些元素已经处理，哪些还没有。', '本题停在第二次累加之后。'] },
      { id: 'algorithm-3', type: 'fill', prompt: '没有任何商品时，按本课约定，总价应该返回多少？填写整数。', answer: ['0'], explanation: '没有发生任何累加，total 保持初始值 0。', misconception: '遗漏空输入', hints: ['检查没有进入循环时，哪个变量会被直接返回。', '思考求和的初始值应该如何选，才能不改变后续结果。'] },
    ],
    challenge: { title: '计算一张清单的总价', prompt: '实现 totalPrice(int[] prices)。每个数代表整数分，价格非负，总和在 int 范围内；数组非 null，可以为空。先手算样例，再写方法。', steps: ['写清输入和输出的含义。', '给出总价如何初始化、如何更新和何时结束。', '用空清单、单件和多件商品检查结果。'], hints: ['先想一个能代表“还没有处理商品”的状态。', '循环负责逐个取出价格，另一个变量负责保留累计结果。', '每轮把当前价格加入累计变量，循环结束后返回它。'], tests: [{ input: '[12, 8, 5]', expected: '25' }, { input: '[]', expected: '0' }, { input: '[7]', expected: '7' }], javaMethod: 'totalPrice' },
  },
  {
    id: 'array', number: 2, title: '数组与下标', subtitle: '位置和元素值，是两件不同的事。', module: '建立直觉', minutes: 18,
    prerequisites: ['algorithm'],
    source: { chapter: '第 4 章 数组与链表', section: '4.1 数组', bookPages: [64], pdfPages: [70], note: '概念对应教材数组章节；交互、解释和习题为原创辅助。' },
    objectives: ['区分下标、元素值和数组长度', '知道合法下标的范围', '读取指定位置并识别越界'],
    scenario: '一排储物格分别装着 [7, 2, 9, 4]。格子的编号决定你打开哪一格，格内的数字是取出的内容。数组下标就是这样的编号。',
    sections: [
      { title: '从 0 开始编号', paragraphs: ['Java 数组的第一个元素下标是 0。对于 [7, 2, 9, 4]，nums[2] 取得的是第三个元素 9，而不是数值 2。描述“第几个”时要和代码里的下标分开。', '数组长度 nums.length 是 4，合法下标为 0、1、2、3。长度代表格子总数，不是最后一格的下标。'] },
      { title: '先检查位置，再访问数据', paragraphs: ['读取 nums[index] 前，要满足 index >= 0 且 index < nums.length。负数下标和等于长度的下标都不合法；空数组长度为 0，没有任何可访问位置。', '参考方法遇到非法下标会抛出 IndexOutOfBoundsException。这是一种明确报告错误的方式，不能随意返回 0，因为 0 本身可能就是合法元素值。'] },
      { title: '访问与遍历的区别', paragraphs: ['已知下标时直接访问该位置，不需要从第一个元素逐个寻找。在数组模型中，这种访问是 O(1)，额外空间也是 O(1)。', '如果只知道想找的数值，就不能把它当作下标。通常需要检查若干元素，那属于后面要学的查找。数组创建后长度固定，修改一个元素不会改变长度。'] },
    ],
    pitfall: '最后一个合法下标是 length - 1。访问 nums[nums.length] 会越界，即使数组不是空的。',
    java: { method: 'valueAt', explanation: 'nums 非 null。合法位置直接返回元素；非法位置抛出 IndexOutOfBoundsException。时间 O(1)，额外空间 O(1)。', code: `public static int valueAt(int[] nums, int index) {
    if (index < 0 || index >= nums.length) {
        throw new IndexOutOfBoundsException("Invalid index");
    }
    return nums[index];
}` },
    simulation: { kind: 'array', values: [7, 2, 9, 4], target: 2 },
    quiz: [
      { id: 'array-1', type: 'choice', prompt: 'nums = [7, 2, 9, 4]，nums[2] 的结果是什么？', options: ['2', '4', '7', '9'], answer: 3, explanation: '下标从 0 开始，位置 2 对应第三个元素 9。', misconception: '把元素值当成下标', hints: ['给每个格子从起点开始编号。', '代码中的位置编号比自然语言的“第几个”少 1。'] },
      { id: 'array-2', type: 'choice', prompt: '长度为 4 的数组，哪个下标访问一定越界？', options: ['0', '3', '4', '1'], answer: 2, explanation: '合法范围是 0 到 3；下标 4 已经在最后一个元素之后。', misconception: '长度与最大下标混淆', hints: ['画出四个位置，逐个写下编号。', '元素总数与最后一个编号不是同一个值。'] },
      { id: 'array-3', type: 'fill', prompt: '长度为 6 的非空数组，最后一个元素的下标是多少？填写整数。', answer: ['5'], explanation: '从 0 编号，最后一个下标是 6 - 1 = 5。', misconception: '数组边界', hints: ['先试着为两个元素的数组编号，再推广。', '用长度减去起始编号带来的偏移。'] },
    ],
    challenge: { title: '安全读取指定位置', prompt: '实现 valueAt(int[] nums, int index)。数组非 null；合法下标返回对应元素，非法下标抛出 IndexOutOfBoundsException。不要用特殊数字冒充错误。', steps: ['列出合法下标需要满足的两个条件。', '先处理非法位置，再访问数组。', '检查首位、末位和越界输入。'], hints: ['先考虑数组一共有多少个合法位置。', '需要同时排除负数位置和越过末尾的位置。', '用 if 判断 index < 0 或 index >= nums.length，随后读取 nums[index]。'], tests: [{ input: '[7, 2, 9, 4], index = 2', expected: '9' }, { input: '[5], index = 0', expected: '5' }, { input: '[], index = 0', expected: '抛出 IndexOutOfBoundsException' }], javaMethod: 'valueAt' },
  },
  {
    id: 'sum', number: 3, title: '遍历与求和', subtitle: '一个变量负责走路，一个变量负责记账。', module: '建立直觉', minutes: 20,
    prerequisites: ['array'],
    source: { chapter: '第 4 章 数组与链表', section: '4.1 数组；可结合迭代（书内 18 / PDF 24）', bookPages: [64], pdfPages: [70], note: '依据数组与迭代概念编写的原创求和课程。' },
    objectives: ['跟踪下标和累加器的变化', '写出覆盖所有元素的循环', '正确处理空数组与负数'],
    scenario: '本周几天的收支是 [3, -2, 5, 1]。收入记为正数，支出记为负数，要计算最终净变化。',
    sections: [
      { title: '两个变量各司其职', paragraphs: ['i 决定当前处理哪个元素，total 保存已经处理的元素之和。i 每轮增加 1，total 每轮增加 nums[i]，二者的变化规则不同。', '例如 [3, -2, 5, 1]，total 从 0 开始，依次变成 3、1、6、7。负数直接参与相加，无需单独分支。'] },
      { title: '循环为何不多不少', paragraphs: ['i 从 0 开始，条件是 i < nums.length。长度为 n 时，循环体恰好处理下标 0 到 n - 1，共 n 个位置。到 i == n 时结束，避免越界。', '循环开始前 total 是前 i 个元素的和；加上 nums[i] 后，就成了前 i + 1 个元素的和。这个一直成立的描述能帮助检查代码是否遗漏元素。'] },
      { title: '初始值与数据范围', paragraphs: ['求和从 0 开始，因为加上 0 不改变结果。空数组一次循环也不执行，返回 0 正好符合约定。不要写 total = nums[0] 后又从 0 累加，否则首元素会算两次。', '本课保证所有中间和以及最终结果在 int 范围内。时间 O(n)，额外空间 O(1)。如果以后频繁查询不同区间的和，可以进一步学习前缀和；本课先掌握一次完整遍历。'] },
    ],
    pitfall: 'i <= nums.length 会多访问一个位置；i 从 1 开始而 total 仍为 0，则会漏掉第一个元素。',
    java: { method: 'sum', explanation: 'nums 非 null，可以为空；所有累加结果在 int 范围内。时间 O(n)，额外空间 O(1)。', code: `public static int sum(int[] nums) {
    int total = 0;
    for (int i = 0; i < nums.length; i++) {
        total += nums[i];
    }
    return total;
}` },
    simulation: { kind: 'sum', values: [3, -2, 5, 1], target: 0 },
    quiz: [
      { id: 'sum-1', type: 'choice', prompt: '对 [3, -2, 5] 求和，处理完下标 1 后 total 的值是多少？', options: ['1', '3', '6', '-2'], answer: 0, explanation: '此时处理了 3 和 -2，累计值是 1，下标 2 的元素尚未加入。', misconception: '循环状态跟踪', hints: ['标出下标 1 对应的元素。', '只累计已经走过的位置。'] },
      { id: 'sum-2', type: 'choice', prompt: 'total 初始为 0。想恰好访问数组全部元素，哪段循环范围正确？', options: ['i 从 1 开始，i < length', 'i 从 0 开始，i <= length', 'i 从 0 开始，i < length', 'i 从 1 开始，i <= length'], answer: 2, explanation: '合法下标从 0 到 length - 1，只有第三种范围既不漏首项也不越界。', misconception: '循环范围', hints: ['用一个长度为 2 的数组检验四个选项。', '检查第一个位置和最后一个位置。'] },
      { id: 'sum-3', type: 'fill', prompt: '补全 Java 循环：for (int i = 0; i ____ nums.length; i++) { total += nums[i]; }。让每个合法位置恰好访问一次，空数组不进入循环。只填写比较运算符。', answer: ['<'], explanation: '填写 <。合法下标是 0 到 nums.length - 1，i 等于长度时必须停止；空数组的 0 < 0 为 false，因此不会访问元素。', misconception: '求和循环边界', hints: ['先想最后一个合法下标与数组长度之间的关系。', '条件需要在 i 等于数组长度之前就阻止下一次访问。'] },
    ],
    challenge: { title: '写出通用数组求和', prompt: '实现 sum(int[] nums)，返回全部元素之和。数组非 null，允许负数和空数组；累加过程与结果保证不溢出 int。', steps: ['用一句话说明 total 代表什么。', '独立写出循环的起点、条件和更新。', '将代码放入本地 Java 环境运行三个样例。'], hints: ['找一个适合“还没处理元素”的累计值。', '每轮只访问一个合法下标，更新同一个累计变量。', '从 i = 0 遍历到 i < nums.length，执行 total += nums[i]。'], tests: [{ input: '[2, -4, 7]', expected: '5' }, { input: '[]', expected: '0' }, { input: '[-8]', expected: '-8' }], javaMethod: 'sum' },
  },
  {
    id: 'max', number: 4, title: '找最大值', subtitle: '保留目前见过的最好答案。', module: '建立直觉', minutes: 20,
    prerequisites: ['sum'],
    source: { chapter: '第 4 章 数组与链表', section: '4.1 数组', bookPages: [64], pdfPages: [70], note: '数组遍历的原创辅助任务，不标为教材原题。' },
    objectives: ['为当前答案选择可靠初值', '用条件判断维护最大值', '解释全负数和空数组的处理'],
    scenario: '记录中的气温是 [-6, -2, -9, -1]。最高温度并不一定是正数；如果先假定最高温是 0，就可能得到记录中根本没有的答案。',
    sections: [
      { title: '从一个真实元素开始', paragraphs: ['只要数组非空，就可以先把第一个元素当作最大值。它既是合法候选，也让“已经看过的元素中的最大值”在开始时成立。', '不要盲目用 0 初始化。对全负数数组，所有元素都小于 0，程序就会错误地保留 0。初值必须适用于题目允许的全部输入。'] },
      { title: '只在发现更大值时更新', paragraphs: ['从下标 1 开始检查剩余元素。如果 nums[i] > max，就更新 max；否则保留原值。相等时不更新也不影响最大数值。', '处理 [-6, -2, -9, -1] 时，max 依次是 -6、-2、-2、-1。变量可能连续几轮不变，这并不表示循环没有运行。'] },
      { title: '空数组没有最大元素', paragraphs: ['空数组不存在可作为初值的元素。本课要求显式抛出 IllegalArgumentException，向调用者说明输入不符合求最大元素的要求；不要把某个普通整数作为替代答案。', '非空数组长度为 n 时做 n - 1 次大小比较，时间 O(n)，额外空间 O(1)。返回最大值和返回它的下标是两个任务，本课只要求数值。'] },
    ],
    pitfall: 'max = 0 在正数示例中看似正常，但不能处理全负数；通过几个样例不等于初始化一定正确。',
    java: { method: 'max', explanation: 'nums 非 null。空数组抛出 IllegalArgumentException；其他输入返回最大元素值。时间 O(n)，额外空间 O(1)。', code: `public static int max(int[] nums) {
    if (nums.length == 0) {
        throw new IllegalArgumentException("Array must not be empty");
    }
    int max = nums[0];
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] > max) {
            max = nums[i];
        }
    }
    return max;
}` },
    simulation: { kind: 'max', values: [-6, -2, -9, -1], target: 0 },
    quiz: [
      { id: 'max-1', type: 'choice', prompt: '对允许全负数的非空数组求最大值，哪种初始化一定可用？', options: ['max = 0', 'max = nums.length', 'max = nums[0]', 'max = 1'], answer: 2, explanation: '第一个元素是真实候选，对任意非空整数数组都成立；0、1 和长度都可能不是合法答案。', misconception: '最大值初始化', hints: ['初值需要适用于负数、零和正数。', '试着让初值来自题目输入本身。'] },
      { id: 'max-2', type: 'choice', prompt: '输入 [-5, -2, -8]，处理完全部元素后应该返回什么？', options: ['0', '-8', '2', '-2'], answer: 3, explanation: '负数中越接近 0 的值越大，这组数据最大为 -2。', misconception: '负数比较', hints: ['可以把三个数标在数轴上。', '比较数值大小，不能比较绝对值。'] },
      { id: 'max-3', type: 'fill', prompt: '输入 [4, 4, 1]，按照本课的方法，nums[i] > max 一共比较几次？填写整数。', answer: ['2'], explanation: '第一个元素用于初始化，只比较剩下两个元素，因此是 2 次。', misconception: '比较次数', hints: ['区分“读取初值”和“进行大小比较”。', '循环从下标 1 开始。'] },
    ],
    challenge: { title: '找到最大元素', prompt: '实现 max(int[] nums)。nums 非 null；非空时返回最大元素，空数组抛出 IllegalArgumentException。允许负数和重复值。', steps: ['先决定如何处理空数组。', '用已处理部分的最大值解释变量。', '检查全负数与单元素输入。'], hints: ['先找一个一定属于输入的候选值。', '初始化之后只需比较剩余元素。', '每遇到更大的 nums[i] 就更新 max，空数组在访问 nums[0] 之前报错。'], tests: [{ input: '[-5, -2, -8]', expected: '-2' }, { input: '[7]', expected: '7' }, { input: '[]', expected: '抛出 IllegalArgumentException' }], javaMethod: 'max' },
  },
  {
    id: 'linear', number: 5, title: '顺序查找', subtitle: '从头检查，第一次遇到就返回。', module: '查找与效率', minutes: 20,
    prerequisites: ['array', 'max'],
    source: { chapter: '第 4 章 数组与链表', section: '4.1 数组', bookPages: [64], pdfPages: [70], note: '基于数组概念的原创顺序查找课程；练习不是教材原题。' },
    objectives: ['返回目标第一次出现的下标', '区分找到与未找到的结束方式', '理解提前返回与比较次数'],
    scenario: '在 [8, 3, 6, 3, 1] 中寻找数字 3 的第一次出现位置。输入没有排好序，所以需要从左向右检查。',
    sections: [
      { title: '先约定返回的含义', paragraphs: ['查找方法返回目标第一次出现的下标，不是目标数值。这里第一个 3 的下标是 1。未找到时返回 -1，因为合法数组下标不会是负数。', '输入不要求有序，也可以包含重复元素。明确“第一次”意味着遇到匹配立即返回，不需要继续寻找后面的位置。'] },
      { title: '什么时候才能说不存在', paragraphs: ['检查 nums[i] == target。相等时已经有答案，可以马上返回 i；不相等只能说明当前位置不是目标，还要继续检查后面的元素。', '只有循环完整结束后，才能返回 -1。如果把 return -1 写在循环内的不相等分支，第一个元素不匹配就会错误结束。'] },
      { title: '一次查找做多少工作', paragraphs: ['目标在第一位时只比较一次，最好时间 O(1)。目标在末尾或不存在时，要检查 n 个元素，最坏时间 O(n)。空数组不比较任何元素，直接返回 -1。', '课堂计数只统计“元素与目标是否相等”的检查。循环条件和下标增加也会消耗工作，但不是本次计数口径。额外空间 O(1)。'] },
    ],
    pitfall: '返回目标数值与返回位置不是一回事；目标重复时，从左向右第一次命中即返回才能保证最左位置。',
    java: { method: 'linearSearch', explanation: 'nums 非 null，可以无序、为空或包含重复。返回第一次命中的下标，不存在则 -1。最坏时间 O(n)，额外空间 O(1)。', code: `public static int linearSearch(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == target) {
            return i;
        }
    }
    return -1;
}` },
    simulation: { kind: 'linear', values: [8, 3, 6, 3, 1], target: 3 },
    quiz: [
      { id: 'linear-1', type: 'choice', prompt: '输入 [8, 3, 6, 3]，target = 3，本课方法返回什么？', options: ['3', '1', '2', '-1'], answer: 1, explanation: '第一次出现 3 的位置是下标 1；返回值描述位置。', misconception: '返回值与返回位置混淆', hints: ['先确定题目要求的是哪一种结果。', '从左到右给元素编号，停在第一次匹配处。'] },
      { id: 'linear-2', type: 'choice', prompt: '第一个元素不等于目标时，应该做什么？', options: ['立即返回 -1', '返回第一个元素', '继续检查后续元素', '必须先排序'], answer: 2, explanation: '一个位置不匹配不能证明整个数组不存在目标；顺序查找也无需先排序。', misconception: '过早判断未找到', hints: ['想一想目标是否可能出现在后面。', '区分一个元素的检查结果和整个数组的结论。'] },
      { id: 'linear-3', type: 'fill', prompt: '在 [5, 1, 9, 2] 中查找 9，返回之前一共检查了几个元素？填写整数。', answer: ['3'], explanation: '依次检查 5、1、9，第三次命中后返回。', misconception: '下标与访问次数混淆', hints: ['用手指依次点过检查的元素。', '返回的下标与已经检查的数量相差一个起始偏移。'] },
    ],
    challenge: { title: '找到第一次出现的位置', prompt: '实现 linearSearch(int[] nums, int target)，返回第一个匹配下标，未找到返回 -1。数组非 null，可为空、无序或有重复值。', steps: ['用循环按原始顺序检查。', '将命中时的返回与未找到的返回分开。', '检查重复值和不存在目标。'], hints: ['保留原始顺序才能保证返回原数组中的位置。', '找到时可以结束；没找到一个位置时还需继续。', '循环内匹配就 return i，循环完整结束后 return -1。'], tests: [{ input: '[8, 3, 6, 3], target = 3', expected: '1' }, { input: '[2, 4], target = 7', expected: '-1' }, { input: '[], target = 1', expected: '-1' }], javaMethod: 'linearSearch' },
  },
  {
    id: 'complexity', number: 6, title: '操作次数与复杂度', subtitle: '先数做了多少工作，再认识增长速度。', module: '查找与效率', minutes: 25,
    prerequisites: ['sum', 'linear'],
    source: { chapter: '第 2 章 复杂度分析', section: '时间复杂度', bookPages: [25], pdfPages: [31], note: '复杂度概念对应教材；访问计数实验与题目为原创辅助。' },
    objectives: ['先约定基本操作再统计', '区分准确次数与增长数量级', '认识常数、线性、平方和对数增长'],
    scenario: '同样是处理一份清单，直接读取一个位置、逐个读完、让每个元素和全部元素配对，工作量会怎样随着清单变长而变化？',
    sections: [
      { title: '先数一个明确的动作', paragraphs: ['本课实验统计遍历经过的元素数。长度为 4 时 visits 为 4，长度为 8 时为 8。这个计数不包含循环条件、变量赋值等所有底层指令，只用来观察规模变化。', '网页动画播放快慢、电脑性能和后台程序都会影响耗时。我们不使用演示播放时间证明复杂度，而是观察算法步骤随输入规模怎样增长。'] },
      { title: '用增长趋势比较方法', paragraphs: ['访问固定下标需要常数次操作，记为 O(1)；完整遍历 n 个元素，记为 O(n)；两层循环各执行 n 次，组合次数为 n²，记为 O(n²)。输入翻倍，后两者分别大约变为 2 倍和 4 倍。', '如果每一步都把候选范围缩小到原来的一半，处理规模翻倍通常只增加一次缩小步骤，这类增长记为 O(log n)。二分查找会给出具体例子。'] },
      { title: '不要只数代码里有几个循环', paragraphs: ['一个循环执行 5 次，与执行 n 次，复杂度并不相同。两个前后执行的完整循环总共约 2n 次，仍是线性增长 O(n)；两层嵌套各执行 n 次才是平方增长。', '同一算法还可能有不同输入情况。顺序查找最好只查一个元素，最坏查完全部。说明复杂度时应讲清讨论的情况；本课完整遍历无提前结束，所以访问次数恒为 n，额外空间 O(1)。'] },
    ],
    pitfall: 'O(n) 不表示“正好执行 n 条机器指令”，也不保证在所有小输入上都比 O(n²) 更快；它描述输入变大时的增长上界。',
    java: { method: 'countVisits', explanation: 'nums 非 null。visits 统计循环处理了几个元素；返回值等于数组长度。此方法为教学计数实验，时间 O(n)，额外空间 O(1)。', code: `public static int countVisits(int[] nums) {
    int visits = 0;
    for (int i = 0; i < nums.length; i++) {
        visits++;
    }
    return visits;
}` },
    simulation: { kind: 'count', values: [3, 1, 4, 2, 5], target: 0 },
    quiz: [
      { id: 'complexity-1', type: 'choice', prompt: '完整遍历每个元素一次，输入从 100 个增加到 200 个，元素访问次数怎样变化？', options: ['保持不变', '约为原来的 2 倍', '约为原来的 4 倍', '只增加 1 次'], answer: 1, explanation: '访问次数与元素数量相同，数量翻倍，访问次数也翻倍，属于线性增长。', misconception: '输入规模与次数关系', hints: ['给两种输入分别列出访问次数。', '每个元素对应一次访问。'] },
      { id: 'complexity-2', type: 'choice', prompt: '两层嵌套循环，内外层都完整执行 n 次，内层动作总次数是哪一个？', options: ['2n', 'n + 1', 'n²', 'log n'], answer: 2, explanation: '外层每执行一次，内层都再执行 n 次，共 n 组，每组 n 次，所以是 n²。', misconception: '顺序循环与嵌套循环混淆', hints: ['先用 n = 3 画出每轮工作。', '思考工作是相加还是按组重复。'] },
      { id: 'complexity-3', type: 'fill', prompt: '两次先后进行的完整遍历，共访问 2n 次。忽略常数系数，时间复杂度是什么？填写 O(...)。', answer: ['O(n)', 'o(n)', 'O（n）'], explanation: '2n 与 n 都随输入线性增长；在这个分析中忽略常数系数，写作 O(n)。', misconception: '常数系数与增长阶', hints: ['这里的循环是先后执行，不是彼此嵌套。', '输入翻倍时，总访问次数也只翻倍。'] },
    ],
    challenge: { title: '给一次遍历计数', prompt: '实现 countVisits(int[] nums)。数组非 null，允许为空；每轮访问一个位置并将计数加一，返回处理元素的次数。此题要求实际写出循环以理解计数，不直接返回 length。', steps: ['约定只统计处理元素的次数。', '每进入一次循环体，计数增加一次。', '比较不同输入长度的结果并解释增长。'], hints: ['先分清“元素值”与“元素数量”。', '计数不需要累加 nums[i] 的数值。', '用 visits 从 0 开始，每轮执行 visits++。'], tests: [{ input: '[9, -2, 7]', expected: '3' }, { input: '[]', expected: '0' }, { input: '[100]', expected: '1' }], javaMethod: 'countVisits' },
  },
  {
    id: 'binary', number: 7, title: '二分查找', subtitle: '利用有序性，每次排除不可能的一半。', module: '查找与效率', minutes: 25,
    prerequisites: ['linear', 'complexity'],
    source: { chapter: '第 10 章 搜索', section: '二分查找', bookPages: [205], pdfPages: [211], note: '算法概念对应教材；讲解、交互数据与练习为原创辅助。' },
    objectives: ['解释有序输入为何必要', '维护闭区间并正确更新边界', '处理命中与目标不存在'],
    scenario: '在 [2, 5, 8, 12, 16, 23, 38] 中找 16。因为数字从小到大排列，看到中间的 12 后，就能确定它左边的所有数也不是目标。',
    sections: [
      { title: '可以排除的依据是有序', paragraphs: ['顺序查找依次检查；二分查找先看中间元素。如果中间值小于目标，左半边及中间值都不可能匹配；大于目标时，同理排除右半边及中间值。', '这里假设数组按非递减顺序排列。主练习使用无重复数组；存在重复值时，基本二分可以返回其中任意一个命中位置，不能保证最左。演示不会替你偷偷排序。'] },
      { title: '维护闭区间 [left, right]', paragraphs: ['left = 0，right = length - 1 表示所有可能位置。只要 left <= right，范围中仍有候选。mid = left + (right - left) / 2 取中间下标，也避免直接 left + right 可能溢出。', '小于目标时令 left = mid + 1；大于时令 right = mid - 1；相等时返回 mid。中间位置已经检查过，排除时必须跨过它，使范围严格缩小。'] },
      { title: '搜索怎样结束', paragraphs: ['如果 left > right，候选范围为空，说明目标不存在，返回 -1。空数组初始化为 left = 0、right = -1，循环自然跳过。', '每轮候选数大约减半，最坏时间 O(log n)，额外空间 O(1)。本课比较计数按检查一个中点算一次，不是 Java 中所有比较表达式的总数。'] },
    ],
    pitfall: '在此闭区间写法中使用 left = mid 或 right = mid，可能让范围停在同一位置，导致无限循环。',
    java: { method: 'binarySearch', explanation: 'nums 非 null，按非递减顺序排列。返回任一命中下标，不存在则 -1；重复值的最左位置由下一课处理。最坏时间 O(log n)，额外空间 O(1)。', code: `public static int binarySearch(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            return mid;
        }
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}` },
    simulation: { kind: 'binary', values: [2, 5, 8, 12, 16, 23, 38], target: 16 },
    quiz: [
      { id: 'binary-1', type: 'choice', prompt: '闭区间二分中，nums[mid] < target，下一步应如何更新？', options: ['right = mid - 1', 'left = mid + 1', 'left = mid', '直接返回 -1'], answer: 1, explanation: '中点与左侧都小于目标，可全部排除，新的左边界是 mid + 1。', misconception: '二分边界方向', hints: ['根据升序关系，想一想哪些位置一定小于目标。', '已经比较过且不匹配的中点，也不应留在候选范围。'] },
      { id: 'binary-2', type: 'choice', prompt: '哪一项是本课二分查找可以正确排除候选的关键前提？', options: ['所有数都为正数', '数组至少有两个元素', '数组按非递减顺序排列', '目标一定存在'], answer: 2, explanation: '有序性使中点的比较结果可以代表整侧的大小关系；其他条件都不是必要前提。', misconception: '二分适用条件', hints: ['思考为什么看到一个元素，就能推断它一侧的所有元素。', '无序时，中点左右的数是否仍有确定的大小关系？'] },
      { id: 'binary-3', type: 'fill', prompt: '闭区间二分使用 while (left <= right)，mid 为当前中点。补全分支：if (nums[mid] < target) { left = ____; }。数组升序，当前中点已确认不匹配。只填写表达式，不写分号。', answer: ['mid + 1', 'mid+1', '1 + mid', '1+mid', '(mid + 1)', '(mid+1)'], explanation: '填写 mid + 1（1 + mid 也等价）。中点及其左侧都小于目标，下一候选位置是中点的右邻居。更新为 mid 可能不能缩小范围。', misconception: '二分范围不能收缩', hints: ['判断哪些位置已经确定不可能是答案。', '新边界要越过已检查且不匹配的中点，确保每轮范围缩小。'] },
    ],
    challenge: { title: '在有序数组中找目标', prompt: '实现 binarySearch(int[] nums, int target)。数组非 null、升序且主测试无重复；不存在返回 -1。请使用闭区间二分，不能先做一次线性查找。', steps: ['写出候选区间初始边界。', '列出相等、小于、大于三种分支。', '用空数组和不存在的目标检查退出条件。'], hints: ['每一步必须减少候选位置，才能保证结束。', '更新边界时排除已经确认不匹配的中点。', '循环条件 left <= right；向右用 mid + 1，向左用 mid - 1。'], tests: [{ input: '[2, 5, 8, 12, 16], target = 12', expected: '3' }, { input: '[2, 5], target = 4', expected: '-1' }, { input: '[], target = 1', expected: '-1' }], javaMethod: 'binarySearch' },
  },
  {
    id: 'boundary', number: 8, title: '查找边界与插入位置', subtitle: '没有恰好命中，也能得到有意义的位置。', module: '查找与效率', minutes: 25,
    prerequisites: ['binary'],
    source: { chapter: '第 10 章 搜索', section: '二分查找插入点；边界入口为书内 213 / PDF 219', bookPages: [209], pdfPages: [215], note: '对应教材插入点与边界概念；本课用半开区间讲解 lowerBound，习题为原创辅助。' },
    objectives: ['找到第一个大于或等于目标的位置', '理解半开区间的边界更新', '处理重复值和返回数组长度的情况'],
    scenario: '有序记录 [2, 4, 4, 4, 7] 中，新来的 4 应插在现有 4 的最前面。如果新来的是 9，它应该排到所有元素之后。',
    sections: [
      { title: '把问题改成第一个满足条件的位置', paragraphs: ['lowerBound 返回第一个大于或等于 target 的下标。在 [2, 4, 4, 4, 7] 中查 4，结果为 1；查 5，结果为 4；查 9，结果为长度 5。', '这同时可以表示插入位置。若要求判断目标是否存在，需要再检查返回位置小于 length 且该位置的值等于 target；不能直接把每个返回位置当作命中。'] },
      { title: '半开区间 [left, right)', paragraphs: ['本课使用 left = 0、right = length，right 位置不包含在待检查范围内。循环条件为 left < right。它与上一课闭区间是一整套不同约定，不能只替换其中一个边界。', '若 nums[mid] < target，中点及左侧都不符合要求，令 left = mid + 1。否则中点可能就是最左答案，令 right = mid，继续向左缩小。这里无需 mid - 1。'] },
      { title: '返回位置可以指向末尾之后', paragraphs: ['left == right 时，分界位置确定：其左侧都小于目标，其右侧从该位置开始都大于或等于目标。返回 left。空数组返回 0，目标大于所有元素时返回 n。', '位置 n 可以代表末尾插入点，但不是可访问的数组下标，不能读取 nums[n]。最坏时间 O(log n)，额外空间 O(1)；实际插入和移动元素不包含在这个查找方法中。'] },
    ],
    pitfall: '遇到相等就返回，只能保证找到某个相等元素；要找最左边界，需要保留它作为候选并继续向左收缩。',
    java: { method: 'lowerBound', explanation: 'nums 非 null、非递减有序，可含重复。返回第一个 >= target 的位置，不存在则返回 nums.length。最坏时间 O(log n)，额外空间 O(1)。', code: `public static int lowerBound(int[] nums, int target) {
    int left = 0;
    int right = nums.length;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}` },
    simulation: { kind: 'boundary', values: [2, 4, 4, 4, 7], target: 4 },
    quiz: [
      { id: 'boundary-1', type: 'choice', prompt: '在 [2, 4, 4, 4, 7] 中求 target = 4 的 lowerBound，应该返回什么？', options: ['2', '3', '1', '4'], answer: 2, explanation: '第一个大于或等于 4 的位置是下标 1，不能随便返回后面的某个 4。', misconception: '任意命中与最左边界混淆', hints: ['先把满足 >= target 的位置标出来。', '题目要求这些位置中最靠左的一个。'] },
      { id: 'boundary-2', type: 'choice', prompt: 'lowerBound 返回 nums.length 时，下列哪种解释正确？', options: ['可以直接读取 nums[nums.length]', '数组中所有元素都小于目标', '一定是代码错误', '目标出现在最后一个位置'], answer: 1, explanation: '没有元素达到目标值，所以插入点在末尾之后；该位置不能被当作现有下标访问。', misconception: '插入位置与访问下标混淆', hints: ['考虑目标比数组所有元素都大的情况。', '区分“可以插入的位置”和“已经存在的元素位置”。'] },
      { id: 'boundary-3', type: 'fill', prompt: '补全 lowerBound：int left = 0, right = nums.length; while (left < right) { int mid = left + (right - left) / 2; if (nums[mid] < target) left = mid + 1; else right = mid; } return ____; 只填写一个边界变量名。', answer: ['left', 'right'], explanation: '参考写法返回 left。循环结束时 left == right，这个重合位置就是第一个 >= target 的位置，因此填写 right 也正确；位置可能等于 nums.length，不应返回 nums[left]。', misconception: '边界位置与元素混淆', hints: ['查看循环结束时，两条边界之间还有没有距离。', '题目要求返回分界位置，不是读取那个位置上的数值。'] },
    ],
    challenge: { title: '找到最左插入位置', prompt: '实现 lowerBound(int[] nums, int target)。数组非 null、非递减有序，可以重复或为空。返回第一个 >= target 的位置，若没有则返回长度；方法只查找，不真正插入元素。', steps: ['用语言描述待寻找的分界。', '采用完整的半开区间写法。', '检查重复值、末尾插入与空数组。'], hints: ['找到一个相等元素以后，左边仍可能有更早的答案。', '将整个序列看作“小于目标”和“不小于目标”两部分。', 'nums[mid] < target 时 left = mid + 1，否则 right = mid，最终返回 left。'], tests: [{ input: '[2, 4, 4, 7], target = 4', expected: '1' }, { input: '[2, 4], target = 9', expected: '2' }, { input: '[], target = 3', expected: '0' }], javaMethod: 'lowerBound' },
  },
  {
    id: 'selection', number: 9, title: '选择排序', subtitle: '每一轮，把剩下最小的放到前面。', module: '排序与整理', minutes: 25,
    prerequisites: ['max', 'complexity'],
    source: { chapter: '第 11 章 排序', section: '选择排序', bookPages: [224], pdfPages: [230], note: '算法对应教材；讲解、练习和演示输入为原创辅助。' },
    objectives: ['区分已排序前缀与未排序区', '记录最小元素的位置并交换', '解释比较次数和原地修改'],
    scenario: '把 [5, 2, 4, 1, 3] 排成从小到大。第一轮在整组里找最小值 1，把它放到第一个位置；再处理剩余部分。',
    sections: [
      { title: '把数组分成已确定与未确定两部分', paragraphs: ['第 i 轮开始时，下标小于 i 的前缀已经放好了最小的那些元素。当前任务是在 i 到末尾之间寻找最小值，并放到下标 i。', '最小值的位置用 minIndex 保存。先假设 i 是最小位置，再逐个检查后面的 nums[j]；发现更小时更新 minIndex。需要记录位置，才知道最后和谁交换。'] },
      { title: '找完再交换', paragraphs: ['扫描完整个未排序区后，将 nums[i] 与 nums[minIndex] 交换。使用 temp 保存一个值，防止连续赋值覆盖原数据。即使最小值已在 i，自己与自己交换也不会改变结果。', '例如 [5, 2, 4, 1, 3]，第一轮结果是 [1, 2, 4, 5, 3]。这一轮只保证第一个位置最终正确，不能认为整个数组已经有序。'] },
      { title: '为什么总要做许多比较', paragraphs: ['第一轮比较 n - 1 次，下一轮 n - 2 次，直到最后一轮 1 次，总计 n(n - 1)/2 次。即使输入原本有序，仍需扫描，因此最好与最坏时间都为 O(n²)。', '只使用几个变量并直接修改原数组，额外空间 O(1)。空数组和单元素无需任何一轮。这个简单交换版本不是稳定排序：带相同键的不同记录可能改变相对顺序。'] },
    ],
    pitfall: 'minIndex 存放的是位置。比较时要用 nums[minIndex]，不能拿元素值直接与 minIndex 比较。',
    java: { method: 'selectionSort', explanation: 'nums 非 null，原地按升序排序。时间 O(n²)，额外空间 O(1)；空数组和单元素保持原样。', code: `public static void selectionSort(int[] nums) {
    for (int i = 0; i < nums.length - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[j] < nums[minIndex]) {
                minIndex = j;
            }
        }
        int temp = nums[i];
        nums[i] = nums[minIndex];
        nums[minIndex] = temp;
    }
}` },
    simulation: { kind: 'selection', values: [5, 2, 4, 1, 3], target: 0 },
    quiz: [
      { id: 'selection-1', type: 'choice', prompt: '对 [5, 2, 4, 1, 3] 完成第一轮选择排序后，数组是什么？', options: ['[1, 2, 4, 5, 3]', '[1, 2, 3, 4, 5]', '[2, 5, 4, 1, 3]', '[5, 2, 4, 3, 1]'], answer: 0, explanation: '第一轮找到 1，并把它与首元素 5 交换；其他位置不因这一轮自动有序。', misconception: '一轮排序的作用范围', hints: ['先找当前未排序区的最小值。', '这一轮只做最终的一次位置交换。'] },
      { id: 'selection-2', type: 'choice', prompt: '选择排序中的 minIndex 应保存什么？', options: ['当前最小元素的值', '数组长度', '当前最小元素的下标', '已完成比较的次数'], answer: 2, explanation: '保存下标才能在本轮结束时找到待交换的位置；数值通过 nums[minIndex] 取得。', misconception: '位置与数值混淆', hints: ['想一想扫描完之后，需要定位哪个位置。', '只有值时，面对重复元素不方便确定交换位置。'] },
      { id: 'selection-3', type: 'fill', prompt: '对 4 个元素做本课选择排序，比较 nums[j] < nums[minIndex] 一共几次？填写整数。', answer: ['6'], explanation: '三轮分别比较 3、2、1 次，总共 6 次。', misconception: '排序比较次数', hints: ['分别列出每轮剩余的候选数量。', '每轮的第一个候选作为初始最小值，不需要和自己比较。'] },
    ],
    challenge: { title: '实现选择排序', prompt: '实现 selectionSort(int[] nums)，直接修改非 null 数组，使其非递减排列。允许空数组、负数和重复值；不要调用 Arrays.sort。', steps: ['划出已排序前缀与剩余区。', '在剩余区扫描得到最小位置。', '完成交换后再开始下一轮。'], hints: ['每轮只需确定一个最终位置。', '扫描时保留最小值的位置，交换发生在扫描结束之后。', '外层 i 从 0 到 n - 2，内层 j 从 i + 1 到 n - 1，最后交换 i 与 minIndex。'], tests: [{ input: '[5, 2, 4, 1, 3]', expected: '[1, 2, 3, 4, 5]' }, { input: '[-1, 2, -1]', expected: '[-1, -1, 2]' }, { input: '[]', expected: '[]' }], javaMethod: 'selectionSort' },
  },
  {
    id: 'bubble', number: 10, title: '冒泡排序', subtitle: '比较相邻元素，让大数逐步移向右侧。', module: '排序与整理', minutes: 25,
    prerequisites: ['selection'],
    source: { chapter: '第 11 章 排序', section: '冒泡排序', bookPages: [227], pdfPages: [233], note: '算法对应教材；说明、随堂题和测试情境为原创辅助。' },
    objectives: ['跟踪相邻比较与交换', '缩小每轮待比较的末端', '用交换标记提前结束'],
    scenario: '对 [5, 1, 4, 2, 3]，从左往右比较相邻两个数，左边较大就交换。走完一轮，最大的 5 会到最右侧。',
    sections: [
      { title: '每次只比较相邻两个数', paragraphs: ['比较 nums[j] 和 nums[j + 1]。如果左边更大，就交换；否则保持原样。完成这次比较后，较大的数留在右侧，下一次又参与和右邻居的比较。', '经过一整轮，未处理区的最大值一定到达该区末尾。它已经处于最终位置，下一轮不必再次碰它。和选择排序相比，这里可能在一轮中发生很多次交换。'] },
      { title: '比较范围随着轮次缩小', paragraphs: ['外层用 i 表示当前待处理区的末端，从 length - 1 向 1 缩小。内层 j 从 0 走到 i - 1，因为比较中还要访问 j + 1。', '例如 [5, 1, 4, 2, 3] 的第一轮结束为 [1, 4, 2, 3, 5]。最大的数已经固定，但中间仍可能无序，不能只进行一轮就结束。'] },
      { title: '没有交换说明什么', paragraphs: ['每轮开始设置 swapped = false。一旦发生交换就设为 true。如果整轮没有交换，说明待处理区的每对相邻元素都满足顺序，结合已确定后缀，整个数组已排序，可以提前退出。', '带此优化的版本，已有序输入只扫描一轮，最好时间 O(n)；逆序等最坏情况仍为 O(n²)，额外空间 O(1)。只有严格大于时交换，能保留相等元素原有相对顺序。'] },
    ],
    pitfall: 'swapped 必须在每轮开始重新设为 false。内层需要 j < i，否则 j + 1 可能跨过本轮范围。',
    java: { method: 'bubbleSort', explanation: 'nums 非 null，原地非递减排序。带无交换提前结束：最好时间 O(n)，最坏 O(n²)，额外空间 O(1)。', code: `public static void bubbleSort(int[] nums) {
    for (int i = nums.length - 1; i > 0; i--) {
        boolean swapped = false;
        for (int j = 0; j < i; j++) {
            if (nums[j] > nums[j + 1]) {
                int temp = nums[j];
                nums[j] = nums[j + 1];
                nums[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) {
            break;
        }
    }
}` },
    simulation: { kind: 'bubble', values: [5, 1, 4, 2, 3], target: 0 },
    quiz: [
      { id: 'bubble-1', type: 'choice', prompt: '从左向右冒泡，对 [3, 1, 2] 完成第一轮后，结果是什么？', options: ['[1, 3, 2]', '[1, 2, 3]', '[3, 2, 1]', '[2, 1, 3]'], answer: 1, explanation: '先交换 3 和 1 得到 [1, 3, 2]，再交换 3 和 2，得到 [1, 2, 3]。', misconception: '一次交换与一整轮混淆', hints: ['第一轮包含不止一次相邻比较。', '交换后，继续使用已经变化的数组。'] },
      { id: 'bubble-2', type: 'choice', prompt: '某一整轮没有发生任何交换，为什么可以结束？', options: ['数组一定只有一个元素', '所有元素都相等', '相邻顺序均满足，剩余区已排序', '比较次数已经达到固定上限'], answer: 2, explanation: '没有交换意味着每一对被检查的相邻元素都非递减，配合已确定后缀即可结束。', misconception: '提前结束条件', hints: ['回想触发交换的条件是什么。', '整轮中每一对相邻元素都没有触发交换。'] },
      { id: 'bubble-3', type: 'fill', prompt: '输入 [1, 2, 3, 4]，带提前结束的冒泡排序共做几次相邻元素比较？填写整数。', answer: ['3'], explanation: '第一轮比较三对相邻元素，没有交换，随后直接退出。', misconception: '优化后的最好情况', hints: ['先检查第一轮有没有交换。', '提前退出会影响之后是否还有新的轮次。'] },
    ],
    challenge: { title: '实现可提前结束的冒泡排序', prompt: '实现 bubbleSort(int[] nums)。原地非递减排序，数组非 null；如果一整轮没有交换就提前结束。允许空数组、负数和重复值。', steps: ['用相邻元素比较完成一轮。', '每轮缩小待处理的末端。', '添加每轮重新初始化的交换标记。'], hints: ['想一想一轮结束后，哪个位置已经确定。', '没有任何逆序相邻对时，无需继续扫描新一轮。', '用 swapped 记录本轮是否交换；内层 j < i，轮末若 !swapped 则 break。'], tests: [{ input: '[3, 1, 2]', expected: '[1, 2, 3]' }, { input: '[1, 2, 3, 4]', expected: '[1, 2, 3, 4]；一轮后结束' }, { input: '[2, -1, 2]', expected: '[-1, 2, 2]' }], javaMethod: 'bubbleSort' },
  },
  {
    id: 'insertion', number: 11, title: '插入排序', subtitle: '像整理手中的扑克牌，把新牌插入合适的位置。', module: '排序与整理', minutes: 25,
    prerequisites: ['selection', 'bubble'],
    source: { chapter: '第 11 章 排序', section: '插入排序', bookPages: [230], pdfPages: [236], note: '算法对应教材；扑克牌情境说明、交互及练习为原创辅助。' },
    objectives: ['维护一个始终有序的前缀', '区分移动元素与保存待插入值', '正确处理向首位插入的边界'],
    scenario: '手里已有排好的 [2, 5]，新拿到一张 3。先把 5 向右移，再把 3 放到腾出的地方，手里便成为 [2, 3, 5]。',
    sections: [
      { title: '从一个有序前缀出发', paragraphs: ['只有一个元素时自然有序，因此从 i = 1 开始。每轮把 nums[i] 保存到 base，再将它插入左侧已经有序的区间中。', '第 i 轮开始时，0 到 i - 1 有序，但不一定是整个数组最小的 i 个值；这是它与选择排序“位置已经最终确定”的不同之处。'] },
      { title: '先移动，再放回', paragraphs: ['令 j = i - 1，从有序区右端向左看。只要 nums[j] > base，就把 nums[j] 向右移动一格，j 再减 1。base 保存在变量中，不会因数组位置被覆盖而丢失。', '移动时数组里可能暂时出现重复值，这是正常中间状态。循环结束后，在 j + 1 写入 base，完整数组的元素才恢复为正确集合。'] },
      { title: '检查边界并理解效率', paragraphs: ['条件写为 j >= 0 && nums[j] > base。Java 的短路求值会先检查 j，避免在 j 为 -1 时访问数组。若比所有前缀元素都小，最后写入位置正好为 0。', '已有序时每轮只比较少量次，最好 O(n)；逆序时每轮要移动整个前缀，最坏 O(n²)，额外空间 O(1)。只移动严格大于 base 的元素，可以保留相等值的相对顺序。'] },
    ],
    pitfall: '没有先保存 base 就移动元素，会覆盖原本需要插入的值。j 停在前一个位置，最终写回位置是 j + 1。',
    java: { method: 'insertionSort', explanation: 'nums 非 null，原地非递减排序。最好时间 O(n)，最坏 O(n²)，额外空间 O(1)。base 保存待插入值。', code: `public static void insertionSort(int[] nums) {
    for (int i = 1; i < nums.length; i++) {
        int base = nums[i];
        int j = i - 1;
        while (j >= 0 && nums[j] > base) {
            nums[j + 1] = nums[j];
            j--;
        }
        nums[j + 1] = base;
    }
}` },
    simulation: { kind: 'insertion', values: [5, 2, 4, 1, 3], target: 0 },
    quiz: [
      { id: 'insertion-1', type: 'choice', prompt: '已排序前缀是 [2, 5]，待插入值为 3。本轮需要先移动哪个元素？', options: ['2 向右', '5 向右', '3 向右', '所有元素向左'], answer: 1, explanation: '从右往左检查，5 大于 3，所以将 5 右移；2 不大于 3，随后把 3 写到两者之间。', misconception: '插入时的移动方向', hints: ['从有序前缀的最右侧开始比较。', '只移动比待插入值更大的元素。'] },
      { id: 'insertion-2', type: 'choice', prompt: '为什么移动之前必须用 base 保存 nums[i]？', options: ['为了改变数组长度', '为了直接得到最大值', '避免原位置被覆盖后丢失待插入值', '为了让数组自动有序'], answer: 2, explanation: '右移会覆盖 nums[i]；base 独立保存原值，最终才能把它写回空位。', misconception: '覆盖原始值', hints: ['观察第一次右移会写入哪个位置。', '原来的待插入值之后还会被使用。'] },
      { id: 'insertion-3', type: 'fill', prompt: '插入排序先执行：int base = nums[i]; int j = i - 1; while (j >= 0 && nums[j] > base) { nums[j + 1] = nums[j]; j--; }。补全随后的写回语句 nums[____] = base;，只填写下标表达式。', answer: ['j + 1', 'j+1', '1 + j', '1+j', '(j + 1)', '(j+1)'], explanation: '填写 j + 1（1 + j 也等价）。停止时 j 指向不大于 base 的前一个元素，或已为 -1；空位总在其右侧。如果插入最前面，-1 + 1 正好得到下标 0。', misconception: '插入排序写回位置', hints: ['跟踪最后一次移动结束后，j 与腾出的位置分别在哪里。', '再检查一种极端情况：base 比有序前缀的所有元素都小。'] },
    ],
    challenge: { title: '把每个新元素插入有序前缀', prompt: '实现 insertionSort(int[] nums)，原地非递减排序，nums 非 null。使用临时变量保存待插入值，不能调用排序库方法。', steps: ['确定每轮开始时已经有序的部分。', '保存当前值，向右移动更大的前缀元素。', '在循环停止后写回待插入值。'], hints: ['把当前位置看成临时空位，而当前值保存在手里。', '向左比较时，要先确认下标仍然合法。', 'while (j >= 0 && nums[j] > base) 中右移并 j--，最后 nums[j + 1] = base。'], tests: [{ input: '[4, 6, 2]', expected: '[2, 4, 6]' }, { input: '[2, 2, -1]', expected: '[-1, 2, 2]' }, { input: '[]', expected: '[]' }], javaMethod: 'insertionSort' },
  },
  {
    id: 'two-pointers', number: 12, title: '双指针与移动零', subtitle: '一个位置负责读取，一个位置负责安排写入。', module: '排序与整理', minutes: 25,
    prerequisites: ['array', 'linear'],
    source: { chapter: '第 4 章 数组与链表', section: '4.1 数组（基础阅读）', bookPages: [64], pdfPages: [70], note: '本课双指针讲解与练习为原创辅助；所标教材页用于数组基础，不声称该页包含本题。LeetCode 283 另见题单。' },
    objectives: ['区分读位置与写位置的职责', '原地移动零并保持非零值顺序', '解释两个先后循环仍为线性时间'],
    scenario: '把 [0, 1, 0, 3, 12] 中的零放到末尾，非零值依然按 1、3、12 的顺序排列。数组长度不变，也不用另建一个数组。',
    sections: [
      { title: '读位置每次前进，写位置按需前进', paragraphs: ['read 按顺序检查每个元素；write 表示下一个非零值应该写入的位置。遇到 0 时只移动 read；遇到非零值时把它写到 nums[write]，再把 write 加 1。', '始终有 write <= read，所以写入不会覆盖尚未读取的未来元素。这里的“指针”只是两个数组下标变量，并不是要求你学习 Java 中不存在的指针算术。'] },
      { title: '先保留非零值，再补零', paragraphs: ['扫描 [0, 1, 0, 3, 12] 后，前 3 个位置保存 [1, 3, 12]，write 为 3。后面的值可能还是旧数据，必须把 write 到末尾的位置改成 0。', '由于非零值按读取顺序写入，相对顺序自然保留。我们没有对它们排序，也没有删除数组位置；只是改变原数组中的内容。'] },
      { title: '用极端情况检查两个职责', paragraphs: ['全是零时没有写入非零值，最后全部补零；没有零时 write 跟着 read 前进，数组不变；空数组两个阶段都不执行。重复非零值同样保持原顺序。', '第一次扫描 n 个元素，补零最多再写 n 次，总工作量至多与 2n 成正比，因此时间 O(n)。只使用下标变量，额外空间 O(1)，原数组本身不计作额外分配。'] },
    ],
    pitfall: '只把非零元素挪到前面还不够，尾部可能留着旧值。也不能给整个数组排序，因为题目要求保持非零值的相对顺序。',
    java: { method: 'moveZeroes', explanation: 'nums 非 null，原地将零移至末尾，非零元素的相对顺序不变。时间 O(n)，额外空间 O(1)。', code: `public static void moveZeroes(int[] nums) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != 0) {
            nums[write] = nums[read];
            write++;
        }
    }
    while (write < nums.length) {
        nums[write] = 0;
        write++;
    }
}` },
    simulation: { kind: 'moveZeroes', values: [0, 1, 0, 3, 12], target: 0 },
    quiz: [
      { id: 'two-pointers-1', type: 'choice', prompt: '对 [0, 3, 0, 1, 3] 移动零并保持非零顺序，正确结果是哪一个？', options: ['[1, 3, 3, 0, 0]', '[3, 1, 3, 0, 0]', '[0, 0, 3, 1, 3]', '[3, 3, 1, 0, 0]'], answer: 1, explanation: '非零值原来的相对顺序是 3、1、3，移动零不能改变它。', misconception: '误把整理当排序', hints: ['先忽略所有零，单独读出非零值顺序。', '再考虑空出的尾部应该放什么。'] },
      { id: 'two-pointers-2', type: 'choice', prompt: 'read 当前读到 0，write 应该怎样变化？', options: ['立刻增加 1', '变成 read', '保持不变', '减小 1'], answer: 2, explanation: '没有新的非零值写入，下一个可写位置不变；read 仍继续向后扫描。', misconception: '读写下标职责混淆', hints: ['write 表示下一个非零值的存放位置。', '考虑本轮是否真的保存了一个非零值。'] },
      { id: 'two-pointers-3', type: 'fill', prompt: '处理 [0, 5, 0, 2, 7]，第一遍扫描完成、尚未补零时，write 的值是多少？填写整数。', answer: ['3'], explanation: '共有三个非零元素，每写入一个 write 增加一次，所以为 3。', misconception: '写位置与已保留数量', hints: ['write 只在一个特定条件下增加。', '统计第一阶段一共写入了几个非零元素。'] },
    ],
    challenge: { title: '原地移动零', prompt: '实现 moveZeroes(int[] nums)。数组非 null，原地把所有零移到末尾，保持非零值的相对顺序；不能新建同等长度数组，也不能通过排序完成。', steps: ['分别说明 read 和 write 代表什么。', '按原顺序把非零值写到前面。', '补零并检查全零、无零和混合情况。'], hints: ['先解决保留非零值顺序，再处理剩余位置。', '读位置每轮前进，写位置只在保存非零值后前进。', '第一阶段 nums[write++] = nums[read]，第二阶段从 write 开始把剩余位置置 0。'], tests: [{ input: '[0, 1, 0, 3, 12]', expected: '[1, 3, 12, 0, 0]' }, { input: '[0, 0]', expected: '[0, 0]' }, { input: '[2, -1, 2]', expected: '[2, -1, 2]' }], javaMethod: 'moveZeroes' },
  },
];

export const futureModules = [
  { id: 'linked', title: '链表与对象引用', description: '后续规划：先理解对象之间的引用，再学习节点操作，不把这些内容视为首版已实现。', topics: ['对象与引用', '链表遍历', '插入与删除', '反转链表'] },
  { id: 'stack-queue', title: '栈与队列', description: '后续规划：用受限的存取顺序解决嵌套与等待问题。', topics: ['后进先出', '先进先出', '双向队列', '括号匹配'] },
  { id: 'hashing', title: '哈希表', description: '后续规划：通过键找到数据，认识哈希冲突与性能条件。', topics: ['键与值', '频次统计', '集合与去重', '哈希冲突'] },
  { id: 'recursion-tree', title: '递归与树', description: '后续规划：先跟踪调用栈，再学习层级数据的遍历与搜索。', topics: ['递归终止', '调用与返回', '二叉树', '深度与层序遍历', '二叉搜索树'] },
  { id: 'heap-graph', title: '堆与图', description: '后续规划：从优先处理任务走到节点之间的连接关系。', topics: ['优先队列', 'Top-k', '图的表示', '广度优先搜索', '深度优先搜索'] },
  { id: 'divide-backtrack', title: '分治与回溯', description: '后续规划：拆分大问题，或系统地尝试选择、撤销选择。', topics: ['归并排序', '快速排序', '拆分与合并', '组合与排列', '剪枝'] },
  { id: 'dynamic-greedy', title: '动态规划与贪心', description: '后续规划：从小状态推导答案，学会检查局部选择是否可靠。', topics: ['状态与转移', '初始化与遍历顺序', '爬楼梯', '背包入门', '贪心条件与反例'] },
];
