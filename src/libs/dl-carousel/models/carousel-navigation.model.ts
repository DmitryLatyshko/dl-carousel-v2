import { NavigationPosition } from '.';

export interface CarouselNavigationModel {
  navigation?: boolean;
  type?: 'arrow' | 'button';
  position?: NavigationPosition;
  prevHtmlText?: string;
  nextHtmlText?: string;
}
