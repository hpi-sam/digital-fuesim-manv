import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DisplayChatMessagesComponent } from './components/display-chat-messages/display-chat-messages.component';

@NgModule({
    declarations: [AppComponent, DisplayChatMessagesComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgxsModule.forRoot([], {
            developmentMode: !environment.production,
            selectorOptions: {
                // in preparation for ngxs@4
                suppressErrors: false,
                injectContainerState: false,
            },
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
