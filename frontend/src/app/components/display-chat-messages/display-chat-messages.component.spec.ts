import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayChatMessagesComponent } from './display-chat-messages.component';

describe('DisplayChatMessagesComponent', () => {
    let component: DisplayChatMessagesComponent;
    let fixture: ComponentFixture<DisplayChatMessagesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DisplayChatMessagesComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DisplayChatMessagesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
