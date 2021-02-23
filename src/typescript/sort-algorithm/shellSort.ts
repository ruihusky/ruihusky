export function shellSort(arr: number[]) {
  const len = arr.length;
  // 步长序列 n / 2^i
  for (let gap = len >> 1; gap > 0; gap >>= 1) {
    // 执行插入排序
    // i = 0 默认已排序，所以从 0 + gap 的位置开始执行插入
    for (let i = gap; i < len; i++) {
      const temp = arr[i];
      let j = i - gap;
      while (j >= 0 && arr[j] > temp) {
        arr[j + gap] = arr[j];
        j -= gap;
      }
      arr[j + gap] = temp;
    }
  }

  return arr;
}

console.log(
  shellSort([3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48])
);
// [ 2,  3,  4,  5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50 ]
