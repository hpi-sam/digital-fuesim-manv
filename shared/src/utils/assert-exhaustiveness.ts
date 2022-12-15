/**
 * @See https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
 * A type error is raised when not all cases in a switch statement have been handled
 * ```ts
 *   switch (shape.kind) { // shape.kind is 'circle' | 'square'
 *       case "circle":
 *           // ...
 *           break;
 *       case "square":
 *           // ...
 *           break;
 *       default:
 *           assertExhaustiveness(shape.kind)
 * }
 * ```
 * @param variable for which TypeScript should make sure that all cases have been handled
 */
export function assertExhaustiveness(variable: never) {
    throw Error(`Unhandled case: ${variable}`);
}
