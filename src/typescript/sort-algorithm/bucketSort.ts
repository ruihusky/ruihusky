export function bucketSort(arr: number[], bucketNums = 5) {
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

  const bucketSize = Math.floor((max - min) / bucketNums) + 1;
  const buckets: number[][] = [];

  for (let i = 0; i < arr.length; i++) {
    // 将元素放入桶中
    const bIdx = Math.floor((arr[i] - min) / bucketSize);
    const bucketArr = buckets[bIdx] || (buckets[bIdx] = []);
    bucketArr.push(arr[i]);
    // 用冒泡排序保持桶内元素有序
    for (let j = bucketArr.length - 1; j > 0; j--) {
      if (bucketArr[j - 1] > bucketArr[j]) {
        [bucketArr[j - 1], bucketArr[j]] = [bucketArr[j], bucketArr[j - 1]];
      }
    }
  }

  let res: number[] = [];
  buckets.forEach((bucketArr) => {
    res = res.concat(bucketArr);
  });

  return res;
}

console.log(
  bucketSort([3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48])
);
// [ 2,  3,  4,  5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50 ]
