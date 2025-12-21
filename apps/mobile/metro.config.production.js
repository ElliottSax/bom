/**
 * Metro configuration for React Native - Production
 * https://github.com/facebook/metro
 */

const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);

  return {
    ...defaultConfig,
    transformer: {
      ...defaultConfig.transformer,
      minifierConfig: {
        // Terser options for production minification
        keep_fnames: false,
        mangle: {
          toplevel: true,
          keep_fnames: false,
          reserved: [],
        },
        compress: {
          dead_code: true,
          drop_console: true, // Remove console logs in production
          drop_debugger: true,
          global_defs: {
            __DEV__: false,
          },
          passes: 2,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          reduce_vars: true,
          side_effects: true,
          unused: true,
        },
        output: {
          comments: false,
          preserve_annotations: false,
        },
      },
      minifierPath: require.resolve('metro-minify-terser'),
      optimizationSizeLimit: 250000, // 250KB limit for individual modules
    },
    resolver: {
      ...defaultConfig.resolver,
      // Production-specific module resolution
      sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
      assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    },
    serializer: {
      ...defaultConfig.serializer,
      // Optimize bundle output
      createModuleIdFactory: () => {
        // Use numeric IDs in production for smaller bundle size
        let nextId = 0;
        const moduleIds = new Map();

        return (path) => {
          if (!moduleIds.has(path)) {
            moduleIds.set(path, nextId++);
          }
          return moduleIds.get(path);
        };
      },
      processModuleFilter: (module) => {
        // Exclude test files from production bundle
        if (module.path.includes('__tests__') ||
            module.path.includes('.test.') ||
            module.path.includes('.spec.')) {
          return false;
        }
        return true;
      },
    },
    server: {
      ...defaultConfig.server,
      // Disable HMR in production
      enableVisualizer: false,
      useGlobalHotkey: false,
    },
    // Caching configuration for faster builds
    cacheStores: [
      {
        name: 'production-cache',
        version: '1.0.0',
      },
    ],
    // RAM bundle configuration for better startup performance
    transformer: {
      ...defaultConfig.transformer,
      asyncRequireModulePath: require.resolve('metro-runtime/src/modules/asyncRequire'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true, // Inline requires for better performance
        },
      }),
    },
  };
})();