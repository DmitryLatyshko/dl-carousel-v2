import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CustomPageComponent } from './custom.component';

const routes: Routes = [
  {
    path: '',
    component: CustomPageComponent,
  },
];

@NgModule({
  declarations: [CustomPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class CustomModule { }
