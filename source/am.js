'use strict';

AM.Sprite = function (element, options) {

    //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //|
    //| Private properties
    //| only priveleged methods may view/edit/invoke
    //|
    //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    var $this = this,
    	$static = $this.constructor.static,
    	$bgPoint = getBackgroundOffsetFrom(element),
    	$bgUrl = getBackgroundImageFrom(element),
    	$factor = 1,
    	$requestID = null,
    	$vars = {};

    //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //|
    //| Public properties - Anyone may read/write
    //|
    //|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    $this.id = ($static.instances++);
    $this.name = 'AM[Sprite_' + $this.id + ']';
    $this.element = element;
    $this.image = { url: $bgUrl, x: $bgPoint.x, y: $bgPoint.y, object: new Image() };
    $this.options = merge($static.defaults, options);
    $this.fps = num($this.options.fps);
    $this.totalFrames = Math.max(1, $this.options.totalFrames - 1);
    $this.currentFrame = bound($this.options.currentFrame, 1, $this.totalFrames);
    $this.vertical = bool($this.options.vertical);
    $this.tileW = (num($this.options.tileW) || element.clientWidth);
    $this.tileH = (num($this.options.tileH) || element.clientHeight);
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

    $this.load = function (vars) {
    	vars = typeOf(vars) === 'object' ? vars : {};
		$this.image.object.src = $this.image.url;
		$this.image.object.onload = function () {
			$this.image.width = $this.image.object.width;
			$this.image.height = $this.image.object.height;
			if (typeof vars.onLoad === 'function') {
                vars.onLoad.apply($this, vars.onLoadParams);
            }
		};
    };

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

    $this.playToBeginAndStop = function (vars) {
        $this.play(0, vars);
    };

    $this.playToEndAndStop = function (vars) {
        $this.play($this.totalFrames, vars);
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

    function merge(defaults, options) {
		var option, output = {};
		options = typeOf(options) === 'object' ? options : {};
		for (option in defaults) {
			var dataset = data(option);
			if (options.hasOwnProperty(option) || dataset) {
				output[option] = options[option] || dataset;
			} else {
				output[option] = defaults[option];
			}
			window.console.log('option', option, output[option]);
		}
		return output;
	}

	function data(key, value) {
		if (!typeOf(value)) {
			return element.getAttribute('data-' + key);
		}
		element.setAttribute('data-' + key, value);
	}

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
        $static.animations[id] = { timeout:0, rAF:0 };
        params = Array.prototype.slice.call(arguments, 0);
        params.splice(0, 3);
        (function run() {
            $static.animations[id].timeout = window.setTimeout(function() {
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
        $this.offsetX = $this.timeline[$this.currentFrame - 1].x + $this.image.x;
        $this.offsetY = $this.timeline[$this.currentFrame - 1].y + $this.image.y;
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
