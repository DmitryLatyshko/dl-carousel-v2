import { CarouselBaseItemModel } from './carousel-base-item.model';

export interface CarouselDefaultItemModel extends CarouselBaseItemModel {
  alt?: string;
  title?: string;
  isIcon?: boolean;
}
