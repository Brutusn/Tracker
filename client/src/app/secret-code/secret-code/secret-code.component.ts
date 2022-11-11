import { Component  } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { map, mapTo, merge, Subject } from 'rxjs';
import { SECRET_CODE } from '../../shared/route';

@Component({
  selector: 'app-secret-code',
  templateUrl: './secret-code.component.html',
  styleUrls: ['./secret-code.component.css']
})
export class SecretCodeComponent {
  readonly inputControl = new UntypedFormControl('', [
    Validators.minLength(SECRET_CODE.length - 2),
    Validators.maxLength(SECRET_CODE.length + 2),
    Validators.required
  ]);
  private readonly $result = new Subject<string>();


  readonly result$ = merge(this.inputControl.valueChanges.pipe(mapTo('')), this.$result.asObservable())
    .pipe(
      map((value) => {
        if (!value) return '';

        if (value.toString() === SECRET_CODE) {
          return '✅ De code is goed! Succes met de route.';
        }

        return '❎ De code is niet goed! Probeer het nog eens.';
      })
    );

  handleCheck(): void {
    if (this.inputControl.valid) {
      this.$result.next(this.inputControl.value);
    }
  }
}
