export function radixSortLSD(arr: number[]) {
  let max = arr[0];

  // 找出最大值
  for (const n of arr) {
    if (n > max) {
      max = n;
    }
  }
  
  // 确定最大位数
  let maxDigit = 0;
  while (max) {
    maxDigit++;
    max = Math.floor(max / 10);
  }

  const buckets: number[][] = [];
  let mod = 10;
  // 根据最大位数进行 maxDigit 轮排序
  // 由低位至高位排序
  for (let k = 0; k < maxDigit; k++, mod *= 10) {
    // 根据当前位数字放入对应桶中
    for (let i = 0; i < arr.length; i++) {
      const bucketIdx = Math.floor((arr[i] % mod) / (mod / 10));
      const bucketArr = buckets[bucketIdx] || (buckets[bucketIdx] = []);
      bucketArr.push(arr[i]);
    }
    // 从桶中依次取出元素排序
    let idx = 0;
    for (let j = 0; j < buckets.length; j++) {
      if (!buckets[j]) continue;
      while (buckets[j].length) {
        arr[idx] = buckets[j].shift();
        idx++;
      }
    }
  }

  return arr;
}

console.log(
  radixSortLSD([3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48])
);
// [ 2,  3,  4,  5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50 ]
