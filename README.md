![AM](http://i.imgur.com/CEEbHaw.gif)

> A personal JavaScript library. 

[![build status][travis_build_status_image]][travis_build_status_url] [![dependencies status][david_dependencies_status_image]][david_dependencies_status_url] [![devDependency status][david_devdependencies_status_image]][david_devdependencies_status_url]

<!-- travis -->
[travis_build_status_image]: https://travis-ci.org/adriancmiranda/am.js.png?branch=master
[travis_build_status_url]: https://travis-ci.org/adriancmiranda/am.js "build status"

<!-- david dependencies -->
[david_dependencies_status_image]: https://david-dm.org/adriancmiranda/am.js.png?theme=shields.io
[david_dependencies_status_url]: https://david-dm.org/adriancmiranda/am.js "dependencies status"

<!-- david devDependencies -->
[david_devdependencies_status_image]: https://david-dm.org/adriancmiranda/am.js/dev-status.png?theme=shields.io
[david_devdependencies_status_url]: https://david-dm.org/adriancmiranda/am.js#info=devDependencies "devDependencies status"

## How to build your own __AM__

Clone a copy of the main __AM__ git repo by running:

```bash
git clone git@github.com:adriancmiranda/am.js.git && cd am.js
```

Run the build script:

```bash
npm run build
```

The built version of __AM__ will be put in the `dist/` subdirectory, along with the minified copy and associated map file.

## Usage

```javascript
var sprite = new AM.Sprite($('.sprite')[0], {
    vertical: true,  // Optional: Reading Order.
    currentFrame: 1, // Optional: Number of first frame in sprite.
    totalFrames: 35, // Required: Number of frames in sprite.
    tileW: 146,      // Optional: Set the frame width manually.
    tileH: 54,       // Optional: Set the frame height manually.
    columns: 6,      // Required: Number of columns in sprite.
    rows: 6,         // Required: Number of rows in sprite.
    fps: 24          // Optional: Frames per second.
});
sprite.play();
```

## License
[MIT](https://github.com/adriancmiranda/generator-gulp-requirejs/blob/master/LICENSE "MIT LICENSE")
