// Do not inject webpack-dev-server/HMR or Node shim dependencies into the sandbox.
module.exports = {
  devServer: false,
  devtool: false,
  module: { rules: [require("./webpack.rules")[0]] },
  resolve: { extensions: [".ts", ".js"] },
};
