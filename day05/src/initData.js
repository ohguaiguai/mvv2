let ARRAY_METHODS = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
];

let array_methods =  Object.create(Array.prototype);

ARRAY_METHODS.forEach((method) => {
    array_methods[method] = function() {
        // 调用原来的方法
        console.log('调用的是拦截的' + method + '方法');
        // 将新加入的数据进行响应式化
        for (let i = 0; i < arguments.length; i++) {
            observe(arguments[i]); // TODOZ 这里还是有问题, 引入watcher后处理
        }
        let res = Array.prototype[method].apply(this, arguments);
        return res;
    }
});

function defineReactive(target, key, value, enumerable) {
    // 这个value只在函数内使用 (闭包)
    if (typeof value === 'object' && value != null) {
        observe(value);
    }

    let dep = new Dep();

    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: !!enumerable,

        get() {
            console.log(`读取${key}`);
            dep.depend();
            return value;
        },
        set(newVal) {
            if(value == newVal) return;

            console.log(`设置${key}`);
            // 当新值为对象时也设置为响应式的
            if (typeof newVal === 'object' && newVal != null) {
                observe(newVal);
            } 
            value = newVal;

            // 派发更新, 找到全局的 watcher, 调用 update
            dep.notify();
        }
    })
}

// 将对象o变成响应式的, vm 就是vue实例，为了处理上下文
function observe (obj, vm) {
    // 之前没有对 obj 本身进行操作
    if (Array.isArray(obj)) {
        obj.__proto__ = array_methods; 
        for (let i = 0; i < obj.length; i++) {
            // 递归处理数组的每一个元素
            observe(obj[i], vm);
        }
    } else {
        let keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            let prop = keys[i];
            defineReactive.call(vm, obj, prop, obj[prop], true);
        }
    }
}

// 将某一个对象的 属性访问 映射到对象的某一个属性成员上
function proxy (target, prop, key) {
    Object.defineProperty(target, key, {
        enumerable: true,
        configurable: true,
        get() {
            return target[prop][key];
        },
        set (newVal) {
            target[prop][key] = newVal;
        }
    });
}

JGVue.prototype.initData = function() {
    // 遍历this._data，将属性转换为响应式
    // 将非递归属性代理到实例上
    let keys = Object.keys(this._data);
    // 响应式化
    observe(this._data);
    // 代理
    for (let i = 0; i < keys.length; i ++) {
        proxy(this, '_data', keys[i]);
    }
}
