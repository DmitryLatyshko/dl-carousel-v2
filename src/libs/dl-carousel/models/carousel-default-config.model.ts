import { NavigationPosition } from '.';
import { CarouselNavigationModel } from './carousel-navigation.model';
import { CarouselOptions } from './carousel-options.model';

export class CarouselDefaultConfigOptions implements CarouselOptions {
  navigation = {
    navigation: false,
    type: 'button',
    position: NavigationPosition.Inner,
    prevHtmlText: 'prev',
    nextHtmlText: 'next',
  } as CarouselNavigationModel;
  loop: false;
  slideWidth = 0;

  mouseDrag = true;
  touchDrag = true;
  pullDrag = true;

  constructor() {}
}
