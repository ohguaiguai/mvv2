# 函数柯里化
- [函数式编程](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/)
  
概念:

  1. 柯里化： 一个函数原本有多个参数，现在只传入一个参数，构造一个新函数，这个新函数来接收剩下的参数
  2. 偏函数：一个函数原本有多个参数，现在只传入`一部分`参数，构造一个新函数，这个新函数来接收剩下的参数
  3. 高阶函数： 一个函数的参数是一个函数，该函数对这个参数进行加工得到一个函数，这个用来加工的函数就是高阶函数

为什么要使用柯里化？
为了提升性能，使用柯里化可以缓存一部分行为。

例子：
1. 判断元素
2. 虚拟dom的render方法

1. 判断元素

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
	- Vue2中的缺陷，数组发生变化，设置length没法通知(Vue3.0中使用Proxy 来解决)
2. 新添加的元素应该变成响应式的

技巧：如果一个函数已经定义了但是需要扩展其功能。我们一般的处理办法：
1. 使用临时的函数名来存储函数
2. 重新定义原来的函数
3. 定义扩展的功能
4. 调用临时的函数

扩展数组的push和pop方法 怎么处理？
- 直接修改prototype **不行**
- 修改要进行响应式化的数组的原型(__proto__)

已经将对象改成响应式了，但是如果直接给对象赋值另一个对象，那么久不是响应式了，怎么办？