export function quickSort(
  arr: number[],
  left: number = 0,
  right: number = arr.length - 1
) {
  if (left >= right) return arr;

  const partitionIdx = partition(arr, left, right);
  quickSort(arr, left, partitionIdx - 1);
  quickSort(arr, partitionIdx + 1, right);

  return arr;
}

// 对于序列的左、中、右三个值，取中值作为基准值
function getPivotIndex(arr: number[], left: number, right: number) {
  const mid = left + ((right - left) >> 1);
  const midValue = arr[mid];
  const leftValue = arr[left];
  const rightValue = arr[right];
  if (leftValue <= rightValue) {
    if (midValue < leftValue) {
      return left;
    } else if (midValue > rightValue) {
      return right;
    } else {
      return mid;
    }
  } else {
    if (midValue < rightValue) {
      return right;
    } else if (midValue > leftValue) {
      return left;
    } else {
      return mid;
    }
  }
}

/**
 * 对于给定的子序列，取一个基准值，并根据基准值分成左右区间
 * 返回最后基准值所在的下标
 */
function partition(arr: number[], left: number, right: number) {
  const pivotIdx = getPivotIndex(arr, left, right);
  // 先将基准值放在最左侧
  [arr[pivotIdx], arr[left]] = [arr[left], arr[pivotIdx]];
  let i = left + 1;
  let leftPartIdx = left;

  // 前后指针法分区
  // leftPartIdx 代表了左侧序列最后一个元素的下标
  // 搜索指针会一直向前移动
  while (i <= right) {
    // 如果搜索指针找到的元素小于等于基准值
    // 则表示该元素应该纳入左侧序列
    if (arr[i] < arr[left]) {
      // 存在距离，说明 leftPartIdx 右侧元素是大于 pivot 的
      // 则交换两个元素，将较小元素放置到左侧序列的右侧
      if (i - leftPartIdx > 1) {
        [arr[leftPartIdx + 1], arr[i]] = [arr[i], arr[leftPartIdx + 1]];
      }
      // 左侧序列的长度+1
      leftPartIdx++;
    }
    i++;
  }

  // 将基准值与左侧序列最后一位元素交换
  [arr[leftPartIdx], arr[left]] = [arr[left], arr[leftPartIdx]];

  return leftPartIdx;
}

console.log(
  quickSort([3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48])
);
// [ 2,  3,  4,  5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50 ]
