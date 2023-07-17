---
title: "CSRF的原理与防御"
date: 2021-03-14T20:00:00+08:00
draft: false
tags: ["网络安全"]
---

## CSRF 原理

CSRF 的全称是 Cross Site Request Forgery 的缩写，即**跨站请求伪造**。简单的说，当用户在被攻击网站未退出登陆时，攻击者欺骗用户在攻击者的网站请求了被攻击网站某一需要登录权限的链接，则构成 CSRF。

举一个经典的例子：

用户登录了某一家银行网站，其登陆状态由浏览器 cookie 与服务器 session 维持。该网站有一用于执行转账操作的 get 请求：

`https://bank.example.com/withdraw?account=AccoutName&amount=1000&for=PayeeName`

攻击者在一个恶意网站上放置如下代码：

`<img src="https://bank.example.com/withdraw?account=Alice&amount=1000&for=Badman" />`

如果用户登录了银行网站之后还未退出登陆，并访问了恶意网站，则上述`img`标签会发出转账请求，并携带银行网站的登录态 cookie。服务器收到了请求，并查看 cookie，发现用户依然是登陆状态，则认为该次请求合法。于是用户的银行账户就损失了 1000 资金。

注意到，攻击者并不能通过 CSRF 直接获取用户帐户的控制权限，也不能窃取用户的任何信息。攻击者能做的是**欺骗用户的浏览器，让其以用户的名义执行操作**。

## CSRF 防御

CSRF 具备两个特点：

- CSRF 通常是发生在第三方域名的
- CSRF 通过欺骗浏览器来使用 cookie 中的信息，以获取用户权限来执行某些操作

针对这两个特点，我们可以制定对应的防护策略。

### 检查 Referer 字段

http 请求头中有一个 Referer 字段，用于标识该请求来源于哪个地址。如果是来自恶意网站的请求，则 Referer 字段将会是恶意网站的地址，服务器可以拒绝该次请求。服务器也可以设置为只允许来自于特定 Referer 的请求，相当于一个白名单规则。

这种方法实现简单，但也有其局限性。虽然 http 协议对 Referer 字段的内容有明确的规定，但无法保证浏览器的具体实现，也无法保证浏览器自身是否没有安全漏洞。使用检查 Referer 字段的方法，等于将安全性依赖于第三方浏览器实现。

### CSRF token

CSRF 中，攻击者只能利用 cookie 中的信息。我们可以要求所有的用户请求都携带一个攻击者无法获得的 token。原理是：当用户发送请求时，服务器端应用生成一个随机且唯一的令牌（token），并将其发送给客户端。客户端提交请求的时候，将 token 一起发送到服务端，服务端通过验证 token 是否有效来判断该次请求的合法性。

大部分 Web 框架都带有这种功能，例如 Django：

```html
<form method="post">{% csrf_token %}</form>
```

渲染后的效果：

```html
<form method="post">
  <input
    type="hidden"
    name="csrfmiddlewaretoken"
    value="KbyUmhTLMpYj7CD2di7JKP1P3qmLlkPt"
  />
</form>
```

但 CSRF token 的防御方式也有不足。因为 token 是唯一且随机的，如果每次请求都使用一个唯一的 token，则服务器对于每一个请求都需要进行校验，工作量与服务器压力都会增加。使用会话（session）等级的 token 代替的话，负担将没有那么重。但在大型网站中，使用 session 等级的 CSRF token 会带来一些问题。大型网站很可能会使用分布式环境，用户的多个 http 请求可能会落到不同的服务器之上，那么分布式环境中的 session 信息需要存储在公共存储空间中，比如 redis 里。访问 session 中的 CSRF token 会带来性能问题。目前很多网站采用 Encrypted Token 模式解决该问题。在该模式下，token 不是随机生成的字符串，而是一个计算出来的结果（通常使用一些用户信息、时间戳、随机数等加密生成）。这样在校验时无需再去读取存储的 Token，只用再次计算一次即可。

### SameSite cookies

为了从源头解决 CSRF 的问题，Google Chrome 版本 51 引入了 `SetCookie SameSite` 规范作为可选属性。SameSite 是 http 响应头 Set-Cookie 的属性之一。该属性用于声明该 cookie 是否仅限于同一站点使用。目前该属性尚未纳入 http 标准，还是草案阶段，但大部分现代浏览器已经支持（[链接：SameSite#浏览器兼容性](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie/SameSite#%E6%B5%8F%E8%A7%88%E5%99%A8%E5%85%BC%E5%AE%B9%E6%80%A7)）。

SameSite 可以被设置为三个值：`Strict`、`Lax`、`None`

#### SameSite=Strict

该规则最为严格，浏览器将仅发送第一方上下文请求的 cookie（源自设置 cookie 的站点的请求）。如果请求源自于当前位置不同的 URL，则不会发送使用被该 Strict 属性标记的任何 cookie。

```raw
Set-Cookie: CookieName=CookieValue; SameSite=Strict;
```

该规则过于严格，可能造成不好的用户体验。例如：某网站有一个 GitHub 的跳转链接，用户点击跳转到 GitHub 网站后，由于 cookie 被标记为 SameSite=Strict，跳转过去后将是未登录状态。

#### SameSite=Lax(浏览器默认值)

Lax 规则相对宽松一些，在满足下述两条规则的情况下，浏览器会在跨源请求中携带 cookie：

1. 请求为顶级导航。可以理解为通过超链接跳转到 cookie 所在网站。
2. 请求方法是安全的，包括 GET、HEAD、OPTIONS 请求。

```raw
Set-Cookie: CookieName=CookieValue; SameSite=Lax;
```

举几个例子用来说明 Lax 与 Strict 之间的区别：

1. 用户访问了 a.com 网站，并点击网站中的一个链接导航至 b.com，则发起 b.com 请求的请求源是 a.com，是一个跨源请求，则 Strict cookies 不会被发送。但这是一个顶级导航，因此 Lax cookies 会被发送。
2. 用户访问了 a.com 网站，该网站中有一个 iframe 请求 b.com，这种情况下 Lax cookies 也不会被发送。因为这不是一次顶级导航。
3. 用户访问了 a.com 网站，该网站对 b.com 网站发起了一次 POST 请求，这种情况下 Lax cookies 也不会被发送。因为请求方法不是安全方法。

#### SameSite=None

cookie 将同时在第一方上下文和跨源请求中发送；但是，必须将该值显式设置为 **None** ，且设置 **Secure** 属性。这也意味着所有请求必须遵循 https 协议。

```raw
Set-Cookie: CookieName=CookieValue; SameSite=None; Secure;
```
