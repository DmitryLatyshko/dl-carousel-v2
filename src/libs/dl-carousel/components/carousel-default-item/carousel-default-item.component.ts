import { Component } from '@angular/core';
import { CarouselDefaultItemModel } from '../../models';
import { CarouselBaseItemComponent } from '../carousel-base-item/carousel-base-item.component';

@Component({
  selector: 'dl-carousel-default-item',
  templateUrl: './carousel-default-item.component.html',
  styleUrls: ['./carousel-default-item.component.scss'],
})
export class CarouselDefaultItemComponent extends CarouselBaseItemComponent<CarouselDefaultItemModel> {
  constructor() {
    super();
  }
}
