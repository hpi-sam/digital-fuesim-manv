import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListViewportsComponent } from './components/list-viewports/list-viewports.component';
import { StoreModule } from '@ngrx/store';
import { appReducers } from './state/app.reducers';
import { AppState } from './state/app.state';
import { AppAction } from './state/app.actions';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [AppComponent, ListViewportsComponent],
    imports: [
        CommonModule,
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        StoreModule.forRoot<AppState, AppAction>(appReducers),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
