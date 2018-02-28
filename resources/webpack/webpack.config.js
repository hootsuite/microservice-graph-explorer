var rootDir = require('path').resolve(__dirname, '../../');

var jsDir = rootDir + '/src';
var buildDir = rootDir + '/__build__';

module.exports = {
  devtool: 'inline-source-map',

  entry: {
    appStatus: jsDir + '/app-status.js',
    appWidget: jsDir + '/app-widget.js'
  },

  output: {
    path: './public/javascripts/build',
    filename: '[name].js',
    publicPath: './public'
  },

  distDir: buildDir,

  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
  },

  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|svg|woff|woff2|eot|ttf|otf)/, loader: 'url-loader?limit=100000' },
      { test: /\.less/, loader: 'style-loader!css-loader!less-loader' }
    ]
  }
};
