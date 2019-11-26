# 函数柯里化

- [函数式编程](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/)
  
概念:

  1. 柯里化： 一个函数原本有多个参数，现在构造一个加工函数，最终生成一个只传入一个参数的新函数，这个加工函数来接收剩下的参数
  2. 偏函数：一个函数原本有多个参数，现在只传入`一部分`参数，构造一个新函数，这个新函数来接收剩下的参数
  3. 高阶函数： 一个函数的参数是一个函数，该函数对这个参数进行加工得到一个函数，这个用来加工的函数就是高阶函数

为什么要使用柯里化？
为了提升性能，使用柯里化可以缓存一部分行为。

例子：

1. 判断元素
2. 虚拟dom的render方法

判断元素

vue本质上是使用HTML的字符串作为模板的，将字符串的模板转换为AST， 再转换为VNode

- 模板 -> AST
- AST -> VNode
- VNode -> DOM

哪一个阶段最消耗性能？
最消耗性能的是字符串解析（模板 -> AST）

例子：let s = "1+2*（3+4）" 写一个程序来解析这个表达式，得到结果(一般化)
我们一般会将这个表达式转换为”波兰式“表达式，然后使用栈结构来运算

1. 在Vue当中，每一个标签可以是真正的HTML标签，也可以是自定义组件，怎么区分？

在Vue源码中将所有可用的HTML标签已经存起来了

假设只考虑几个标签：

```js
let tag = 'div, p, a, img, ul, li'.split(',');
```

需要一个函数，判断一个标签是否为内置的标签

```js
function isHMTLTag(tagName) {
    tagName = tagName.toLowerCase();
    for (...) {
        if (tagName === tags[i]) return true;
    }
    return false;
}
```

模板是任意编写的，可以很简单也可以很复杂

如果有6种内置标签，而模板中有10个标签需要判断，那么就需要执行60次循环

2. 虚拟dom的render方法
思考：vue项目`模板转换为抽象语法树`需要执行几次？
- 页面一开始加载需要渲染
- 每一个属性(响应式)数据在发生变化时需要渲染
- watch， computed 

06-deepProps.html中每次需要渲染，模板就会被解析一次

render的作用是将虚拟dom转换为真正的dom加到页面中
- 虚拟dom可以降级理解为AST
- 一个项目运行的时候模板是不会变的，就表示AST是不会变的
  
我们可以将代码优化，将虚拟dom缓存起来，生成一个函数，函数只需要传入数据就可以得到真正的dom

# 响应式原理
- 我们在使用Vue的时候，赋值属性 获取属性都是直接使用的Vue实例
- 我们在设置属性值的时候，页面更新
```js
Object.defineProperty(obj, key, {
	writable
	configurable
	enumerable
	set
	get
})
```
实际开发中对象一般是有多级的
```js
let o = {
	list: [{}],
	user: {},
	ads: [{}]
}
```
怎么处理？递归

```js
function defineReactive(target, key, value, enumerable) {
            // 这个value只在函数内使用 (闭包)
            Object.defineProperty(target, key, {
                configurable: true,
                enumerable: !!enumerable,

                get() {
                    console.log(`读取o的${key}`);
                    return value;
                },
                set(newVal) {
                    console.log(`设置o的${key}`);
                    value = newVal;
                }
            })
        }

```

对于对象可以使用递归来响应式，但是数组也需要处理
- push
- pop
- shift
- unshift
- reverse
- sort

要做什么？
1. 改变数组的数据时发出通知
	- Vue2中的缺陷，数组发生变化，设置length没法通知(Vue3.0中使用Proxy 来解决)，因为数组不是响应式的，所以直接给数组赋值没法通知
2. 新添加的元素应该变成响应式的

技巧：如果一个函数已经定义了但是需要扩展其功能。我们一般的处理办法：
1. 使用临时的函数名来存储函数
2. 重新定义原来的函数
3. 定义扩展的功能
4. 调用临时的函数

扩展数组的push和pop方法 怎么处理？
- 直接修改prototype **不行**
- 修改要进行响应式化的数组的原型(__proto__)

已经将对象改成响应式了，但是如果直接给对象赋值另一个对象，那么就不是响应式了，怎么办？
```js
value = reactify(newVal);// set 中对新值进行响应化处理
```



- 代理方法(app.name app._data.name)
- 事件模型(借助于node的event模块)
- Vue中Observer 与 Watcher 和 Dep

代理方法，就是要将app._data 中的成员给映射到app上
由于需要在更新数据的时候更新页面的内容，所以app._data与app访问的成员应该是同一个成员
由于app._data已经是响应式的对象了，所以只需要让app访问的成员去访问app._data的对应成员就可以了

如： app.name 转换为 app._data.name

Vue中引入了一个函数proxy(target, src, prop), 将target的操作映射到src.prop上，这里是因为当时没有`Proxy`语法


# 发布订阅模式

目标：解耦，让各个模块之间没有紧密的联系

在Vue中，整个的更新是按照组件为单位进行**判断**，以节点为单位进行更新。

**目标，如果修改了什么属性，就尽可能只更新这些属性对应的页面DOM** 

这样就不能把更新的代码写死，就需要把各个模块之间解耦


1. 中间的全局容器，用来存储可以被触发的东西
2. 需要一个方法，可以往容器中传入东西
3. 需要一个方法，可以将容器中的东西取出来使用


vue中的发布订阅模式模型

页面变更(diff) 是以组件为单位

读取(getter)时， 会把所有组件对应的watcher都存储到全局的watcher中，这就是依赖收集
设置(setter)时，会把全局watcher中的watcher都取出来--触发,这叫派发更新

全局watcher中的watcher执行之后就移除了

第一次执行全局watcher中的watcher是什么时候？ getter中

- 如果页面中只有一个组件（vue实例）， 不会有性能损失
- 如果有多个组件，第一次会把所有组件对应的watcher存入到全局watcher中
  - 如果只修改了某一个组件的数据，只会对该组件进行diff算法，只重新生成该组件的抽象语法树，也就只会访问该组件的watcher，全局watcher中存储的只有该组件对应的watcher