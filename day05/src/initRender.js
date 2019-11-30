JGVue.prototype.mount = function() {
    // 需要提供一个render方法： 生成虚拟dom
    this.render = this.createRenderFn();

    this.mountComponent();
}
JGVue.prototype.mountComponent = function() {
    
    // 执行mountComponent() 函数
    let mount = () => {
        this.update(this.render());
    }
    // 这个wather 就是全局的watcher, 在任何一个地方都可以访问
    new Watcher(this, mount);

    // this.update(this.render()) 之所以不这么写的原因是 要使用发布订阅者模式，渲染和计算的行为要交给watcher来完成
}
/**
 * 在真正的Vue中使用了 二次提交的 设计结构
 * 1. 在页面中的dom和虚拟dom是一一对应的关系
 * 2. 当数据变化时，先由AST和数据生成新的vnode（第一次），新的vnode和旧的vnode做diff比较（第二次），相同的不管，不同的更新
*/
// 生成render函数，目的是缓存抽象语法树 (这里用虚拟dom来模拟)
JGVue.prototype.createRenderFn = function() {
    let ast = getVNode(this._template);// 旧的vnode
    // console.log(ast);
    // Vue: 将AST + data => VNode
    // 简化： 带坑的 vnode + data => 含有数据的VNode
    return function render() {
        // 将带坑的vnode转换为带数据的vnode
        let _tmp = combine(ast, this._data);
        // console.log(_tmp);
        return _tmp;
    }
}
// vue源码中将虚拟dom渲染到页面中： diff算法
JGVue.prototype.update = function(vnode) {
    // 简化， 直接生成HTML DOM replaceChild 到页面中
    // 父元素.replaceChild(newChild, oldChild)
    let realDOM = parseVNode(vnode);
    // console.log('realDOM', realDOM);
    this._parent.replaceChild(realDOM, document.querySelector('#root'));
    // 这个算法是不负责任的，每次都会将页面中的DOM全部替换
}