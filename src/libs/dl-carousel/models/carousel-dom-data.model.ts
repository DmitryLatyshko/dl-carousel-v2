import { CarouselDraggableModel } from './carousel-draggable.model';

export class CarouselDomData implements CarouselDraggableModel {
  public isMouseDraggable: boolean = false;
  public isTouchDraggable: boolean = false;
  public isGrab: boolean = false;
}
