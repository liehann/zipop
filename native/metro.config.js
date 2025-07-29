const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'mp3', 'wav', 'aac', 'm4a'],
  },
  watchFolders: [
    __dirname + '/assets',
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
