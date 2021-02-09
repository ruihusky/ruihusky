---
title: "JavaScript异步编程：Generator函数与Async函数"
date: 2020-11-18T20:00:00+08:00
draft: false
tags: ["JavaScript"]
categories: ["理论基础"]
---

## Generator 函数基本概念

### 关于协程

首先我们要讨论的是 Generator 函数和普通函数在运行方式上有什么区别。

### 运行-完成

对于一个普通函数而言，一旦函数开始运行，除非运行完毕，否则其余的 JS 代码无法运行。这句话应该如何理解？看一个例子：

```javascript
setTimeout(function () {
  console.log("Hello World");
}, 1);

function foo() {
  // 提示: 最好不要尝试这样的迭代
  for (var i = 0; i <= 1e10; i++) {
    console.log(i);
  }
}

foo();
// 0..1E10
// "Hello World"
```

在这个例子中，`foo()` 函数的运行时间超过了 1ms，但是 Hello World 出现在了最后面。所以，在 `foo()` 函数运行过程中，上面的 `setTimeout()` 函数不会被运行，直到 `foo()` 函数运行结束。

### 运行-停止-运行

**Generator 函数允许在运行的过程中暂停一次或多次，随后再恢复运行。暂停的过程中允许其它的代码执行**。

这里引申到 **协程（coroutine）** 的概念。可以这么理解：一个进程（这里可以将它理解为一个 function）本身可以选择何时被中断以便与其它代码进行协作。

在 ES6 中，Generator 函数使用协程来进行并发操作。在 Generator 函数体内，通过使用新的 `yield` 关键字从内部将函数的运行打断。除了 Generator 函数内部的 `yield` 关键字，你不可能从任何地方（包括函数外部）中断函数的运行。

一旦 Generator 函数被中断，它不可能自行恢复运行，除非通过外部的控制来重新该函数。稍后会介绍如何做到这一点。

更重要的一点是，**Generator 函数的执行，允许信息的双向传递**。普通函数在开始的时候获取参数，在结束的时候返回一个值，而 Generator 函数可以在每次 `yield` 的时候返回值，并且在下一次重新启动的时候再传入值。这样就能完美实现各线程之间的通信。

### Generator 函数基本语法

看一个简单例子：

```javascript
function* helloWorldGenerator() {
  yield "hello";
  yield "world";
  return "ending";
}

var hw = helloWorldGenerator();
```

与普通函数相比，例子中多了一个 `*` 来进行标示，表示这是一个 Generator 函数。另外，函数体内有关键字 `yield` ，称作 yield 表达式。

那么，yield 表达式的作用是什么？有两点：

1. 每次函数中断时将 yield 表达式的结果输出。
2. 重新启动函数时，传入的值会作为 yield 表达式计算的结果。

举例说明：

```javascript
function* foo() {
  var x = 1 + (yield "foo");
  console.log(x);
}
```

在 `foo()` 函数暂停时，`yield "foo"` 表达式会返回字符串"foo"，下一次 `foo()` 函数重新启动时，传入的值会代替 `yield "foo"` ，结果就是将 **1 + 传入值** 的结果赋值给 `x`。

### Generator 函数运行控制

### Generator 遍历器对象

执行 Generator 函数会返回一个遍历器对象，该遍历器对象可以依次遍历 Generator 函数内部的每一个状态。这听起来好像有点复杂，考虑下面这个简单的例子：

```javascript
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}
// 返回了遍历器对象
var it = foo();
// 第一次通过next()调用，返回第一个yield的值
var message = it.next();
console.log(message); // { value:1, done:false }
// 事实上每次调用next()方法都会返回一个object对象，其中的value属性就是yield表达式返回的值。
// 属性done是一个boolean类型，用来表示对Generator函数的遍历是否已经结束。
console.log(it.next()); // { value:2, done:false }
console.log(it.next()); // { value:3, done:false }
console.log(it.next()); // { value:4, done:false }
console.log(it.next()); // { value:5, done:false }
// 这里注意到，执行到yield 5时，done属性依然是false。
// 这是因为从技术上来说，Generator函数还没有执行完。
// 我们必须再调用一次next()方法，然后Generator函数才算执行完毕。
// 注意到最后一次的value是return语句的返回值。
console.log(it.next()); // { value:6, done:true }
```

仔细看完上面的例子，相信已经可以理解 Generator 函数运行控制的基本概念了。这里还没有涉及到值的传入，给一个稍微复杂的例子：

```javascript
function* foo(x) {
  var y = 2 * (yield x + 1);
  var z = yield y / 3;
  return x + y + z;
}

var it = foo(5);

// 注意这里在调用next()方法时没有传入任何值
console.log(it.next()); // { value:6, done:false }
console.log(it.next(12)); // { value:8, done:false }
console.log(it.next(13)); // { value:42, done:true }
```

这里解释一下上面的例子中发生了什么：

1. 构造 Generator 函数遍历器的时候，通过语句 foo(5)，我们将参数 x 的值设置为 5。
2. 第一次调用 next()方法时，没有传入任何值。因为此时没有 yield 表达式来接收我们传入的值。如果在第一次调用 next()方法时传入一个值，也不会有任何影响，该值会被抛弃掉。按照 ES6 标准的规定，此时 Generator 函数会直接忽略掉该值。
3. 表达式 `yield(x + 1)` 的返回值是 6，然后第二个 `next(12)` 将 12 作为参数传入，用来代替表达式 `yield(x + 1)` ，因此变量 y 的值就是 12 \* 2 = 24。随后的 `yield(y / 3)`（即 `yield(24 / 3)` ）返回值 8。然后第三个 `next(13)` 将 13 作为参数传入，用来代替表达式 `yield(y / 3)` ，所以变量 z 的值是 13。
4. 最后，语句 `return (x + y + z)` 即 `return (5 + 24 + 13)` ，所以最终的返回值是 42。

### for...of 循环

ES6 从语法层面上对遍历器提供了直接的支持，即 for...of 循环。因此 Generator 函数遍历器也可以使用下面的方式进行循环控制：

```javascript
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

for (var v of foo()) {
  console.log(v);
}
// 1 2 3 4 5

console.log(v); // 仍然是5，而不是6
```

注意到，for...of 循环忽略并抛弃了返回值 6，这是因为此处没有对应的 `next()` 方法被调用，另外，for...of 循环不支持将值传递到 Generator 函数内。

### Generator 函数错误处理

ES6 Generators 函数内部的代码是同步的，即使在 Generator 函数外部控制是异步进行的。也就是说，你可以使用任何你所熟悉的错误处理机制来简单地在 Generator 函数中处理错误，例如使用 `try/catch` 机制。
来看一个例子：

```javascript
function* foo() {
  try {
    var x = yield 3;
    console.log("x: " + x);
  } catch (err) {
    console.log("Error: " + err);
  }
}

var it = foo();

var res = it.next(); // { value:3, done:false }

// 这里我们不调用next()方法，而直接抛出一个异常：
it.throw("Oops!"); // Error: Oops!
```

这里我们使用了另一个方法 `throw()`，它会在 Generator 函数暂停的位置抛出一个错误，然后函数内部的 `try/catch` 语句捕获了这个错误。

如果函数内部没有 `try/catch` 语句，会发生什么？错误因为没有被任何代码捕获，会被当作一个未处理的异常向上抛出。

```javascript
function* foo() {}

var it = foo();
try {
  it.throw("Oops!");
} catch (err) {
  console.log("Error: " + err); // Error: Oops!
}
```

很显然，如果在 Generator 函数内部发生的错误没有被捕获，也会被向上抛出。

```javascript
function* foo() {
  var x = yield 3;
  var y = x.toUpperCase(); // 可能会引发类型错误！
  yield y;
}

var it = foo();

it.next(); // { value:3, done:false }

try {
  it.next(42); // 42没有toUpperCase()方法
} catch (err) {
  console.log(err); // toUpperCase()引发TypeError错误
}
```

### Generator 函数委托

在一个 Generator 函数体内，可以调用另一个 Generator 函数，实际上是将当前 Generator 函数的迭代控制 **委托** 给另一个 Generator 函数。我们通过关键字 `yield *` 来实现。看下面的代码：

```javascript
function* foo() {
  yield 3;
  yield 4;
}

function* bar() {
  yield 1;
  yield 2;
  yield* foo(); // `yield *` 将当前函数的迭代控制委托给另一个Generator函数foo()
  yield 5;
}

for (var v of bar()) {
  console.log(v);
}
// 1 2 3 4 5
```

在关键字 `yield *` 的位置，程序将迭代控制委托给另一个 Generator 函数 `foo()`，随后 `for...of` 循环将通过 `next()` 方法遍历 `foo()`。当对 `foo()` 的遍历结束后，委托控制又重新回到之前的 Generator 函数。

不使用 `for...of` 循环，通过 `next()` 方法控制并传入相应的值来进行遍历，这些传入的值也会通过 `yield *` 关键字传递给对应的 yield 表达式中。另外，`yield *` 表达式可以接收被委托的 Generator 函数的返回值。

```javascript
function* foo() {
  var z = yield 3;
  var w = yield 4;
  console.log("z: " + z + ", w: " + w);
  return "foo";
}

function* bar() {
  var x = yield 1;
  var y = yield 2;
  var f = yield* foo(); // `yield*` 将控制权委托给 `foo()`，并且接受了字符串`foo`
  console.log("f: " + f);
  var v = yield 5;
  console.log("x: " + x + ", y: " + y + ", v: " + v);
}

var it = bar();

it.next(); // { value:1, done:false }
it.next("X"); // { value:2, done:false }
it.next("Y"); // { value:3, done:false }
it.next("Z"); // { value:4, done:false }
it.next("W"); // { value:5, done:false },f="foo"
// z: Z, w: W
// f: foo
it.next("V"); // { value:undefined, done:true }
// x: X, y: Y, v: V
```

对于`yield *` 表达式中的错误传递，道理也很简单：在被委托函数内的错误如果未被捕获，就会抛出到委托函数中。若在委托函数中仍未被处理，就会继续向上抛出。

```javascript
function* foo() {
  try {
    yield 2;
  } catch (err) {
    console.log("foo caught: " + err);
  }

  yield; // 暂停

  // 抛出一个错误
  throw "Oops!";
}

function* bar() {
  yield 1;
  try {
    yield* foo();
  } catch (err) {
    console.log("bar caught: " + err);
  }
}

var it = bar();

it.next(); // { value:1, done:false }
it.next(); // { value:2, done:false }

it.throw("Uh oh!"); // 将会被foo()中的try..catch捕获
// foo caught: Uh oh!

it.next(); // { value:undefined, done:true } --> 注意这里不会出现错误！
// bar caught: Oops!
```

## Generator 函数的异步应用

前文所述所有对 Generator 函数的控制都是同步执行的，现在来看看如何利用 Generator 函数开发异步应用。

### Generator 与 Promise 的结合

从这里开始理解起来会稍有困难，我的建议是自己动手去运行一下这些实例，有助于加快理解。最新的 [Node.js](http://nodejs.cn/) 环境已经支持所有示例。

设想一下：yield 表达式返回了一个 Promise 对象。之后我们可以做些什么动作？我们可以通过 Promise 对象的状态（resolved/rejected）来对 Generator 函数的流程进行控制。

先从一个简单一点的例子说起：

```javascript
function request(num) {
  // 注意：返回的是一个Promise对象
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      num += 1;
      // 返回新num值
      console.log("Promise resolved.");
      resolve(num);
    }, 1000);
  });
}

function* main() {
  var ret1 = yield request(0);
  var ret2 = yield request(ret1);
  console.log("Number: " + ret2);
}

var it = main();

var step1 = it.next();
console.log(step1);
step1.value.then(function (num) {
  step2 = it.next(num);
  console.log(step2);
  step2.value.then(function (num2) {
    it.next(num2);
  });
});

// 结果：
// { value: Promise { <pending> }, done: false }
// Promise resolved.
// { value: Promise { <pending> }, done: false }
// Promise resolved.
// Number: 2
```

这个例子还比较好理解：每次调用 `it.next()` 都会 **立即** 返回一个 Promise 对象，但是该对象内部的状态为 `pending` ，因此之后调用该 Promise 对象的 `then()` 方法等待对象状态改变。这里有一点很关键，在 Promise 对象中， `resolve()` 方法传出的值，会被 `then()` 方法参数中的函数接受，随后再传入到 `it.next()` 中。

但是仔细看看，控制 Generator 函数的流程依旧是层层嵌套的，有没有办法解决这个问题？上例中，嵌套控制的部分每一层的结构基本是一致的，因此我们可以用递归函数实现它：

```javascript
// Generator函数自动执行器
function runGenerator(generator) {
  // 取得Generator遍历器
  var it = generator();
  var retVal;
  // 异步迭代该遍历器
  (function iterate(val) {
    retVal = it.next(val);
    console.log(retVal);
    // 当迭代未完成，就继续执行
    if (!retVal.done) {
      if ("then" in retVal.value) {
        // 等待Promise对象状态改变，随后递归调用自身，重新迭代。同时Promise传出的值传入到函数iterate中
        retVal.value.then(iterate);
      } else {
        // 非Promise对象，立即执行下一步迭代
        // 避免同步递归调用
        setTimeout(function () {
          iterate(retVal.value);
        }, 0);
      }
    }
  })();
}

runGenerator(main);

// 结果：
// { value: Promise { <pending> }, done: false }
// Promise resolved.
// { value: Promise { <pending> }, done: false }
// Promise resolved.
// Number: 2
// { value: undefined, done: true }
```

`runGenerator()` 函数传入一个 Generator 函数作为参数并取得它的遍历器，随后在 `iterate()` 函数中进行迭代。如果 yield 表达式返回了一个 Promise 对象，就等待其执行完毕再递归迭代，否则立即执行下一步迭代。注意到在 `else` 语句中使用了一个 `setTimeout()` 语句，在这里我们不能立即执行 `it.next()` 函数，否则会报错。因为当前线程仍在 Generator 函数中（yield 表达式没有计算完毕），Generator 函数不在暂停状态。而 `setTimeout()` 语句会在该线程执行完毕后立即执行。

当然，在 yield 表达式中，完全可以不用返回 Promise 对象，而是自行编写异步代码，但是使用 Promise 来管理 Generator 函数中异步调用部分的代码，有许许多多的优势：

- Promise 拥有内置的错误处理机制。在上面的例子中没有展现出来，这并不难做到：Promise 监听到错误后状态变为 rejected，随后可以在 `runGenerator()` 函数中使用 `try/catch` 处理，或者使用 `it.throw()` 将错误抛出。
- 我们通过 Promise 强大的 API 来控制所有的流程。
- 可以利用 Promise 处理各种复杂的“并行”任务。例如，使用 `yield Promise.all([...])` 或者 `yield Promise.race([...])` 接收一个“并行”任务的 Promise，随后就可以根据该 Promise 进行流程控制。

我们把上面的例子稍作改动，看看 `yield Promise.all([...])` 如何使用：

```javascript
function request(num) {
  // 注意：返回的是一个Promise对象
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      num += 1;
      // 返回新num值
      console.log("Promise resolved, num = " + num);
      resolve(num);
    }, 1000 + num);
  });
}

function* main() {
  var ret1 = yield Promise.all([request(100), request(300), request(200)]);
  var ret2 = yield request(ret1[0] + ret1[1] + ret1[2]);
  console.log("Number: " + ret2);
}
// Generator函数自动执行器
function runGenerator(generator) {
  // ...code
  // 与上文一致
}

runGenerator(main);
// 结果：
// { value: Promise { <pending> }, done: false }
// Promise resolved, num = 101
// Promise resolved, num = 201
// Promise resolved, num = 301
// { value: Promise { <pending> }, done: false }
// Promise resolved, num = 604
// Number: 604
// { value: undefined, done: true }
```

注意以下两点：

1. 第一个 yield 表达式传入了 `Promise.all(...])` ，立即返回一个新的 Promise 对象，该对象的状态根据传入的三个 Promise 对象决定，不懂的话可以参考我的上一篇博客。
2. 我把 `request()` 方法中的 `setTimeout()` 时间参数改为 `1000 + num` ，这样可以从结果清晰的看出三个 Promise 对象中的异步任务是并发执行的。

## async 函数

使用 Generator 函数进行异步开发时，需要有一个 Generator 函数自动执行器来实现上面介绍的 Generator+Promise 模式。目前网上有许多开源库提供了这样的工具，例如 [co 模块](https://github.com/tj/co) 。

ES2017 标准引入了 async 函数，其中最重要的一点是 **async 函数内置 Generator 函数自动执行器**。也就是说，它可以自动地执行 Promise（或者异步函数）并在它们执行完后恢复运行。

### async 函数基本用法

我们将上文的例子改成使用 async 函数来实现：

```javascript
function request(num) {
  // 注意：返回的是一个Promise对象
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      num += 1;
      // 返回新num值
      console.log("Promise resolved, num = " + num);
      resolve(num);
    }, 1000 + num);
  });
}

async function main() {
  var ret1 = await Promise.all([request(100), request(300), request(200)]);
  var ret2 = await request(ret1[0] + ret1[1] + ret1[2]);
  console.log("Number: " + ret2);
}

main();
// 结果：
// Promise resolved, num = 101
// Promise resolved, num = 201
// Promise resolved, num = 301
// Promise resolved, num = 604
// Number: 604
```

从语法上看，async 函数与 Generator 函数的区别只有两点：

1. `*` 标识符换成了 `async` 关键字，表示这是一个 async 函数。
2. `yield` 关键字换成了 `await` 关键字，它会告诉 async 函数需要在这里等待 Promise 完成之后继续运行。

其实，async 函数完全可以看作多个异步操作所包装成的一个 Promise 对象，而 `await` 命令就是内部 `then` 命令的语法糖。

## 总结

Generator 函数与 Promise 对象结合起来的模式功能已经足够强大，可以利用它们自如的控制同步、异步流程。并且现在许多开源库提供了 Generator 函数自动执行器，其中还包含了错误处理机制，我们可以很方便的进行运用。

async 函数已经在 ES2017 标准中加入，未来将会成为（也许现在已经是）JavaScript 异步控制的主流方案。
