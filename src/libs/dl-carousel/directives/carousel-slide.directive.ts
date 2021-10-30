import { Directive, Input, TemplateRef } from '@angular/core';

let nextId = 0;

@Directive({
  selector: 'ng-template[dlCarouselSlide]',
})
export class CarouselSlideDirective {
  /**
   * Unique slide identifier. Will be auto-generated if not provided.
   */
  @Input()
  public id = `dl-carousel-slide-${nextId++}`;

  /**
   * Width of slide.
   */
  @Input()
  public width? = 0;

  constructor(public tplRef: TemplateRef<any>) {}
}
