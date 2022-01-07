import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { StoreModule } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import type { AppState } from './state/app.state';
import { PatientsListComponent } from './components/patients-list/patients-list.component';
import { appReducers } from './state/app.reducer';

@NgModule({
    declarations: [AppComponent, PatientsListComponent],
    imports: [
        CommonModule,
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        StoreModule.forRoot<AppState>(appReducers),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
