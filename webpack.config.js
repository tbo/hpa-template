const path = require('path');
const { readdirSync } = require('fs');

const WEB_COMPONENTS = 'src/web-components/';
const getEntries = () => {
  const entries = Object.fromEntries(
    readdirSync(WEB_COMPONENTS).map(filename => [
      filename.split('.')[0],
      path.resolve(__dirname, WEB_COMPONENTS + filename),
    ]),
  );
  entries.client = './src/client.ts';
  return entries;
};

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: 'source-map',
  entry: getEntries,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build/'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /(node_modules|bower_components)/,
        use: { loader: 'ts-loader' },
      },
    ],
  },
};
