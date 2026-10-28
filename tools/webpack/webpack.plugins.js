const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  ...(process.env.NODE_ENV === "development"
    ? []
    : [new MiniCssExtractPlugin({ filename: "[name]/index.css" })]),
];
