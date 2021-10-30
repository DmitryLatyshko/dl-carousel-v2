import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CarouselComponent,
  CarouselContainerComponent,
  CarouselDefaultItemComponent,
  CarouselItemWrapperComponent,
  CarouselNavigationComponent,
  CarouselStageComponent,
} from './components';
import { CarouselSlideDirective } from './directives';
import { CarouselService, NavigationService } from './services';

@NgModule({
  declarations: [
    CarouselComponent,
    CarouselContainerComponent,
    CarouselDefaultItemComponent,
    CarouselItemWrapperComponent,
    CarouselNavigationComponent,
    CarouselStageComponent,
    CarouselSlideDirective,
  ],
  imports: [CommonModule, FormsModule],
  exports: [CarouselComponent],
  providers: [CarouselService, NavigationService],
})
export class CarouselModule {}
