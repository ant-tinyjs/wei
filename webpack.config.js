var path = require('path');
var fs = require('fs');
var os = require('os');
var webpack = require('webpack');
var cliColor = require('cli-color');
require('console.table');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var autoprefixer = require('autoprefixer');
var CopyWebpackPlugin = require('copy-webpack-plugin');

function isWebpackDev() {
  var startAppPath = process.argv[1] || '';
  return startAppPath.indexOf('webpack-dev-server') !== -1;
}

var rootPath = __dirname;
var srcPath = path.join(rootPath, 'src');
var distPath = path.join(rootPath, 'dist');
var bundlesPath = path.join(srcPath, 'bundles');
var publicJsPath = path.join(srcPath, 'public/js');

// 是否开发模式
var isDev = isWebpackDev();

var commonsChunkPlugin = new webpack.optimize.CommonsChunkPlugin({
  name: 'commons',
  filename: '[name]/index.js',
  minChunks: 2
});

var extractLESS = new ExtractTextPlugin('[name]/index.css');

// 拷贝游戏资源

var copyRes = new CopyWebpackPlugin([
  {
    from: path.join(rootPath, '/res/images'),
    to: path.join(distPath, '/res/images')
  },
  {
    from: path.join(rootPath, '/res/sounds'),
    to: path.join(distPath, '/res/sounds')
  }
]);

// app内所有bundles
var bundles = fs.readdirSync(bundlesPath);

// excluding files start with "."
var i = 0;
while (bundles[i]) {
  if (bundles[i].startsWith('.')) {
    bundles.splice(i, 1);
  } else {
    ++i;
  }
}

// 所有页面入口，需要在entry内定义，并对应有同名的js在js目录内
var entrys = {};
var htmlWebpackPlugins = [];

bundles.forEach(bundleName => {
  var entryControllers = fs.readdirSync(path.join(bundlesPath, bundleName, 'entry'));
  entryControllers.forEach(entryController => {
    // 忽略隐藏文件
    if (entryController.startsWith('.')) {
      return;
    }

    var p = path.parse(entryController);
    if (p.ext !== '.js') return;
    entrys[bundleName + '/' + p.name] = [publicJsPath + '/public.js', path.join(bundlesPath, bundleName, 'js', entryController)];
    htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        filename: bundleName + '/' + p.name + '.html',
        template: path.join(bundlesPath, bundleName, 'entry', entryController),
        chunks: [bundleName + '/' + p.name, 'commons']
      })
    );
  });
});
// ===================== plugin start ==========================================
/**
 * 构建结束后显示 bundle 对应的页面发布路径
 * @param {object} options 目前还没有实际参数，以后有需求可以扩展
 */

function PagePathPlugin(options) {
  this.options = options;
}
PagePathPlugin.prototype.apply = function (compiler) {
  /**
   * 计算文件大小单位方法
   * @param {any} size
   */
  function formatSize(size) {
    var mArr = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i;
    size = parseInt(size, 10);
    for (i = 0; size > 1000 && i < mArr.length; i = i + 1) {
      size = size / 1000;
    }
    return (i ? size.toFixed(2) : size) + ' ' + mArr[i];
  }

  var self = this;
  // 在整个基本构建完成后执行
  // 获取发布的 assest，过滤出 htm 文件
  compiler.plugin('done', function (stats) {
    try {
      var assets = stats.compilation.assets;
      var htmFile = [];         // htm 文件列表
      var logTable = [];        // 所有 assets 文件列表
      for (var key in assets) {
        var chunk = key.substr(0, key.lastIndexOf('/')) || '';
        var size = assets[key].size() || 0;
        logTable.push({
          chunk: chunk,
          asset: key,
          size: formatSize(size)
        });
        var file = assets[key].existsAt || '';
        if (file.endsWith('.htm') || file.endsWith('.html')) {
          console.log(file);
          htmFile.push(file);
        }
      }
      // 时间标记
      console.log(os.EOL);
      console.log(cliColor.green(new Date()));
      var _compilation = stats.compilation;
      /**
       * 错误处理
       */
      var hasError = false;
      if (_compilation.errors && _compilation.errors.length > 0) {
        console.log(cliColor.red('Errors:'));
        _compilation.errors.forEach(function (error) {
          try {
            console.log(cliColor.red(error.module.resource));
          } catch (err) {}
          console.log(error.toString() + os.EOL);
        });
        hasError = true;
      }
      /**
       * 警告处理
       */
      if (_compilation.warnings && _compilation.warnings.length > 0) {
        console.log(cliColor.yellow('Warnings:'));
        _compilation.warnings.forEach(function (warn) {
          try {
            console.log(cliColor.yellow(warn.module.resource));
          } catch (err) {}
          console.log(warn.toString() + os.EOL);
        });
      }
      // console.log(_compilation.errors);
      // console.log(_compilation.warnings);
      if (!hasError) {
        if (!self.init) {
          self.init = true;
          if (htmFile.length > 0) {
            console.log(os.EOL);
            console.table(logTable);
            console.log(cliColor.green(os.EOL + '===页面访问路径：==========================='));
            htmFile.forEach(function (htm) {
              console.log(cliColor.greenBright(self.options.base_path + htm));
            });
            console.log(cliColor.green('============================================' + os.EOL));
          } else {
            self.init = true;
            console.log(cliColor.green('您还没有 bundle 文件，请使用 luna bundle 命令进行创建') + os.EOL);
          }
        } else {
          console.log(cliColor.green('===编译成功=========================================' + os.EOL))
        }
      }
    } catch (err) {
      // done 最终结束时执行，出错不会影响主构建过程
      console.log(err.message);
    }
  });
};
// ===================== plugin end ==========================================
// 本地域名，hpm-debug-local.alipay.net 自动转向 localhost
var pagePathPlugin = new PagePathPlugin({base_path: 'http://hpm-debug-local.alipay.net:8080'});

var config = {
  entry: entrys,

  output: {
    path: distPath,
    publicPath: isDev ? '/' : '../',
    filename: '[name]/index.js'
  },

  module: {
    loaders: [
      {
        test: /\.less$/,
        loader: extractLESS.extract(['css?-autoprefixer', 'postcss', 'less'], {
          publicPath: '../../'
        })
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url?limit=1024&name=images/[hash].[ext]'
      },
      {
        test: /\.(htm|html|ejs|tpl)$/,
        loader: 'ejs',
        query: {
          evaluate: '<\\?(.+?)\\?>',
          interpolate: '<\\?=(.+?)\\?>',
          escape: '<\\?-(.+?)\\?>'
        }
      },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      }
    ]
  },

  plugins: [
    extractLESS,
    commonsChunkPlugin
  ]
    .concat(htmlWebpackPlugins)
    .concat(isDev ? pagePathPlugin : [])
    .concat(isDev ? [] : copyRes),

  resolve: {
    alias: {
      // layout入口
      'layout': path.resolve('./src/public/layout/layout.js'),

      // app内public
      'public': path.resolve('./src/public'),

      // img
      'img': path.resolve('./src/img')
    }
  },

  postcss: [
    autoprefixer({
      browsers: ['last 2 versions', '> 1%', 'iOS >= 8', 'Android >= 4']
    })
  ],

  babel: {
    presets: ['es2015', 'stage-0'],
    plugins: ['transform-runtime']
  }
};

if (isDev) {
  config.devServer = {
    disableHostCheck: true
  };
}

module.exports = config;
