export interface HeightChangeObservationStrategies {
    /**
     * Observe whether the content dimensions have been resized (e.g. window or an outer container got resized)
     */
    resizeObserver: boolean;
    /**
     * Observe wether the content or its children got mutated (attributes changed, new element added, element removed etc.)
     * Can be non-performant if the content is large
     */
    mutationObserver: boolean;
    /**
     * Check every {@link polling} ms if the scrollHeight of the content has changed
     * number - the polling interval in ms
     * false - disable polling
     */
    polling: number | false;
}
