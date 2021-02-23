export function mergeSort(arr: number[]) {
  const len = arr.length;

  if (len < 2) return arr;

  const _helperArr = new Array(len);

  /**
   * 对于相邻的两组序列，可以知道：
   * 左边界为左侧序列的起始下标
   * 中间点为左右序列的分界点，是左侧序列最后元素下标+1，也是右侧序列的起始下标
   * 右边界为右侧序列的右边界，也是右侧序列的最后元素下标+1
   * @param leftIdx 左侧边界
   * @param midIdx 中间点
   * @param rightIdx 右侧边界
   * @param originArr 原始数组
   * @param helperArr 辅助数组
   */
  function merge(
    leftIdx: number,
    midIdx: number,
    rightIdx: number,
    originArr: number[],
    helperArr: number[]
  ) {
    let i = leftIdx;
    let j = midIdx;
    let helperArrIndex = leftIdx;

    // 先将归并后的数组填充到辅助数组中
    while (i < midIdx && j < rightIdx) {
      if (originArr[i] < originArr[j]) {
        helperArr[helperArrIndex] = originArr[i];
        i++;
      } else {
        helperArr[helperArrIndex] = originArr[j];
        j++;
      }
      helperArrIndex++;
    }

    while (i < midIdx) {
      helperArr[helperArrIndex] = originArr[i];
      i++;
      helperArrIndex++;
    }

    while (j < rightIdx) {
      helperArr[helperArrIndex] = originArr[j];
      j++;
      helperArrIndex++;
    }

    // 将序列从辅助数组中复制到原数组
    for (
      helperArrIndex = leftIdx;
      helperArrIndex < rightIdx;
      helperArrIndex++
    ) {
      originArr[helperArrIndex] = helperArr[helperArrIndex];
    }
  }

  let groupSize = 1;
  while (Math.ceil(len / groupSize) > 1) {
    for (let i = 0; i < len; i += groupSize * 2) {
      // 合并每相邻两组，得到新的有序组
      let midIdx: number, rightIdx: number;
      midIdx = (midIdx = i + groupSize) > len ? len : midIdx;
      rightIdx = (rightIdx = i + groupSize * 2) > len ? len : rightIdx;
      merge(i, midIdx, rightIdx, arr, _helperArr);
    }

    // 分组大小翻倍
    groupSize <<= 1;
  }

  return arr;
}

console.log(
  mergeSort([3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48])
);
// [ 2,  3,  4,  5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50 ]
