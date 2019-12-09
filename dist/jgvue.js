(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.jgvue = factory());
}(this, (function () { 'use strict';

    function help() {
        console.log('啊啊啊啊');
    }

    function ind(options) {
        this.options = options;
        help();
    }

    return ind;

})));
