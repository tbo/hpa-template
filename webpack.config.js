const path = require('path');
const { readdirSync } = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const ENTRY_FOLDER = 'src/client/components/';
const getEntries = () => {
  const entries = Object.fromEntries(
    readdirSync(ENTRY_FOLDER).map(filename => [
      filename.split('.')[0],
      path.resolve(__dirname, ENTRY_FOLDER + filename),
    ]),
  );
  entries.styles = ['./src/client/styles.scss'];
  return entries;
};

const isProduction = process.env.NODE_ENV === 'production';
const basename = `${isProduction ? '[contenthash]-' : ''}[name]`;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: 'source-map',
  entry: getEntries,
  output: {
    filename: basename + '.js',
    path: path.resolve(__dirname, 'build/'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    splitChunks: {
      minSize: 100,
      chunks: 'all',
      name: 'core',
    },
    runtimeChunk: {
      name: 'core',
    },
  },
  plugins: [new CleanWebpackPlugin(), new MiniCssExtractPlugin({ filename: basename + '.css' })],
  module: {
    rules: [
      {
        test: /\.(t|j)s$/,
        exclude: /(node_modules|bower_components)/,
        use: { loader: 'ts-loader' },
      },
      {
        test: /\.css$/,
        exclude: /(node_modules|bower_components)/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
};
