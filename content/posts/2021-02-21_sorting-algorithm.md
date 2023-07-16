---
title: "十大经典排序算法"
date: 2021-02-20T20:00:00+08:00
draft: false
tags: ["算法", "排序算法"]
---

## 概览与术语

在计算机科学与数学中，一个排序算法（Sorting algorithm）是一种能将一串资料依照特定排序方式进行排列的一种算法，最常用到的排序方式之一就是数值顺序。

排序算法依照稳定性可分为稳定算法和不稳定算法。稳定排序算法会让原本有相等键值的纪录维持相对次序。也就是如果一个排序算法是稳定的，当有两个相等键值的纪录 R 和 S，且在原本的列表中 R 出现在 S 之前，则在排序过的列表中 R 也将会是在 S 之前。

排序算法依照排序过程中占用空间的方式分为 In-place 算法 与 Out-place 算法。In-place 是原地算法，基本上不需要额外的辅助空间，可允许固定数量的辅助变量。非原地算法就是 Out-place，其开辟的辅助空间与问题规模相关。例如，冒泡排序只需要数据在原序列中交换位置，不需要额外的辅助空间，是 In-place 算法。

不同的排序算法会有不同的时间复杂度（最差、平均、和最好性能），下表列出了十种经典排序算法的概览：

![十大排序算法概览](/ruihusky/assets/img/2021-02-21_sorting-algorithm/sort-algorithm-table.png)

## 冒泡排序（Bubble Sort）

一种简单的排序算法。该算法重复地走访过要排序的数列，每次比较相邻的两个元素，如果它们的顺序错误就进行交换，直到序列有序。这个算法的名字由来是因为：越小/越大的元素会经由交换慢慢“浮”到数列的顶端。

冒泡排序对 n 个项目最多需要 O(n^2)的比较次数，且可以原地排序。尽管这个算法是最易了解和实现的排序算法之一，它对于大量数据的排序效率还是比较低。

**算法描述**

1. 比较相邻的元素。如果第一个比第二个大，就交换他们两个；
2. 对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对。这步做完后，最后的元素会是最大的数；
3. 针对所有的元素重复以上的步骤，除了最后一个；
4. 重复步骤 1~3，直到没有任何一对数字需要比较；
5. 可选的优化步骤：某次步骤 1~3 执行过程中没有元素发生交换，则证明该序列已经有序，不需要再进行下一次序列遍历。

**动图演示**

![冒泡排序演示](/ruihusky/assets/img/2021-02-21_sorting-algorithm/bubbleSort.gif)

**代码实现**

```typescript
// TypeScript实现
export function bubbleSort(arr: number[]) {
  const len = arr.length;
  for (let i = 0; i < len - 1; i++) {
    let sorted = true;
    for (let j = 0; j < len - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        sorted = false;
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
    if (sorted) break;
  }
  return arr;
}
```

**算法分析**

最好时间复杂度：O(n)，当数据已经有序时

最坏时间复杂度：O(n^2)，当数据完全反序时

平均时间复杂度：O(n^2)

空间复杂度：O(1)

稳定性：稳定

## 选择排序（Selection Sort）

选择排序是一种简单直观的排序算法。它的工作原理如下：首先在未排序序列中找到最小（大）元素，存放到排序序列的起始位置，然后，再从剩余未排序元素中继续寻找最小（大）元素，然后放到已排序序列的末尾。以此类推，直到所有元素均排序完毕。

选择排序的主要优点与数据移动有关。如果某个元素位于正确的最终位置上，则它不会被移动。选择排序每次交换一对元素，它们当中至少有一个将被移到其最终位置上，因此对 n 个元素的表进行排序总共进行至多 n-1 次交换。在所有的完全依靠交换去移动元素的排序方法中，选择排序属于非常好的一种。

**算法描述**

1. 在未排序序列中找到最小（大）元素，存放到排序序列的起始位置；
2. 从剩余未排序元素中继续寻找最小（大）元素，然后放到已排序序列的末尾；
3. 重复步骤 2，直到所有元素排序完毕。

**动图演示**

![选择排序演示](/ruihusky/assets/img/2021-02-21_sorting-algorithm/selectionSort.gif)

**代码实现**

```typescript
// TypeScript实现
export function selectionSort(arr: number[]) {
  const len = arr.length;
  let minIndex: number;
  for (let i = 0; i < len - 1; i++) {
    minIndex = i;
    for (let j = i + 1; j < len; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }
  return arr;
}
```

**算法分析**

选择排序的比较次数与关键字的初始状态无关，总的比较次数 N=(n-1)+(n-2)+...+1=n\*(n-1)/2。交换次数 O(n)，最好情况是，已经有序，交换 0 次；最坏情况是，逆序，交换 n-1 次。交换次数比冒泡排序较少，由于交换相对于比较所需的 CPU 时间更多，n 值较小时，选择排序比冒泡排序快。

原地操作几乎是选择排序的唯一优点，当空间复杂度要求较高时，可以考虑选择排序；实际适用的场合非常罕见。

最好时间复杂度：O(n^2)

最坏时间复杂度：O(n^2)

平均时间复杂度：O(n^2)

空间复杂度：O(1)

稳定性：不稳定。最小（大）元素与已排序序列末尾之后一位元素进行交换时，末尾之后一位的元素与其他非最小（大）元素的相对位置发生了变化。

## 插入排序（Insertion Sort）

插入排序是一种简单直观的排序算法。该算法通过逐渐构建有序序列完成。对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。插入排序在实现上通常采用原地排序，因而在从后向前扫描过程中，需要反复把已排序元素逐步向后挪位，为最新元素提供插入空间。

**算法描述**

1. 从第一个元素开始，该元素可以认为已经被排序；
2. 取出下一个元素，在已经排序的元素序列中从后向前扫描；
3. 如果该元素（已排序）大于新元素，将该元素移到下一位置；
4. 重复步骤 3，直到找到已排序的元素小于或者等于新元素的位置；
5. 将新元素插入到该位置后；
6. 重复步骤 2~5，直到所有元素排序完毕。

**动图演示**

![插入排序演示](/ruihusky/assets/img/2021-02-21_sorting-algorithm/insertionSort.gif)

**代码实现**

```typescript
// TypeScript实现
export function insertionSort(arr: number[]) {
  const len = arr.length;
  let j: number;
  let temp: number;
  for (let i = 1; i < len; i++) {
    temp = arr[i];
    j = i - 1;
    while (j >= 0 && arr[j] > temp) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = temp;
  }
  return arr;
}
```

**算法分析**

采用插入排序存在最好情况和最坏情况，对于长度为 n 的列表：最好情况是列表已经有序，此时只需要进行 n-1 次比较。最坏情况是序列逆序，此时需要进行 1 + 2 + ... + (n - 1) = n\*(n-1)/2 次比较。平均来说插入排序算法复杂度为 O(n^2)。插入排序不适合对大量数据排序。但如果数据量很小，例如，量级小于千；或者原序列已大致有序，那么插入排序是一个不错的选择。

最好时间复杂度：O(n)

最坏时间复杂度：O(n^2)

平均时间复杂度：O(n^2)

空间复杂度：O(1)

稳定性：稳定

## 希尔排序（Shell Sort）

希尔排序，也称递减增量排序算法，是基于插入排序的更高效改进版本。该算法是按其设计者希尔（Donald Shell）的名字命名的，于 1959 年公布。

希尔排序在插入排序的基础上，基于以下两点性质提出改进方法：

- 插入排序在对几乎已经排好序的数据操作时，效率高，可以达到线性排序的效率
- 插入排序一般来说是低效的，因为插入排序每次只能将数据移动一位

希尔排序通过将全部元素分为几个大组分别执行插入排序以提高性能。这样可以让一个元素一次性地朝最终位置前进一大步。一次分组排序执行完毕后，算法重新分组、排序，且每组数量（也称为步长）逐步减小。算法的最后一步就是普通的插入排序，到了这步时，数据几乎是有序的了（此时插入排序效率很高）。

为了更好的理解希尔排序是什么，用一个实际的例子来进行说明：

现在我们要对数组 `[13 14 94 33 82 25 59 94 65 23 45 27 73 25 39 10]` 进行希尔排序，第一次我们将步长定为 5，那么我们将数组排列成一个表，每行的数量是 5：

```
13 14 94 33 82
25 59 94 65 23
45 27 73 25 39
10
```

每一轮希尔排序的过程就是对上表中的每**列**进行插入排序，排序后结果为：

```
10 14 73 25 23
13 27 94 33 39
25 59 94 65 82
45
```

请注意，将数组排列成表只是为了让我们更好的理解希尔排序（逻辑分组），真正的排序过程并不会这样做。我们将这四行拼起来就是第一轮希尔排序完成后数组的状态：`[10 14 73 25 23 13 27 94 33 39 25 59 94 65 82 45]`。第二次，我们将步长减小，定为 3：

```
10 14 73
25 23 13
27 94 33
39 25 59
94 65 82
45
```

再对每列进行一轮插入排序，结果为：

```
10 14 13
25 23 33
27 25 59
39 65 73
45 94 82
94
```

此时，数组已经**大致有序**了，此时对其进行插入排序效率较高。于是我们将步长定为 1 再次进行希尔排序（其实就是插入排序），完成整个排序过程。

**希尔排序的步长序列**

步长的选择是希尔排序的重要部分，对希尔排序的效率有很大的影响。

Donald Shell 最初建议步长选择为 n/2 并且每次对步长取半直到步长达到 1。虽然这样取可以比 O(n^2)类的算法（插入排序）更好，但还是有优化平均时间复杂度和最差时间复杂度的余地。下表列出了两种步长序列及其相应的最坏情况时间复杂度：

| 步长序列 | 最坏情况时间复杂度 |
| ----- | ----- |
| n/2^i | O(n^2)     |
| 2^i-1 | O(n^(3/2)) |

已知的最好步长序列是由 Sedgewick 提出的(1, 5, 19, 41, 109,...)，该序列的项来自 9 \* 4^i - 9 \* 2^i + 1 和 2^(i+2) \* (2^(i+2) - 3) + 1 这两个算式。用这样步长序列的希尔排序比插入排序要快，甚至在小数组中比快速排序和堆排序还快，但是在涉及大量数据时希尔排序还是比快速排序慢。

**算法描述**

1. 确定好步长序列 t1, t2, ..., tk，最终步长 tk 应为 1；
2. 对于某一步长 t，进行如下排序过程：将所有元素按照步长划分为 m 组。例如：`[ a[0] , a[0 + t], a[0 + 2t], ... ]`为一组，`[ a[1], a[1 + t], a[1 + 2t], ... ]`为一组。然后对每组单独进行插入排序；
3. 根据步长序列，重复步骤 2，直到完成整个排序过程。

**动图演示**

![希尔排序演示](/ruihusky/assets/img/2021-02-21_sorting-algorithm/shellSort.gif)

**代码实现**

```typescript
// TypeScript实现
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
```

**算法分析**

希尔排序是插入排序的改进版，其复杂度受所选步长序列影响。相关分析可见上文。

空间复杂度：O(1)

稳定性：不稳定。对单独的分组进行插入排序时，该组元素与其他分组元素的相对位置发生了变化。

## 归并排序（Merge Sort）

归并排序，是创建在归并操作上的一种有效的排序算法，效率为 O(nlogn)。1945 年由约翰·冯·诺伊曼首次提出。该算法是采用分治法（Divide and Conquer）的一个非常典型的应用，有两种实现方式：

- 自上而下的递归；
- 自下而上的迭代；

这里需要指出，在《数据结构与算法 JavaScript 描述》中，作者认为递归法在 JavaScript 中不可行，因为该算法的递归栈太深了:

> However, it is not possible to do so in JavaScript, as the recursion goes too deep for the language to handle.

是因为在 JavaScript 引擎中，有对调用栈深度的限制，不同浏览器/解析引擎的值可能不一样。你可以执行如下代码来了解确切的限制值：

```javascript
var i = 0;
function inc() {
  i++;
  inc();
}

try {
  inc();
} catch (e) {
  console.log("Maximum stack size is", i, "in your current browser");
}
```

假定最大调用栈深度限制为`x`，那么当数据量大于 2^x 时，JavaScript 环境执行递归方式的归并算法就会出错。

**算法描述**

这里给出迭代法的描述：

1. 对于长度为 n 的序列，将其视为每组大小为 1 的 n 组（视为每个元素为一组）；
2. 执行归并操作：将每相邻的 2 组合并成一个有序的新组。例如：组 1 与组 2 合并，成为新的组 1，组 3 与组 4 合并成为新的组 2；
3. 重复步骤 2，直到组的总数为 1，此时序列排序完毕。

**动图演示**

下图演示的是递归实现的归并排序算法。

![归并排序演示](/ruihusky/assets/img/2021-02-21_sorting-algorithm/mergeSort.gif)

**代码实现**

```typescript
// TypeScript实现（迭代实现）
export function mergeSort(arr: number[]) {
  const len = arr.length;

  if (len < 2) return arr;

  const _helperArr = new Array(len);

  /**
   * 用于合并相邻的两组序列。
   * 说明：
   * 左侧边界为左侧序列的起始元素位置
   * 中间点是左侧序列最后元素的位置+1，也是右侧序列的起始元素位置
   * 右侧边界为右侧序列的右边界，也是右侧序列的最后元素位置+1
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
```

**算法分析**

时间复杂度：不难得出归并操作总共会进行 O(logn)层，对于每一层来说，执行归并过程中每个元素都会被操作一次，也就是每层的时间复杂度为 O(n)，所以综合的时间复杂度为 O(nlogn)。

空间复杂度：进行归并操作时，需要一个辅助数组保存归并后的序列，其空间复杂度为 O(n)。

稳定性：稳定

## 快速排序（Quick Sort）

快速排序，又称分区交换排序（partition-exchange sort），简称快排，最早由东尼·霍尔提出。在平均状况下，排序 n 个项目要 O(nlogn)次比较。在最坏状况下则需要 O(n^2)次比较，但这种状况并不常见。事实上，快速排序通常明显比其他算法更快，因为它的内部循环可以在大部分的架构上很有效率地达成。

**算法描述**

快速排序使用分治策略来把一个序列分为较小和较大的 2 个子序列，然后递归地排序两个子序列。

1. 挑选基准值：从数列中挑出一个元素，称为“基准”（pivot）；
2. 分割：重新排序数列，所有比基准值小的元素摆放在基准前面，所有比基准值大的元素摆在基准后面（与基准值相等的数可以到任何一边）。在这个分割结束之后，对基准值的排序就已经完成；
3. 递归排序子序列：递归地将小于基准值元素的子序列和大于基准值元素的子序列排序，直到子序列长度为 1。

**动图演示**

![快速排序演示](/ruihusky/assets/img/2021-02-21_sorting-algorithm/quickSort.gif)

**代码实现**

```typescript
// TypeScript实现
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
 * 返回最后基准值所在的位置
 */
function partition(arr: number[], left: number, right: number) {
  const pivotIdx = getPivotIndex(arr, left, right);
  // 先将基准值放在最左侧
  [arr[pivotIdx], arr[left]] = [arr[left], arr[pivotIdx]];
  let i = left + 1;
  let leftPartIdx = left;

  // 前后指针法分区
  // leftPartIdx 代表了左侧序列最后一个元素的位置
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
```

**算法分析**

时间复杂度分析：在最好的情况，每次我们运行一次分割，我们会把一个数列分为两个几近相等的片段。这个意思就是每次递归调用处理一半大小的数列。因此，在到达大小为一的数列前，我们只要作 logn 次嵌套的调用。在同一层次结构的多个程序调用中，分区操作会访问每个元素一遍，总共全部仅需要 O(n)的时间。综合起来其时间复杂度是 O(nlogn)。

空间复杂度分析：快速排序算法所使用的空间，依照使用的版本而定。这里分析使用原地（in-place）分割的快速排序版本。对于 O(logn)层深度的嵌套调用，算法需要在每一层存储一个固定数量的信息。最好的情况最多需要 O(logn)次的嵌套递归调用，所以它需要 O(logn)的空间。最坏情况下需要 O(n)次嵌套递归调用，因此需要 O(n)的空间。

最好时间复杂度：O(nlogn)

最坏时间复杂度：O(n^2)。假定每次分割某一侧都没有子片段，则调用树的深度是 O(n)，结合上文看每层处理需要 O(n)时间，综合起来就是 O(n^2)。

平均时间复杂度：O(nlogn)

空间复杂度：对于 in-place 版本，平均 O(logn)，最坏 O(n)。

稳定性：不稳定

## 堆排序（Heap Sort）

堆排序是利用堆这种数据结构所设计的一种排序算法。堆是一个近似完全二叉树的结构，并同时满足堆的性质：即子节点的键值或索引总是小于（或者大于）它的父节点。要理解堆排序，首先要了解一下二叉树与堆。

**二叉树与堆**

**二叉树**：在计算机科学中，二叉树（英语：Binary tree）是每个节点最多只有两个分支（即不存在分支度大于 2 的节点）的树结构。通常分支被称作“左子树”或“右子树”。二叉树的分支具有左右次序，不能随意颠倒。

![二叉树](/ruihusky/assets/img/2021-02-21_sorting-algorithm/binaryTree.svg)
<span style="font-size: 14px;">一棵有 9 个节点且深度为 3 的二叉树</span>

**完全二叉树**：在一颗二叉树中，若满足以下两个条件，则称其为完全二叉树：

1. 除最后一层外的其余层都是满的
2. 最后一层要么是满的，要么在右边缺少连续若干节点

```
深度为 3 的完全二叉树

      0
    /   \
  1       2
 / \     / \
3   4   5   6
```

对于完全二叉树，还可以用数组来储存。如果某个节点的索引为 i，（假设根节点的索引为 0）则在它左子节点的索引会是 2i+1，右子节点会是 2i+2；而它的父节点（如果有）索引则为 (i-1)/2。

以上文为例：

![存储在数组中的完全二叉树](/ruihusky/assets/img/2021-02-21_sorting-algorithm/Binary_tree_in_array.svg)
<span style="font-size: 14px;">一个存储在数组中的完全二叉树</span>

**堆**：在完全二叉树的基础上，若二叉树满足以下条件，则称其为二叉堆：父节点的键值总是保持固定的序关系于任何一个子节点的键值，且每个节点的左子树和右子树都是一个二叉堆。

当父节点的键值总是大于或等于任何一个子节点的键值时为“最大堆”。当父节点的键值总是小于或等于任何一个子节点的键值时为“最小堆”。

此外，由于完全二叉树的特性，它可以用数组来进行表示。下例是一个最小堆和一个最大堆以及它们相应的数组表示：

```
          最小堆                             最大堆
            1                                 11
         /      \                          /      \
       2         3                       9         10
    /    \     /   \                   /   \     /    \
   4      5   6     7                5      6   7      8
  / \    / \                        / \    / \
 8  9   10 11                      1   2  3   4

位置:  0  1  2  3  4  5  6  7  8  9 10
左堆:  1  2  3  4  5  6  7  8  9 10 11
右堆: 11  9 10  5  6  7  8  1  2  3  4
```

了解以上内容后，接下来我们讨论堆排序的原理。

**算法描述**

1. **初始化最大堆**：将序列调整成一个最大堆，此时堆顶元素为最大值；
2. **堆排序过程**：取出堆顶元素，将剩下的堆继续调整为最大堆；
3. 重复过程 2，直到所有元素被取出。

**初始化最大堆**

对于一颗完全二叉树，执行如下算法就可以将其调整为最大二叉堆：

1. 从树的倒数第二层，调整每个节点（最大堆调整），使其成为最大二叉堆节点；
2. 往上一层，重复步骤 1，直到根节点。

最大堆调整算法(MAX-HEAPIFY)：

1. 对比节点和其左右子节点，若子节点大于该节点，将最大的子节点和该节点交换位置；
2. 若步骤一执行了交换操作，则对于被交换的子节点，再次执行步骤 1。

借助下图进行说明：

![构建最大堆过程](/ruihusky/assets/img/2021-02-21_sorting-algorithm/build-max-heap.png)

上图中，依次对节点 5、4、3、2、1 进行了最大堆调整，最终整个二叉树成为一个最大堆。分析其原理：

1. 先对第 3 层（节点 5、4）进行最大堆调整后，每一个节点都是最大堆（执行完 MAX-HEAPIFY(A,4)）；
2. 对第 2 层（节点 3、2）进行最大堆调整，若第二层的某个节点与其某一侧子节点进行了交换，则只需要继续往下调整该侧子树，因为另一侧子树已经满足最大堆属性；
3. 继续调整第 1 层，完成整个最大堆的调整。

**堆排序过程**

1. 将堆顶元素取出；
2. 将最后一个元素放到堆顶，并对堆顶执行最大堆调整算法；
3. 重复步骤 1、2，直到所有元素都被取出。

参考下图便于理解：

![堆排序过程](/ruihusky/assets/img/2021-02-21_sorting-algorithm/heap-sort.png)

**动图演示**

![快速排序演示](/ruihusky/assets/img/2021-02-21_sorting-algorithm/heap-sort-animation.gif)

**代码实现**

```typescript
// TypeScript实现
export function heapSort(arr: number[]) {
  let len = arr.length;

  // build max heap
  for (let i = Math.floor((len - 1) / 2); i >= 0; i--) {
    maxHeapify(arr, i, len);
  }

  // sort loop
  while (len) {
    [arr[0], arr[len - 1]] = [arr[len - 1], arr[0]];
    len--;
    maxHeapify(arr, 0, len);
  }

  return arr;
}

function maxHeapify(arr: number[], index: number, heapSize: number) {
  let maxIdx: number;
  let leftIdx: number;
  let rightIdx: number;

  while (true) {
    maxIdx = index;
    leftIdx = 2 * maxIdx + 1;
    rightIdx = 2 * maxIdx + 2;

    if (leftIdx < heapSize && arr[leftIdx] > arr[maxIdx]) {
      maxIdx = leftIdx;
    }

    if (rightIdx < heapSize && arr[rightIdx] > arr[maxIdx]) {
      maxIdx = rightIdx;
    }

    if (maxIdx !== index) {
      [arr[maxIdx], arr[index]] = [arr[index], arr[maxIdx]];
      index = maxIdx;
    } else {
      break;
    }
  }
}
```

**算法分析**

最好时间复杂度：O(nlogn)

最坏时间复杂度：O(nlogn)

平均时间复杂度：O(nlogn)

空间复杂度：O(1)

稳定性：不稳定

## 计数排序（Counting Sort）

计数排序是一种稳定的线性时间排序算法。该算法于 1954 年由 Harold H. Seward 提出。计数排序使用一个额外的数组 C ，其中第 i 个元素是待排序数组 A 中值等于 i 的元素的个数。然后根据数组 C 来将 A 中的元素排到正确的位置。

**算法描述**

通俗地理解，例如有 10 个年龄不同的人，统计出有 8 个人的年龄比 A 小，那 A 的年龄就排在第 9 位，用这个方法可以得到其他每个人的位置，也就排好了序。当然，年龄有重复时需要特殊处理（保证稳定性），这就是为什么最后要反向填充目标数组，以及将每个数字的统计减去 1。算法的步骤如下：

1. 找出待排序的数组中最大和最小的元素
2. 统计数组中每个值为 i 的元素出现的次数，存入数组 C 的第 i 项
3. 对所有的计数累加（从 C 中的第一个元素开始，每一项和前一项相加）
4. 反向填充目标数组：将每个元素 i 放在新数组的第 C[i]项，每放一个元素就将 C[i]减去 1

**动图演示**

![计数排序演示](/ruihusky/assets/img/2021-02-21_sorting-algorithm/countingSort.gif)

**代码实现**

```typescript
// TypeScript实现
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
```

**算法分析**

计数排序是一个稳定的排序算法。当输入的元素是 n 个 0 到 k 之间的整数时，时间复杂度是 O(n+k)，空间复杂度也是 O(n+k)，其排序速度快于任何比较排序算法。当 k 不是很大并且序列比较集中时，计数排序是一个很有效的排序算法。

最好时间复杂度：O(n+k)

最坏时间复杂度：O(n+k)

平均时间复杂度：O(n+k)

空间复杂度：O(k)

稳定性：稳定

## 桶排序（Bucket Sort）

桶排序工作的原理是将数组分到有限数量的桶里。每个桶再个别排序（可以根据情况使用最佳的排序算法）。

**算法描述**

1. 设置一个定量的数组当作空桶子；
2. 寻访序列，并且把项目一个一个放到对应的桶子去；
3. 对每个不是空的桶子进行排序；
4. 从不是空的桶子里把项目再放回原来的序列中。

**图片演示**

![桶排序：分配元素](/ruihusky/assets/img/2021-02-21_sorting-algorithm/Bucket_sort_1.svg)
<span style="font-size: 14px;">元素分配到桶中</span>
![桶排序：元素排序](/ruihusky/assets/img/2021-02-21_sorting-algorithm/Bucket_sort_2.svg)
<span style="font-size: 14px;">对桶中元素排序</span>

**代码实现**

```typescript
// TypeScript实现
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
```

**算法分析**

桶排序实际上只需要遍历一遍所有的待排序元素，然后依次放入指定的位置。如果加上输出排序的时间，那么需要遍历所有的桶，时间复杂度就是 O(n+k)，其中，n 为待排序的元素的个数，k 为桶的个数。

最好时间复杂度：O(n+k)

最坏时间复杂度：O(n^2)

平均时间复杂度：O(n+k)

空间复杂度：O(n+k)

稳定性：稳定

## 基数排序（Radix Sort）

基数排序是一种非比较型整数排序算法，其原理是将整数按位数切割成不同的数字，然后按每个位数分别比较。由于整数也可以表达字符串（比如名字或日期）和特定格式的浮点数，所以基数排序也不是只能使用于整数。

**算法描述**

将所有待比较数值（正整数）统一为同样的数位长度，数位较短的数前面补零。然后，从最低位开始，依次进行一次排序。这样从最低位排序一直到最高位排序完成以后，数列就变成一个有序序列。

基数排序的方式可以采用 LSD（Least significant digital）或 MSD（Most significant digital），LSD 的排序方式由键值的最右边开始，而 MSD 则相反，由键值的最左边开始。

**动图演示**

<img src="/ruihusky/assets/img/2021-02-21_sorting-algorithm/radixSort_LSD.gif" alt="基数排序：LSD" style="width: 420px;" />
<span style="font-size: 14px;">LSD 基数排序</span>

**代码实现**

```typescript
// TypeScript实现
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
```

**算法分析**

基数排序共需要进行 k 轮排序，其中 k 为最大位数。每轮排序的时间复杂度为 O(n)，所以综合时间复杂度为 O(n\*k)。

最好时间复杂度：O(n\*k)

最坏时间复杂度：O(n\*k)

平均时间复杂度：O(n\*k)

空间复杂度：O(n+k)

稳定性：稳定

## 参考资料

- [十大经典排序算法](https://sort.hust.cc/)
- [维基百科 - 冒泡排序](https://zh.wikipedia.org/wiki/%E5%86%92%E6%B3%A1%E6%8E%92%E5%BA%8F)
- [维基百科 - 选择排序](https://zh.wikipedia.org/wiki/%E9%80%89%E6%8B%A9%E6%8E%92%E5%BA%8F)
- [维基百科 - 插入排序](https://zh.wikipedia.org/wiki/%E6%8F%92%E5%85%A5%E6%8E%92%E5%BA%8F)
- [维基百科 - 希尔排序](https://zh.wikipedia.org/wiki/%E5%B8%8C%E5%B0%94%E6%8E%92%E5%BA%8F)
- [维基百科 - 归并排序](https://zh.wikipedia.org/wiki/%E5%BD%92%E5%B9%B6%E6%8E%92%E5%BA%8F)
- [维基百科 - 快速排序](https://zh.wikipedia.org/wiki/%E5%BF%AB%E9%80%9F%E6%8E%92%E5%BA%8F)
- [维基百科 - 堆排序](https://zh.wikipedia.org/wiki/%E5%A0%86%E6%8E%92%E5%BA%8F)
- [堆排序 (Heap Sort)](https://web.archive.org/web/20180110174742/http://bubkoo.com/2014/01/14/sort-algorithm/heap-sort/)
- [维基百科 - 计数排序](https://zh.wikipedia.org/wiki/%E8%AE%A1%E6%95%B0%E6%8E%92%E5%BA%8F)
- [维基百科 - 桶排序](https://zh.wikipedia.org/wiki/%E6%A1%B6%E6%8E%92%E5%BA%8F)
- [维基百科 - 基数排序](https://zh.wikipedia.org/wiki/%E5%9F%BA%E6%95%B0%E6%8E%92%E5%BA%8F)
