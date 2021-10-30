import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { CustomPageComponent } from './custom/custom.component';
import { CustomModule } from './custom/custom.module';

const appRoutes: Routes = [
  {
    path: 'custom',
    component: CustomPageComponent,
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    CustomModule,
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
