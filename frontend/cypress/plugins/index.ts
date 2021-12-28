// @ts-expect-error there is no type definition for this package yet
import * as cypressImageDiffPlugin from 'cypress-image-diff-js/dist/plugin';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const pluginConfig: Cypress.PluginConfig = (on, config) => {
    const getCompareSnapshotsPlugin = cypressImageDiffPlugin;
    getCompareSnapshotsPlugin(on, config);
};
export default pluginConfig;
