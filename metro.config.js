const {getDefaultConfig} = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');


module.exports = ( () => {
  const defaultConfig =  getDefaultConfig(__dirname);
  defaultConfig.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg');
  defaultConfig.resolver.blacklistRE = exclusionList([
    /android\/.*/,
    /ios\/.*/
  ]);
  return wrapWithReanimatedMetroConfig(defaultConfig);
})();
