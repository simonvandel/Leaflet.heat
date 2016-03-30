module.exports = {
    entry: "./entry.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
      loaders: [
        {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
      ]
  },
  eslint: {
    emitWarning: true,
    emitError: false,
    fix: true
  }
};
