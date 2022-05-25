import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { HospitalEditorModalComponent } from './hospital-editor-modal/hospital-editor-modal.component';
import { HospitalEditorItemComponent } from './hospital-editor-item/hospital-editor-item.component';

@NgModule({
    declarations: [HospitalEditorModalComponent, HospitalEditorItemComponent],
    imports: [CommonModule, SharedModule, FormsModule, NgbDropdownModule],
})
export class HospitalEditorModule {}
