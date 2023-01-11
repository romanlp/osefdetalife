import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DialogImageComponent } from './dialog-image/dialog-image.component';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule, MatToolbarModule, MatIconModule, MatDialogModule,
        MatListModule
    ],
    exports: [
        MatButtonModule, MatToolbarModule, MatIconModule, MatDialogModule,
        MatListModule
    ],
    declarations: [DialogImageComponent]
})
export class SharedModule {
}
