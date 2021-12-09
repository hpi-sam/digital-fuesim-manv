import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// this enables this option globally
import { enableMapSet } from 'immer';
enableMapSet();

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListViewportsComponent } from './components/list-viewports/list-viewports.component';
import { StoreModule } from '@ngrx/store';
import { appReducers } from './state/app.reducers';

@NgModule({
    declarations: [AppComponent, ListViewportsComponent],
    imports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        StoreModule.forRoot(appReducers),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
