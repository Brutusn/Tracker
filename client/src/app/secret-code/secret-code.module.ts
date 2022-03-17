import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecretCodeComponent } from './secret-code/secret-code.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    SecretCodeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{
      path: '',
      component: SecretCodeComponent,
    }]),
  ]
})
export class SecretCodeModule { }
