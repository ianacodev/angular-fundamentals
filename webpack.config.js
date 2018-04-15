// provides utilities for working with file and directory paths.
const path = require('path');
// provides an API for interacting with the file system.
const fs = require('fs');

// module bundler, its main purpose is to bundle JavaScript files for usage in a browser,
// yet it is also capable of transforming, bundling, or packaging just about any resource or asset.
const webpack = require('webpack');
// development server that provides live reloading. This should be used for development only.
const server = require('webpack-dev-server');
// speed up compilation and gives full control on how files are compiled utilizing the following:
// - has first-class integration with Babel and enables caching possibilities
// - able to fork type-checker and emitter to a separate process (webpack compilation will end earlier)
const ts = require('awesome-typescript-loader');
// terminal string styling.
const chalk = require('chalk');
// terminal progress bar graphic during webpack compilation.
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
// provides fake REST API
const jsonServer = require('json-server');

module.exports = {
  // Cache the generated webpack modules and chunks to improve build speed. Caching is enabled by default while in watch mode.
  cache: true,
  // These options allows you to control how webpack notifies you of assets and entrypoints that exceed a specific file limit.
  performance: {
    // Turns hints on/off. In addition, tells webpack to throw either an error or a warning when hints are found false | "error" | "warning"
    hints: false
  },
  // used to quickly develop an application.
  devServer: {
    // Tell the server where to serve content from
    contentBase: path.resolve(__dirname),
    // Enable gzip compression for everything served. Compression is a simple, effective way to save bandwidth and speed up your site
    // 1**
    compress: true,
    // script will be inserted in your bundle to take care of live reloading, and build messages will appear in the browser console.\
    // Inline mode is recommended for Hot Module Replacement as it includes an HMR trigger from the websocket.
    // It is also possible to use iframe mode, which uses an <iframe> under a notification bar with messages about the build. (inline: false)
    inline: true,
    // enable webpack's Hot Module Replacement feature.
    hot: true,
    // specify a port number to listen for requests on
    port: 4000,
    // the bundled files will be available in the browser under this path.
    // by default the publicPath is "/", publicPath can be changed so the bundle is put in a directory.
    publicPath: '/build/',
    // nothing except the initial startup information will be written to the console.
    // This also means that errors or warnings from webpack are not visible.
    quiet: true,
    // using the HTML5 History API, the index.html page will likely have to be served in place of any 404 responses.
    historyApiFallback: true,
    // Provides the ability to execute custom middleware prior to all other middleware internally within the server. This could be used to define custom handlers
    before: function(app) {
      app.use('/api/', jsonServer.router('db.json'));
    },
    // lets you precisely control what bundle information gets displayed.
    // this option has no effect when used with quiet or noInfo
    stats: {
      // Add chunk information (setting this to `false` allows for a less verbose output)
      chunks: false,
      // Add built modules information to chunk information
      chunkModules: false
    }
  },
  // option controls if and how source maps are generated
  // 2**
  devtool: 'sourcemap',
  //  default the current directory is used, but it's recommended to pass a value in your configuration
  // this makes your configuration independent from CWD
  // The context is an absolute string to the directory that contains the entry files.
  context: path.join(__dirname),
  // where webpack looks to start building the bundle
  entry: {
    app: ['reflect-metadata', 'ts-helpers', 'zone.js', 'main']
  },
  // contains set of options instructing webpack on how and where it should output your bundles,
  //assets and anything else you bundle or load with webpack.
  output: {
    // this option determines the name of non-entry chunk files (ie files not in the above entry property)
    chunkFilename: '[name].chunk.js',
    // option determines the name of each output bundle
    filename: '[name].bundle.js',
    // output directory as an absolute path.
    path: path.resolve(__dirname, 'build'),
    // option when using on-demand-loading or loading external resources like images, files, etc.
    // This option specifies the public URL of the output directory when referenced in a browser
    publicPath: '/build/',
    // option is only used when devtool uses a SourceMap option which writes an output file
    // configures how source maps are named.
    sourceMapFilename: '[name].map'
  },
  // these options determine how the different types of modules within a project will be treated.
  module: {
    // An array of Rules which are matched to requests when modules are created.
    // These rules can modify how the module is created. They can apply loaders to the module, or modify the parser.
    rules: [
      // typescript rule.
      {
        // Rule.test is a shortcut to Rule.resource.test
        test: /\.ts$/,
        // A list of UseEntries which are applied to modules. Each entry specifies a loader to be used.
        use: [
          {
            loader: 'awesome-typescript-loader'
          },
          {
            // searches for templateUrl and styleUrls declarations inside of the Angular 2 Component metadata
            // and replaces the paths with the corresponding require statement
            // The generated require statements will be handled by the given loader for .html and .js
            // 3**
            loader: 'angular2-template-loader'
          }
        ],
        // Rule.include is a shortcut to Rule.resource.include
        include: [path.resolve(__dirname, 'app')]
      },
      // html rule
      {
        test: /\.html$/,
        // Loads raw content of a file (utf-8)
        // A loader for webpack that allows importing files as a String
        loader: 'raw-loader'
      },
      // sass rule
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'raw-loader'
          },
          {
            // Webpack loader that resolves relative paths in url() statements based on the original source file
            // Use in conjunction with the sass-loader and specify your asset url() relative to the .scss file in question.
            loader: 'resolve-url-loader'
          },
          {
            // Loads a Sass/SCSS file and compiles it to CSS
            // Use the css-loader or the raw-loader to turn it into a JS module
            // and the ExtractTextPlugin (mini css plugin) to extract it into a separate file
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  // These options configure whether to polyfill or mock certain Node.js globals and modules.
  // This allows code originally written for the Node.js environment to run in other environments like the browser.
  // This is an object where each property (key) is the name of a Node global or module and each value may be one of the following
  // 4**
  node: {
    fs: 'empty',
    global: true,
    crypto: 'empty'
  },
  // customize the webpack build process in a variety of ways.
  plugins: [
    // The DllPlugin and DllReferencePlugin provide means to split bundles
    // in a way that can drastically improve build time performance.
    new webpack.DllReferencePlugin({
      // (absolute path) context of requests in the manifest (or content property)
      context: './',
      // an object containing content and name or a string to the absolute path of the JSON manifest to be loaded upon compilation
      // Using manifest.json, you specify basic metadata about your extension such as the name and version
      manifest: require(path.resolve(__dirname, 'vendor/vendor-manifest.json'))
    }),
    // This plugin will cause the relative path of the module to be displayed when HMR is enabled. Suggested for use in development.
    new webpack.NamedModulesPlugin(),
    // terminal progress bar graphic for webpack compilation.
    new ProgressBarPlugin({
      // the format of the progress bar
      format:
        chalk.magenta.bold('build') +
        ' [' +
        chalk.green(':bar') +
        '] ' +
        chalk.green.bold(':percent') +
        ' ' +
        chalk.yellow.bold(':elapsed seconds') +
        ' ' +
        chalk.white(':msg'),
      // option to clear the bar on completion
      clear: false
    }),
    // If you want to use new paths and baseUrl feature of TS 2.0 please include TsConfigPathsPlugin.
    new ts.TsConfigPathsPlugin(),
    // Use it if you want async error reporting.
    // We need this plugin to detect a `--watch` mode. It may be removed later
    new ts.CheckerPlugin(),
    // enables Hot Module Replacement, otherwise known as HMR.
    // Hot Module Replacement (HMR) exchanges, adds, or removes modules
    // while an application is running, without a full reload
    new webpack.HotModuleReplacementPlugin()
  ],
  // Configure how modules are resolved
  resolve: {
    // Automatically resolve certain extensions
    extensions: ['.ts', '.js'],
    // tell webpack what directories should be searched when resolving modules
    modules: ['node_modules', __dirname]
  }
};

/**
 * 1** (devserver.compress)
 * If we could send a .zip file to the browser (index.html.zip) instead of plain old index.html,
 * we’d save on bandwidth and download time. The browser could download the zipped file, extract it,
 * and then show it to user, who’s in a good mood because the page loaded quickly.
 *
 * 2** (devtool sourcemap)
 * Choose a style of source mapping to enhance the debugging process
 * https://webpack.js.org/configuration/devtool/
 *
 * 3** (angular2 template loader)
 * In order to improve performance, Angular compiles templates into TypeScript code.
 * The easiest solution for this is Just in Time (JIT) compilation which is performed in the browser,
 * after all the application files are downloaded. To speed up the program start, one can also compile
 * the templates at build time, which is called Ahead of Time (AOT) compilation
 *
 * 4** (node)
 * This is an object where each property is the name of a Node global or module and each value may be one of the following...
 * true: Provide a polyfill.
 * "mock": Provide a mock that implements the expected interface but has little or no functionality.
 * "empty": Provide an empty object.
 * false: Provide nothing. Code that expects this object may crash with a ReferenceError. Code that attempts to import the module using require('modulename') may trigger a Cannot find module "modulename" error.
 */

/*
 The project uses webpack to build and compile all of our assets. This will do the following for us:

Compile all our TypeScript code into JavaScript (starting from main.ts and branching outwards from imported files)
Bundle all our JavaScript into one file to use
Allow us to use Sass for our component's CSS files
Provide the polyfills needed to run our app in all modern browsers
Mock a JSON backend using json-server
*/
