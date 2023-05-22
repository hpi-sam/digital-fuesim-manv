import type { OnChanges, SimpleChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { LogEntry, Tag } from 'digital-fuesim-manv-shared';

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

    public filters: Filter[] = [
        {
            category: 'patient',
            specifiers: [
                {
                    specifier: '123',
                    name: '123',
                    color: 'black',
                    backgroundColor: 'lime',
                },
                {
                    specifier: '456',
                    name: '654',
                    color: 'black',
                    backgroundColor: 'lime',
                },
            ],
        },
        // { category: 'patient', specifiers: ['123', '456'] },
    ];

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
