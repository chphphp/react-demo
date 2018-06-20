"use strict"
const path = require('path');
const os = require('os');
const webpack = require('webpack');
const HappyPack = require('happypack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextWebapckPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const BabelPolyfill = require('babel-polyfill')
const glob = require('glob');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HtmlWebPackPlugin = require("html-webpack-plugin");

var happyThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length
});

module.exports = {
    entry: {
        babel: "babel-polyfill",
        main: path.join(__dirname, 'src/index.js'),
    },
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: '/',
        filename: "js/[name]-[hash]" + ".js",
        chunkFilename: "js/[name]-[hash]" + ".js",
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                enforce: 'pre',
                use: [{
                    loader: 'happypack/loader?id=happybabel',
                },{
                    loader: 'babel-loader',
                }, {
                    loader: 'eslint-loader', // 指定启用eslint-loader
                    options: {
                        formatter: require('eslint-friendly-formatter'),
                        emitWarning: false
                    }
                }]
            },
            // {
            // 	test: /\.css$/,
            // 	use: [{
            // 		loader: 'style-loader'
            // 	}, {
            // 		loader: 'css-loader?modules'
            // 	}, {
            // 		loader: 'postcss-loader'
            // 	}]
            // },
            {   //antd样式处理
                test: /\.(css|less)$/,
                include: /node_modules/,
                exclude: /src/,
                use: [
                    {loader: "style-loader"},
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 2,
                            minimize: process.env.NODE_ENV === 'production'
                        }
                    },
                    {loader: 'postcss-loader',
                        options: {           // 如果没有options这个选项将会报错 No PostCSS Config found
                            plugins: (loader) => [
                                require('autoprefixer')(), //CSS浏览器兼容
                            ]
                        }
                    },
                    'less-loader'
                ]
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                include: /src/,
                // loader:['style-loader','css-loader']
                use: ExtractTextWebapckPlugin.extract({
                    fallback:'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: process.env.NODE_ENV === 'production',
                                importLoaders: 2,
                                localIdentName: '[name]-[local]-[hash:base64:5]',
                                modules:true
                            }
                        }, {
                            loader: 'postcss-loader',
                            options: {           // 如果没有options这个选项将会报错 No PostCSS Config found
                                plugins: (loader) => [
                                    require('autoprefixer')(), //CSS浏览器兼容
                                ]
                            }
                        },{
                            loader: 'less-loader',
                            options: {
                                javascriptEnabled: true,
                            }
                        }],
                    }
                )
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                include: /src/,
                // loader:['style-loader','css-loader']
                use: ExtractTextWebapckPlugin.extract({
                    fallback:'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: process.env.NODE_ENV === 'production',
                                importLoaders: 2,
                                localIdentName: '[name]-[local]-[hash:base64:5]',
                                modules:true
                            }
                        }, {
                            loader: 'postcss-loader',
                            options: {           // 如果没有options这个选项将会报错 No PostCSS Config found
                                plugins: (loader) => [
                                    require('autoprefixer')(), //CSS浏览器兼容
                                ]
                            }
                        }],
                })
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'static/img/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'static/media/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'static/fonts/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        minimize: true
                    }
                }]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin('dist/*', {
            root: __dirname,
            verbose: true,
            dry: false
        }),
        // new UglifyJsPlugin({
        //     uglifyOptions: {
        //         compress: {
        //             warnings: false
        //         }
        //     },
        //     sourceMap: true,
        //     parallel: true
        // }),
        new ExtractTextWebapckPlugin({
            filename: 'css/[name]-[hash].css',
            // Setting the following option to `false` will not extract CSS from codesplit chunks.
            // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
            // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
            allChunks: true
        }),
        new OptimizeCSSPlugin({
            cssProcessorOptions: { safe: true, map: { inline: false } }
        }),
        // generate dist index.html with correct asset hash for caching.
        // you can customize output by editing /index.html
        // see https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebPackPlugin({
            template: './src/index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            },
            filename: 'index.html'
        }),
        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, './src/static'),
                to: 'static',
                ignore: ['.*']
            }
        ]),
        // Analysis Bundle
        // new BundleAnalyzerPlugin(),
        new HappyPack({
            id: 'happybabel',
            loaders: ['babel-loader'],
            threadPool: happyThreadPool,
            verbose: true
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ],
    devServer: {
        // contentBase: path.join(__dirname, ""),
        contentBase: false, //since we use CopyWebpackPlugin.
        clientLogLevel: 'warning',
        publicPath: '/',
        hot: true,
        progress: true,
        overlay: { warnings: false, errors: true },
        historyApiFallback: {
            rewrites: [
                { from: /.*/, to: path.posix.join('/', 'index.html') },
            ],
        },
        // historyApiFallback: true,
        // quiet: true, // necessary for FriendlyErrorsPlugin
        compress: true,
        inline: true,
        port: 8083,
        host: '127.0.0.1',
        watchOptions: {
            poll: false,
        }
    },
    //4.0配置
    optimization: {
        /*splitChunks: {
            chunks: 'all',//"initial" | "async" | "all"
            cacheGroups: {
                default: false,
                vendors: false,
            },
        },*/
        /*splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        }*/
        runtimeChunk: {
            name: "manifest"
        },
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        }
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            '@': path.join(__dirname, "/src"),
            '@pages': path.join(__dirname,"/src/pages"),
            '@service': path.join(__dirname, "/src/util/service.js")
        }
    }
};
