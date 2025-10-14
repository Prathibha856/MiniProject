const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const webpack = require('webpack');
const SuppressMimeErrorPlugin = require('./suppress-mime-error');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          'react-native',
          'react-native-web',
          '@react-navigation',
          'react-native-gesture-handler',
          'react-native-reanimated',
          'react-native-screens',
          'react-native-safe-area-context',
          '@react-native-async-storage',
        ],
      },
    },
    argv
  );

  // Override React Native with react-native-web and add stubs for missing modules
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    
    // Reanimated - use stub for web
    'react-native-reanimated': path.resolve(__dirname, 'web-stubs/Reanimated.js'),
    
    // Platform stubs - all variations including absolute paths
    'react-native/Libraries/Utilities/Platform': path.resolve(__dirname, 'web-stubs/Platform.js'),
    '../Utilities/Platform': path.resolve(__dirname, 'web-stubs/Platform.js'),
    '../../Utilities/Platform': path.resolve(__dirname, 'web-stubs/Platform.js'),
    '../../../Libraries/Utilities/Platform': path.resolve(__dirname, 'web-stubs/Platform.js'),
    '../../../../Libraries/Utilities/Platform': path.resolve(__dirname, 'web-stubs/Platform.js'),
    './Platform': path.resolve(__dirname, 'web-stubs/Platform.js'),
    
    // Alert Manager
    './RCTAlertManager': path.resolve(__dirname, 'web-stubs/RCTAlertManager.js'),
    
    // Networking
    './RCTNetworking': path.resolve(__dirname, 'web-stubs/RCTNetworking.js'),
    '../../Network/RCTNetworking': path.resolve(__dirname, 'web-stubs/RCTNetworking.js'),
    
    // BackHandler
    '../Utilities/BackHandler': path.resolve(__dirname, 'web-stubs/BackHandler.js'),
    
    // Platform Color Types
    './PlatformColorValueTypes': path.resolve(__dirname, 'web-stubs/PlatformColorValueTypes.js'),
    '../../StyleSheet/PlatformColorValueTypes': path.resolve(__dirname, 'web-stubs/PlatformColorValueTypes.js'),
    
    // Base View Config
    './BaseViewConfig': path.resolve(__dirname, 'web-stubs/BaseViewConfig.js'),
    
    // DevTools Settings
    '../DevToolsSettings/DevToolsSettingsManager': path.resolve(__dirname, 'web-stubs/DevToolsSettingsManager.js'),
    
    // Accessibility
    '../Components/AccessibilityInfo/legacySendAccessibilityEvent': path.resolve(__dirname, 'web-stubs/legacySendAccessibilityEvent.js'),
    
    // Image - use react-native-web's Image
    '../../Image/Image': 'react-native-web/dist/exports/Image',
  };

  // Add a custom resolver plugin to handle deep relative paths
  config.resolve.plugins = config.resolve.plugins || [];
  config.resolve.plugins.push({
    apply(resolver) {
      const target = resolver.ensureHook('resolve');
      resolver.getHook('resolve').tapAsync('CustomResolverPlugin', (request, resolveContext, callback) => {
        // Handle Platform imports from react-native internals
        if (request.request && request.request.includes('Libraries/Utilities/Platform')) {
          return resolver.doResolve(
            target,
            {
              ...request,
              request: path.resolve(__dirname, 'web-stubs/Platform.js'),
            },
            null,
            resolveContext,
            callback
          );
        }
        callback();
      });
    },
  });

  // Add fallback for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
    stream: false,
    buffer: false,
    path: false,
    fs: false,
  };

  // Suppress warnings about missing exports and modules
  config.ignoreWarnings = [
    /export .* was not found/,
    /Can't resolve/,
    /Module not found/,
    /MIME for Buffer/,
    /Could not find MIME for Buffer/,
    (warning) => {
      return warning.message && warning.message.includes('MIME for Buffer');
    },
  ];

  // Modify the infrastructure logging to suppress MIME errors
  config.infrastructureLogging = {
    ...config.infrastructureLogging,
    level: 'error',
  };

  // Add custom plugin to filter out MIME errors
  config.plugins = config.plugins || [];
  config.plugins.push(new SuppressMimeErrorPlugin());

  return config;
};
