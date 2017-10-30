# Tiny开发方案

## 概念

* app
  * 一个 H5 应用称为一个 app。

* bundle
  * 基于未来扩展考虑，我们的一个 app 里可能会共存几个不同的业务，这时一个业务就称为一个 bundle。

* page
  * 一个业务会有多个页面组成，每个页面称为一个 page。在最标准的情况下，一个 page 由四个文件组成。


```
  + reward
    + css
      - index.less
    + entry
      - index.js      (页面入口配置)
    + js
      - index.js      (js 入口)
    + tpl
      - index.tpl     (页面 html 模板)
```

  上图是业务 reward 最简单的页面目录结构，其中：

  * entry中的 `index.js` 是页面入口配置, 提供外界资源引用， 以及页面标题，分享标题等配置项
  * tpl中的 `index.tpl` 是 html 页面模板，无需手写 head，body 等公共标签，只需要写业务所需 html 即可
  * js中的 `index.js` 是 js 业务逻辑，每个 entry 会自动引入一个文件名相同的 js 文件。如果业务很多，可以拆分文件，用相对路径的方式引用进来
  * css中的 `index.less` 是样式文件，在 js 入口文件中可以 require 方式引入

### 脚手架工具安装
``` sh
$ npm install tinyjs-cli -g
```

### 初始化项目
``` sh
$ tiny init
```

### 安装依赖
``` sh
$ npm install
```

### 新建一个 bundle
``` sh
$ tiny bundle
```

### 启动本地服务器
``` sh
$ npm run dev
```

例如浏览名称为 `bundle1` 的 bundle 的 `index` 页面，其 src 中的 entry 入口文件为 `src/bundles/bundle1/entry/index.js`，对应浏览器打开的页面地址为 `http://127.0.0.1:8080/bundle1/index.htm`。

### 项目构建
``` sh
$ make build
```

## 项目结构

```
  + res                 游戏资源路径
    + images            图片资源和最终执行‘tiny resource’生成的tileset相关文件在这个目录
    + sound             音频资源目录（仅支持ogg格式）
    + tileset           tileset原文件目录
      + {tilesetName}   tileset推荐区分目录，例如snake
        - *.png         所有需要合并的图片
  + src                 项目最重要的部分，所有代码、资源都放在这里
    + bundles           业务代码
      + {bundleName}    业务 bundle 名称，例如 'reward'
        + entry         存放页面入口， 每个 js 文件构建后都会生成一个页面入口
          - index.js    'index' 页面入口
          - a.js        'a' 页面入口
        + tpl           存放模板文件，不同 entry 可以引入相同的模板
          - index.tpl
        + js            存放业务 js，跟 entry 中的文件一一对应
          - index.js
          - a.js
        + css           存放业务 css，然后 js 中可以 require 方式引入
        + components    存放 vue 组件，不使用 vue 的话可删掉
    + public            各 bundle 公用的代码，一般情况下不需要修改
      + layout
        - foot.tpl      通用的 html 尾模板
        - head.tpl      通用的 html 头模板
        - layout.js     页面生成的具体逻辑
      + js              全局通用 js 文件
      + css             全局通用 css 文件
    + img               本地图片存储路径
  + dist                编译后的代码，实际上就是生产环境应用的未压缩版
    + {commons}         公用js代码
      - index.js
      - index.css
    + {bundleName}      对应 src/bundles 内的 {bundlename} 文件夹 例如 'reward'
      + {pageName}      pageName对应目录，存放当前bundle下{pageName}对应的js和css
        - index.js
        - index.css
      - {bundleName}.htm  即可访问的页面，例如 'index.htm', 'a.htm'
  - package.json        npm 配置文件，需要使用新的 js 组件时，需要在这里配置
  - webpack.config.js   webpack 配置文件，如果有特殊的构建配置的话，可以在这里修改
```

### 文件的引用

一般的文件引用，都是使用相对路径的方式。

在`src/public` 中存放的 js 文件，如果需要在业务中引用，请使用 `public/` 开始

``` js
var public = require('public/js/public.js')
```

`src/public` 中存放的 less，如果在业务中引用，请使用 `~public/` 开始

``` less
@import "~public/css/public.less";
```

图片等资源都放在 `src/img` 下，在tpl 与 css 中的引用方法如下：

  - .tpl 中引入 img/ `<img src="<?= require('img/xx.jpg')?>">`
  - css 中引入 ~img/ `background: url('~img/xxx.png');`


注意：

* H5 离线包可以使用“动态加载”的方式，默认已经加入了语言包输出的webpack配置，按照推荐的目录结构来写即可。

