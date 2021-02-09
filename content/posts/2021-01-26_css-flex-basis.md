---
title: "CSS flex-basis: auto 与弹性布局"
date: 2021-01-26T20:00:00+08:00
draft: false
tags: ["CSS", "Flex布局"]
categories: ["经验技巧"]
---

## flex 布局中的问题

最近在开发一个移动端适配的 H5 应用时，遇到了一个布局上的问题。简单描述如下：

页面从上到下排列有多个元素，其中有几张图片。在高宽比较大的手机上展示时（也就是比较长的手机，例如 iPhone X），布局没什么问题。但在一些小手机上，屏幕的纵轴无法容纳这么多元素。特别当微信浏览器中出现下方的导航栏时，高宽比被进一步减小，纵轴空间更加局促了。

我一想，使用 flex 布局，让图片元素在小屏幕上自动控制高度，自适应等比缩放不就 OK 了吗？于是写出了如下的代码：

```html
<div class="page-container">
  <!-- ...其他flex子项 -->

  <div class="image-wrap">
    <!-- 为了实现多个动画效果，图片被一个div包裹 -->
    <img class="image" src="..." />
  </div>

  <!-- ...其他flex子项 -->
</div>

<!-- vue css scope -->
<style>
  .page-container {
    width: 750px;
    /* 父元素固定100vh */
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  .image-wrap {
    /* 让flex子元素自动伸展、自动压缩，并且设置最大、最小高度 */
    flex-grow: 1;
    flex-shrink: 1;
    max-height: 688px;
    min-height: 613px;
  }
  .image {
    /* 跟随父元素的高度变化 */
    height: 100%;
  }
</style>
```

在 Chrome 中使用移动设备仿真，各种不同高度下的效果都 OK 了。结果用自己的 iPhone 再看却出了问题：图片没有按照预想的那样自动调整高度，而是保持原始图片的大小不变。

于是我上网搜索了有关 flex 布局与 min/max 尺寸限制相关的资料，最后的解决方案是：给 `.image-wrap` 元素加上 `flex-basis: 688px` 这一行样式。

## 关于 flex-basis: auto

为了彻底弄明白问题出在哪里，有必要进一步了解 `flex-basis` 属性。以前我只是简单的以为它大概就和 `width` 属性一样，设置不设置都没关系。研究过后才发现这个属性有着诸多细节。（这里为了简化说明，只探讨 `flex-direction: row` 的情形）

在 flex 布局中，一个 flex 子项的最终尺寸是基础尺寸、弹性增长或收缩、最大最小尺寸限制共同作用的结果。其中：

- 基础尺寸由 `flex-basis`、`width` 等属性以及 `box-sizing` 盒模型共同决定；
- 弹性增长指的是 `flex-grow` 属性，弹性收缩指的是 `flex-shrink` 属性；
- 最大最小尺寸限制指的是 `min-width` / `max-width` 等 CSS 属性，以及 `min-content` 最小内容尺寸。

其中优先级为：**最大最小尺寸限制 > 弹性增长或收缩 > 基础尺寸**。

按照这个理论，在上文的例子中，我已经设置好了 `max-height`、`min-height`、`flex-grow`、`flex-shrink`，虽然没有设置 `flex-basis`，也不应该影响结果才对。

当我没有设置 `flex-basis` 时，它就是默认值 `auto`。此时 flex 子项的 `flex-basis` 根据其自身的尺寸决定，由 `box-sizing` 盒模型、 `width` / `min-width` / `max-width` 等属性以及 `content` 内容（min-content 最小宽度）共同决定。看来在 Chrome 和 Safari 下对于`flex-basis: auto` 的处理有些不一致。

看来以后在使用弹性布局时，最好是明确给出 `flex-basis` 的值。
