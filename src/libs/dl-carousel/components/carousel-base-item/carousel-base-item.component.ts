import { Directive, Input } from '@angular/core';

@Directive()
export abstract class CarouselBaseItemComponent<TRecord> {
  public loading: boolean = false;

  @Input()
  public record: TRecord;

  constructor() {}
}
