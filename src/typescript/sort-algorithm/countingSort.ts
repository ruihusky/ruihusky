export function countingSort(arr: number[]) {
  let max = arr[0];
  let min = arr[0];

  // 找出最大值、最小值
  for (const n of arr) {
    if (n > max) {
      max = n;
    }
    if (n < min) {
      min = n;
    }
  }

  // 根据最大值、最小值初始化计数数组
  const count_arr: number[] = new Array(max - min + 1);
  // 计数
  for (const n of arr) {
    count_arr[n - min] = count_arr[n - min] ? count_arr[n - min] + 1 : 1;
  }

  // 累加
  for (let i = 1; i < count_arr.length; i++) {
    if (!count_arr[i]) count_arr[i] = 0;
    count_arr[i] += count_arr[i - 1];
  }

  const res = new Array(arr.length);
  // 根据位置信息重新排列数组
  // 将 arr[i] 元素放置到 res 数组中正确的排序位置
  // 为了保持稳定性，需要采用倒序
  for (let i = arr.length - 1; i >= 0; i--) {
    res[--count_arr[arr[i] - min]] = arr[i];
  }

  return res;
}

console.log(
  countingSort([3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48])
);
// [ 2,  3,  4,  5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50 ]
