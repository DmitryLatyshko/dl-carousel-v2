import { Component } from '@angular/core';
import { CarouselDefaultItemModel, CarouselOptions } from 'src/libs';

function randomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

@Component({
  selector: 'ngx-owl-carousel-o-page',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
})
export class CustomPageComponent {
  public imagesData: CarouselDefaultItemModel[] = this._createItems(10);
  public options: CarouselOptions = {
    navigation: {
      navigation: true
    },
    loop: true,
    slideWidth: 200,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
  };

  private _createItems(count: number): CarouselDefaultItemModel[] {
    const images: CarouselDefaultItemModel[] = [];
    for (let i = 0; i < count; i++) {
      images.push({
        id: 'image' + i,
        source: 'https://picsum.photos/200/300?random=' + randomNumber(1, 100),
        alt: 'image' + i,
        title: 'image' + i,
      });
    }
    return images;
  }
}
