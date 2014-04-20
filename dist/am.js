/**
 * am.js
 * @author Adrian C. Miranda
 * @description AM is a personal javascript library
 * @version v0.0.0
 * @link https://github.com/adriancmiranda/am.js
 * @license MIT
 */
(function (window, document, AM, undefined) {
    //| .-------------------------------------------------------------------.
    //| | NAMING CONVENTIONS:                                               |
    //| |-------------------------------------------------------------------|
    //| | Singleton-literals and prototype objects      | PascalCase        |
    //| |-------------------------------------------------------------------|
    //| | Functions and public variables                | camelCase         |
    //| |-------------------------------------------------------------------|
    //| | Global variables and constants                | UPPERCASE         |
    //| |-------------------------------------------------------------------|
    //| | Private variables                             | _underscorePrefix |
    //| '-------------------------------------------------------------------'
    //|
    //| Comment syntax for the entire project follows JSDoc:
    //| @see http://code.google.com/p/jsdoc-toolkit/wiki/TagReference
    //'
    'use strict';
    (function () {
        var i, lastTime, vendors, rAF, cAF, cRF;
        lastTime = 0;
        vendors = ['ms', 'moz', 'webkit', 'o'];
        for (i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
            rAF = vendors[i] + 'RequestAnimationFrame';
            cAF = vendors[i] + 'CancelAnimationFrame';
            cRF = vendors[i] + 'CancelRequestAnimationFrame';
            window.requestAnimationFrame = window[rAF];
            window.cancelAnimationFrame = window[cAF] || window[cRF];
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback, element) {
                var currTime, timeToCall, id;
                currTime = new Date().getTime();
                timeToCall = Math.max(0, 16 - (currTime - lastTime));
                id = window.setTimeout(function () {
                    callback(currTime + timeToCall, element);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                window.clearTimeout(id);
            };
        }
    }());
    function isBrowser(name) {
        var browser = {}, ua = navigator.userAgent.toLowerCase(), info = /(chrome)[ \/]([\w.]+)/.exec(ua) || ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || [];
        if (info[1]) {
            browser[info[1]] = true;
            browser.version = info[2] || '0';
        }
        // Chrome is Webkit, but
        // Webkit is also Safari.
        // Mozilla is Firefox.
        // MSIE is IE
        if (browser.chrome) {
            browser.webkit = true;
        } else if (browser.webkit) {
            browser.safari = true;
        } else if (browser.mozilla) {
            browser.firefox = true;
        } else if (browser.msie) {
            browser.ie = true;
        }
        return name ? browser[name] : browser;
    }
    function getDefinitionName(value, strict) {
        if (value === false) {
            return 'Boolean';
        }
        if (value === '') {
            return 'String';
        }
        if (value === 0) {
            return 'Number';
        }
        if (value && value.constructor) {
            var name = (value.constructor.toString() || Object.prototype.toString.apply(value)).replace(/^.*function([^\s]*|[^\(]*)\([^\x00]+$/, '$1').replace(/^(\[object\s)|]$/g, '').replace(/\s+/, '') || 'Object';
            if (strict !== true) {
                if (!/^(Boolean|RegExp|Number|String|Array|Date)$/.test(name)) {
                    return 'Object';
                }
            }
            return name;
        }
        return value;
    }
    function typeOf(value, strict) {
        var type = typeof value;
        if (value === false) {
            return 'boolean';
        }
        if (value === '') {
            return 'string';
        }
        if (value && type === 'object') {
            type = getDefinitionName(value, strict);
            type = String(type).toLowerCase();
        }
        if (type === 'number' && !window.isNaN(value) && window.isFinite(value)) {
            if (strict === true && window.parseFloat(value) === window.parseInt(value, 10)) {
                return value < 0 ? 'int' : 'uint';
            }
            return 'number';
        }
        return value ? type : value;
    }
    function bool(value) {
        if (typeOf(value) === 'string') {
            return /^(true|(^[1-9][0-9]*$)$|yes|y|sim|s|on)$/gi.test(value);
        }
        return !!value;
    }
    function bound(value, min, max) {
        num(value);
        num(min);
        num(max);
        return value > max ? max : value < min ? min : value;
    }
    function mod(value, min, max) {
        num(value);
        num(min);
        num(max);
        value = value % max;
        return value < min ? value + max : value;
    }
    function uint(value) {
        value = int(value);
        return value < 0 ? 0 : value;
    }
    function int(value) {
        return 0 | window.parseInt(value, 10);
    }
    function num(value, ceiling) {
        value = window.parseFloat(value);
        value = window.isNaN(value) || !window.isFinite(value) ? 0 : value;
        if (ceiling === true) {
            value = window.parseInt(value * 10000, 10) / 10000;
        }
        return value;
    }
    function MovieClip(element, options) {
    }
}(this, this.document, this.AM = this.AM || {}));