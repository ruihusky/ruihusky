---
title: "Promise实现原理（Promise/A+规范）"
date: 2020-11-27T20:00:00+08:00
draft: false
tags: ["JavaScript"]
categories: ["理论基础"]
---

## 前言

Promise 对象用于表示一个异步操作的最终完成（或失败），及其结果值。它最早由社区提出和实现，其中有多种 Promise 规范。ES6 按照 Promise/A+ 规范将其写进了语言标准。
关于该规范的详情可参考：[Promise/A+规范 中文翻译](https://www.ituring.com.cn/article/66566)。

## 基础实现

我们先尝试实现最简单的 Promise 功能：通过 Promise 包装异步请求，并使用`then`方法注册回调函数，通过`resolve`方法通知 Promise 异步请求已解决，并执行回调函数。
模拟一个基础的异步 http 请求，并使用 Promise 封装：

```javascript
// 模拟http请求
const mockAjax = (url, s, callback) => {
  console.log("[mockAjax] start");
  setTimeout(() => {
    console.log("[mockAjax] callback");
    callback("异步结果：" + url + "异步请求耗时" + s + "秒");
  }, 1000 * s);
};
// Promise基础功能
new Promise((resolve) => {
  mockAjax("getUserId", 1, function (result) {
    resolve(result);
  });
})
  .then((result) => {
    console.log("[then] onFulfilled:", result);
  })
  .then((result) => {
    console.log("[then] onFulfilled:", result);
  });
```

### 实现思路

- `then`用于注册回调函数，因此可以在 Promise 实例中维护一个回调函数队列。
- `then`要求可以进行链式调用，考虑在`then`方法中`return this`。
- Promise 的构造方法接受一个`[resolve => {}]`形式的函数，其中`resolve`方法接受异步请求的返回值并传递给`then`注册的回调函数。因此可以通过`resolve`方法调用回调函数队列中的函数。
- 这里的思路类似于观察者模式。

依照上述两点，我们可以做最简单的实现：

```javascript
class Promise {
  // 回调队列
  callbacks = [];
  // 构造函数传入需要执行的函数[形式为(resolve) => {}]
  constructor(fn) {
    fn(this._resolve.bind(this));
  }
  // then方法用于注册onFulfilled函数[形式为(value) => {}]
  then(onFulfilled) {
    // 将onFulfilled函数添加到callbacks中
    this.callbacks.push(onFulfilled);
    // 基础链式调用
    return this;
  }
  // resolve被调用时执行注册过的onFulfilled函数
  _resolve(value) {
    this.callbacks.forEach((fn) => fn(value));
  }
}
```

### 状态保存

在上面的实现中，存在这样的问题：
在`resolve`执行之后再通过`then`注册的回调函数不会执行。例如同步执行`resolve`，或者`resolve`之后再次调用`then`:

```javascript
// Promise
const p = new Promise((resolve) => {
  // 同步执行的resolve，比then先执行
  resolve(result);
  // 此处的回调不会执行
}).then((result) => {
  console.log("[then] onFulfilled:", result);
});

// 此处的回调不会执行
p.then((result) => {
  console.log("[then] onFulfilled:", result);
});
```

为了解决这个问题，我们需要在 Promise 中保存状态和值。规范中规定，Promise 的状态可以从`pending`转换为`fulfilled`或者`rejected`，分别代表“处理中”、“已解决”、“已失败”。状态转换的过程是不可逆的。修改上文的实现如下：

```javascript
// 带基础链式调用功能的简单实现
class Promise {
  // 回调队列
  callbacks = [];
  // Promise实例状态
  state = "pending";
  // Promise的值
  value = null;
  // 构造函数传入需要执行的函数[形式为(resolve) => {}]
  constructor(fn) {
    fn(this._resolve.bind(this));
  }
  // then方法用于注册onFulfilled函数[形式为(value) => {}]
  then(onFulfilled) {
    // 在Promise未解决之前，onFulfilled函数添加到callbacks中
    if (this.state === "pending") {
      this.callbacks.push(onFulfilled);
      // 在Promise解决之后，直接执行onFulfilled函数
    } else {
      onFulfilled(this.value);
    }
    // 基础链式调用
    return this;
  }
  // resolve被调用时执行注册过的onFulfilled函数
  _resolve(value) {
    // 改变状态
    this.state = "fulfilled";
    // 保存结果
    this.value = value;
    this.callbacks.forEach((fn) => fn(value));
  }
}
```

参考代码：[Promise：基础实现](https://github.com/ruihusky/ruihusky/blob/main/src/javascript/promise/promise-1.js)。

## 进阶：链式调用

考虑如下一种链式调用的情形：

```javascript
// 在链式调用中传递值
new Promise((resolve) => {
  mockAjax("getUserId", 1, function (result) {
    resolve(result);
  });
})
  .then((result) => {
    console.log("[then] onFulfilled:", result);
    return "第一个then的返回值";
  })
  .then((result) => {
    console.log("[then] onFulfilled:", result);
  });
```

注意到，第一个`then`方法最后返回了一个值，并且我们希望在第二个`then`方法中可以接收到。

### 链式 Promise

首先，第二个`then`方法中接受的值与最初 Promise 的值是不同的；其次，Promise 的状态改变是不可逆的，因此我们不能在`then`方法中重新修改 Promise 的值，这不符合规范。那么只剩下一种可能来实现`then`的链式调用：`then`方法最终返回的是一个新的 Promise 实例，并且该实例的值就是第一个`then`方法中`return`语句的返回值，比如上例中的字符串`"第一个 then 的返回值"`。

我们就依据上文的示例来理清一下思路：

- 第一个`then`方法注册的回调函数应该保存在第一个 Promise 实例之中（代称 p1），并且最终调用该回调函数的也应该是 p1 实例。
- 在 p1 实例调用回调函数时，需要获得回调函数的返回值，并且传递给下一个 Promise 实例(代称 p2)，也就是调用`p2.resolve(/*回调函数的返回值*/)`。
- `p2.then`以及之后的链式调用思路是递归的。

理解以上几点之后，我们尝试实现：

```javascript
// 链式Promise
class Promise {
  // 回调队列
  callbacks = [];
  // Promise实例状态
  state = "pending";
  // Promise的值
  value = null;
  // 构造函数传入需要执行的函数[形式为(resolve) => {}]
  constructor(fn) {
    fn(this._resolve.bind(this));
  }

  // _resolve方法用于改变Promise的状态为已解决，并执行回调队列[形式为(value) => {}]
  _resolve(value) {
    // 改变状态，保存值
    this.state = "fulfilled";
    this.value = value;
    // 依次执行回调队列
    this.callbacks.forEach((fn) => fn());
  }

  // then方法用于注册onFulfilled函数[形式为(value) => {}]
  then(onFulfilled) {
    // 返回了新的 Promise 实例，这样可实现真正的链式调用
    const nextPromise = new Promise((resolve) => {
      if (this.state === "pending") {
        this.callbacks.push(() => {
          this._execCb(onFulfilled, resolve);
        });
        return;
      }

      if (this.state === "fulfilled") {
        this._execCb(onFulfilled, resolve);
        return;
      }
    });

    return nextPromise;
  }

  _execCb(cb, resolve) {
    const x = cb(this.value);
    resolve(x);
  }
}
```

核心思路就是通过递归实现链式调用，可能不那么容易看懂，这里列出几个要点以帮助理解：

- `_execCb`方法负责执行回调函数，并且将回调函数的返回值通过`resolve(x)`传递给下一个 Promise。
- `then`方法中，先创建了新的 Promise，并且在其构造函数中，根据当前 Promise 的状态选择执行回调函数或者将该操作放入回调队列。
- `_resolve`方法负责改变 Promise 的状态为已解决，并按顺序执行回调队列。

仔细理解以上三点，再总结一下核心思路：前一个 Promise 执行`resolve`时，回调队列将被执行，并且回调队列中所执行函数的返回值通过下一个 Promise 的`resolve`传入。这就是通过链式 Promise 实现链式调用的基础。

### 当返回值为 Promise

考虑如下一个应用场景：

```javascript
// 在链式调用中传递Promise
new Promise((resolve) => {
  mockAjax("getUserId", 1, function (result) {
    resolve(result);
  });
})
  .then((result) => {
    console.log("[then] onFulfilled:", result);
    return new Promise((resolve) => {
      resolve("第一个then返回了一个Promise");
    });
  })
  .then((result) => {
    console.log("[then] onFulfilled:", result);
  });
```

当注册的回调函数返回了一个 Promise 时，我们希望之后注册的回调队列能等待该 Promise 改变状态再执行，这又如何实现呢？在理解上文的基础上，我们理清一下思路：

- 按照之前的逻辑，第一个`then`方法将生成一个 Promise(代称 p1)，并且回调函数将返回一个 Promise 实例(代称 p2)。
- 如果 p2 的状态依旧为`pending`，则需要等待其状态改变，再执行 p1 相应的状态改变方法。

其实这部分内容在 [Promise/A+规范：Promise 解决过程](https://www.ituring.com.cn/article/66566) 一节中有详细的处理逻辑，这里引用一部分内容：

> Promise 解决过程是一个抽象的操作，其需输入一个`promise`和一个值，我们表示为`[[Resolve]](promise, x)`，如果`x`有`then`方法且看上去像一个 Promise ，解决程序即尝试使`promise`接受`x`的状态；否则其用`x`的值来执行`promise`。

更多详细的说明大家可以点击链接查看。

在这里我们先简化问题，只考虑回调函数返回值为 Promise 这一种特殊情况，且不处理 rejected 状态。

首先明白一个概念：在获得回调函数的返回值后，根据该返回值处理下一个 Promise 的过程称之为 **Promise 解决过程**。在该过程中，**判断回调函数返回值为 Promise 时，调用该 Promise 的 then 方法，将此次解决过程注册为回调函数延迟执行**。这一段有点绕，我们参考代码理解：

```javascript
// Promise解决过程
function resolvePromise(promise, x, resolve) {
  if (x instanceof Promise) {
    const then = x.then;
    then.call(x, (y) => {
      resolvePromise(promise, y, resolve);
    });
    return;
  }
  resolve(x);
}

// 链式Promise
class Promise {
  // 回调队列
  callbacks = [];
  // Promise实例状态
  state = "pending";
  // Promise的值
  value = null;
  // 构造函数传入需要执行的函数[形式为(resolve) => {}]
  constructor(fn) {
    fn(this._resolve.bind(this));
  }

  // _resolve方法用于改变Promise的状态为已解决，并执行回调队列[形式为(value) => {}]
  _resolve(value) {
    // 改变状态，保存值
    this.state = "fulfilled";
    this.value = value;
    // 依次执行回调队列
    this.callbacks.forEach((fn) => fn());
  }

  // then方法用于注册onFulfilled函数[形式为(value) => {}]
  then(onFulfilled) {
    // 返回了新的 Promise 实例，这样可实现真正的链式调用
    const nextPromise = new Promise((resolve) => {
      if (this.state === "pending") {
        this.callbacks.push(() => {
          // 必须异步执行，否则无法获取nextPromise对象
          setTimeout(() => {
            this._execCb(onFulfilled, nextPromise, resolve);
          });
        });
        return;
      }

      if (this.state === "fulfilled") {
        // 必须异步执行，否则无法获取nextPromise对象
        setTimeout(() => {
          this._execCb(onFulfilled, nextPromise, resolve);
        });
        return;
      }
    });

    return nextPromise;
  }

  _execCb(cb, nextPromise, resolve) {
    const x = cb(this.value);
    resolvePromise(nextPromise, x, resolve);
  }
}
```

这部分内容可能不易理解，请大家多动手多思考。这一节的完整代码可参考：[Promise：链式调用实现](https://github.com/ruihusky/ruihusky/blob/main/src/javascript/promise/promise-2.js)。

## 完整实现

上文已经将 Promise 的核心逻辑实现。在理解了这部分的基础上，参照规范将其余部分进行实现应该不难了。
剩下的工作主要在于添加 **rejected** 状态处理，以及考虑一些边界条件(例如当`resolve`传递了`Promise`实例本身导致链式调用进入死循环)。
完整的实现代码可以参考：[Promise/A+完整实现](https://github.com/ruihusky/ruihusky/blob/main/src/javascript/promise/promise-aplus.js)。
