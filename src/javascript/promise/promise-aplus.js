// 完全实现 Promise/A+规范 https://www.ituring.com.cn/article/66566
// 执行 npx promises-aplus-tests ES6/Promise/promise-aplus.js 以进行测试

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function isFn(fn) {
  return typeof fn === "function";
}

/**
 * Promise解决过程
 */
function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    reject(new TypeError("Invalid value, may cause infinite loop."));
    return;
  }
  if (x && (typeof x === "object" || typeof x === "function")) {
    let used;
    try {
      const then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (used) return;
            used = true;
            resolvePromise(promise, y, resolve, reject);
          },
          (r) => {
            if (used) return;
            used = true;
            reject(r);
          }
        );
        return;
      }
      if (used) return;
      used = true;
      resolve(x);
    } catch (error) {
      if (used) return;
      used = true;
      reject(error);
    }
    return;
  }
  resolve(x);
}

class Promise {
  state = PENDING;
  value = null;
  _fulfilledCbs = [];
  _rejectedCbs = [];

  constructor(executor) {
    try {
      executor(this._resolve.bind(this), this._reject.bind(this));
    } catch (error) {
      // console.log('executor error')
      this._reject.call(this, error);
    }
  }

  _resolve(value) {
    if (this.state === PENDING) {
      this.state = FULFILLED;
      this.value = value;
      this._fulfilledCbs.forEach((fn) => fn());
    }
  }

  _reject(reason) {
    if (this.state === PENDING) {
      this.state = REJECTED;
      this.value = reason;
      this._rejectedCbs.forEach((fn) => fn());
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = isFn(onFulfilled) ? onFulfilled : (v) => v;
    onRejected = isFn(onRejected)
      ? onRejected
      : (r) => {
          throw r;
        };
    const nextPromise = new Promise((resolve, reject) => {
      if (this.state === PENDING) {
        this._fulfilledCbs.push(() => {
          setTimeout(() => {
            this._execCb(onFulfilled, nextPromise, resolve, reject);
          });
        });

        this._rejectedCbs.push(() => {
          setTimeout(() => {
            this._execCb(onRejected, nextPromise, resolve, reject);
          });
        });
        return;
      }

      if (this.state === FULFILLED) {
        setTimeout(() => {
          this._execCb(onFulfilled, nextPromise, resolve, reject);
        });
        return;
      }

      if (this.state === REJECTED) {
        setTimeout(() => {
          this._execCb(onRejected, nextPromise, resolve, reject);
        });
        return;
      }
    });

    return nextPromise;
  }

  _execCb(cb, nextPromise, resolve, reject) {
    try {
      const x = cb(this.value);
      resolvePromise(nextPromise, x, resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
}

// promises-aplus-tests 测试用接口
Promise.deferred = function () {
  const dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

module.exports = Promise;
