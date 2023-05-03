const { createWebpackAliases } = require("./webpack.helpers");

module.exports = createWebpackAliases({
  "@assets": "assets",
  "@misc": "misc",
  "@src": "src",
  "@tools": "tools",
});
