import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || 'Confirm' }}</h2>
    <div mat-dialog-content>
      <p id="confirm-message">{{ data.message || 'Confirm this action?' }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close(false)" cdkFocusInitial>Cancel</button>
      <button
        mat-raised-button
        color="warn"
        (click)="close(true)"
        aria-describedby="confirm-message"
      >
        Confirm
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly data = inject(MAT_DIALOG_DATA) as {
    title?: string;
    message?: string;
  };
  private readonly ref = inject(MatDialogRef<ConfirmDialogComponent, boolean>);
  close(ok: boolean) {
    this.ref.close(ok);
  }
}
