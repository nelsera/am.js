if (exports) {
	/**
	 * Source file collection
	 */
	var am = exports.source = {
		am: {
			'name':'am',
			'files':[
				'source/helpers/Polyfills.js',
				'source/AM.js',
				'source/helpers/Utils.js',
				'source/display/DisplayObject.js',
				'source/display/Sprite.js',
				'source/display/MovieClip.js'
			]
		}
	};

	/**
	 * @usage am.mergeFilesFor('karma');
	 * @return Array
	 */
	exports.mergeFilesFor = function() {
		var files = [];
		Array.prototype.slice.call(arguments, 0).forEach(function(filegroup) {
			am[filegroup].forEach(function(file) {
				// replace @ref
				var match = file.match(/^\@(.*)/);
				if (match) {
					files = files.concat(am[match[1]]);
				} else {
					files.push(file);
				}
			});
		});
		return files;
	};
}
