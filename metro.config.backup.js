const { getDefaultConfig } = require('expo/metro-config');
const { withNativewindMetro } = require('nativewind/metro');

module.exports = withNativewindMetro(getDefaultConfig(__dirname));
