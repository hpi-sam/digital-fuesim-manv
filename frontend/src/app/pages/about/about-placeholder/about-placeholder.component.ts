import { Location as NgLocation } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { Observable } from 'rxjs';

@Component({
    selector: 'app-about-placeholder',
    templateUrl: './about-placeholder.component.html',
    styleUrls: ['./about-placeholder.component.scss'],
})
export class AboutPlaceholderComponent implements OnInit {
    content$!: Observable<string>;

    /**
     * The title of the page shown as h2 headline.
     */
    @Input() pageTitle = '';

    /**
     * The filename in the assets/about/ directory where the page content should be loaded from.
     */
    @Input() contentFile = '';

    constructor(
        private readonly location: NgLocation,
        private readonly http: HttpClient
    ) {}

    ngOnInit(): void {
        this.content$ = this.http.get(`assets/about/${this.contentFile}`, {
            responseType: 'text',
        });
    }

    back(event: MouseEvent): void {
        event.preventDefault();

        if (history.length > 1) {
            this.location.back();
        } else {
            window.close();
        }
    }
}
