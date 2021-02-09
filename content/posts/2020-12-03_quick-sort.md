---
title: "快速排序"
date: 2020-12-03T20:00:00+08:00
draft: true
tags: ["算法", "排序算法", "快速排序"]
categories: ["理论基础"]
---

该排序算法使用了分而治之的算法思想。

1. 对于一个需要排序的数组，随机选择一个元素作为基准值。随后将小于、大于基准值的元素分别找出，在此分别暂称之为左列、右列，并返回`[左列, 基准值, 右列]`的排序结果。
2. 如果左列/右列的数组长度>1，则递归调用快速排序。

这是一种分而治之的算法思想：

- 基线条件：数组长度<1，则不再需要排序，返回本身即可。
- 问题分解过程：利用基准值将数组划分为左列、基准值、右列，左列、右列数组的长度将不断减小，直至满足基线条件。

时间复杂度：
平均时间：调用栈的高度为 O(log n))，而每层需要的时间为 O(n)。因此整个算法需要的时间为 O(n) ＊ O(log n)=O(n logn)。
最坏情况：调用栈的高度为 O(n)，而每层需要的时间为 O(n)。因此整个算法需要的时间为 O(n^2)。

算法示例(python)：

```python
def quicksort(array):
  if len(array) < 2:
    # base case, arrays with 0 or 1 element are already "sorted"
    return array
  else:
    # recursive case
    pivot = array[0]
    # sub-array of all the elements less than the pivot
    less = [i for i in array[1:] if i <= pivot]
    # sub-array of all the elements greater than the pivot
    greater = [i for i in array[1:] if i > pivot]
    return quicksort(less) + [pivot] + quicksort(greater)
```
