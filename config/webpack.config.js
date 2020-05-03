const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const UglifyPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const paths = require('./paths');
const env = process.env.NODE_ENV;
const config =
  env === 'development'
    ? require('./development.js')
    : require('./production.js');

const { inject } = config;

const plugins = [
  new CopyWebpackPlugin(
    [
      {
        from: '**/*',
        transform: (content, path) => {
          let changed = content.toString();
          for (const key in inject) {
            changed = changed.replace(`%${key}%`, inject[key]);
          }
          return changed;
        },
      },
    ],
    {
      ignore: [
        '*.png',
        '*.jpg',
        '*.jpeg',
        '*.gif',
        '*.ts',
        '*.js',
        '*.ico',
        '*.scss',
      ],
    },
  ),
  new CopyWebpackPlugin([
    {
      from: '**/*.{png,jpg,jpeg,gif,ico}',
    },
  ]),
];

if (env === 'production') {
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new UglifyPlugin(),
  );
} else {
  plugins.push(new webpack.NamedModulesPlugin());
}

module.exports = {
  mode: env,
  context: paths.src,
  devtool: 'cheap-module-source-map',
  entry: paths.index,
  output: {
    path: paths.build,
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        exclude: [
          /\.html$/,
          /\.js$/,
          /\.ts$/,
          /\.css$/,
          /\.scss$/,
          /\.json$/,
          /\.svg$/,
          /\.ico/,
          /\.bmp$/,
          /\.gif$/,
          /\.jpe?g$/,
          /\.png$/,
        ],
        loader: require.resolve('file-loader'),
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.ts?$/,
        loader: 'babel-loader',
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
      {
        test: /\.(css|scss)$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              modules: false,
              sourceMap: false,
              localIdentName:
                env === 'development' ? '[local]' : '[hash:base64:5]',
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              ident: 'postcss',
              plugins: () => [
                require('cssnano'),
                autoprefixer({
                  browsers: ['>1%', 'last 4 versions', 'Firefox ESR'],
                  flexbox: 'no-2009',
                }),
              ],
            },
          },
          {
            loader: require.resolve('sass-loader'),
          },
        ],
      },
    ],
  },
  plugins: plugins,
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false,
  },
};
