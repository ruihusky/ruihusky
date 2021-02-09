// 带基础链式调用功能的简单Promise实现
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

// 示例
const p = new Promise((resolve) => {
  resolve(result);
}).then((result) => {
  console.log("[then] onFulfilled:", result);
});

p.then((result) => {
  console.log("[then] onFulfilled:", result);
});
