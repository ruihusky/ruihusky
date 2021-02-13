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

这个问题看起来不难。使用 flex 布局，让图片元素在小屏幕上自动控制高度，自适应等比缩放不就 OK 了吗？于是写出了如下的代码：

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

在 Chrome 中使用移动设备仿真，各种不同高度下的效果都 OK 了。结果用自己的 iPhone 再看却出了问题：图片没有按照预想的那样自动调整高度，而是保持着原始图片的大小。

于是我开始搜索有关 flex 布局与 min/max 样式之间如何相互作用的资料。这里先给出最后的解决方案：给 `.image-wrap` 元素加上 `flex-basis: 688px` 样式。

## flex-basis 默认值：auto

为了彻底弄明白问题出在哪里，有必要进一步了解 `flex-basis` 属性。以前我只是简单的以为它大概就和 `width` 属性一样，设置不设置都没关系。研究过后才发现这个属性有着诸多细节。（这里为了简化说明，只探讨 `flex-direction: row` 的情形）

在 flex 布局中，一个 flex 子项的最终尺寸是基础尺寸、弹性增长或收缩、最大最小尺寸限制共同作用的结果。其中：

- 基础尺寸由 `flex-basis` 与 `box-sizing` 盒模型共同决定；
- 弹性增长指的是 `flex-grow` 属性，弹性收缩指的是 `flex-shrink` 属性。这里不做过多阐述，详情可参考：[flex-grow](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-grow)，[flex-shrink](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-shrink)；
- 最大最小尺寸限制指的是 `min-width` / `max-width` 等 CSS 属性。

其中优先级为：**最大最小尺寸限制 > 弹性增长或收缩 > 基础尺寸**。

按照这个理论，在上文的例子中，我已经设置好了 `max-height`、`min-height`、`flex-grow`、`flex-shrink`，虽然没有设置 `flex-basis`，也不应该影响结果才对。

我在查看了更多资料之后，发现 `flex-basis` 还有许多细节：

- 在 flex 布局中，`flex-basis` 就同非 flex 布局中 `width` 属性表现一样；
- 若同时设置了确定数值的 `flex-basis` 与 `width`，则 `width` 属性会被忽略；
- 当 `flex-basis` 值为 `auto` 时（默认值），子项的基本尺寸根据其自身的尺寸决定。更具体一点地说，由 `box-sizing`、`width`、`min-width`、`max-width`以及元素内容共同决定。

再来看上文的例子，我没有设置 `flex-basis` ，所以它是默认值 `auto`，flex 子项的 `flex-basis` 根据其自身的尺寸决定。对于 `.image-wrap` 元素，根据我所设置的 CSS 样式：

```css
.image-wrap {
  flex-grow: 1;
  flex-shrink: 1;
  max-height: 688px;
  min-height: 613px;
}
```

它的高度应该是由 `box-sizing` 盒模型、`min-height`、`max-height` 属性共同决定（注意这里我没有设置 `height`）。看来在这种情况下，Chrome 和 Safari 下对于最终效果的处理有些不一致。

在使用弹性布局时，最好是明确给出 `flex-basis` 的值。

## 参考资料

[Oh My God，CSS flex-basis 原来有这么多细节](https://www.zhangxinxu.com/wordpress/2019/12/css-flex-basis/)
