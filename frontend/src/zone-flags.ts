/**
 * The events in here will not be patched by zone.js
 * This means that angular will not (reliably) update templates
 * that use variables that have been set in the context of one of these events.
 *
 * Use
 * ```ts
 * ngZone.run(() => {
 *     // My code
 * });
 * ```
 * to reenter the zone.
 * You can debug this via
 * ```ts
 * NgZone.isInAngularZone()
 * ```
 */

(window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
(window as any).__zone_symbol__UNPATCHED_EVENTS = ['wheel', 'pointermove']; // disable patch specified eventNames
