## 你确定 ES6 的新特性你都会了吗？

### 1. super

1. super 关键字用于访问和调用一个对象的父对象上的函数。
2. super.prop 和 super[expr]表达式在类和对象字面量任何方法定义中都是有效的。
3. 子类构造函数必须要调用一次 super()，且必须在 this 使用之前调用。
4. 在字面量对象中的使用

[打开查看示例](https://github.com/kekeon/blog/tree/master/ES6/demo/js/super.js)

### 2.Proxy

- get(target, propKey, receiver)

拦截对象属性的读取，比如 proxy.foo 和 proxy['foo']。

最后一个参数 receiver 是一个对象，可选，参见下面 Reflect.get 的部分。

- set(target, propKey, value, receiver)

拦截对象属性的设置，比如 proxy.foo = v 或 proxy['foo'] = v，返回一个布尔值。

- has(target, propKey)

拦截 propKey in proxy 的操作，返回一个布尔值。

- deleteProperty(target, propKey)

拦截 delete proxy[propKey]的操作，返回一个布尔值。

- ownKeys(target)

拦截 Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object.keys(proxy)，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而 Object.keys()的返回结果仅包括目标对象自身的可遍历属性。

- getOwnPropertyDescriptor(target, propKey)

拦截 Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象。

- defineProperty(target, propKey, propDesc)

拦截 Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)，返回一个布尔值。

- preventExtensions(target)

拦截 Object.preventExtensions(proxy)，返回一个布尔值。

- getPrototypeOf(target)

拦截 Object.getPrototypeOf(proxy)，返回一个对象。

- isExtensible(target)

拦截 Object.isExtensible(proxy)，返回一个布尔值。

- setPrototypeOf(target, proto)

拦截 Object.setPrototypeOf(proxy, proto)，返回一个布尔值。

如果目标对象是函数，那么还有两种额外操作可以拦截。

- apply(target, object, args)

拦截 Proxy 实例作为函数调用的操作，比如 proxy(...args)、proxy.call(object, ...args)、proxy.apply(...)。

- construct(target, args)

拦截 Proxy 实例作为构造函数调用的操作，比如 new proxy(...args)。

### 3.Reflect

> 与大多数全局对象不同Reflect并非一个构造函数，所以不能通过new运算符对其进行调用，或者将Reflect对象作为一个函数来调用。Reflect的所有属性和方法都是静态的（就像Math对象）。

- Reflect.apply(target, thisArgument, argumentsList)
对一个函数进行调用操作，同时可以传入一个数组作为调用参数。和 Function.prototype.apply() 功能类似。

- Reflect.construct(target, argumentsList[, newTarget])
对构造函数进行 new 操作，相当于执行 new target(...args)。

- Reflect.defineProperty(target, propertyKey, attributes)
和 Object.defineProperty() 类似。如果设置成功就会返回 true

- Reflect.deleteProperty(target, propertyKey)
作为函数的delete操作符，相当于执行 delete target[name]。

- Reflect.get(target, propertyKey[, receiver])
获取对象身上某个属性的值，类似于 target[name]。

- Reflect.getOwnPropertyDescriptor(target, propertyKey)
类似于 Object.getOwnPropertyDescriptor()。如果对象中存在该属性，则返回对应的属性描述符,  否则返回 undefined.

- Reflect.getPrototypeOf(target)
类似于 Object.getPrototypeOf()。

- Reflect.has(target, propertyKey)
判断一个对象是否存在某个属性，和 in 运算符 的功能完全相同。

- Reflect.isExtensible(target)
类似于 Object.isExtensible().

- Reflect.ownKeys(target)
返回一个包含所有自身属性（不包含继承属性）的数组。(类似于 Object.keys(), 但不会受enumerable影响).

- Reflect.preventExtensions(target)
类似于 Object.preventExtensions()。返回一个Boolean。

- Reflect.set(target, propertyKey, value[, receiver])
将值分配给属性的函数。返回一个Boolean，如果更新成功，则返回true。

- Reflect.setPrototypeOf(target, prototype)
设置对象原型的函数. 返回一个 Boolean， 如果更新成功，则返回true。