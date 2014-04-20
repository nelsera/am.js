'use strict';

function isBrowser(name) {
	var browser = {},
	ua = navigator.userAgent.toLowerCase(),
	info = /(chrome)[ \/]([\w.]+)/.exec(ua)
	|| ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)
	|| /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)
	|| /(webkit)[ \/]([\w.]+)/.exec(ua)
	|| /(msie) ([\w.]+)/.exec(ua)
	|| [];
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
		var name = (value.constructor.toString() || Object.prototype.toString.apply(value))
		.replace(/^.*function([^\s]*|[^\(]*)\([^\x00]+$/, '$1')
		.replace(/^(\[object\s)|]$/g, '')
		.replace(/\s+/, '') || 'Object';
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
	return((value > max) ? max : (value < min ? min : value));
}

function mod(value, min, max) {
	num(value);
	num(min);
	num(max);
	value = value % max;
	return((value < min) ? (value + max) : value);
}

function uint(value) {
	value = int(value);
	return value < 0 ? 0 : value;
}

function int(value) {
	return(0 | window.parseInt(value, 10));
}

function num(value, ceiling) {
	value = window.parseFloat(value);
	value = (window.isNaN(value) || !window.isFinite(value)) ? 0 : value;
	if (ceiling === true) {
		value = window.parseInt(value * 10000, 10) / 10000;
	}
	return value;
}
