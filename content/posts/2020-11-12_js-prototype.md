---
title: "JavaScript原型与继承"
date: 2020-11-12T20:00:00+08:00
draft: false
tags: ["JavaScript"]
categories: ["理论基础"]
---

## 理解原型对象

在 JavaScript 中，创建的每个函数都有一个 `prototype` （原型）属性，这个属性是一个指针，指向原型对象。通过调用构造函数创建的所有对象实例都可以访问该原型对象。举例来说：

```javascript
function Person() {}

Person.prototype.name = "Nicholas";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function () {
  alert(this.name);
};

var person1 = new Person();
person1.sayName(); // "Nicholas"
var person2 = new Person();
person2.sayName(); // "Nicholas"
alert(person1.sayName == person2.sayName); // true
```

## 原型搜索机制

访问实例对象的属性时，会先从实例对象的属性找起，找不到再去原型对象中寻找。为实例对象添加属性会屏蔽对原型对象中同名属性的访问。要恢复对原型对象属性的访问，使用 `delete` 删除实例对象属性即可。下面是例子：

```javascript
function Person() {}

Person.prototype.name = "Nicholas";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function () {
  alert(this.name);
};

var person1 = new Person();
var person2 = new Person();

person1.name = "Greg";
alert(person1.name); // "Greg"--来自实例
alert(person2.name); // "Nicholas"--来自原型

delete person1.name;
alert(person1.name); // "Nicholas"--来自原型
```

## 继承

ECMAScript 中描述了 **原型链** 的概念，并将原型链作为实现继承的主要方法。其基本思想是利用原型让一个引用类型继承另一个引用类型的属性和方法。实现原型链的一种基本模式是让 **原型对象等于另一个类型的实例**。这么说比较抽象，先看一段代码：

```javascript
function SuperType() {
  this.property = true;
}

SuperType.prototype.getSuperValue = function () {
  return this.property;
};

function SubType() {
  this.subProperty = false;
}
// 继承了SuperType
SubType.prototype = new SuperType();

SubType.prototype.getSubValue = function () {
  return this.subProperty;
};
var instance = new SubType();
alert(instance.getSuperValue()); // true
```

以上代码定义了 `SuperType`、`SubType` 两个类型，他们分别有自己的属性和方法。通过重写 `Subtype` 的原型对象（让其等于 `SuperType` 的实例），可以让存在于 `SuperType` 实例中的所有属性和方法在 `SubType.prototype` 访问到。

结合上文的原型搜索机制来理解：访问一个实例属性时，首先在实例中搜索该属性。如果没有找到则会继续搜索该实例的原型。通过原型链实现继承后，搜索过程就会沿着原型链继续向上。拿上面的例子来说，调用 `instance.getSuperValue()` 的过程如下：

**搜索实例 --> 搜索`SubType.prototype`--> 搜索`SuperType.prototype`**

另外，所有的默认原型都是 `Object` 的实例。因此可以这么概括：`SubType` 继承自 `SuperType` ，`SuperType` 继承自 `Object`。

## 原型链的问题

使用原型链实现继承，最主要的问题是包含引用类型值的原型。举例来说：

```javascript
function SuperType() {
  this.colors = ["red", "blue", "green"];
}

function SubType() {}

// 继承了SuperType
SubType.prototype = new SuperType();

var instance1 = new SubType();
instance1.colors.push("black");
alert(instance1.colors); // "red,blue,green,black"

var instance2 = new SubType();
alert(instance2.colors); // "red,blue,green,black"
```

可以看到，对 `instance1.colors` 所做的修改，会在 `instance2` 反映出来。

原型链的第二个问题是：创建子类实例时，无法向超类的构造函数传递参数。

为了解决这些问题，通常会使用下面这些技术来实现继承。

## 组合继承

通过将原型链和借用构造函数技术相结合达到目的。使用原型链实现对原型属性、方法的继承，通过借用构造函数实现对实例属性的继承。

```javascript
function SuperType(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function () {
  alert(this.name);
};
function SubType(name, age) {
  // 继承属性，通过call()函数在实例内部创建属性
  SuperType.call(this, name);
  this.age = age;
}
// 继承方法，来自子类原型对象的原型对象-也就是超类原型对象
SubType.prototype = new SuperType();
// 默认情况下，所有原型对象会自动获得一个constructor（构造函数）属性，指向原型对象所在函数。
// 覆写的prototype对象没有constructor属性，需要重新指定。
SubType.prototype.constructor = SubType;
SubType.prototype.sayAge = function () {
  alert(this.age);
};
var instance1 = new SubType("Nicholas", 29);
instance1.colors.push("black");
alert(instance1.colors); // "red,blue,green,black"
instance1.sayName(); // "Nicholas";
instance1.sayAge(); // 29

var instance2 = new SubType("Greg", 27);
alert(instance2.colors); // "red,blue,green"
instance2.sayName(); // "Greg";
instance2.sayAge(); // 27
```

在这个例子中，通过子类创建的实例会包含下列属性、方法：

1. `name`、`colors` 通过 `SuperType.call()` 创建，它们属于子类实例。
2. **超类实例直接赋值给子类原型，`Subtype.prototype` 也有 `name`、`colors` 属性。**
3. `age` 通过 `SubType` 构造函数创建，属于子类实例。
4. `sayName()` 方法继承自超类原型。
5. `sayAge()` 方法来自子类原型。

这种继承方式是 JavaScript 中最为常见的继承模式。并且 `instanceof` 和 `isPrototypeOf()` 也能够用于识别子类实例。但是可以看到，子类的原型有多余的属性。接下来的继承方式则解决了这个问题。

## 寄生组合式继承

这里可能稍微有些复杂，先看其基本模式：

```javascript
// 这里是原型式继承-通过该函数，将实例的原型指定为对象o，从而拥有o的属性。
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}
// 寄生组合式继承基本模式
// 接受两个参数：子类构造函数、超类构造函数
function inheritPrototype(subType, superType) {
  // 创建prototype对象，目的是准备把它当成子类的原型。同时该prototype对象的原型是超类原型。
  var prototype = object(superType.prototype); //创建对象
  // 覆写的prototype对象没有constructor属性，需要重新指定。
  prototype.constructor = subType;
  // 将prototype对象赋值给子类原型
  subType.prototype = prototype;
}
```

基本想法就是自行创建子类的原型对象，同时将该原型对象的原型指向超类原型。**这样一来子类只继承了超类的原型，而与超类实例无关。**
下面看一个更加具体的例子加深理解：

```javascript
function SuperType(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function () {
  alert(this.name);
};
function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}
inheritPrototype(SubType, SuperType);
SubType.prototype.sayAge = function () {
  alert(this.age);
};
```

在上面的例子中，通过子类创建的实例会包含下列属性、方法：

1. `name`、`colors` 通过 `SuperType.call()` 创建，它们属于子类实例。
2. `age` 通过 `SubType` 构造函数创建，属于子类实例。
3. `sayName()` 方法继承自超类原型。
4. `sayAge()` 方法来自子类原型。

与上述组合继承方式相比，这种继承方式避免了在 `SubType.prototype` 上创建多余的属性，同时保持了原型链不变。
