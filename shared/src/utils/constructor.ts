/**
 * The type of a constructor function
 * @param Instance The type of the instance
 */
export type Constructor<Instance = any> = new (...args: any[]) => Instance;
