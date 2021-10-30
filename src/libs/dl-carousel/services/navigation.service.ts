import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import {
  CarouselNavigationModel,
  CarouselOptions,
  NavigationData,
  NavigationPosition,
} from '../models';
import { CarouselService } from './carousel.service';

@Injectable()
export class NavigationService {
  private _subscription: Subscription = new Subscription();

  private _navigationData: NavigationData = {
    disabled: true,
    prevDisabled: true,
    nextDisabled: true,
    navigationModel: {
      navigation: false,
      type: 'button',
      position: NavigationPosition.Default,
      prevHtmlText: '',
      nextHtmlText: '',
    },
  };

  constructor(private _carouselService: CarouselService) {
    this._spyDataStreams();
  }

  private _getPosition(): number {
    return this._carouselService.getRelativePosition();
  }

  private _getNewPosition(successor: boolean): number {
    let position: number;
    Number;
    position = this._getPosition();
    if (successor) {
      position += 1;
    } else {
      position -= 1;
    }
    return position;
  }

  private _updateNavigationButtons(): void {
    const settings: CarouselOptions = this._carouselService.carouselSettings;
    const loop = settings.loop as boolean;
    const index = this._getPosition();
    if (settings.navigation?.navigation) {
      this._navigationData.prevDisabled =
        !loop && index <= this._carouselService.minimum(true);
      this._navigationData.nextDisabled =
        !loop && index >= this._carouselService.maximum(true);
    }
    this._carouselService.navigationData = this._navigationData;
  }

  private _initializeNavigationData(): void {
    this._navigationData.disabled = true;
    this._navigationData.navigationModel = this._carouselService
      .carouselSettings.navigation as CarouselNavigationModel;
    this._carouselService.navigationData = this._navigationData;
  }

  private _setNavigationDataDisabled(): void {
    const settings: CarouselOptions = this._carouselService.carouselSettings;
    this._navigationData.disabled = !settings.navigation?.navigation || false;
  }

  private _update(): void {
    this._updateNavigationButtons();
  }

  private _subscribeInitializedCarousel(): void {
    const initializedCarousel$: Observable<string> = this._carouselService
      .getInitializedCarousel()
      .pipe(
        tap((state) => {
          this._initializeNavigationData();
          this._setNavigationDataDisabled();
          this._update();
          this._carouselService.sendChanges();
        })
      );
    this._subscription.add(initializedCarousel$.subscribe(() => {}));
  }

  private _subscribeChangedSettingsCarousel(): void {
    const changedSettingCarousel$: Observable<any> = this._carouselService
      .getChangedSettingsCarousel()
      .pipe(
        filter((data) => data.property.name === 'position'),
        tap((data) => {
          this._update();
        })
      );
    this._subscription.add(changedSettingCarousel$.subscribe(() => {}));
  }

  private _spyDataStreams(): void {
    this._subscribeInitializedCarousel();
    this._subscribeChangedSettingsCarousel();
  }

  public prev(): void {
    this._carouselService.to(this._getNewPosition(false));
  }

  public next(): void {
    this._carouselService.to(this._getNewPosition(true));
  }
}
