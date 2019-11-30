function getVNode(node) {
    let nodeType = node.nodeType;
    let _vnode = null;
    // 元素
    if (nodeType === 1) {
        let nodeName = node.tagName;
        let attrs = node.attributes;
        let _attrObj = {};
        for (let i = 0; i < attrs.length; i++) { // attrs[i]是属性节点 nodeType = 2
            _attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
        }
        _vnode = new VNode(nodeName, _attrObj, undefined, nodeType);
        // 考虑node的子元素
        let childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            _vnode.appendChild(getVNode(childNodes[i]));// 递归
        }

    } else if (nodeType === 3) {
        _vnode = new VNode(undefined, undefined, node.nodeValue, nodeType);
    }
    return _vnode;
}
function parseVNode (vnode) {
    // 创建真实的dom
    let type = vnode.type;
    let _node = null;
    if (type === 3) {
        return document.createTextNode(vnode.value);// 创建文本节点
    } else if (type === 1) {
        _node = document.createElement(vnode.tag);

        // 属性
        let data = vnode.data;// 现在data是键值对
        Object.keys(data).forEach((key) => {
            let attrName = key;
            let attrValue = data[key];
            _node.setAttribute(attrName, attrValue);
        });
        // 子元素
        let children = vnode.children;
        children.forEach(subvnode => {
            _node.appendChild(parseVNode(subvnode));// 递归
        });
        return _node;
    }
}
let rkuohao = /\{\{(.+?)\}\}/g;
function getValueVByPath(obj, path) {
    let paths = path.split('.');// [xxx, yyy, zzz]

    let res = obj;
    let prop;
    while(prop = paths.shift()) {
        res = res[prop];
    }
    return res;
}

// 将带有坑的vnode与数据data结合得到填充数据的vnode
// 模拟 AST -> VNode
function combine(vnode, data) {
    let _tag = vnode.tag;
    let _data = vnode.data;
    let _value = vnode.value;
    let _type = vnode.type;
    let _children = vnode.children;

    let _vnode = null;
    if (_type === 3) {
        // 对文本处理
        _value = _value.replace(rkuohao, function(_, g) {
            return getValueVByPath(data, g.trim());
        });
        _vnode = new VNode(_tag, _data, _value, _type);
    } else if (_type === 1) {
        _vnode = new VNode(_tag, _data, _value, _type);
        _children.forEach( _subvnode => _vnode.appendChild(combine(_subvnode, data)));
    }
    return _vnode;
} 
