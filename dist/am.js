/**
 * am.js
 * @author Adrian C. Miranda
 * @description AM is a personal javascript library
 * @version v0.0.1
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
    function merge(defaults, options) {
        var option, output = {};
        options = typeOf(options) === 'object' ? options : {};
        for (option in defaults) {
            output[option] = (options.hasOwnProperty(option) ? options : defaults)[option];
        }
        return output;
    }
    function gridLayout(length, columns, width, height, marginX, marginY, vertical) {
        var id, row, column, offsetX, offsetY, positions = [];
        for (id = 0; id < length; id++) {
            column = vertical ? ~~(id / columns) : id % columns;
            row = vertical ? id % columns : ~~(id / columns);
            offsetX = Math.round(width + marginX) * column;
            offsetY = Math.round(height + marginY) * row;
            positions.push({
                column: column,
                row: row,
                x: 0 - offsetX,
                y: 0 - offsetY,
                frame: id,
                label: ''
            });
        }
        return positions;
    }
    function getBackgroundPositionFrom(element) {
        var position = (getStyle(element, 'backgroundPosition') || getStyle(element, 'backgroundPositionX') + ' ' + getStyle(element, 'backgroundPositionY')).replace(/left|top/gi, 0).split(' ');
        return {
            x: int(position[0]),
            y: int(position[1])
        };
    }
    function getStyle(element, property) {
        if (window.getComputedStyle) {
            return window.getComputedStyle(element, null)[property];
        }
        return element.currentStyle[property];
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
    function num(value, ceiling) {
        value = window.parseFloat(value);
        value = window.isNaN(value) || !window.isFinite(value) ? 0 : value;
        if (ceiling === true) {
            value = window.parseInt(value * 10000, 10) / 10000;
        }
        return value;
    }
    function bool(value) {
        if (typeOf(value) === 'string') {
            return /^(true|(^[1-9][0-9]*$)$|yes|y|sim|s|on)$/gi.test(value);
        }
        return !!value;
    }
    function bound(value, min, max) {
        value = num(value);
        min = num(min);
        max = num(max);
        return value > max ? max : value < min ? min : value;
    }
    function mod(value, min, max) {
        value = num(value);
        min = num(min);
        max = num(max);
        value = value % max;
        return num(value < min ? value + max : value);
    }
    function uint(value) {
        value = int(value);
        return value < 0 ? 0 : value;
    }
    function int(value) {
        return 0 | window.parseInt(value, 10);
    }
    AM.Sprite = function (element, options) {
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //|
        //| Private properties
        //| only priveleged methods may view/edit/invoke
        //|
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        var $this = this, $static = $this.constructor.static, $bgPoint = getBackgroundPositionFrom(element), $factor = 1, $requestID = null, $vars = {};
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //|
        //| Public properties - Anyone may read/write
        //|
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        $this.id = $static.instances++;
        $this.name = 'AM[Sprite_' + $this.id + ']';
        $this.element = element;
        $this.options = merge($static.defaults, options);
        $this.fps = num($this.options.fps);
        $this.totalFrames = Math.max(1, $this.options.totalFrames - 1);
        $this.currentFrame = bound($this.options.currentFrame, 1, $this.totalFrames);
        $this.vertical = bool($this.options.vertical);
        $this.tileW = num($this.options.tileW) || element.clientWidth;
        $this.tileH = num($this.options.tileH) || element.clientHeight;
        $this.columns = uint($this.options.columns);
        $this.rows = uint($this.options.rows);
        $this.column = num($this.currentFrame % $this.rows);
        $this.row = ~~($this.currentFrame / $this.columns);
        $this.timeline = gridLayout($this.totalFrames, $this.vertical ? $this.rows : $this.columns, $this.tileW, $this.tileH, 0, 0, $this.vertical);
        $this.lastFrame = $this.currentFrame;
        $this.targetNextFrame = 0;
        $this.targetFrame = 0;
        $this.offsetX = 0;
        $this.offsetY = 0;
        $this.reverse = false;
        $this.running = false;
        $this.looping = false;
        $this.yoyo = false;
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //|
        //| Privileged methods:
        //| may be invoked publicly and may access private items
        //| may not be changed; may be replaced with public flavors
        //|
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        $this.play = function (frame, vars) {
            $this.pause();
            if (typeOf(frame, true) === 'uint') {
                $vars = typeOf(vars) === 'object' ? vars : {};
                $this.targetFrame = bound(frame, 1, $this.totalFrames);
                $this.reverse = $this.currentFrame > $this.targetFrame;
                $factor = $this.reverse ? -1 : 1;
                if (typeof $vars.onInit === 'function') {
                    $vars.onInit.apply($this, $vars.onInitParams);
                }
            } else {
                $this.targetFrame = 0;
            }
            $requestID = setAnimation(onUpdateFrames, $this.element, $this.fps);
            $this.running = true;
            if (typeof $vars.onStart === 'function') {
                $vars.onStart.apply($this, $vars.onStartParams);
            }
        };
        $this.pause = function () {
            clearAnimation($requestID);
            $requestID = null;
            $this.running = false;
        };
        $this.togglePause = function () {
            $this[$requestID ? 'pause' : 'play']();
        };
        $this.stop = function () {
            drawFrame(0);
            $this.pause();
            $this.running = false;
        };
        $this.playToBeginAndStop = function () {
            $this.play(0);
        };
        $this.playToEndAndStop = function () {
            $this.play($this.totalFrames);
        };
        $this.gotoRandomFrame = function () {
            $this.gotoAndStop(~~(Math.random() * $this.totalFrames));
        };
        $this.gotoAndPlay = function (frame) {
            drawFrame(frame);
            $this.play();
            $this.running = true;
        };
        $this.gotoAndStop = function (frame) {
            drawFrame(frame);
            $this.pause();
            $this.running = false;
        };
        $this.nextFrame = function () {
            $this.jumpFrames(0 + 1);
            $this.running = false;
        };
        $this.prevFrame = function () {
            $this.jumpFrames(0 - 1);
            $this.running = false;
        };
        $this.jumpFrames = function (amount) {
            $this.gotoAndStop($this.currentFrame + int(amount));
        };
        $this.loopBetween = function (from, to, yoyo, vars) {
            from = bound(from, 1, $this.totalFrames);
            to = bound(to, 0, $this.totalFrames);
            $this.gotoAndStop(from);
            $this.running = true;
            $this.looping = true;
            $this.yoyo = bool(yoyo);
            $this.targetNextFrame = from;
            if (to === 0) {
                to = $this.totalFrames;
            }
            $this.play(to, vars);
        };
        $this.cancelLooping = function () {
            $this.running = false;
            $this.looping = false;
            $this.yoyo = false;
        };
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //|
        //| Private functions
        //| only priveleged methods may view/edit/invoke
        //|
        //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        function setAnimation(callback, element, fps) {
            var params, id;
            if (typeOf(callback) !== 'function') {
                return;
            }
            if (typeOf(element) === 'number') {
                fps = element;
                element = null;
            }
            id = ++$static.animationID;
            fps = 1000 / bound(fps || 10, 1, 60);
            $static.animations[id] = {
                timeout: 0,
                rAF: 0
            };
            params = Array.prototype.slice.call(arguments, 0);
            params.splice(0, 3);
            (function run() {
                $static.animations[id].timeout = window.setTimeout(function () {
                    $static.animations[id].rAF = window.requestAnimationFrame(run, element);
                    callback.apply(null, params);
                }, fps);
            }());
            return id;
        }
        function clearAnimation(id) {
            if (typeOf($static.animations[id])) {
                window.clearTimeout($static.animations[id].timeout);
                window.cancelAnimationFrame($static.animations[id].rAF);
                delete $static.animations[id];
            }
        }
        function drawFrame(frame) {
            $this.lastFrame = $this.currentFrame;
            $this.currentFrame = mod(frame, 1, $this.totalFrames);
            $this.row = $this.timeline[$this.currentFrame - 1].row;
            $this.column = $this.timeline[$this.currentFrame - 1].column;
            $this.offsetX = $this.timeline[$this.currentFrame - 1].x + $bgPoint.x;
            $this.offsetY = $this.timeline[$this.currentFrame - 1].y + $bgPoint.y;
            $this.element.style.backgroundPosition = $this.offsetX + 'px ' + $this.offsetY + 'px';
        }
        function onUpdateFrames() {
            if (typeof $vars.onUpdate === 'function') {
                $vars.onUpdate.apply($this, $vars.onUpdateParams);
            }
            if ($this.currentFrame < $this.targetFrame) {
                drawFrame($this.currentFrame + $factor);
            } else if ($this.currentFrame > $this.targetFrame) {
                drawFrame($this.currentFrame + $factor);
            } else if ($this.currentFrame === $this.targetFrame) {
                if ($this.looping) {
                    if ($this.yoyo) {
                        $this.loopBetween($this.currentFrame, $this.targetNextFrame, $this.yoyo, $vars);
                    } else {
                        $this.loopBetween($this.targetNextFrame, $this.currentFrame, $this.yoyo, $vars);
                    }
                } else {
                    $this.pause();
                    if (typeof $vars.onComplete === 'function') {
                        $vars.onComplete.apply($this, $vars.onCompleteParams);
                    }
                }
            }
        }
    };
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //
    // Static - Anyone may read/write
    //
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    AM.Sprite.static = {
        instances: 0,
        animationID: 0,
        animations: {},
        defaults: {
            fps: 24,
            totalFrames: 1,
            currentFrame: 1,
            vertical: false,
            tileW: 0,
            tileH: 0,
            columns: 0,
            rows: 0
        }
    };
}(this, this.document, this.AM = this.AM || {}));