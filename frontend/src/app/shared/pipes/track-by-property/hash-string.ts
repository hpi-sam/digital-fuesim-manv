/**
 * @returns a shorter hashed version of a string
 * - this is just for making the string smaller - do not use it for crypto!
 *
 * A shorter string makes quicker comparisons.
 * The collision probability is not 0. Only use it where best effort is good enough.
 */
export function hashString(str: string): string {
    // See https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        // eslint-disable-next-line no-bitwise
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash.toString();
}
