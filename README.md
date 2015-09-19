[![NPM version](https://img.shields.io/npm/v/xcompress.svg?style=flat)](https://www.npmjs.com/package/xcompress)


## XCOMPRESS

用于CSS文件，JS文件和HTML文件夹的批量压缩工具

## Usage

### 环境需求

```
Node.js 0.10.0+ (tested on CentOS, Ubuntu, OS X 10.6+, and Windows 7+)
```

### 安装
```
npm install xcompress
```

### 使用
```
node xcompress [options]

-h, --help          获得帮助
-v, --version       输出版本号
-c, --comment       输出的js和css文件将会保留源码的第一对/* ... */之间的注释
```
即可打包位于根目录下的项目文件

##### 例子
[![Eg](http://i1.tietuku.com/c4e9482e1c9ee3cc.png)](http://i1.tietuku.com/c4e9482e1c9ee3cc.png)

在当前目录执行`node xcompress`后，红框处文件夹内的所有后缀为css，js，html（or htm）的文件将被压缩引擎处理并发布到`./dest`目录中,图片以及其他静态文件将被原样输出。

##### 注意之处

* 当前版本不可全局使用，请等待更新。
* 对于js压缩，会在Uglifyjs的基础上使用JsPacker进行eval操作，压缩率大大提升，但是会对性能有非常微小的影响。倘若在eval后反而增大了体积则只进行Uglifyjs的步骤。



[1.1.44 / 2015-05-22]()
==================
* 修正了会被压缩器忽略的文件不会被保留的BUG
* 修正了保留注释功能中匹配原文注释不全的功能
* 也一并压缩了HTML中的script和style,html真正的变为一行了