import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { AboutRoutingModule } from './about-routing.module';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { LicenseComponent } from './license/license.component';
import { TemplateComponent } from './template/template.component';

@NgModule({
    declarations: [ImprintComponent, PrivacyComponent, LicenseComponent, TemplateComponent],
    imports: [CommonModule, AboutRoutingModule, SharedModule],
})
export class AboutModule {}
