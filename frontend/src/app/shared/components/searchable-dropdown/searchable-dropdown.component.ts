import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-searchable-dropdown',
    templateUrl: './searchable-dropdown.component.html',
    styleUrls: ['./searchable-dropdown.component.scss'],
})
export class SearchableDropdownComponent {
    @Input()
    public options: string[] = [];

    public filter = '';

    public get filteredOptions() {
        return this.options.filter((option) =>
            option.toLowerCase().includes(this.filter.toLowerCase())
        );
    }

    @Output()
    public readonly selected: EventEmitter<string> = new EventEmitter();
}
