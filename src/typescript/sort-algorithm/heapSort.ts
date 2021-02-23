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

console.log(heapSort([3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48]));
// [ 2,  3,  4,  5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50 ]
