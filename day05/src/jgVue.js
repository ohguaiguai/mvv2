function JGVue(options) {
    this._data = options.data;
    let elm = document.querySelector(options.el);// vue中是字符串，这里是dom
    this._template = elm;
    this._parent = elm.parentNode;
    
    this.initData();// 将data进行响应式转换并且代理

    this.mount();
}

