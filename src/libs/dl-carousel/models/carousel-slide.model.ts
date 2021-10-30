import { TemplateRef } from '@angular/core';

export class CarouselSlideModel {
  id: string;
  tplRef: TemplateRef<any>;
  width?: number;
  isCloned?: boolean;
}
