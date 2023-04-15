// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  // mode: 'development',
  mode: 'production',
  entry: './src/index.tsx',
  output: {
    filename: 'devtools/panel.js',
    path: path.resolve(__dirname, 'Eolink2TsType'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader"
      },
      { test: /\.css$/, use: 'css-loader' },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
  },
  devServer: {
    compress: true,
    port: 9000,
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/panel.html',
      filename: 'devtools/panel.html',
      inject: 'body',
      minify: true,
    }),
    new CopyPlugin({
      patterns: [{
        from: './public', to: path.resolve(__dirname, 'Eolink2TsType')
      }]
    })
  ],
}