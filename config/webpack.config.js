const path = require('path');
const webpack = require('webpack');

const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

const BASE_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.resolve(BASE_DIR, 'dist');
const SRC_DIR = path.resolve(BASE_DIR, 'src');

const DEV_PLUGINS = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin()
];
const PRODUCTION_PLUGINS = [
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      drop_console: true,
      screw_ie8: true,
      warnings: false
    },
    output: {comments: false},
    sourceMap: false
  })
];

module.exports = function(/*env*/{production}/*, argv*/) {
  const client = path.resolve(SRC_DIR, 'index.js');
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
    entry: production ? client : ['react-hot-loader/patch', client],
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
      // chunkFilename: `js/[name]${production ? '-[chunkhash].min' : ''}.js`,
      filename: `js/[name]${production ? '-[hash].min' : ''}.js`,
      path: path.resolve(PUBLIC_DIR, 'assets'),
      publicPath: '/assets/'
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'commons',
        filename: `js/commons${production ? '-[hash].min' : ''}.js`,
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
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700%7CMaterial+Icons',
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