---
title: "JavaScript异步编程：回调函数与Promise"
date: 2020-11-16T20:00:00+08:00
draft: false
tags: ["JavaScript"]
categories: ["理论基础"]
---

## JavaScript 异步编程背景

JavaScript 是一门单线程语言。所谓单线程，就是同一时刻只能进行一个任务，所有任务排着队按照先后顺序进行。若某个任务耗时很长，进程就会出现卡死的状态。例如使用同步方式加载某个页面，有一个资源需要加载很长时间，那这段时间用户无法对页面做任何操作。因此对于 JavaScript 来说，异步编程异常重要。

## Javascript 异步编程方法

按照时间先后顺序，Javascript 的异步编程方案有这些：

ES6 以前：回调函数、Promise 对象
ES6：Generator 函数
ES7：async 函数

## 回调函数

举一个通俗易懂的例子来说明什么是回调函数：

某个顾客到书店买书，但是书店缺货，于是他向店员留下了电话号码。过了几天后，书店进了货，店员打了这个电话通知顾客货到了。于是顾客来到书店取了货。

在这个例子中，“顾客买书”可以看作一个任务。但是这个任务不能在最开始执行，必须在“书店有货”这个条件成立时才能执行。于是顾客在书店留下电话号码，也就是**向店员登记回调函数**。对于书店来说，他在“书店到货”这个事件发生时，就可以通过电话号码“调用”“顾客买书”的任务，这里是**调用回调函数**。顾客去书店买了书，**这里是“响应回调事件”**。

那么，回调函数和异步有什么关系呢？在上面的例子中，顾客告知店员电话号码之后，就可以离开书店做其他事情，不必一直在书店等到书到货。这里就是异步思想的体现。

在 JS 中，最简单的例子就是定时任务 - `setTimeout()`

```javascript
function test() {
  setTimeout(function () {
    console.log("from setTimeout");
  }, 500);
  console.log("from test");
}

test();
// 结果：
// from test
// from setTimeout
```

可以看到，在 `test()` 中，`setTimeout()` 之后的代码立刻执行了，没有等待 500ms 之后再执行。

现在假设这样一个业务场景：需要有序读取多个文件并输出。这是嵌套回调的常见模式，看下面的例子：

```javascript
// 嵌套回调，读一个文件后输出，再读另一个文件。读取第二个文件的代码需要写在第一个回调函数之中
var fs = require("fs");

fs.readFile("./text1.txt", "utf8", function (err, data) {
  console.log("text1 file content: " + data);
  fs.readFile("./text2.txt", "utf8", function (err, data) {
    console.log("text2 file content: " + data);
  });
});
```

这里是一个两层嵌套回调，看起来没有什么问题。但是假如嵌套数量多起来，代码就不怎么美观了：

```javascript
// 回调地狱(callback hell)
doSomethingAsync1(function () {
  doSomethingAsync2(function () {
    doSomethingAsync3(function () {
      doSomethingAsync4(function () {
        doSomethingAsync5(function () {
          // code...
        });
      });
    });
  });
});
```

这样的代码从逻辑上说没有什么问题，但是随着业务逻辑的增加和趋于复杂，后期维护、更改的时候简直是地狱一般，这就是“回调地狱(callback hell)”。

回调函数的另外一个问题是回调函数之外无法捕获到回调函数中的异常，先看一个例子：

```javascript
var fs = require("fs");

try {
  // 尝试读取一个不存在的文件
  fs.readFile("not_exist_file", "utf8", function (err, data) {
    console.log(data);
    // 输出undefined
  });
} catch (e) {
  console.log("error caught: " + e);
  // 未捕获错误，无输出
}
```

原因在于，`try/catch` 语句只能捕获当次事件循环的异常，而异步调用一般以传入 callback 的方式来指定异步操作完成后要执行的动作。而异步调用本体和 callback 属于不同的事件循环。

## Promise 对象

Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。它由社区最早提出和实现，ES6 将其写进了语言标准，统一了用法，原生提供了 Promise 对象。

所谓 Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

### Promise 基本用法

```javascript
// ES6原生Promise示例 - 生成Promise对象
var promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
```

Promise 构造函数接受一个函数作为参数，该函数的两个参数分别是 resolve 和 reject。它们是两个函数，由 JavaScript 引擎提供，不用自己部署。

`resolve` 函数的作用是，将 Promise 对象的状态从“未完成”变为“成功”，在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；`reject` 函数的作用是，将 Promise 对象的状态从“未完成”变为“失败”（，在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

Promise 实例生成以后，可以用 `then` 方法分别指定 Resolved 状态和 Rejected 状态的回调函数。

```javascript
// ES6原生Promise示例 - 指定Promise回调函数
promise.then(
  function (value) {
    // success
  },
  function (error) {
    // failure
  }
);
```

`then` 方法可以接受两个回调函数作为参数。第一个回调函数是 Promise 对象的状态变为 Resolved 时调用，第二个回调函数是 Promise 对象的状态变为 Rejected 时调用。其中，第二个函数是可选的，不一定要提供。这两个函数都接受 Promise 对象传出的值作为参数。

`then` 方法是定义在原型对象 `Promise.prototype` 上的，它返回的是一个新的 Promise 实例（注意，不是原来那个 Promise 实例）。因此可以采用链式写法，即 `then` 方法后面再调用另一个 `then` 方法。

```javascript
// 原生Primose顺序嵌套回调示例
var fs = require("fs");

var read = function (filename) {
  var promise = new Promise(function (resolve, reject) {
    fs.readFile(filename, "utf8", function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
  return promise;
};

read("./text1.txt")
  .then(function (data) {
    console.log(data);
    return read("./text2.txt");
  })
  .then(function (data) {
    console.log(data);
  });
```

上面的代码中，第一个 `then` 方法输出 text1.txt 的内容后返回 `read('./text2.txt')` ，注意这里很关键，**这里实际上返回了一个新的 Promise 实例，第二个 `then` 方法的回调函数需要等待 `read('./text2.txt')` 所返回的 Promise 对象状态改变才会被调用**。

### Promise 异常处理

`Promise.prototype.catch` 方法是 `.then(null, rejection)` 的别名，用于指定发生错误时的回调函数。

```javascript
var fs = require("fs");

var read = function (filename) {
  var promise = new Promise(function (resolve, reject) {
    fs.readFile(filename, "utf8", function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
  return promise;
};

read("./text1.txt")
  .then(function (data) {
    console.log(data);
    return read("not_exist_file");
  })
  .then(function (data) {
    console.log(data);
  })
  // 捕获read('not_exist_file')中发生的异常
  .catch(function (err) {
    console.log("error caught: " + err);
    //假如在catch中抛出异常，不会被捕获，也不会传递到外层
    x + 1;
  })
  // 捕获上一个catch中抛出的异常
  .catch(function (err) {
    console.log("error caught: " + err);
  })
  .then(function (data) {
    console.log("completed");
  });
```

使用 Promise 对象的 `catch` 方法可以捕获异步调用链中 callback 的异常，该方法返回的也是一个 Promise 对象，因此，在 `catch` 方法后还可以继续写异步调用方法。这是一个非常强大的能力。

### Promise 异步并发

如果几个异步调用有关联，但它们不是顺序式的，是可以同时进行的，我们很直观地会希望它们能够并发执行。

`Promise.all` 方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。其中的每个 Promise 对象的操作可以同时进行。

```javascript
var p = Promise.all([p1, p2, p3]);
```

`p`的状态由`p1`、`p2`、`p3`决定，分成两种情况。

（1）只有`p1`、`p2`、`p3`的状态都变成 fulfilled，`p`的状态才会变成 fulfilled，此时`p1`、`p2`、`p3`的返回值组成一个数组，传递给`p`的回调函数。

（2）只要`p1`、`p2`、`p3`之中有一个被 rejected，`p`的状态就变成 rejected，此时第一个被 reject 的实例的返回值，会传递给 p 的回调函数。

```javascript
var fs = require("fs");

var read = function (filename) {
  var promise = new Promise(function (resolve, reject) {
    fs.readFile(filename, "utf8", function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
  return promise;
};

var promises = [1, 2].map(function (fileno) {
  return read("./text" + fileno + ".txt");
});

Promise.all(promises)
  .then(function (contents) {
    console.log(contents);
    // 结果：
    // [ text1Content, text2Content ]
  })
  .catch(function (err) {
    console.log("error caught: " + err);
  });
```

上述代码会并发执行读取 text1.txt 和 text2.txt 的操作，当两个文件都读取完毕时，输出它们的内容，`contents` 是一个数组，对应 `promises` 数组中各实例的返回结果，在这里就是 text1.txt 和 text2.txt 的内容。

`Promise.race` 方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。

```javascript
var p = Promise.race([p1, p2, p3]);
```

对于`p`，只要`p1`、`p2`、`p3`之中有一个实例率先改变状态，`p`的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给`p`的回调函数。这里就不写例子了，可以参考上文自行思索。

## 总结

Promise 在形式上避免了回调的嵌套写法，代码可读性更好，异常处理也比较方便，但是本质上依然是把异步串接起来。

相对来说，ES6 出现的 Generator 函数是一种“类协程”的实现，功能相比 Promise 更加强大，理解起来也困难一点。具体的介绍在后续文章中给出。
