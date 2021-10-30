import { Component, Input } from '@angular/core';
import { CarouselBaseItemModel, CarouselOptions } from '../../models';
@Component({
  selector: 'dl-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent {
  @Input()
  public items: CarouselBaseItemModel[];

  @Input()
  public options: CarouselOptions;

  public loading: boolean = false;
}
