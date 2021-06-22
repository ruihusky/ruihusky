---
title: "React Hooks 原理简析"
date: 2021-06-20T20:00:00+08:00
draft: false
tags: ["框架原理"]
categories: ["理论基础"]
---

## 说明

本文的原理简析基于 React 17.0.2 和 Legacy Mode ，不涉及 Concurrent Mode 。

## 函数组件与类组件

想要理解 Hooks，需要先理解函数组件与类组件之间的区别。

先看概括 React 设计理念的公式：

```javascript
UI = render(data)
```

React 根据状态渲染视图，且一个状态对应一个渲染结果。也就是说，数据是和渲染结果绑定的。

### 类组件与可变的 this

在 React 中，推荐使用不可变数据 (immutable data) 描述状态。需要更新状态时，应使用一份新的数据，而不是对原来的数据进行修改。

不过就算使用不可变数据，类组件中还是会有`this`的问题。先看一个类组件示例：

```jsx
/**
  假设这里是某个用户的个人信息页
  点击 Follow 将会关注该用户，关注成功后需要弹出消息，提示关注成功
  通过 setTimeout 模拟了一个响应较慢的接口
*/
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };
  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };
  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

如果在点击 Follow 后，在 setTimeout 回调触发之前，传入组件的 props.user 改变了，那么 showMessage 将会提示你关注了改变后的 props.user 。

![类组件 Follow 演示](/ruihusky/assets/img/2021-06-20_react-hooks/class-component-follow.gif)

可以点击 [这个示例](https://codesandbox.io/s/pjqnl16lm7) 自己动手操作，点击页面上的 Follow(class) ，并在三秒之内通过上方的 select 切换 user 。

按照数据应和渲染结果绑定的设计理念，alert 的表现也是渲染结果的一部分，应与点击按钮那一刻的状态绑定。

问题在于，在类组件中是通过 this 访问 props 的，而 this 是可变的。具体到这个例子，点击按钮时的 this.props 和三秒之后的 this.props 是不一样的。

### 函数组件与数据捕获

将上文的类组件改为函数组件：

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };
  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };
  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

然后以同样的方式操作，会发现函数组件的表现与类组件不同：

![函数组件 Follow 演示](/ruihusky/assets/img/2021-06-20_react-hooks/function-component-follow.gif)

可以点击 [这个示例](https://codesandbox.io/s/pjqnl16lm7) 自己动手操作，点击页面上的 Follow(function) ，并在三秒之内通过上方的 select 切换 user 。

在函数组件的 showMessage 函数中，被访问的 props 在函数执行的时刻就被“捕获”了，只要确保 props 是不可变的，在 setTimeout 中访问到的 props.user 就是点击按钮那一刻的值。

### 生命周期函数与副作用

在类组件中，副作用通常是在 componentDidMount 或 componentDidUpdate 生命周期函数中执行的。

> 函数副作用指当调用函数时，除了返回函数值之外，还对主调用函数产生附加的影响。例如修改全局变量（函数外的变量），修改参数或改变外部存储。

假设有一个聊天室页面，该页面需要根据不同的聊天室ID与后端建立对应的 websocket 连接。在类组件中，我们可以在 componentDidMount 和 componentDidUpdate 中根据当前的 ID 执行建立、销毁 websocket 连接的操作。但我们需要在两个生命周期函数中写这段逻辑。如果还有其它的副作用需要执行，我们就需要在这两个生命周期函数中重复多个逻辑。

在函数组件中，函数的主要任务就是通过数据渲染出视图，相应的副作用则可以通过 useEffect Hook 执行，代码不再需要分散到各个生命周期函数中，逻辑清晰。

## useState

我们先通过 useState 这个最常用的 Hook 来了解 Hook 的实现原理。

先看一下 React 给出的 Hook 的使用原则：

> 1. 只在最顶层使用 Hook ，不要在循环、条件或嵌套函数中调用 Hook
> 
> 2. 只在 React 函数中调用 Hook ，即只在 React 函数组件和自定义 Hook 中调用 React Hook

React 也给出了[说明](https://zh-hans.reactjs.org/docs/hooks-rules.html#explanation)：React 要求每次渲染时 Hook 的调用顺序保持一致，这样 React 就能正确地将内部 state 和对应的 Hook 进行关联。

背后的原因是：Hook 是通过链表实现的。在一个函数组件中多次调用 useState 将会创建一个**单向环状链表**。

先看一个示例：（[Code Sandbox: React Conditionally Hook](https://codesandbox.io/s/react-conditionally-hook-ik8s4)）

```jsx
import { useState } from "react";

let isMounted = false;

// 组件初次渲染时，两个 useState 都会执行。
// 点击按钮触发更新渲染时，只会执行第二个 useState
export default function App() {
  let valueA, setValueA, valueB, setValueB;

  console.log("isMounted ?", isMounted);
  if (!isMounted) {
    [valueA, setValueA] = useState("initial value a");
    console.log("valueA =", valueA);
    isMounted = true;
  }

  [valueB, setValueB] = useState("initial value b");
  console.log("valueB =", valueB);

  return (
    <div className="App">
      <h1>React conditionally hook example</h1>
      <div>A: {valueA}</div>
      <div>B: {valueB}</div>
      <button
        onClick={() => {
          setValueA("changed value a");
          setValueB("changed value b");
        }}
      >
        Click to change values
      </button>
      <div>Click the button and view the console output</div>
    </div>
  );
}
```

挂载该组件，页面将正常显示。点击按钮改变 valueB 的值，React 将会报错，我们查看控制台的输出信息：

```text
isMounted ? false
valueA = initial value a
valueB = initial value b
isMounted ? true
valueB = changed value a
```

注意第二次渲染时控制台的输出：`valueB = changed value a`，明明调用的是`[valueB, setValueB] = useState("initial value b")`，为什么`valueB`的值变成了`changed value a`？

带着疑问我们看看源码中 React 做了哪些事情。

### mount 阶段

在函数组件初次渲染时，调用 useState 实际上最终是调用了 [mountState](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberHooks.old.js#L1113) 函数：

```javascript
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  // 创建新的 hook 对象
  const hook = mountWorkInProgressHook();
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  // 设置 hook 的初始值
  hook.memoizedState = hook.baseState = initialState;
  // 创建 hook 队列
  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  });
  // 创建 dispatch
  const dispatch: Dispatch<
    BasicStateAction<S>,
  > = (queue.dispatch = (dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue,
  ): any));
  return [hook.memoizedState, dispatch];
}
```

mountState 函数通过 mountWorkInProgressHook 函数创建了新的 hook 对象，然后为 hook 赋予初始值、创建 dispatch 函数，最后返回。

再看看 [mountWorkInProgressHook](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberHooks.old.js#L531) 是如何创建 hook 对象的：

```javascript
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // This is the first hook in the list
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // Append to the end of the list
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```

上例的 mount 阶段调用了两次 useState ，并产生如下的 Hook 链表：

```javascript
hook: { memoizedState: 'initial value a' }
↓next
hook: { memoizedState: 'initial value b' }
```

点击按钮之后，将会调用如下代码：

```javascript
onClick={() => {
  setValueA("changed value a");
  setValueB("changed value b");
}}
```

在 onClick 事件中多次调用的 setState 将会合并，并异步触发更新。

React 将执行之前通过调用 mountState 返回的两个 dispatch ，更新两个 hook 节点的 memoizedState ，更新后的 hook 链表如下：

```javascript
hook: { memoizedState: 'changed value a' }
↓next
hook: { memoizedState: 'changed value b' }
```

随后进入异步的 update 阶段，重新执行函数组件。

### update 阶段

在 update 阶段，useState 最终调用了 [updateReducer](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberHooks.old.js#L651) 函数：

```javascript
function updateReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S,
): [S, Dispatch<A>] {
  // 按照顺序从之前的链表获取当前 hook
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  
  queue.lastRenderedReducer = reducer;

  // ...
  // 获取 newState 并赋值给 hook.memoizedState
  hook.memoizedState = newState;
  // ...

  const dispatch: Dispatch<A> = (queue.dispatch: any);
  return [hook.memoizedState, dispatch];
}
```

updateReducer 中逻辑较多，这里有所省略。简单来说，它会按顺序遍历之前构建的链表，取出对应的数据进行渲染。

上例的 update 阶段，第一个 useState 将被跳过，只调用了第二个 useState ，并将返回值赋值给 valueB：

但对于 React 来说，这是该函数组件第一次调用 useState ，因此 React 按照顺序取出第一个 hook ，并返回对应的 memoizedState 和 dispatch ：

```javascript
hook: { memoizedState: 'changed value a' } // 实际被取出的 hook ，因此 valueB = 'changed value a'
↓next
hook: { memoizedState: 'changed value b' }
```

以上就是对 useState Hook 的原理简析。

## useEffect

先提出两个问题：

1. 若父子组件都使用了 useEffect ，他们的执行顺序是怎么样的？
2. 同级兄弟组件之间的 useEffect 执行顺序又是怎么样的？

读者可以带着疑问继续往下阅读。

首先看一段 React 官方文档对 useEffect 的说明：

> 传给 useEffect 的函数会在浏览器完成布局与绘制之后，在一个延迟事件中被调用

React 是如何实现这一点的呢？这涉及到 Fiber 架构的工作流程，这里简单展开说一下。

### Fiber 架构工作流程

React 将组件树渲染到真实 DOM 的过程分为两大阶段： render 与 commit 。

在 render 阶段，React 会为每个 React 元素生成一个 Fiber 节点，节点之间通过指针连接起来，形成 Fiber 树。可以将 Fiber 树理解为虚拟 DOM ，它保存着 React 如何渲染真实 DOM 的各种信息。Fiber 树是一个基于单链表的树结构，类似于下图结构：

![Fiber Tree](/ruihusky/assets/img/2021-06-20_react-hooks/react-fiber-tree.png)

每个 Fiber 节点会有三个指针属性：

- child 指向该节点子节点列表的第一个节点
- sibling 指向该节点的下一个兄弟节点
- return 指向该节点的父节点

React 以上图中箭头标识的顺序创建、走访所有 Fiber 节点，可以理解为一个递归过程（请注意，只有 Legacy 模式下的 render 过程才是一个同步的递归过程）。

在“递”阶段，React 会从根节点开始向下深度优先遍历，为每个 Fiber 节点调用 beginWork 函数。该函数会创建子 Fiber 节点，并将两个 Fiber 节点连接起来。当遍历到叶子节点（即没有子组件的组件）时就会进入“归”阶段。

在“归”阶段，React 会调用 completeWork 处理 Fiber 节点。当某个 Fiber 节点执行完 completeWork ，如果其存在兄弟 Fiber 节点，会进入其兄弟 Fiber 节点的“递”阶段。如果不存在兄弟 Fiber 节点，会进入父 Fiber 节点的“归”阶段。

整个递归过程最终会回到根节点。到此 render 阶段结束，进入 commit 阶段。

在 commit 阶段，React 会将 Fiber 树同步到真实 DOM 。这一阶段的主要工作就是操作 DOM ，除此之外会有一些其他工作，例如执行 effect 。

### render - beginWork 阶段

在 beginWork 函数创建 Fiber 节点的过程中有大量逻辑，这里只需要关注其中会执行组件的 render 函数。对于函数组件，就会执行其中可能存在的 useEffect Hook 。

在函数组件初次渲染时，调用 useEffect 最终会执行 [mountEffect](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberHooks.old.js#L1232) 函数：

```javascript
function mountEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  // ...
  return mountEffectImpl(
    UpdateEffect | PassiveEffect,
    HookPassive,
    create,
    deps,
  );
}
```

它实际调用了 [mountEffectImpl](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberHooks.old.js#L1193) 函数：

```javascript
function mountEffectImpl(fiberFlags, hookFlags, create, deps): void {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    // create 就是实际传入的 effect 函数
    create,
    undefined,
    // nextDeps 是传入的依赖项数组
    nextDeps,
  );
}
```

mountEffectImpl 创建了一个新的 hook 对象，并将其 memoizedState 属性设置为 pushEffect 的返回值。

再来看看 [pushEffect](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberHooks.old.js#L1150) 函数做了什么：

```javascript
function pushEffect(tag, create, destroy, deps) {
  // 创建 effect 对象
  const effect: Effect = {
    tag,
    create,
    destroy,
    deps,
    // Circular
    next: (null: any),
  };
  // componentUpdateQueue 是当前正在执行渲染函数的 Fiber 节点所维护的一个队列
  let componentUpdateQueue: null | FunctionComponentUpdateQueue = (currentlyRenderingFiber.updateQueue: any);
  if (componentUpdateQueue === null) {
    // componentUpdateQueue 不存在，则创建一个
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = (componentUpdateQueue: any);
    // componentUpdateQueue 是一个单向环状链表
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      // 维护单向环状链表的数据结构
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
}
```

总结一下 pushEffect 所做的事情：

1. 根据传入的参数创建新的 effect 对象
2. 获取或创建当前正在执行渲染的 Fiber 节点的 Fiber.updateQueue
3. 将新的 effect 赋值给 Fiber.updateQueue.lastEffect，并维护 effect 的单向环状链表数据结构
4. 返回 effect 对象

因此 hook.memoizedState 中保存的是一个 effect 对象，而该对象是一个 effect 单向环状链表中的一员。函数组件所对应的 Fiber 数据结构中， Fiber.updateQueue.lastEffect 始终指向最后一个 effect 。

beginWork 阶段最终会为该 Fiber 节点创建 effect 链表，该链表的顺序与组件中调用 useEffect 的顺序保持一致。

### render - completeWork 阶段

我们先不关注 completeWork 函数做了什么。

在 completeWork 函数执行结束后，其上层函数 completeUnitOfWork 会检测当前 Fiber 节点是否存在 effect 链表，若存在就将**该 Fiber 节点**添加到父 Fiber 节点所维护的一份 effectList 链表中。可以参考源码中的注释：[completeUnitOfWork](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L1711) 。（请注意，这里父节点的 effectList 是一个 Fiber 节点链表，与子节点里的 Fiber.updateQueue 中维护的 effectList 不是同一个概念）

最终所有具有 effect 的 Fiber 节点在递归过程结束后会形成一个链表，维护在根节点的 effectList 中，其顺序与节点执行 completeWork 的顺序一致。

上文有一点没有提到：除了 useEffect 产生的 effect 之外，React 也会将待进行的 DOM 更新操作[标记成 effect](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberFlags.js#L17) ，保存在 effect 链表中。commit 阶段将根据 effectList 执行所有的 DOM 更新。

### commit 阶段

这里先不关注 commit 阶段是如何更新 DOM 的，只关注 useEffect 所产生副作用的执行时机。

在 React 完成 DOM 更新之后，将调用 [commitLayoutEffects](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L2385) 函数，其中调用了 commitLayoutEffectOnFiber 函数，该函数是 [commitLifeCycles](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberCommitWork.old.js#L454) 函数的别名：

```javascript
function commitLifeCycles(
  finishedRoot: FiberRoot,
  current: Fiber | null,
  finishedWork: Fiber,
  committedLanes: Lanes,
): void {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent:
    case Block: {
      // At this point layout effects have already been destroyed (during mutation phase).
      // This is done to prevent sibling component effects from interfering with each other,
      // e.g. a destroy function in one component should never override a ref set
      // by a create function in another component during the same commit.
      if (
        enableProfilerTimer &&
        enableProfilerCommitHooks &&
        finishedWork.mode & ProfileMode
      ) {
        try {
          startLayoutEffectTimer();
          commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
        } finally {
          recordLayoutEffectDuration(finishedWork);
        }
      } else {
        commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
      }
      // useEffect 产生的 effect 属于 PassiveEffect ，将在这里调度执行
      schedulePassiveEffects(finishedWork);
      return;
    }
    // ...
  }
  // ...
}
```

再来看看 [schedulePassiveEffects](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberCommitWork.old.js#L379) 做了什么：

```javascript
function schedulePassiveEffects(finishedWork: Fiber) {
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      const {next, tag} = effect;
      if (
        (tag & HookPassive) !== NoHookEffect &&
        (tag & HookHasEffect) !== NoHookEffect
      ) {
        // 将 effect 的销毁函数推入队列 pendingPassiveHookEffectsUnmount
        // 相当于 pendingPassiveHookEffectsUnmount.push(effect, finishedWork);
        enqueuePendingPassiveHookEffectUnmount(finishedWork, effect);
        // 将 effect 的执行函数推入队列 pendingPassiveHookEffectsMount
        // 相当于 pendingPassiveHookEffectsMount.push(effect, finishedWork)
        enqueuePendingPassiveHookEffectMount(finishedWork, effect);
      }
      // 移动指针，走访整个链表
      effect = next;
    } while (effect !== firstEffect);
  }
}

```

schedulePassiveEffects 遍历 effect 链表，将 effect 的销毁函数、执行函数推入了队列。那么队列中的函数是什么时候执行的呢？这涉及到 React 的调度机制，这里不再展开叙述。我们先简单认为这两个队列将在某个时机异步执行，其执行函数就是 [flushPassiveEffects](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L2434) ，该函数最终会调用 [flushPassiveEffectsImpl](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L2512) ：

```javascript
function flushPassiveEffectsImpl() {
  // ...

  // 阶段一：执行销毁函数
  const unmountEffects = pendingPassiveHookEffectsUnmount;
  pendingPassiveHookEffectsUnmount = [];
  for (let i = 0; i < unmountEffects.length; i += 2) {
    const effect = ((unmountEffects[i]: any): HookEffect);
    const fiber = ((unmountEffects[i + 1]: any): Fiber);
    const destroy = effect.destroy;
    effect.destroy = undefined;

    // ...

    // 如果存在销毁函数则执行，这里省略了一些不相关的逻辑
    if (typeof destroy === 'function') {
      try {
        destroy();
      } finally {
        // ...
      }
    }
  }
  // 阶段二：执行副作用函数
  const mountEffects = pendingPassiveHookEffectsMount;
  pendingPassiveHookEffectsMount = [];
  for (let i = 0; i < mountEffects.length; i += 2) {
    const effect = ((mountEffects[i]: any): HookEffect);
    const fiber = ((mountEffects[i + 1]: any): Fiber);

    // ...

    // 重新执行副作用函数，这里省略了一些不相关的逻辑
    try {
      effect.destroy = create();
    } finally {
      // ...
    }
  }

  // ...
}
```

flushPassiveEffectsImpl 先依次执行了所有 effect 销毁函数，然后再依次执行 effect 执行函数。到这里，整个 useEffect 的执行过程结束。

现在已经可以回答上文的问题了：

1. 若父子组件都使用了 useEffect ，子组件的 effect 将先执行。
2. 同级兄弟组件， effect 将会按照组件顺序依次执行。

## useRef

> useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数。返回的 ref 对象在组件的整个生命周期内保持不变。

ref 是 reference（引用）的缩写。React 推荐使用不可变数据，但某些情况下用户希望使用可变数据，ref 就提供了这样的能力。

### useRef Hook 的实现

useRef Hook 的 hook.memoizedState 中保存着 ref 对象。例如：

```
const ref = useRef('hello') // ref = hook.memoizedState = { current: 'hello' }
```

这可以从 useRef 实际调用的 mountRef 、 updateRef 函数看出：

```javascript
function mountRef<T>(initialValue: T): {|current: T|} {
  const hook = mountWorkInProgressHook();
  const ref = {current: initialValue};

  hook.memoizedState = ref;
  return ref;
}

function updateRef<T>(initialValue: T): {|current: T|} {
  const hook = updateWorkInProgressHook();
  return hook.memoizedState;
}
```

### React 元素的 Refs

React 支持通过 Refs 访问 DOM 元素或者类组件：

```html
// DOM 元素
<div ref={domRef}></div>
// React 类组件
<ClassComponent ref={classComponentRef} />
```

对于元素上的 ref 声明，React 是如何对 ref.current 赋值的呢？

在 render 的 beginWork 阶段，React 将通过 [beginWork: markRef](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberBeginWork.old.js#L691) 函数为含有 ref 属性的 Fiber 添加 [flag: Ref](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberFlags.js#L24) 。

```javascript
// ReactFiberFlags.js 中定义的 Ref flag
export const Ref = 0b000000000010000000;

// beginWork 阶段的 markRef
function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) ||
    (current !== null && current.ref !== ref)
  ) {
    // Schedule a Ref effect
    workInProgress.flags |= Ref;
  }
}
```

markRef 将在 [finishClassComponent](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberBeginWork.old.js#L956) 函数和 [updateHostComponent](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberBeginWork.old.js#L1154) 函数中调用。其中 finishClassComponent 用于类组件， updateHostComponent 用于原生 DOM 元素。

```javascript
function finishClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  shouldUpdate: boolean,
  hasContext: boolean,
  renderLanes: Lanes,
) {
  // 即使 shouldComponentUpdate 返回了 false ，Refs 也应该更新
  markRef(current, workInProgress);

  const didCaptureError = (workInProgress.flags & DidCapture) !== NoFlags;

  if (!shouldUpdate && !didCaptureError) {
    // Context providers should defer to sCU for rendering
    if (hasContext) {
      invalidateContextProvider(workInProgress, Component, false);
    }

    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  // ...
}

function updateHostComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
) {
  // ...
  markRef(current, workInProgress);
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```

另外在 render 的 completeWork 阶段，React 将通过 [completeWork: markRef](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberCompleteWork.old.js#L146) 为需要进行 ref 更新的节点进行标记：

```javascript
function markRef(workInProgress: Fiber) {
  workInProgress.flags |= Ref;
}

function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  // ...
  switch (workInProgress.tag) {
    // ...
    case HostComponent: {
      // ...
      if (current !== null && workInProgress.stateNode != null) {
        // ...
        // 更新节点的情形，ref 属性发生变化
        if (current.ref !== workInProgress.ref) {
          markRef(workInProgress);
        }
      } else {
        // ...
        // 新建节点的情形，节点存在 ref 属性
        if (workInProgress.ref !== null) {
          markRef(workInProgress);
        }
      }
      return null;
    }
    // ...
  }
  // ...
}
```

在 commit 阶段，React 将为需要操作 ref 的 Fiber 节点执行两类操作：清除之前的 ref 、赋值新的 ref 。

有两种情形需要清除之前的 ref ，第一种是 Fiber 节点包含 flag: Ref ，通过 [commitMutationEffects](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L2302) 函数执行：

```javascript
function commitMutationEffects(
  root: FiberRoot,
  renderPriorityLevel: ReactPriorityLevel,
) {
  while (nextEffect !== null) {
    const flags = nextEffect.flags;
    // ...
    if (flags & Ref) {
      const current = nextEffect.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
    }
    // ...
  }
  // ...
}
```

[commitDetachRef](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberCommitWork.old.js#L852) 是实际执行 ref 清除的函数：

```javascript
function commitDetachRef(current: Fiber) {
  const currentRef = current.ref;
  if (currentRef !== null) {
    if (typeof currentRef === 'function') {
      currentRef(null);
    } else {
      currentRef.current = null;
    }
  }
}
```

第二种情形是 Fiber 节点[需要被移除](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L2374)：

```javascript
function commitMutationEffects(
  root: FiberRoot,
  renderPriorityLevel: ReactPriorityLevel,
) {
  while (nextEffect !== null) {
    // ...
    const flags = nextEffect.flags;
    // ...
    const primaryFlags = flags & (Placement | Update | Deletion | Hydrating);
    switch (primaryFlags) {
      // ...
      // 需要删除节点
      case Deletion: {
        commitDeletion(root, nextEffect, renderPriorityLevel);
        break;
      }
    }
    // ...
  }
}
```

commitDeletion 函数最终会调用 [safelyDetachRef](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberCommitWork.old.js#L178) 函数，负责 ref 清除的工作：

```javascript
function safelyDetachRef(current: Fiber) {
  const ref = current.ref;
  if (ref !== null) {
    if (typeof ref === 'function') {
      // ...
      try {
        ref(null);
      } catch (refError) {
        captureCommitPhaseError(current, refError);
      }
    } else {
      ref.current = null;
    }
  }
}
```

完成 ref 的清除除工作后，接下来是 ref 的赋值工作，在 [commitLayoutEffect](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L2414) 函数中会执行 [commitAttachRef](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberCommitWork.old.js#L818) 函数：

```javascript
function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  if (ref !== null) {
    const instance = finishedWork.stateNode;
    let instanceToUse;
    switch (finishedWork.tag) {
      // 原生 DOM 元素
      case HostComponent:
        instanceToUse = getPublicInstance(instance);
        break;
      // 类组件
      default:
        instanceToUse = instance;
    }
    // ...
    if (typeof ref === 'function') {
      ref(instanceToUse);
    } else {
      // ...
      ref.current = instanceToUse;
    }
  }
}
```

## useCallback 与 useMemo

相比于上文的几种 Hook ，useCallback 和 useMemo 的实现比较简单。

### mount 阶段

先看 mount 阶段 [mountCallback](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberHooks.old.js#L1374) 与 [mountMemo](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberHooks.old.js#L1397) 的实现：

```javascript
function mountCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  hook.memoizedState = [callback, nextDeps];
  return callback;
}

function mountMemo<T>(
  nextCreate: () => T,
  deps: Array<mixed> | void | null,
): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
```

两者的区别在于：mountCallback 保存**传入的函数**与依赖项，mountMemo 保存**传入函数的执行结果**与依赖项。

### update 阶段

在 update 阶段，useCallback 与 useMemo 将会比较依赖项，若依赖项改变则保存新值，否则返回之前保存的值。

```javascript
function updateCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps: Array<mixed> | null = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }
  hook.memoizedState = [callback, nextDeps];
  return callback;
}

function updateMemo<T>(
  nextCreate: () => T,
  deps: Array<mixed> | void | null,
): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  if (prevState !== null) {
    // Assume these are defined. If they're not, areHookInputsEqual will warn.
    if (nextDeps !== null) {
      const prevDeps: Array<mixed> | null = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
```

比较函数 [areHookInputsEqual](https://github.com/facebook/react/blob/17.0.2/packages/react-reconciler/src/ReactFiberHooks.old.js#L295) 的实现如下：

```javascript
function areHookInputsEqual(
  nextDeps: Array<mixed>,
  prevDeps: Array<mixed> | null,
) {
  // ...

  if (prevDeps === null) {
    // ...
    return false;
  }

  // ...
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    // is 是 Object.is 的 polyfill
    if (is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```

areHookInputsEqual 对依赖项进行了浅层的 [Object.is](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 比较，因此修改依赖项的深层数据并不会触发 useCallback 和 useMemo 重新计算的逻辑。
