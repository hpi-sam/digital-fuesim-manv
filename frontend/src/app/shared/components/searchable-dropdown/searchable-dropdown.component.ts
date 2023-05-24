import type { AfterViewInit } from '@angular/core';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';

interface Option {
    name: string;
    identifier: string;
    color?: string;
    backgroundColor?: string;
}

@Component({
    selector: 'app-searchable-dropdown',
    templateUrl: './searchable-dropdown.component.html',
    styleUrls: ['./searchable-dropdown.component.scss'],
})
export class SearchableDropdownComponent implements AfterViewInit {
    @Input()
    public options: Option[] = [];

    public filter = '';
    public selectedIndex = -1;

    public get filteredOptions() {
        return this.options.filter((option) =>
            option.name.toLowerCase().includes(this.filter.toLowerCase())
        );
    }

    @Output()
    public readonly selected: EventEmitter<string> = new EventEmitter();

    @ViewChild('searchInput')
    private readonly searchInput!: ElementRef;

    ngAfterViewInit() {
        this.searchInput.nativeElement.focus();
    }

    increaseSelectedIndex() {
        if (this.selectedIndex + 1 < this.filteredOptions.length)
            this.selectedIndex++;
    }

    decreaseSelectedIndex() {
        if (this.selectedIndex - 1 >= -1) this.selectedIndex--;
    }

    resetSelectedIndex() {
        if (this.filteredOptions.length === 1) {
            this.selectedIndex = 0;
        } else {
            this.selectedIndex = -1;
        }
    }

    confirmSelection() {
        if (
            this.selectedIndex > -1 &&
            this.selectedIndex < this.filteredOptions.length
        ) {
            this.selected.emit(
                this.filteredOptions[this.selectedIndex]!.identifier
            );
        }
    }
}
