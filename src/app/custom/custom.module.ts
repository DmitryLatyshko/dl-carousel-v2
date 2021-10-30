import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomPageComponent } from './custom.component';
import { CarouselModule } from 'src/libs';

const routes: Routes = [
  {
    path: '',
    component: CustomPageComponent,
  },
];

@NgModule({
  declarations: [CustomPageComponent],
  imports: [CarouselModule, RouterModule.forChild(routes)],
})
export class CustomModule { }
