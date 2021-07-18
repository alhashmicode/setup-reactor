const webpack = require("webpack");
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const {GenerateSW, InjectManifest} = require('workbox-webpack-plugin');
{/*
  webpack configuration structure:
  mode, 
  entry,
  output,
  devtool,
  optimization:{
    tarserPlugin,
    cssMinimizePlugin,
    splitChunks
  }
  devServer
  plugins:{
    htmlWebpackPlugin,
    cssExtractPlugin,
    webpack.DefinePlugin
  }
  loaders:{
    web-worker,
    babel-loader,
    css and extractCss loader,
    postcss-loader,
    sass-loader,
    url-loader,
    file-loader
  }
*/}
module.exports = (env) => { // webpack function with env pramater and return webpack config ;
  // ****************************************************************************************/
  console.log(env)          // console the webpack env object {} ;
  // ****************************************************************************************/
  return {
    mode: env.production ? 'production' : 'development',//Providing the mode configuration option tells webpack
    //to use its built-in optimizations accordingly. (production | development);
    entry: './src/index.jsx',                           //The entry object is where webpack looks to start building the bundle;
    output: {
      clean: true,                                                  // Clean the output directory before emit.
      filename: env.production ? "assets/js/[name].[fullhash].js" : //This option determines the name of each output bundle;
        "assets/js/[name].bundle.js",                               // it determines depend on webpack env property;
      path: path.resolve(__dirname, 'build'),                       // tells webpack where path to output the files;
      publicPath: path.resolve(__dirname, "/")                       // This option specifies the public URL of the output directory when referenced in a browser;
    },
    devtool: env.development && "eval-cheap-source-map",   // This option controls if and how source maps are generated if
    // webpack env.production = true is set to false for optimization and minifying the files
    optimization: {                 // optimization section 
      minimize: env.production,     // Tell webpack to minimize the bundle using the TerserPlugin or the plugin(s) specified in minimizer
      // if webpack env.production = false don't use it and use default webpack optimization 
      minimizer: [                  // Allows you to override the default minimizer by providing a different one or more customized

        new TerserWebpackPlugin({   // tarser => use for minimize and optimize js files 
          parallel: true,           // Use multi-process parallel running to improve the build speed
          terserOptions: {          // Terser minify options                     
            compress: {             // {***  minify option **}
              comparisons: false,
              drop_console: true     // remove console log from files
            },                      // ****************************************************************************************/
            mangle: {               // allows you to control whether or not to mangle class name, function name, property name,
              safari10: true        //
            },                      // ****************************************************************************************/
            output: {               // build outpu option 
              comments: false,      // avoid build with comments
              ascii_only: true,     //escape Unicode characters in strings and regexps
            },
            warnings: false         // allow show warning 
          },
        }),
        new CssMinimizerPlugin()   // css minimizer plugin 
      ],
      splitChunks: {               // split chunk configuration 
        chunks: "all",
        minSize: 0,
        maxInitialRequests: 20,
        maxAsyncRequests: 20,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name(module, chunks, cacheGroupKey) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `${cacheGroupKey}.${packageName.replace("@", "")}`;
            }
          },
          common: {
            minChunks: 2,
            priority: -10
          }
        }
      },
      runtimeChunk: "single"       // adds an additional chunk containing only the runtime to each entrypoint
    },                             //************************************************************************/
    devServer: {                   //describes the options that affect the behavior of webpack-dev-server  
      port: 5000,                  //the port of the server to run into                                    
      contentBase: '/build',       //the content base of files live                                        
      watchContentBase: true,      //reload when something changed                                         
      filename: '[name].bundle.js',//name of file output                                                   
      hot: true,                   //auto realod the files on the server                                   
      compress: true,              //Enable gzip compression for everything served                         
      historyApiFallback: true,    // the index.html page will likely have to be served in place of any 404 responses
      open: true,                  // open new window in browser when server are runing
      overlay: true,               //Shows a full-screen overlay in the browser when there are compiler errors or warnings.
      publicPath: "/assets/",      //The bundled files will be available in the browser under this path
      liveReload: true             //the dev-server will reload/refresh the page when file changes are detected.
    },
    plugins: [
      new HtmlWebpackPlugin({                                      //  simplifies creation of HTML files to serve your webpack bundles                              
        template: path.resolve(__dirname, 'public', 'index.html'), // webpack relative or absolute path to the template. 
        title: "React | Basic Setup",                              // title of the page
        inject: true,                                              // inject the script in html and use defer type approach 
        scriptLoading: "defer",                                    // add scription loading defenition
        publicPath: path.resolve(__dirname, "/")                   // add public path 
      }),                                                          // ********************************************************
      new MiniCssExtractPlugin({                                                                                      // extract css and put them in sperate files
        filename: env.production ? "assets/css/[name].bundle.css" : "assets/css/[name].[fullhash].css",               // file name approach
        chunkFilename: env.production ? "assets/css/[name].[contenthash:8].chunk.css" : "assets/css/[name].chunk.css" // chunk name of files
      }),
      new webpack.DefinePlugin({   // set the NODE_ENV property 
        "process.env.NODE_ENV": JSON.stringify(
          env.production ? "production" : "development"
        )
      }),
      //todo                        
      // new GenerateSW({                           // Service workers enable advanced optimization techniques and improvements to user experience
      //   swDest: "service-worker.js",             // specifies the output filename for the generated worker file.
      //   mode: env.production ? "production" : "development",// => mode env for WorkboxPlugin
      //   clientsClaim: true,                      // instructs the service worker to take control of the page immediately after registration and begin serving cached resources
      //   skipWaiting: true,                       // makes updates to the service worker take effect immediately,
      //   sourcemap:env.development,               // create source map for server worker in development mode
      //   directoryIndex:"index.html",             // If a navigation request for a URL ending in / fails to match a precached URL, this value will be appended to the URL and that will be checked for a precache match.
      //   navigateFallback:'',
      //   dontCacheBustURLsMatching,
      //   exclude: [
      //     // Images don't need to be pre-cached (cache only if in use)
      //     /\.(png|jpg|jpeg|webm|gif|svg|map)$/,
      //     // Translations don't need to be pre-cached (cache only if in use)
      //     /[a-z]{2}(?:-[A-Z]{2})?-[a-z0-9]{20}\.min\.js/
      // ], 
      //   runtimeCaching:''
      // })
    ],
    module: {                     // loaders section in module.rules
      rules: [
        {
          test: /\.worker\.js$/,  // test for worker javascript files
          loader: "worker-loader" // use web worker loader in webpack to create new threades 
        },                        //to apply multi threads operation in javascript.
        {
          test: /\.css$/,                                  //test the file with extention ending by .css
          use: [MiniCssExtractPlugin.loader, {             // css extract loader;
            loader: 'css-loader',                          // css-loader and minimize the css
            options: {                                     // options
              modules: true,                               // enable css modules
              importLoaders: 1                             // imoprt loader before css-loader
            }                                              //****************************************** */
          }, "postcss-loader"]                             //for optimization and performancd loader;
        },
        {
          test: /\.s[ac]ss$/,                              //Sass is another popular CSS processing framework
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                importLoaders: 2
              }
            },
            "resolve-url-loader",
            {
              loader: "sass-loader",
              options: {
                sourceMap: true
              }
            }
          ]
        },
        {
          test: /\.module.css$/,                              // test the file with extention ending by .css
          use: [                                              //                              
            MiniCssExtractPlugin.loader,                      // extract css loader
            {                                                 //
              loader: "css-loader",                           //
              options: {                                      // loader options
                modules: true                                 // enable module option to use css module in css loader
              }
            }
          ]
        },
        {
          test: /\.(js|jsx)?$/,                            // test the file with extention ending by .js or .jsx
          exclude: /node_modules/,                         // exclude node_modules folder to served in babel-loader
          use: {                                           // conifguatin the usage of babel-loader
            loader: 'babel-loader',                        // loader => babel loader
            options: {                                     // options of loader

              cacheDirectory: true,                        // the given directory will be used to cache the results of the loader
              cacheCompression: false,                     // each Babel transform output will be compressed with Gzip.
              envName: env.production ? 'production' : 'development' // set the babel loader envirounment
            }
          }
        },
        {
          test: /\.(png|jpg|gif)$/,                      // test the file with extention ending by .jpg,.png,gif
          use: {                                         // image loader
            loader: "url-loader",                        // use loader => url-loader
            options: {                                   // optinos of loader
              limit: false,                              //The limit can be specified via loader options and defaults to no limit.
              encoding: true,                            //Specify the encoding which the file will be inlined with. If unspecified the encoding will be base64
              name: "images/[name].[fullhash].[ext]",    // name of files 
            }
          }
        },
        {
          test: /\.(eot|otf|ttf|woff|woff2)$/,            // files loader
          loader: require.resolve("file-loader"),         // node resolve the file and require it 
          options: {                                      // loader options
            name: "static/images/[name].[fullhash].[ext]" // name of files
          }
        }
      ],
    },
    resolve: {                    //Configure how modules are resolved.              
      extensions: [".js", ".jsx"] //Attempt to resolve these extensions in order
    }
  };
};
/************************************************************************************************** end  */