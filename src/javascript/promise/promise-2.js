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

// 模拟http请求
const mockAjax = (url, s, callback) => {
  console.log("[mockAjax] start");
  setTimeout(() => {
    console.log("[mockAjax] callback");
    callback("异步结果：" + url + "异步请求耗时" + s + "秒");
  }, 1000 * s);
};

// 在链式调用中传递值
new Promise((resolve) => {
  mockAjax("getUserId", 1, function (result) {
    resolve(result);
  });
})
  .then((result) => {
    console.log("[then] onFulfilled:", result);
    return "第一个then返回";
  })
  .then((result) => {
    console.log("[then] onFulfilled:", result);
    return new Promise((resolve) => {
      resolve("第二个then返回了一个Promise");
    });
  })
  .then((result) => {
    console.log("[then] onFulfilled:", result);
  });
