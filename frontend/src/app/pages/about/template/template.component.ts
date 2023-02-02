import { Location as NgLocation } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnDestroy, OnInit {
    private readonly destroy$ = new Subject<void>();
    imprintContent?: string;

    /**
     * The title of the page shown as h2 headline.
     */
    @Input() title = '';

    /**
     * The filename in the assets/about/ directory where the page content should be loaded from.
     */
    @Input() contentFile = '';

    constructor(
        private readonly location: NgLocation,
        private readonly http: HttpClient
    ) {}

    ngOnInit(): void {
        this.http
            .get(`assets/about/${this.contentFile}`, { responseType: 'text' })
            .pipe(takeUntil(this.destroy$))
            .subscribe((response) => (this.imprintContent = response));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }

    back(event: MouseEvent): void {
        event.preventDefault();
        this.location.back();
    }
}
