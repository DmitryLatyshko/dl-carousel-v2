import { DOCUMENT } from '@angular/common';
import { AfterContentInit, Component, ContentChildren, ElementRef, Inject, Input, OnDestroy, OnInit, QueryList } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CarouselSlideDirective } from '../../directives';
import { CarouselDomData, CarouselOptions, CarouselSlideModel, CarouselStageModel, NavigationData } from '../../models';
import { CarouselService, CarouselViewData } from '../../services';

@Component({
  selector: 'dl-carousel-container',
  templateUrl: './carousel-container.component.html',
  styleUrls: ['./carousel-container.component.scss'],
})
export class CarouselContainerComponent implements OnInit, AfterContentInit, OnDestroy {
  private _docRef: Document;
  private _subscription: Subscription = new Subscription();

  private _carouselWidth: number;

  @ContentChildren(CarouselSlideDirective)
  public slides: QueryList<CarouselSlideDirective>;

  @Input()
  public options: CarouselOptions;

  public stageModel: CarouselStageModel;

  public slidesData: CarouselSlideModel[];

  public domData: CarouselDomData;

  public navigationData: NavigationData;

  constructor(
    private _el: ElementRef,
    private _carouselService: CarouselService,
    @Inject(DOCUMENT) docRef: any,
  ) {
    this._docRef = docRef as Document;
  }

  private _setupCarouselService(slides: CarouselSlideDirective[]): void {
    this._carouselService.setup(this._carouselWidth, slides, this.options);
    this._carouselService.initialize(slides);
  }

  private _subscribeSlidesChanges(): void {
    const slidesChangesSubscription$ = this.slides.changes
      .pipe(
        tap((slides: QueryList<CarouselSlideDirective>) => {
          if (slides.toArray().length) {
            this._setupCarouselService(slides.toArray());
          } else {
            console.log(
              "There are no slides to show. So the carousel won't be rendered"
            );
          }
        }),
      );
    this._subscription.add(slidesChangesSubscription$.subscribe(() => {}));
  }

  private _subscribeViewSettings(): void {
    const viewSettings$ = this._carouselService.getViewSettings().pipe(
      tap((data: CarouselViewData) => {
        this.stageModel = data.stageModel;
        this.slidesData = data.slidesData;
        this.domData = data.domData;
        this.navigationData = data.navigationData;
      })
    );
    this._subscription.add(viewSettings$.subscribe(() => { }));
  }

  private _spyDataStreams(): void {
    this._subscribeViewSettings();
  }

  private _setupCarouselWidth(): void {
    this._carouselWidth =
      this._el.nativeElement.querySelector('.dl-carousel').clientWidth;
  }

  public ngOnInit(): void {
    this._spyDataStreams();
    this._setupCarouselWidth();
  }

  public ngAfterContentInit(): void {
    if (this.slides.toArray().length) {
      this._setupCarouselService(this.slides.toArray());
    } else {
      console.log(
        "There are no slides to show. So the carousel won't be rendered"
      );
      // TODO: Display blank-slate.
    }

    this._subscribeSlidesChanges();
  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
