---
title: "JavaScript原型与继承"
date: 2020-11-12T20:00:00+08:00
draft: false
tags: ["JavaScript"]
---

## 构造函数模式与原型

在 ES5 中，我们可以自定义构造函数用于创建特定的类型对象，例如：

```javascript
// 定义构造函数
function Person(name, age, job) {
  this.name = name;
  this.age = age;
  this.job = job;
  this.sayName = function () {
    console.log(this.name);
  };
}

// 以 new 操作符调用构造函数
let person1 = new Person("Nicholas", 29, "Software Engineer");
let person2 = new Person("Greg", 27, "Doctor");
person1.sayName(); // Nicholas
person2.sayName(); // Greg
```

其实这里的“构造函数”说法只是一种概念上的区分，它与普通的 JavaScript 函数没什么区别。通常会约定构造函数以大写字母开头，非构造函数以小写字母开头。

通过`new`操作符调用构造函数，会创建一个 Person 的实例。具体的创建过程如下：

1. 在内存中创建一个新对象。
2. 这个新对象内部的`[[Prototype]]`特性被赋值为构造函数的`prototype`属性。
3. 执行构造函数内的代码，并以刚才新建的对象作为`this`值。
4. 若构造函数返回非空对象，则返回该对象，否则返回刚才创建的对象。

每个函数都会有`prototype`属性，它是一个对象，默认有一个属性`constructor`指向函数本身。而通过`new`操作符创建的新对象，内部的`[[Prototype]]`属性指向该原型对象。下面的例子展示了这些特性：

```javascript
function Person() {}

Person.prototype.name = "Nicholas";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function () {
  console.log(this.name);
};

console.log(Person.prototype.constructor === Person); // true

const person1 = new Person();
person1.sayName(); // "Nicholas"

const person2 = new Person();
person2.sayName(); // "Nicholas"

console.log(person1.sayName == person2.sayName); // true
console.log(Object.getPrototypeOf(person1) === Person.prototype); // true
```

访问对象的属性时，会先从对象的自身拥有的属性找起。找不到再去对象的`[[Prototype]]`所指向的对象中寻找。上面的例子也说明了这一点。

## 继承

ECMAScript 中描述了 **原型链** 的概念，并将原型链作为实现继承的主要方法。其基本思想是利用原型让一个引用类型继承另一个引用类型的属性和方法。回想一下上文的概念：每个构造函数都有一个原型对象，而实例有一个内部指针指向原型。如果原型是另一个构造函数的实例呢？那意味着这个实例也会有一个内部指针指向另一个原型。这样就在实例和原型之间构造了一条原型链。

实现原型链的一种基本模式是让 **原型对象等于另一个类型的实例**：

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
// 继承 SuperType
SubType.prototype = new SuperType();
SubType.prototype.getSubValue = function () {
  return this.subProperty;
};

const instance = new SubType();
console.log(instance.getSuperValue()); // true
```

以上代码定义了 `SuperType`、`SubType` 两个类型，他们分别有自己的属性和方法。通过重写 `Subtype` 的原型对象（让其等于 `SuperType` 的实例），可以让存在于 `SuperType` 实例中的所有属性和方法在 `SubType.prototype` 访问到。

结合上文的原型搜索机制来理解：访问一个实例属性时，首先在实例中搜索该属性。如果没有找到则会继续搜索该实例的原型。通过原型链实现继承后，搜索过程就会沿着原型链继续向上。拿上面的例子来说，调用 `instance.getSuperValue()` 的过程如下：

**搜索 SubType 实例 --> 搜索 SubType.prototype --> 搜索 SuperType.prototype --> 找到 getSuperValue 方法**

另外，任何函数的默认原型都是一个 `Object` 的实例，这意味着这个实例有一个内部指针指向 `Object.prototype`。因此可以这么概括：`SubType` 继承自 `SuperType` ，`SuperType` 继承自 `Object`。完整的原型链如下：

![原型链](/ruihusky/assets/img/2020-11-12_js-prototype/js-prototype-chain.jpg)

## 原型链的问题

原型链虽然是实现继承的强大工具，但它也有问题。主要问题出现在原型中包含引用值的时候。举例来说：

```javascript
function SuperType() {
  this.colors = ["red", "blue", "green"];
}

function SubType() {}

// 继承了SuperType
SubType.prototype = new SuperType();

const instance1 = new SubType();
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"

const instance2 = new SubType();
console.log(instance2.colors); // "red,blue,green,black"
```

原型中包含引用值时，该引用值就会在所有实例中共享。可以看到，对 `instance1.colors` 所做的修改，会在 `instance2` 反映出来。

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
  console.log(this.name);
};

function SubType(name, age) {
  // 继承属性，通过call()函数在子类实例内部创建超类的属性
  SuperType.call(this, name);
  this.age = age;
}
// 子类原型指向超类实例：这样可以通过原型链访问到超类原型
SubType.prototype = new SuperType();
// 默认情况下，所有原型对象会自动获得一个constructor（构造函数）属性，指向原型对象所在函数。
// 覆写的prototype对象没有constructor属性，需要重新指定。
SubType.prototype.constructor = SubType;

SubType.prototype.sayAge = function () {
  console.log(this.age);
};

const instance1 = new SubType("Nicholas", 29);
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"
instance1.sayName(); // "Nicholas";
instance1.sayAge(); // 29

const instance2 = new SubType("Greg", 27);
console.log(instance2.colors); // "red,blue,green"
instance2.sayName(); // "Greg";
instance2.sayAge(); // 27
```

在这个例子中，通过子类创建的实例会包含下列属性、方法：

1. `name`、`colors` 通过 `SuperType.call()` 创建，它们属于子类实例。
2. **超类实例直接赋值给子类原型，`Subtype.prototype` 也有 `name`、`colors` 属性。**
3. `age` 通过 `SubType` 构造函数创建，属于子类实例。
4. `sayName()` 方法继承自超类原型。
5. `sayAge()` 方法来自子类原型。

这种继承方式是 JavaScript 中最为常见的继承模式。并且 `instanceof` 和 `isPrototypeOf()` 也能够用于识别子类实例。

## 寄生式组合继承

组合继承其实也存在效率问题。最主要的效率问题就是父类构造函数始终会被调用两次：一次在是创建子类原型时调用，另一次是在子类构造函数中调用。本质上，为了达到子类继承超类的目的，需要做到以下两点：

1. 子类拥有超类实例的所有属性。
2. 子类继承超类的原型。

对于第 1 点，使用借用构造函数的方法就可以实现了：

```javascript
function SubType(name, age) {
  // 继承属性，通过call()函数在子类实例内部创建超类的属性
  SuperType.call(this, name);
  this.age = age;
}
```

对于第 2 点，我们通过下述模式实现：

```javascript
// 这里是原型式继承。通过该函数，将实例的原型指定为对象o，从而拥有o的属性。
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

// 寄生式组合继承的核心逻辑
// 接受两个参数：子类构造函数、超类构造函数
function inheritPrototype(subType, superType) {
  // 创建prototype对象，目的是准备把它当成子类的原型。同时该prototype对象的原型是超类原型。
  const prototype = object(superType.prototype); //创建对象
  // 覆写的prototype对象没有constructor属性，需要重新指定。
  prototype.constructor = subType;
  // 将prototype对象赋值给子类原型
  subType.prototype = prototype;
}
```

简单的一句话概括：创建一个空对象作为子类的原型，同时将该对象的原型指向超类原型。**这样一来子类只继承了超类的原型，而与超类实例无关。**
下面是一个更加具体的例子：

```javascript
function SuperType(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}

SuperType.prototype.sayName = function () {
  console.log(this.name);
};

function SubType(name, age) {
  // 借用构造函数继承实例属性
  SuperType.call(this, name);
  this.age = age;
}

// 继承超类原型
inheritPrototype(SubType, SuperType);

SubType.prototype.sayAge = function () {
  console.log(this.age);
};
```

在上面的例子中，通过子类创建的实例会包含下列属性、方法：

1. `name`、`colors` 通过 `SuperType.call()` 创建，它们属于子类实例。
2. `age` 通过 `SubType` 构造函数创建，属于子类实例。
3. `sayName()` 方法继承自超类原型。
4. `sayAge()` 方法来自子类原型。

与上述组合继承方式相比，这种继承方式避免了在 `SubType.prototype` 上创建多余的属性，同时保持了原型链不变。
