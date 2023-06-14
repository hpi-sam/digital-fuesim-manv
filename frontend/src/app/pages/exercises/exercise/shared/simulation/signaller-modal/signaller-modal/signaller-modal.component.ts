import type { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UUID } from 'digital-fuesim-manv-shared';
import { Subject } from 'rxjs';
import { HotkeysService } from 'src/app/shared/services/hotkeys.service';

@Component({
    selector: 'app-signaller-modal',
    templateUrl: './signaller-modal.component.html',
    styleUrls: ['./signaller-modal.component.scss'],
})
export class SignallerModalComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    private readonly destroy$ = new Subject<void>();

    @Input()
    currentSimulatedRegionId!: UUID;

    @ViewChild('modal')
    private readonly modalRef!: ElementRef;

    @ViewChild('button')
    private readonly buttonRef!: ElementRef;

    constructor(
        private readonly activeModal: NgbActiveModal,
        private readonly hotkeys: HotkeysService
    ) {}

    ngOnInit() {
        console.log('dummy');
    }

    ngAfterViewInit() {
        // this.hotkeys
        //     .addShortcut({
        //         keys: 'F1',
        //         element: this.modalRef.nativeElement,
        //     })
        //     .pipe(takeUntil(this.destroy$))
        //     .subscribe((e) => console.log('F1', e));
        console.log('dummy');
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    public close() {
        this.activeModal.close();
        // this.hotkeys
        //     .addShortcut({ keys: 'F1', element: this.buttonRef.nativeElement })
        //     .pipe(takeUntil(this.destroy$))
        //     .subscribe((e) => console.log('New F1', e));
    }
}
