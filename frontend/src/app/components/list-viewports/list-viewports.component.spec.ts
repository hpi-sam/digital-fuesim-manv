import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListViewportsComponent } from './list-viewports.component';

describe('ListViewportsComponent', () => {
    let component: ListViewportsComponent;
    let fixture: ComponentFixture<ListViewportsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ListViewportsComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ListViewportsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
