const webpack = require('webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    assert: require.resolve('assert'),
    process: require.resolve('process/browser'),
  };
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ]);
  config.ignoreWarnings = [
    (warning) =>
      warning.module &&
      warning.module.resource.includes('node_modules') &&
      warning.details &&
      warning.details.includes('source map'),
  ];
  return config;
};