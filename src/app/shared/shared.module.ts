import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
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
