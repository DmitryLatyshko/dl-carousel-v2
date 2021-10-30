import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnDestroy,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CarouselBaseItemModel } from '../../models';
import { CarouselBaseItemComponent } from '../carousel-base-item/carousel-base-item.component';
import { CarouselDefaultItemComponent } from '../carousel-default-item/carousel-default-item.component';

@Component({
  selector: 'dl-carousel-item-wrapper',
  template: '<ng-container #carouselItem></ng-container>',
})
export class CarouselItemWrapperComponent implements OnInit, OnDestroy {
  private _itemComponentRef: ComponentRef<
    CarouselBaseItemComponent<CarouselBaseItemModel>
  >;

  @ViewChild('carouselItem', { read: ViewContainerRef, static: true })
  public itemViewContainerRed: ViewContainerRef;

  @Input()
  public record: CarouselBaseItemModel;

  constructor(
    private readonly _componentFactoryResolver: ComponentFactoryResolver
  ) { }

  private _destroyItemComponentRef(): void {
    if (!this._itemComponentRef) {
      return;
    }
    this._itemComponentRef.destroy();
  }

  private _clearItemViewContainerRef(): void {
    this.itemViewContainerRed.clear();
  }

  private _getItemComponentClass(): Type<
    CarouselBaseItemComponent<CarouselBaseItemModel>
  > {
    return CarouselDefaultItemComponent;
  }

  private _generateItemComponentRef(
    itemComponentClass: Type<CarouselBaseItemComponent<CarouselBaseItemModel>>
  ): ComponentRef<CarouselBaseItemComponent<CarouselBaseItemModel>> {
    this._clearItemViewContainerRef();
    const componentFactory =
      this._componentFactoryResolver.resolveComponentFactory(
        itemComponentClass
      );
    return this.itemViewContainerRed.createComponent(componentFactory);
  }

  private _initializeItemComponentRef(): void {
    const itemComponentClass = this._getItemComponentClass();
    this._itemComponentRef = this._generateItemComponentRef(itemComponentClass);
  }

  private _initializeItemComponentProperties(): void {
    const componentInstance = this._itemComponentRef?.instance;
    if (!componentInstance) {
      return;
    }
    componentInstance.record = this.record;
  }

  private _initializeItem(): void {
    this._initializeItemComponentRef();
    this._initializeItemComponentProperties();
  }

  public ngOnInit(): void {
    this._initializeItem();
  }

  public ngOnDestroy(): void {
    this._destroyItemComponentRef();
    this._clearItemViewContainerRef();
  }
}
