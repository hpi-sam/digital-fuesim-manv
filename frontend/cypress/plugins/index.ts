// @ts-expect-error there is no type definition for this package yet
// eslint-disable-next-line no-restricted-imports
import * as cypressImageDiffPlugin from 'cypress-image-diff-js/dist/plugin';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const pluginConfig: Cypress.PluginConfig = (on, config) => {
    cypressImageDiffPlugin.default(on, config);
};
export default pluginConfig;
