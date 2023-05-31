/**
 *
 * @param duration in ms
 */
export function formatDuration(duration: number): string {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const secondsStr = (seconds % 60).toLocaleString(undefined, {
        minimumIntegerDigits: 2,
    });
    const minutesStr = (minutes % 60).toLocaleString(undefined, {
        minimumIntegerDigits: 2,
    });
    const hoursStr = (hours % 24).toLocaleString(undefined, {
        minimumIntegerDigits: 2,
    });
    const daysStr = days > 0 ? `${days}${thinSpace}d ` : '';

    return `${daysStr}${hoursStr}:${minutesStr}:${secondsStr}`;
}

const thinSpace = `\u2009`;
