'use strict';

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
		column = (vertical ? ~~(id / columns) : (id % columns));
		row = (vertical ? (id % columns) : ~~(id / columns));
		offsetX = (Math.round(width + marginX) * column);
		offsetY = (Math.round(height + marginY) * row);
		positions.push({
			column: column,
			row: row,
			x: (0 - offsetX),
			y: (0 - offsetY),
			frame: id,
			label: ''
		});
	}
	return positions;
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
