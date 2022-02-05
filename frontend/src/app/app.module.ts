import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { StoreModule } from '@ngrx/store';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import type { AppState } from './state/app.state';
import { appReducers } from './state/app.reducer';
import { LandingPageModule } from './pages/landing-page/landing-page.module';

@NgModule({
    declarations: [AppComponent],
    imports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        StoreModule.forRoot<AppState>(appReducers),
        LandingPageModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
