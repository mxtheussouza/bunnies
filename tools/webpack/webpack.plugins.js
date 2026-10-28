const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { version } = require("../../package.json");

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new webpack.DefinePlugin({ BUNNIES_APP_VERSION: JSON.stringify(version) }),
];
