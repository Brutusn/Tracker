import { Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { UserDto } from "../../../../../models/src/user";

@Component({
  selector: "app-delete-user-dialog",
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: "./delete-user-dialog.component.html",
  styleUrl: "./delete-user-dialog.component.css",
})
export class DeleteUserDialogComponent {
  protected readonly dialogData = inject(MAT_DIALOG_DATA) as UserDto;
}
