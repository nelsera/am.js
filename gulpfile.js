(function (gulp, gulpLoadPlugins, pkg) {
	'use strict';
	//|**
	//|
	//| Gulpfile
	//|
	//| This file is the streaming build system
	//|
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
	//| - http://code.google.com/p/jsdoc-toolkit/wiki/TagReference
	//|
	//| For performance reasons we're only matching one level down:
	//| - 'test/spec/{,*/}*.js'
	//|
	//| Use this if you want to recursively match all subfolders:
	//| - 'test/spec/**/*.js'
	//|
	//'*/
	var $ = gulpLoadPlugins({ pattern: '*', lazy: true }),
		_ = { dist: './dist', test: './test' },
		source = require('./.amrc').source,
		inline = '// <%= pkg.name %>@v<%= pkg.version %>, <%= pkg.license[0].type %> licensed. <%= pkg.homepage %>\n',
		extended = [
		'/**',
		' * <%= pkg.name %>',
		' * @author <%= pkg.author.name %>',
		' * @description <%= pkg.description %>',
		' * @version v<%= pkg.version %>',
		' * @link <%= pkg.homepage %>',
		' * @license <%= pkg.license[0].type %>',
		' */\n'
	].join('\n');

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ validate
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	gulp.task('jsonlint', function() {
		var stream = gulp.src([
			'package.json',
			'bower.json',
			'.bowerrc',
			'.jshintrc',
			'.jscs.json'
		])
		.pipe($.plumber())
		.pipe($.jsonlint())
		.pipe($.jsonlint.reporter())
		.pipe($.notify({
			message: '<%= options.date %> ✓ jsonlint: <%= file.relative %>',
			templateOptions: {
				date: new Date()
			}
		}));
		return stream;
	});

	gulp.task('jshint', function () {
		var core = source['core'];
		var stream = gulp.src(wrap(core.files, core.name))
		.pipe($.plumber())
		.pipe($.notify({
			message: '<%= options.date %> ✓ jshint: <%= file.relative %>',
			templateOptions: {
				date: new Date()
			}
		}))
		.pipe($.concat('am.js'))
		.pipe($.removeUseStrict())
		.pipe($.jshint('.jshintrc'))
		.pipe($.jshint.reporter('default'))
		.pipe($.jscs());
		return stream;
	});

	gulp.task('mocha', function () {
		var stream = gulp.src(_.test + '/**/*.js')
		.pipe($.plumber())
		.pipe($.mocha({ reporter: 'list' }));
		return stream;
	});

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ compress
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	gulp.task('src', ['validate'], function () {
		var core = source['core'];
		var stream = gulp.src(wrap(core.files, core.name))
		.pipe($.plumber())
		.pipe($.notify({
			message: '<%= options.date %> ✓ src: <%= file.relative %>',
			templateOptions: {
				date: new Date()
			}
		}))
		.pipe($.concat(core.name + '.js'))
		.pipe($.removeUseStrict())
		.pipe($.header(extended, { pkg: pkg }))
		.pipe($.size())
		.pipe(gulp.dest(_.dist));
		return stream;
	});

	gulp.task('min', ['src'], function () {
		var core = source['core'];
		var min = gulp.src(_.dist + '/' + core.name + '.js')
		.pipe($.plumber())
		.pipe($.notify({
			message: '<%= options.date %> ✓ min: <%= file.relative %>',
			templateOptions: {
				date: new Date()
			}
		}))
		.pipe($.rename(core.name + '.min.js'))
		.pipe($.uglify())
		.pipe($.header(inline, { pkg: pkg }))
		.pipe($.size())
		.pipe(gulp.dest(_.dist));
		return min;
	});

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ versioning
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	gulp.task('bump', function () {
		var bumpType = process.env.BUMP || 'patch';
		var stream = gulp.src(['package.json', 'bower.json'])
		.pipe($.bump({ type: bumpType }))
		.pipe(gulp.dest('./'));
		return stream;
	});

	gulp.task('tag', ['bump', 'min'], function () {
		var version = 'v' + pkg.version;
		var message = 'Release ' + version;
		var stream = gulp.src('./')
		.pipe($.git.commit(message))
		.pipe($.git.tag(version, message))
		.pipe($.git.push('origin', 'master', '--tags'))
		.pipe($.gulp.dest('./'));
		return stream;
	});

	gulp.task('npm', ['tag'], function (done) {
		var process = require('child_process')
		.spawn('npm', ['publish'], { stdio: 'inherit' })
		.on('close', done);
		return process;
	});

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ default
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	gulp.task('clean', function () {
		var stream = gulp.src(_.dist, { read: false })
		.pipe($.plumber())
		.pipe($.clean());
		return stream;
	});

	gulp.task('default', function() {
		gulp.start('min');
	});

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ shortcuts
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	gulp.task('validate', ['jsonlint', 'jshint', 'mocha']);
	gulp.task('release', ['npm']);
	gulp.task('ci', ['min']);

	//|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//| ✓ utils
	//'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	function wrap(src, name) {
		src.unshift('source/' + name + '.prefix');
		src.push('source/' + name + '.suffix');
		return src;
	}

}(require('gulp'), require('gulp-load-plugins'), require('./package.json')));
