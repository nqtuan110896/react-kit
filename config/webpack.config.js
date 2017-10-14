const path = require('path');
const webpack = require('webpack');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

const BASE_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.resolve(BASE_DIR, 'dist');
const SRC_DIR = path.resolve(BASE_DIR, 'src');

const DEV_PLUGINS = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(),
  new webpack.NoEmitOnErrorsPlugin()
];
const PRODUCTION_PLUGINS = [
  new webpack.HashedModuleIdsPlugin(/*{
    hashDigest: 'base64', // check out hash.digest
    hashDigestLength: 4,
    hashFunction: 'md5' // check out crypto.createHash
  }*/),
  // Note: UglifyJs currently does not support
  // minifying/uglifying ES2015+
  new webpack.optimize.UglifyJsPlugin({
    uglifyOptions: {
      compress: {
        drop_console: true,
        warnings: false
      },
      ecma: 6
    }
  })
];

module.exports = function(/*env*/{production}/*, argv*/) {
  // Base entry client (for MPA add extra chunks here)
  const baseClient = {
    main: [
      path.resolve(SRC_DIR, 'index.js')
    ]
  };

  // Get entry client based on environment,
  // adding 'react-hot-loader' client to each chunk,
  // while also adding a separate vendor chunk
  const client = (base => {
    if (!production) {
      for (let i = 0, chunks = Object.keys(base); i < chunks.length; ++i) {
        base[chunks[i]].unshift('react-hot-loader/patch');
      }
    }

    return Object.assign(base, {
      vendor: ['react']
    });
  })(baseClient);

  const extractStyles = new ExtractTextWebpackPlugin({
    allChunks: true,
    disable: !production,
    filename: 'css/[name]-[hash].min.css'
  });

  return {
    // context: BASE_DIR,
    devServer: production ? undefined : {
      compress: true,
      contentBase: PUBLIC_DIR,
      historyApiFallback: true,
      hot: true,
      hotOnly: true,
      inline: true,
      publicPath: '/assets/'
    },
    devtool: production ? undefined : 'cheap-module-eval-source-map',
    entry: client,
    module: {
      rules: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }, {
        test: /\.s[ac]ss$/,
        exclude: /node_modules/,
        loader: extractStyles.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }, {
            loader: 'sass-loader',
            options: {
              outputStyle: production ? 'compressed' : 'expanded',
              sourceMap: true
            }
          }]
        })
      }]
    },
    output: {
      chunkFilename: `js/[name]${production ? '-[chunkhash].min' : ''}.js`,
      filename: `js/[name]${production ? '-[hash].min' : ''}.js`,
      path: path.resolve(PUBLIC_DIR, 'assets'),
      publicPath: '/assets/'
    },
    plugins: [
      new CleanWebpackPlugin(['dist'], {
        root: BASE_DIR
      }),
      // Must include vendor chunk prior to other common chunks
      new webpack.optimize.CommonsChunkPlugin({
        filename: `js/vendor${production ? '-[hash].min' : ''}.js`,
        name: 'vendor'
      }),
      new webpack.optimize.CommonsChunkPlugin({
        filename: `js/commons${production ? '-[hash].min' : ''}.js`,
        name: 'commons'
      }),
      new webpack.DefinePlugin({
        __DEV__: !production,
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development')
      }),
      extractStyles,
      new HtmlWebpackPlugin({
        alwaysWriteToDisk: true,
        appMountId: 'react-root',
        externalCSS: [
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700%7CMaterial+Icons'
        ],
        filename: '../index.html',
        inject: false,
        minify: /* !production ? false : */ {
          caseSensitive: true,
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          preserveLineBreaks: false,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        mobile: true,
        template: require('html-webpack-template'),
        title: 'My Custom Homepage'
      }),
      new HtmlWebpackHarddiskPlugin(),
      ...(production ? PRODUCTION_PLUGINS : DEV_PLUGINS)
    ],
    resolve: {
      alias: {
        globals: path.resolve(SRC_DIR, '_globals.scss')
      },
      modules: [
        'node_modules',
        'src'
      ]
    }
  };
};