const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Explicitly set projectRoot and watchFolders for monorepo
config.projectRoot = projectRoot;
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Ensure Metro properly resolves assets and source extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// 4. In monorepo setups, route any legacy /index.bundle requests to expo-router/entry
config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    if (url.includes('/index.bundle') && !url.includes('node_modules/expo-router/entry')) {
      return url.replace('/index.bundle', '/node_modules/expo-router/entry.bundle');
    }
    return url;
  },
};

// 5. Wrap with NativeWind
module.exports = withNativeWind(config, { input: './global.css' });
