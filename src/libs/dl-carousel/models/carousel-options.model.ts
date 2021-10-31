import { CarouselNavigationModel } from './carousel-navigation.model';

export interface CarouselOptions {
  navigation?: CarouselNavigationModel;
  loop?: boolean;
  center?: boolean;
  slideWidth?: number;

  mouseDrag?: boolean;
  touchDrag?: boolean;
  pullDrag?: boolean;
}
