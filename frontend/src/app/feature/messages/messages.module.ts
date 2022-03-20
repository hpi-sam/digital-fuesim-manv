import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from 'src/app/shared/shared.module';
import { AlertsComponent } from './alerts/alerts.component';
import { MessageBodyComponent } from './message-body/message-body.component';
import { ToastsComponent } from './toasts/toasts.component';
import { CustomTimerProgressBarComponent } from './custom-timer-progress-bar/custom-timer-progress-bar.component';
import { AppShowMoreComponent } from './show-more/app-show-more.component';
import { LogToStringPipe } from './log-to-string/log-to-string.pipe';

@NgModule({
    imports: [CommonModule, BrowserAnimationsModule, SharedModule],
    declarations: [
        AppShowMoreComponent,
        AlertsComponent,
        ToastsComponent,
        MessageBodyComponent,
        CustomTimerProgressBarComponent,
        LogToStringPipe,
    ],
    exports: [AlertsComponent, ToastsComponent],
})
export class MessagesModule {}
