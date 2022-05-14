const maximumNumberOfValues = 200;

export function decimateStatistics<T>(statistic: T[]): T[] {
    const n = Math.ceil(statistic.length / (maximumNumberOfValues / 2));
    // Performance shortcut
    if (n === 1) {
        return statistic;
    }
    // TODO:_Try to always use the maximum possible number of values
    const decimatedStatistics = statistic.filter(
        (value, index) => index % n === 0
    );
    // The first element is always included
    // Always include the last element
    const lastElement = statistic.at(-1);
    if (lastElement && decimatedStatistics.at(-1) !== lastElement) {
        decimatedStatistics.push(lastElement);
    }
    return decimatedStatistics;
}
