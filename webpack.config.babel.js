import 'babel-polyfill';
import path from 'path';
import nib from 'nib';
import webpack from 'webpack';
import AssetsPlugin from 'assets-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import pkg from './package.json';

export default () => {
	process.env.NODE_ENV = process.env.NODE_ENV || 'development';
	const DEBUG = process.env.NODE_ENV !== 'production';

	return {
		target: 'web',

		context: path.join(__dirname, 'src'),

		entry: {
			main: ['babel-polyfill', './js/index.js'],
		},

		output: {
			path: path.resolve(__dirname, 'share', 'static'),
			pathinfo: false,
			publicPath: '/',
			filename: DEBUG ? '[name].js' : '[name].[chunkhash:8].js',
			chunkFilename: DEBUG ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
			devtoolModuleFilenameTemplate: (info) => path.resolve(info.absoluteResourcePath),
		},

		resolve: {
			extensions: ['.js', '.jsx'],
			modules: ['node_modules', 'src'],
			alias: { underscore: path.join('lodash', 'lodash.js') },
		},

		module: {
			strictExportPresence: true,

			rules: [{
				test: /\.jsx?$/,
				include: [path.join(__dirname, 'src')],
				use: [{
					loader: 'babel-loader',
					options: {
						cacheDirectory: DEBUG ? path.join(__dirname, 'tmp', 'caches', 'babel-client') : false,
						babelrc: false,
						presets: [
							['env', { targets: { browsers: pkg.browserslist, forceAllTransforms: true }, modules: false, useBuiltIns: false, debug: false }],
							// ['react'],
							// babel v7
							// ['react', { development: DEBUG }],
						],
						plugins: [
							'transform-class-properties',
							'transform-object-rest-spread',
							// ...(DEBUG ? [] : ['transform-react-constant-elements']),
							// ...(DEBUG ? [] : ['transform-react-inline-elements']),
							// ...(DEBUG ? [] : ['transform-react-remove-prop-types']),
						],
					},
				}],
			}, {
				test: /\.styl$/,
				include: path.resolve(__dirname, 'src'),
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [{
						loader: 'css-loader',
						options: { sourceMap: false, minimize: !DEBUG },
					}, {
						loader: 'stylus-loader',
						options: { use: [nib()], import: ['~nib/index'] },
					}],
				}),
			}, {
				test: /\.(png|jpe?g|gif|svg)$/,
				include: [path.join(__dirname, 'src')],
				use: [{
					loader: 'url-loader',
					options: { name: DEBUG ? '[path][name].[ext]?[hash:8]' : '[hash:8].[ext]', limit: 1000 },
				}],
			}],
		},

		bail: !DEBUG,

		cache: DEBUG,

		stats: {
			cached: false,
			cachedAssets: false,
			chunks: false,
			chunkModules: false,
			chunkOrigins: false,
			colors: true,
			hash: false,
			modules: false,
			reasons: DEBUG,
			timings: true,
			version: false,
		},

		devtool: DEBUG ? 'cheap-module-inline-source-map' : 'source-map',

		plugins: [
			new webpack.DefinePlugin(Object.assign({}, process.env)),
			// new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /ja/),
			new ExtractTextPlugin(DEBUG ? '[name].css' : '[name]-[hash].css'),
			new AssetsPlugin({ path: path.join(__dirname, 'share', 'layouts', 'partials'), filename: 'assets.html', prettyPrint: true, processOutput: (assets) => ([
				`<link rel="stylesheet" href="${assets.main.css}" />`,
				`<script src="${assets.main.js}"></script>`,
			].join('\n')) }),
			...(DEBUG ? [] : [new webpack.optimize.ModuleConcatenationPlugin()]),
			...(DEBUG ? [] : [new webpack.optimize.UglifyJsPlugin({ sourceMap: true, compress: { screw_ie8: true, warnings: false, unused: true, dead_code: true }, mangle: { screw_ie8: true }, output: { comments: false, screw_ie8: true } })]),
		],

		watchOptions: {
			ignored: /node_modules/,
		},

		node: {
			fs: 'empty',
			net: 'empty',
			tls: 'empty',
		},
	};
};
