// Deterministic teaching traces. Each frame owns its array and can be revisited safely.
export function parseValues(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const parts = trimmed.split(/[,，\s]+/);
  if (parts.length > 12) throw new Error('一次最多演示 12 个数，便于看清每一步。');
  if (parts.some(x => !/^-?\d+$/.test(x) || Number(x) < -99 || Number(x) > 99)) {
    throw new Error('请输入 -99 到 99 的整数，用逗号或空格分隔。');
  }
  return parts.map(Number);
}

export function parseTarget(text) {
  if (!/^-?\d+$/.test(String(text).trim())) throw new Error('目标值或下标必须是整数。');
  const value = Number(text);
  if (!Number.isSafeInteger(value) || value < -99 || value > 99) throw new Error('请输入 -99 到 99 的整数。');
  return value;
}

export function makeTrace(kind, input, target = 0) {
  if (!Array.isArray(input) || input.length > 12 || input.some(x => !Number.isInteger(x) || x < -99 || x > 99)) {
    throw new Error('演示数据须为最多 12 个 -99 到 99 的整数。');
  }
  const values = [...input];
  const frames = [];
  let comparisons = 0, writes = 0, reads = 0;
  const push = (message, variables = {}, active = [], sorted = [], codeMatch = '', result) => {
    frames.push({ values: [...values], message, variables: { ...variables }, active: [...active], sorted: [...sorted], codeMatch, comparisons, writes, reads, result });
  };
  const indices = n => Array.from({ length: n }, (_, i) => i);
  push('先观察输入。点击“下一步”，跟随变量一起推演。', { n: values.length });
  if (kind === 'array') {
    if (!Number.isInteger(target) || target < 0 || target >= values.length) throw new Error(`合法下标范围是 0 到 ${values.length - 1}；空数组没有可访问元素。`);
    reads++;
    push(`下标 ${target} 对应第 ${target + 1} 个元素，值为 ${values[target]}。读取不会改变数组。`, { index: target, value: values[target], length: values.length }, [target], [], 'return nums[index]', values[target]);
  } else if (kind === 'sum' || kind === 'count') {
    let total = 0;
    push(kind === 'sum' ? '累加器从 0 开始，还没有处理任何元素。' : '访问次数从 0 开始。这里只统计循环体处理元素的次数。', { [kind === 'sum' ? 'total' : 'visits']: total }, [], [], kind === 'sum' ? 'int total = 0' : 'int visits = 0');
    for (let i = 0; i < values.length; i++) {
      reads++;
      total += kind === 'sum' ? values[i] : 1;
      push(kind === 'sum' ? `读取 nums[${i}] = ${values[i]}，累计结果变为 ${total}。` : `处理下标 ${i}，累计访问 ${total} 个元素。`, { i, [kind === 'sum' ? 'total' : 'visits']: total }, [i], indices(i), kind === 'sum' ? 'total += nums[i]' : 'visits++');
    }
    push(`循环结束，返回 ${total}。${!values.length ? '空数组不进入循环。' : ''}`, { [kind === 'sum' ? 'total' : 'visits']: total }, [], indices(values.length), kind === 'sum' ? 'return total' : 'return visits', total);
  } else if (kind === 'max') {
    if (!values.length) throw new Error('空数组没有最大值。Java 参考方法会抛出 IllegalArgumentException。');
    let max = values[0]; reads++;
    push(`先把第一个元素 ${max} 作为当前最大值，这也适用于全是负数的数组。`, { max, i: 0 }, [0], [], 'int max = nums[0]');
    for (let i = 1; i < values.length; i++) {
      reads++; comparisons++;
      const previous = max;
      max = Math.max(max, values[i]);
      push(values[i] > previous ? `${values[i]} 大于 ${previous}，更新最大值。` : `${values[i]} 没有超过 ${previous}，保留当前最大值。`, { i, max }, [i], indices(i), values[i] > previous ? 'max = nums[i]' : 'if (nums[i] > max)');
    }
    push(`所有元素已检查，最大值为 ${max}。`, { max }, [], indices(values.length), 'return max', max);
  } else if (kind === 'linear') {
    for (let i = 0; i < values.length; i++) {
      reads++; comparisons++;
      push(`检查下标 ${i}：${values[i]} ${values[i] === target ? '等于' : '不等于'}目标 ${target}。`, { i, target }, [i], indices(i), 'if (nums[i] == target)');
      if (values[i] === target) {
        push(`找到目标，返回首次出现的下标 ${i}。`, { i, target }, [i], indices(i), 'return i', i);
        return frames;
      }
    }
    push('所有元素都不等于目标，返回 -1 表示未找到。', { target }, [], indices(values.length), 'return -1', -1);
  } else if (kind === 'binary' || kind === 'boundary') {
    if (values.some((v, i) => i > 0 && v < values[i - 1])) throw new Error('二分查找要求数组有序，请输入从小到大的数据。网站不会自动替你排序。');
    let left = 0, right = kind === 'binary' ? values.length - 1 : values.length;
    const boundary = kind === 'boundary';
    push(boundary ? '使用左闭右开区间 [left, right)，寻找第一个不小于目标的位置。' : '使用双闭区间 [left, right]，两端都在搜索范围内。', { left, right, target }, [], [], 'int left = 0');
    while (boundary ? left < right : left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      comparisons++; reads++;
      push(`中间下标为 ${mid}，值为 ${values[mid]}；与目标 ${target} 比较。`, { left, right, mid, target }, [mid], indices(values.length).filter(i => i < left || (boundary ? i >= right : i > right)), 'int mid = left + (right - left) / 2');
      if (!boundary && values[mid] === target) {
        push(`找到目标，返回下标 ${mid}。有重复值时，基本二分不保证返回首次出现位置。`, { left, right, mid, target }, [mid], [], 'return mid', mid);
        return frames;
      }
      if (values[mid] < target) {
        left = mid + 1;
        push('中间值小于目标，排除中间位置及其左侧。', { left, right, mid, target }, [], indices(left), 'left = mid + 1');
      } else {
        right = boundary ? mid : mid - 1;
        push(boundary ? '中间值已不小于目标，仍可能是答案；继续检查更左侧。' : '中间值大于目标，排除中间位置及其右侧。', { left, right, mid, target }, [], indices(values.length).filter(i => boundary ? i >= right : i > right), boundary ? 'right = mid' : 'right = mid - 1');
      }
    }
    push(boundary ? `边界相遇，返回位置 ${left}。${left === values.length ? '等于数组长度，表示应放在末尾。' : '这里是第一个不小于目标的位置。'}` : '区间已空，没有找到目标，返回 -1。', { left, right, target }, [], indices(values.length), boundary ? 'return left' : 'return -1', boundary ? left : -1);
  } else if (kind === 'selection') {
    for (let i = 0; i < values.length - 1; i++) {
      let minIndex = i;
      push(`第 ${i + 1} 轮：从未排序区间寻找最小值，先记住下标 ${i}。`, { i, minIndex }, [i], indices(i), 'int minIndex = i');
      for (let j = i + 1; j < values.length; j++) {
        comparisons++; reads += 2;
        const better = values[j] < values[minIndex];
        if (better) minIndex = j;
        push(`比较下标 ${j} 后，当前最小值为 ${values[minIndex]}，下标为 ${minIndex}。`, { i, j, minIndex }, [j, minIndex], indices(i), better ? 'minIndex = j' : 'if (nums[j] < nums[minIndex])');
      }
      [values[i], values[minIndex]] = [values[minIndex], values[i]]; writes += 2;
      push(`将本轮最小值放到下标 ${i}，前 ${i + 1} 个位置已确定。`, { i, minIndex }, [i, minIndex], indices(i + 1), 'nums[i] = nums[minIndex]');
    }
    push('每一轮确定一个位置，排序完成。', {}, [], indices(values.length), '', [...values]);
  } else if (kind === 'bubble') {
    for (let i = values.length - 1; i > 0; i--) {
      let swapped = false;
      for (let j = 0; j < i; j++) {
        comparisons++; reads += 2;
        push(`比较相邻的 ${values[j]} 和 ${values[j + 1]}。`, { i, j, swapped }, [j, j + 1], indices(values.length).filter(k => k > i), 'if (nums[j] > nums[j + 1])');
        if (values[j] > values[j + 1]) {
          [values[j], values[j + 1]] = [values[j + 1], values[j]]; writes += 2; swapped = true;
          push('左边更大，交换相邻元素，把较大值向右移动。', { i, j, swapped }, [j, j + 1], indices(values.length).filter(k => k > i), 'nums[j] = nums[j + 1]');
        }
      }
      push(swapped ? `本轮结束，下标 ${i} 的位置已确定。` : '这一轮没有交换，剩余元素已经有序，可以提前结束。', { i, swapped }, [], indices(values.length).filter(k => k >= i), 'if (!swapped)');
      if (!swapped) break;
    }
    push('排序完成。相等的相邻元素不交换。', {}, [], indices(values.length), '', [...values]);
  } else if (kind === 'insertion') {
    for (let i = 1; i < values.length; i++) {
      const base = values[i]; reads++;
      let j = i - 1;
      push(`暂存 ${base} 为 base，准备插入左侧已排序区间。`, { i, j, base }, [i], indices(i), 'int base = nums[i]');
      while (j >= 0) {
        comparisons++; reads++;
        if (values[j] <= base) {
          push(`${values[j]} 不大于 ${base}，找到插入位置。`, { i, j, base }, [j], [], 'while (j >= 0');
          break;
        }
        values[j + 1] = values[j]; writes++;
        push(`${values[j]} 比 base 大，向右移动一格。base = ${base} 仍保存在变量里。`, { i, j, base }, [j, j + 1], [], 'nums[j + 1] = nums[j]');
        j--;
      }
      values[j + 1] = base; writes++;
      push(`把暂存的 ${base} 放在下标 ${j + 1}，前 ${i + 1} 个元素有序。`, { i, j, base }, [j + 1], indices(i + 1), 'nums[j + 1] = base');
    }
    push('所有元素都已插入合适位置，排序完成。', {}, [], indices(values.length), '', [...values]);
  } else if (kind === 'moveZeroes') {
    let write = 0;
    for (let read = 0; read < values.length; read++) {
      comparisons++; reads++;
      if (values[read] !== 0) {
        const value = values[read]; values[write] = value; writes++;
        push(`读到非零值 ${value}，写到下标 ${write}。read 之前的旧值稍后处理。`, { read, write }, [read, write], indices(write), 'nums[write] = nums[read]');
        write++;
      } else {
        push('读到 0，读取位置继续向前，写入位置保持不动。', { read, write }, [read], indices(write), 'if (nums[read] != 0)');
      }
    }
    while (write < values.length) {
      values[write] = 0; writes++;
      push(`非零元素已写完，把剩余下标 ${write} 置为 0。`, { write }, [write], indices(write), 'nums[write] = 0');
      write++;
    }
    push('移动完成，非零元素的相对顺序保持不变。', { write }, [], indices(values.length), '', [...values]);
  } else throw new Error('没有找到该演示。');
  return frames;
}
