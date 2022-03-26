/**
 * The type of a constructor function
 * Mostly used in Mixins
 * @see https://www.typescriptlang.org/docs/handbook/mixins.html
 * @param Instance The type of the instance
 */
export type Constructor<Instance = any> = new (...args: any[]) => Instance;
