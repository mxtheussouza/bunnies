require("../patches/amqplib.cjs").ensureAmqplibPatch();
const { BannerPlugin } = require("webpack");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: ["./src/main/app.ts"],
  plugins: [
    new BannerPlugin({
      banner: readFileSync(
        resolve(__dirname, "../patches/amqplib-NOTICE.txt"),
        "utf8",
      ),
      entryOnly: true,
    }),
  ],
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
    alias: require("./webpack.aliases"),
  },
  stats: "minimal",
};
