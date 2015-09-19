#!/usr/bin/env node

var fs = require('fs'),
    stat = fs.stat,
    path = require('path');
require('./lib/Uglifyjs.js');
var rocker = require('./lib/JsPacker.js');
var url = path.normalize("./");
var dest = path.normalize("./dest");
var CleanCSS = require('clean-css');
var minify = require('html-minifier').minify;
var pkg = require('./package.json');
var util = require('util');


// console.log(rocker.pack);
// <script src="Scripts/Uglifyjs.js"></script>
// <script src="Scripts/JsPacker.js"></script>
var program = require('commander');
program
    .allowUnknownOption()
    .version(pkg.version)
    .option('-c, --comment', 'Keep source comments') // 开启输出注释，默认 true
    .parse(process.argv);
var xcompress = module.exports = function xcompress(options) {

    function _pack_(content) {


        // if_pack = if_pack || false;
        var js = content;
        // var mangle = $('#mangle').prop('checked');
        var mangle = true;
        var lengths = [js.length];

        var ast = UglifyJS.parse(js);
        ast.figure_out_scope();
        var comp = new UglifyJS.Compressor({
            sequences: true,
            properties: true,
            dead_code: true,
            drop_debugger: true,
            unsafe: true,
            unsafe_comps: false,
            conditionals: true,
            comparisons: true,
            evaluate: true,
            booleans: false,
            loops: true,
            unused: true,
            hoist_funs: true,
            hoist_vars: false,
            if_return: true,
            join_vars: true,
            cascade: true,
            side_effects: true,
            warnings: true,
        });
        ast = ast.transform(comp);
        ast.figure_out_scope();
        ast.compute_char_frequency();
        if (mangle) {
            ast.mangle_names();
        }
        js = ast.print_to_string();
        lengths.push(js.length);

        // js = rocker.pack(js, 62, true, false);


        // js = "(" + js[0] + ")(" + js[1] + "," + js[2] + ")";
        return js;
    }

    function bytesToSize(bytes) {
        if (bytes === 0) return '0 B';
        var k = 1000, // or 1024
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    };

    function getFirstComment(argument) {
        // body...
        if (!program.comment) {
            return '';
        }
        var a = argument.match(/^((\s*(\/\/[^\r\n]*?)?)[\r\n]|[\s\r\n]*\/\*(.|\n|\r)+?\*\/)+/g);
        if (a) {
            return a[0].replace(/[\r\n]+/g, '\n').replace(/[\r\n]+$/g, '') + '\n'
        } else {
            return '';
        }
        // return argument.match(/\/\*(.|\n|\r)+?\*\//g)[0] || '';
    }
    var cleanOpts = {
        compatibility: 'ie7',
    };
    // console.log(_pack_('alert(1)'));
    var copy = function(src, dst) {
        // 读取目录中的所有文件/目录
        fs.readdir(src, function(err, files) {
            if (err) {
                throw err;
            }
            // console.log('总计' + files.length + '文件');
            // console.log('执行中');
            files.forEach(function(path) {
                var _src = src + '/' + path,
                    _dst = dst + '/' + path,
                    readable,
                    writable;

                var srcLength = 0;
                var dstLength = 0;
                var dstContent = '';

                if (_src != '.\\/xcompress.js' && _src != '.\\/package.json' && _src != '.\\/README.md' && _src != '.\\/lib' && _src != '.\\/node_modules' && _src != '.\\/dest') {
                    console.log(_src);
                    stat(_src, function(err, stats) {
                        if (err) {
                            throw err;
                        }
                        // console.log(stats)
                        if (stats.isFile()) {
                            // console.log(stats);
                            // 处理源文件
                            // console.log(_src);
                            // 判断文件类型
                            var fileType = _src.split('.')[_src.split('.').length - 1];
                            switch (fileType) {
                                case 'js':
                                case 'json':
                                    fs.readFile(_src, {
                                        encoding: 'utf-8'
                                    }, function(err, data) {
                                        if (err) throw err;
                                        var srcLength = data.length; // 源大小
                                        var comment = getFirstComment(data); // 获得注释
                                        var dstContent = _pack_(data);

                                        var dstContentPack = rocker.pack(dstContent, 62, true, false); // 混淆加密的内容
                                        if (dstContent.length > dstContentPack.length) {
                                            // 混淆后更小的情况
                                            fs.writeFile(_dst, comment + dstContentPack.replace(/[\r\n]+$/g, ''), {
                                                encoding: 'utf-8'
                                            }, function(err) {
                                                if (err) throw err;
                                                console.log('处理' + path + '完毕,压缩前' + bytesToSize(srcLength) + ',压缩后' + bytesToSize(dstContentPack.length) + ',压缩率' + parseInt((dstContentPack.length / srcLength * 10000)) / 100 + '%');
                                            });
                                        } else {
                                            // 混淆后变大的情况
                                            fs.writeFile(_dst, comment + dstContent.replace(/[\r\n]+$/g, ''), {
                                                encoding: 'utf-8'
                                            }, function(err) {
                                                if (err) throw err;
                                                console.log('处理' + path + '完毕,压缩前' + bytesToSize(srcLength) + ',压缩后' + bytesToSize(dstContent.length) + ',压缩率' + parseInt((dstContent.length / srcLength * 10000)) / 100 + '%');
                                            });
                                        }
                                        // else {
                                        //     // 复制流
                                        //     readable = fs.createReadStream(_src);
                                        //     writable = fs.createWriteStream(_dst);
                                        //     readable.pipe(writable);
                                        //     console.log('处理' + path + '完毕，未压缩');
                                        // }
                                    });
                                    break;
                                case 'css':
                                    fs.readFile(_src, {
                                        encoding: 'utf-8'
                                    }, function(err, data) {
                                        if (err) throw err;
                                        var srcLength = data.length;
                                        var comment = getFirstComment(data);
                                        // console.log(comment)
                                        var minified = new CleanCSS(cleanOpts).minify(data);
                                        fs.writeFile(_dst, comment + minified.styles.replace(/\/\*(.|\n|\r)+?\*\//g, ''), {
                                            encoding: 'utf-8'
                                        }, function(err) {
                                            if (err) throw err;
                                            console.log('处理' + path + '完毕,压缩前' + bytesToSize(srcLength) + ',压缩后' + bytesToSize(minified.styles.length) + ',压缩率' + parseInt((minified.styles.length / srcLength * 10000)) / 100 + '%,' /*+ '' + minified.stats */ + '错误' + (minified.errors == '' ? '0' : minified.errors) + ',警告' + (minified.warnings == '' ? '0' : minified.warnings));
                                            // console.log('处理' + path + '完毕,压缩前' + srcLength + ',压缩后' + dstContent.length);
                                        });
                                        // console.log(minified);
                                        // dstContent = _pack_(data);
                                        // if (srcLength > dstContent.length) {
                                        //     // 创建文件
                                        //     fs.writeFile(_dst, dstContent, {
                                        //         encoding: 'utf-8'
                                        //     }, function(err) {
                                        //         if (err) throw err;
                                        //         console.log('处理' + path + '完毕,压缩前' + srcLength + ',压缩后' + dstContent.length);
                                        //     });
                                        // } else {
                                        //     // 复制流
                                        //     readable = fs.createReadStream(_src);
                                        //     writable = fs.createWriteStream(_dst);
                                        //     readable.pipe(writable);
                                        //     console.log('处理' + path + '完毕，未压缩');
                                        // }
                                    });



                                    break;
                                case 'html':
                                case 'htm':
                                case 'HTML':

                                    fs.readFile(_src, {
                                        encoding: 'utf-8'
                                    }, function(err, data) {
                                        if (err) throw err;
                                        var srcLength = data.length;
                                        // console.log(comment)
                                        var result = minify(data, {

                                            removeComments: true,
                                            removeCommentsFromCDATA: true,
                                            removeCDATASectionsFromCDATA: true,


                                            collapseWhitespace: true,
                                            // conservativeCollapse: true,
                                            // preserveLineBreaks:true,

                                            collapseBooleanAttributes: true,


                                            removeAttributeQuotes: false,
                                            removeRedundantAttributes: true,
                                            useShortDoctype: true, // HTML5,
                                            removeEmptyAttributes: true,
                                            removeScriptTypeAttributes: true,
                                            removeStyleLinkTypeAttributes: true,
                                            removeOptionalTags: false,
                                            removeIgnored: true,
                                            removeEmptyElements: false,
                                            minifyURLs: true,


                                        });


                                        result = result.replace(/(<style[^>]*?>)((?:.|\r|\n)*?)(<\/style>)/g, function(a, b, c, d) {
                                            var minified = new CleanCSS(cleanOpts).minify(c);
                                            // console.log(minified.styles);
                                            return b + minified.styles + d;
                                        })
                                        result = result.replace(/(<script[^>]*?>)((?:.|\r|\n)*?)(<\/script>)/g, function(a, b, c, d) {
                                            // console.log(minified.styles);

                                            // var dstContent;
                                            try {
                                                return b + _pack_(c) + d;
                                            } catch (e) {
                                                // console.log('========================'+a);
                                                return a;
                                            }


                                        })
                                        result = result.replace(/\r|\n|\t/g, '');
                                        fs.writeFile(_dst, result, {
                                            encoding: 'utf-8'
                                        }, function(err) {
                                            if (err) throw err;
                                            console.log('处理' + path + '完毕,压缩前' + bytesToSize(srcLength) + ',压缩后' + bytesToSize(result.length) + ',压缩率' + parseInt((result.length / srcLength * 10000)) / 100 + '%');
                                            // console.log('处理' + path + '完毕,压缩前' + srcLength + ',压缩后' + dstContent.length);
                                        });
                                    });

                                    break;
                                default:
                                    readable = fs.createReadStream(_src);
                                    writable = fs.createWriteStream(_dst);
                                    readable.pipe(writable);
                                    break;
                            }


                            // readable = fs.createReadStream(_src);
                            // writable = fs.createWriteStream(_dst);
                            // readable.pipe(writable);

                            //创建文件
                            // var data = 1;
                            // fs.writeFile(_dst, data, 'ascii', function(err) {
                            //     if (err) {
                            //         console.log('写入文件失败');
                            //     } else {
                            //         console.log('保存成功, 赶紧去看看乱码吧');
                            //     }
                            // })
                        } else if (stats.isDirectory()) {
                            exists(_src, _dst, copy);
                        }

                    });
                }

            });
        });
    };
    var exists = function(src, dst, cb) {
        fs.exists(dst, function(exists) {
            // 已存在
            if (exists) {
                cb(src, dst);
            }
            // 不存在
            else {
                fs.mkdir(dst, function() {
                    cb(src, dst);
                });
            }
        });
    };
    // 复制目录
    exists(url, dest, copy);
}

xcompress();