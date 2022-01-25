import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';

import { StoreModule } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import type { AppState } from './state/app.state';
import { PatientsListComponent } from './components/patients-list/patients-list.component';
import { appReducers } from './state/app.reducer';
import { ClientOverviewComponent } from './client-overview/client-overview.component';

@NgModule({
    declarations: [
        AppComponent,
        PatientsListComponent,
        ClientOverviewComponent,
    ],
    imports: [
        CommonModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        MatTableModule,
        AppRoutingModule,
        StoreModule.forRoot<AppState>(appReducers),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
