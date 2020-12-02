const path = require('path');
const { readdirSync } = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');

const ENTRY_FOLDER = 'src/client/components/';
const getEntries = () => {
  const entries = Object.fromEntries(
    readdirSync(ENTRY_FOLDER).map(filename => [
      filename.split('.')[0],
      path.resolve(__dirname, ENTRY_FOLDER + filename),
    ]),
  );
  entries.client = './src/client/index.ts';
  entries.styles = ['./src/server/pages/shared/styles.css'];
  return entries;
};

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: 'source-map',
  entry: getEntries,
  output: {
    filename: '[contenthash]-[name].js',
    path: path.resolve(__dirname, 'build/'),
  },
  plugins: [new FixStyleOnlyEntriesPlugin(), new MiniCssExtractPlugin({ filename: '[contenthash]-[name].css' })],
  module: {
    rules: [
      {
        test: /\.ts$/,
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
