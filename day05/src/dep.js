let depid = 0;

class Dep {

    constructor() {
      this.id = depid++;
      this.subs = []; // 存储的是与 当前 Dep 关联的 watcher
    }
  
    /** 添加一个 watcher */
    addSub( sub ) {
        this.subs.push(sub);
    }
    /** 移除 */
    removeSub( sub ) {
        for (let i = this.subs.length; i > 0; i--) {
            if (sub == this.subs[i]) {
                this.subs.splice(i, 1);
            }
        }
    }
  
    /** 将当前 Dep 与当前的 watcher ( 暂时渲染 watcher ) 关联*/
    depend() {
        if (Dep.target) {
            this.addSub(Dep.target);
            Dep.target.addDep(this);
            console.log(Dep.target)
        }
    }
    /** 触发与之关联的 watcher 的 update 方法, 起到更新的作用 */
    notify() {
      // 在真实的 Vue 中是依次触发 this.subs 中的 watcher 的 update 方法
      // 此时deps已经关联到我们需要需要的watcher了
    //   if ( Dep.target ) {
        let deps = this.subs.slice();
        deps.forEach(watcher => {
            watcher.update();
        });
      }
    // }
  }
  

  Dep.target = null; // 这就是全局的 Watcher
  
  let targetStack = [];
  // 当前操作的watcher存储到全局watcher中
  function pushTarget(target) {
    targetStack.unshift(Dep.target);// [null]
    Dep.target = target;
  }
  // 将当前watcher 踢出
  function popTarget() {
    Dep.target = targetStack.shift();// null
  }

