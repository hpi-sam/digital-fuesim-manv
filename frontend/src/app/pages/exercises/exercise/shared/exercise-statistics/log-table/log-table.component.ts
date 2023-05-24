import type { OnChanges, SimpleChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { LogEntry, Tag } from 'digital-fuesim-manv-shared';
import { StrictObject } from 'digital-fuesim-manv-shared';
import { difference } from 'lodash-es';

type KnownSpecifier = Omit<Tag, 'category'>;

interface Filter {
    category: string;
    specifiers: KnownSpecifier[];
}

@Component({
    selector: 'app-log-table',
    templateUrl: './log-table.component.html',
    styleUrls: ['./log-table.component.scss'],
})
export class LogTableComponent implements OnChanges {
    @Input() public logEntries!: readonly LogEntry[];

    public knownCategories: {
        [category: string]: { [specifier: string]: KnownSpecifier };
    } = {};

    public filters: Filter[] = [];

    public get availableCategories() {
        const knownCategoryNames = Object.keys(this.knownCategories);
        const categoriesInUse = this.filters.map((filter) => filter.category);

        return difference(knownCategoryNames, categoriesInUse)
            .sort((a, b) => a.localeCompare(b))
            .map((categoryName) => ({
                name: categoryName,
                identifier: categoryName,
            }));
    }

    public get availableSpecifiersPerCategory() {
        return StrictObject.fromEntries(
            StrictObject.entries(this.knownCategories).map(
                ([knownCategory, knownSpecifiers]) => [
                    knownCategory,
                    Object.entries(knownSpecifiers)
                        .filter(
                            ([knownSpecifier]) =>
                                this.filters
                                    .find(
                                        (filter) =>
                                            filter.category === knownCategory
                                    )
                                    ?.specifiers.every(
                                        (specifierInUse) =>
                                            specifierInUse.specifier !==
                                            knownSpecifier
                                    ) ?? true
                        )
                        .map(([, availableSpecifier]) => ({
                            name: availableSpecifier.name,
                            identifier: availableSpecifier.specifier,
                            color: availableSpecifier.color,
                            backgroundColor: availableSpecifier.backgroundColor,
                        })),
                ]
            )
        );
    }

    public get filteredLogEntries() {
        const predicate = (logEntry: LogEntry) =>
            this.filters.every((filter) => {
                if (filter.specifiers.length === 0) {
                    return logEntry.tags.some(
                        (tag) => tag.category === filter.category
                    );
                }

                return filter.specifiers.some((specifier) =>
                    logEntry.tags.some(
                        (tag) =>
                            tag.category === filter.category &&
                            tag.specifier === specifier.specifier
                    )
                );
            });

        return this.logEntries.filter(predicate);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!('logEntries' in changes)) return;

        this.knownCategories = {};

        // Process all tags in reverse order to use the latest available display name and color
        [...this.logEntries].reverse().forEach((logEntry) => {
            logEntry.tags.forEach((tag) => {
                if (!(tag.category in this.knownCategories)) {
                    this.knownCategories[tag.category] = {};
                }

                const knownCategory = this.knownCategories[tag.category]!;

                if (!(tag.specifier in knownCategory)) {
                    knownCategory[tag.specifier] = {
                        specifier: tag.specifier,
                        name: tag.name,
                        color: tag.color,
                        backgroundColor: tag.backgroundColor,
                    };
                }
            });
        });
    }

    addCategory(category: string) {
        if (!this.filters.some((filter) => filter.category === category)) {
            this.filters.push({ category, specifiers: [] });
        }
    }

    removeCategory(category: string) {
        const categoryIndex = this.filters.findIndex(
            (filter) => filter.category === category
        );

        if (categoryIndex !== -1) {
            this.filters.splice(categoryIndex, 1);
        }
    }

    clearFilters() {
        this.filters = [];
    }

    addSpecifierToCategory(specifier: string, category: string) {
        const categoryFilter = this.filters.find(
            (filter) => filter.category === category
        );

        if (!categoryFilter) return;

        const specifierIndex = categoryFilter.specifiers.findIndex(
            (filter) => filter.specifier === specifier
        );

        if (specifierIndex === -1) {
            categoryFilter.specifiers.push(
                this.knownCategories[category]![specifier]!
            );
        }
    }

    removeSpecifierFromCategory(specifier: string, category: string) {
        const categoryFilter = this.filters.find(
            (filter) => filter.category === category
        );

        if (!categoryFilter) return;

        const specifierIndex = categoryFilter.specifiers.findIndex(
            (filter) => filter.specifier === specifier
        );

        if (specifierIndex !== -1) {
            categoryFilter.specifiers.splice(specifierIndex, 1);
        }
    }
}
