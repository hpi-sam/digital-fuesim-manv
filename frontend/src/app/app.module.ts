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
import { HealthPageComponent } from './pages/health/health-page/health-page.component';
import { SharedModule } from './shared/shared.module';
import { ConfirmationModalModule } from './core/confirmation-modal/confirmation-modal.module';
import { MessagesModule } from './feature/messages/messages.module';
import { Error404Module } from './pages/error-404/error-404.module';

@NgModule({
    declarations: [AppComponent, HealthPageComponent],
    imports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        StoreModule.forRoot<AppState>(appReducers),
        LandingPageModule,
        Error404Module,
        SharedModule,
        ConfirmationModalModule,
        MessagesModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
