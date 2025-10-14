module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      "nativewind/babel",
      ["@babel/plugin-proposal-class-properties", { "loose": true }],
      ["@babel/plugin-transform-private-methods", { "loose": true }],
      ["@babel/plugin-transform-private-property-in-object", { "loose": true }],
      // Only add reanimated plugin for native platforms
      ...(process.env.EXPO_PLATFORM !== 'web' ? ['react-native-reanimated/plugin'] : [])
    ],
  };
};
