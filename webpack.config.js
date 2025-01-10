const path = require("path");

module.exports = {
  entry: {
    script: "./src/script.js",
  },
  mode: "development",
  output: {
    filename: "[name].mit.js",
    path: path.resolve(__dirname, "dist/publicAppRevolut"),
  },
  devtool: "inline-source-map",
};
