import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Error404Component } from './error-404.component';

@NgModule({
    imports: [CommonModule, RouterModule],
    declarations: [Error404Component],
    exports: [Error404Component],
})
export class Error404Module {}
