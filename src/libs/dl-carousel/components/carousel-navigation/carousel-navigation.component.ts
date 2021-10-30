import { Component, Input } from '@angular/core';
import { NavigationData, NavigationPosition } from '../../models';
import { NavigationService } from '../../services';

@Component({
  selector: 'dl-carousel-navigation',
  templateUrl: './carousel-navigation.component.html',
  styleUrls: ['./carousel-navigation.component.scss'],
})
export class CarouselNavigationComponent {
  public storedNavigationPosition = NavigationPosition;

  @Input()
  public navigationData: NavigationData;

  constructor(private _navigationService: NavigationService) {}

  public prev(): void {
    this._navigationService.prev();
  }

  public next(): void {
    this._navigationService.next();
  }
}
