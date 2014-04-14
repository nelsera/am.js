am = {
	core: [
	],
	modules: [
	]
};
if (exports) {
	exports.source = am;
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
