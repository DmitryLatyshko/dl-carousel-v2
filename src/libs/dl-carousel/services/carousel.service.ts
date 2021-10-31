import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CarouselSlideDirective } from '../directives';
import {
  CarouselDefaultConfigOptions,
  CarouselDomData,
  CarouselOptions,
  CarouselSlideModel,
  CarouselStageModel,
  NavigationData,
  NavigationPosition,
} from '../models';

export class Coords {
  public x: number;
  public y: number;
}

export class CarouselViewData {
  public stageModel: CarouselStageModel;
  public slidesData: CarouselSlideModel[];
  public domData: CarouselDomData;
  public navigationData: NavigationData;
}

enum Pipe {
  all,
  width,
  items,
  settings,
  position,
}

@Injectable()
export class CarouselService {
  private readonly _clonedIdPrefix = 'cloned-';

  private _viewSettingsShipper$ = new Subject<CarouselViewData>();
  private _initializedCarousel$ = new Subject<string>();
  private _changedSettingsCarousel$ = new Subject<any>();

  private _invalidated: any = {};
  private _carouselWidth: number;

  private _items: CarouselSlideDirective[];
  private _options: CarouselOptions;

  private _stageModel: CarouselStageModel = {
    transform: 'translate3d(0px,0px,0px)',
    transition: '0s',
    width: 0,
  };
  private _slidesData: CarouselSlideModel[];
  private _clones: any[] = [];

  private _widths: any[] = [];
  private _coordinates: number[] = [];
  private _current: number | null = null;
  private _speed: number | null = null;

  private _pipe: { filter: Pipe[]; run: (cache: any) => void }[] = [
    {
      filter: [Pipe.width, Pipe.items, Pipe.settings],
      run: (cache: any) => this._setCurrentSlideId(cache),
    },
    {
      filter: [Pipe.width, Pipe.items, Pipe.settings],
      run: (cache: any) => this._setMarginStyles(cache),
    },
    {
      filter: [Pipe.width, Pipe.items, Pipe.settings],
      run: (cache: any) => this._setupSlidesDataWidth(cache),
    },
    {
      filter: [Pipe.items, Pipe.settings],
      run: (cache: any) => this._setupClonedSlidesData(),
    },
    {
      filter: [Pipe.width, Pipe.items, Pipe.settings],
      run: (cache: any) => this._setupCoordinates(),
    },
    {
      filter: [Pipe.width, Pipe.items, Pipe.settings],
      run: (cache: any) => this._setupStageModelWidth(),
    },
    {
      filter: [Pipe.width, Pipe.items, Pipe.settings],
      run: (cache: any) => this._resetCurrent(cache),
    },
    {
      filter: [Pipe.position],
      run: (cache: any) => this._animatePosition(),
    },
    {
      filter: [Pipe.width, Pipe.position, Pipe.items, Pipe.settings],
      run: (cache: any) => this._resetActiveSlides(),
    },
  ];

  public carouselSettings: CarouselOptions = {};
  public domData: CarouselDomData = {
    isMouseDraggable: false,
    isTouchDraggable: false,
    isGrab: false,
  };
  public navigationData: NavigationData;

  constructor() {}

  private _trigger(name: string, data?: any): void {
    switch (name) {
      case 'initialized':
        this._initializedCarousel$.next(name);
        break;
      case 'changed':
        this._changedSettingsCarousel$.next(data);
        break;
      default:
        break;
    }
  }

  /**
   * Operators to calculate RTL and LTR.
   * @param a The left side operand.
   * @param o The operator.
   * @param b The right side operand.
   * @returns true/false meaning RTL or LTR.
   */
  private _operators(a: number, o: string, b: number): boolean {
    const rtl = false;
    switch (o) {
      case '<':
        return rtl ? a > b : a < b;
      case '>':
        return rtl ? a < b : a > b;
      case '>=':
        return rtl ? a <= b : a >= b;
      case '<=':
        return rtl ? a >= b : a <= b;
      default:
        break;
    }
    return false;
  }

  private _width(dimension?: NavigationPosition): number {
    dimension = dimension || NavigationPosition.Default;
    switch (dimension) {
      case NavigationPosition.Outer:
        return this._carouselWidth;
      case NavigationPosition.Inner:
      case NavigationPosition.Outside:
      case NavigationPosition.Default:
      default:
        return this._carouselWidth;
    }
  }

  private _isNumeric(number: any): boolean {
    return !isNaN(parseFloat(number));
  }

  private _normalize(position: number, relative?: boolean): number {
    const itemsLength = this._items.length;
    const absoluteClonesLength = relative ? 0 : this._clones.length;
    if (!this._isNumeric(position) || itemsLength < 1) {
      position = 0;
    } else if (position < 0 || position >= itemsLength + absoluteClonesLength) {
      position =
        ((((position - absoluteClonesLength / 2) % itemsLength) + itemsLength) %
          itemsLength) +
        absoluteClonesLength / 2;
    }
    return position;
  }

  private _relative(position: number): number {
    position -= this._clones.length / 2;
    return this._normalize(position, true);
  }

  private _animate(coordinate: number | number[]): void {
    this._stageModel.transform = `translate3d(${coordinate}px,0px,0px)`;
    this._stageModel.transition = `${this.speed() / 1000}s`;
  }

  private _reset(position: number): void {
    position = this._normalize(position);
    if (position === undefined) {
      return;
    }
    this._speed = 0;
    this._current = position;
    this._animate(this.coordinates(position));
  }

  private _setCurrentSlideId(cache: { current: string }): void {
    cache.current =
      this._items && this._items[this._relative(this._current as number)].id;
  }

  private _setMarginStyles(cache: {
    css: { 'margin-left': string | number; 'margin-right': string | number };
  }): void {
    console.log('Called _setMarginStyles');
    // TODO: implement.
  }

  private _setupSlidesDataWidth(cache: {
    items: { merge: boolean; width?: number };
    css: { [x: string]: string | number | undefined };
  }): void {
    const width: number = +(this._width() / 0).toFixed(3); // TODO: Replace 0 to this.settings.items
    const widths: number[] = [];
    let iterator = this._items.length;
    cache.items = {
      merge: false,
      width: width,
    };
    while (iterator--) {
      widths[iterator] = this._items[iterator].width
        ? (this._items[iterator].width as number)
        : width;
    }
    this._widths = widths;
    this._slidesData.forEach((slide, i) => {
      slide.width = this._widths[i];
    });
  }

  private _setupClonedSlidesData(): void {
    const clones: any[] = [];
    const items = this._items;
    const settings = this.carouselSettings;
    const view = Math.max(0 * 2, 4); // TODO: replace 0 to settings.items
    const size = Math.ceil(items.length / 2) * 2;
    let append: CarouselSlideModel[] = [];
    let prepend: CarouselSlideModel[] = [];
    let repeat = settings.loop && items.length ? Math.max(view, size) : 0;
    repeat /= 2;
    while (repeat--) {
      clones.push(this._normalize(clones.length / 2, true));
      append.push({ ...this._slidesData[clones[clones.length - 1]] });
      clones.push(
        this._normalize(items.length - 1 - (clones.length - 1) / 2, true)
      );
      prepend.unshift({ ...this._slidesData[clones[clones.length - 1]] });
    }
    this._clones = clones;
    append = append.map((slide: CarouselSlideModel) => {
      slide.id = `${this._clonedIdPrefix}${slide.id}`;
      slide.isCloned = true;
      return slide;
    });
    prepend = prepend.map((slide: CarouselSlideModel) => {
      slide.id = `${this._clonedIdPrefix}${slide.id}`;
      slide.isCloned = true;
      return slide;
    });
    this._slidesData = prepend.concat(this._slidesData).concat(append);
  }

  private _setupCoordinates(): void {
    const rtl = -1;
    const size = this._clones.length + this._items.length;
    const coordinates: number[] = [];
    let iterator = -1;
    let previous = 0;
    let current = 0;
    while (++iterator < size) {
      previous = coordinates[iterator - 1] || 0;
      current = this._widths[this._relative(iterator)];
      coordinates.push(previous + current * rtl);
    }
    this._coordinates = coordinates;
  }

  private _setupStageModelWidth(): void {
    const coordinates = this._coordinates;
    const css = {
      width: Math.ceil(Math.abs(coordinates[coordinates.length - 1])),
    };
    this._stageModel.width = css.width;
  }

  private _resetCurrent(cache: { current: string }): void {
    let current = cache.current
      ? this._slidesData.findIndex((slide) => slide.id === cache.current)
      : 0;
    current = Math.max(this.minimum(), Math.min(this.maximum(), current));
    this._reset(current);
  }

  private _animatePosition(): void {
    this._animate(this.coordinates(this._current as number));
  }

  private _resetActiveSlides(): void {
    const rtl = -1;
    const matches = [];
    let begin: number | number[];
    let end: number;
    let inner: number;
    let outer: number;
    let iterator: number;
    let coordinates: number;
    begin = this.coordinates(this.current());
    if (typeof begin === 'number') {
      begin += 0;
    } else {
      begin = 0;
    }
    end = begin + this._width() * -1;
    if (rtl === -1 && this.carouselSettings.center) {
      const result = this._coordinates.filter((element) => {
        return 0 % 2 === 1 ? element >= begin : element > begin; // TODO: Replace 0 to this.settings.items
      });
      begin = result.length ? result[result.length - 1] : begin;
    }
    for (
      iterator = 0, coordinates = this._coordinates.length;
      iterator < coordinates;
      iterator++
    ) {
      inner = Math.ceil(this._coordinates[iterator - 1] || 0);
      outer = Math.ceil(Math.abs(this._coordinates[iterator]));
      if (
        (this._operators(inner, '<=', begin) &&
          this._operators(inner, '>', end)) ||
        (this._operators(outer, '<', begin) && this._operators(outer, '>', end))
      ) {
        matches.push(iterator);
      }
    }
  }

  private _invalidate(part: Pipe): string[] {
    this._invalidated[part] = true;
    return Object.keys(this._invalidated);
  }

  private _runPipes(): void {
    let iterator = 0;
    const pipeCount = this._pipe.length;
    const filter = (item: Pipe) => this._invalidated[item];
    const cache = {};
    while (iterator < pipeCount) {
      const filteredPipe = this._pipe[iterator].filter.filter(filter);
      if (this._invalidated[Pipe.all] || filteredPipe.length > 0) {
        this._pipe[iterator].run(cache);
      }
      iterator++;
    }
    this._invalidated = {};
  }

  private _setupCarouselWidth(width: number): void {
    this._carouselWidth = width;
  }

  private _setupItems(content: CarouselSlideDirective[]): void {
    this._items = content;
  }

  private _setupSlidesData(): void {
    this._slidesData = this._items.map((slide) => {
      return {
        id: slide.id,
        tplRef: slide.tplRef,
        width: 0,
      };
    });
  }

  private _setupOptions(options: CarouselOptions): void {
    const config: CarouselOptions = new CarouselDefaultConfigOptions();
    const navigation = {
      ...(config.navigation as NavigationData),
      ...options.navigation,
    };
    options.navigation = navigation;
    this._options = { ...config, ...options };
  }

  private _setOptionsForViewport(): void {
    this.domData.isMouseDraggable = this.carouselSettings.mouseDrag as boolean;
    this.domData.isTouchDraggable = this.carouselSettings.touchDrag as boolean;
  }

  private _update(): void {
    this._runPipes();
    this.sendChanges();
  }

  private _refresh(): void {
    this._trigger('refresh');
    this._setupSlidesData();
    this._update();
    this._trigger('refreshed');
  }

  private _getDifference(first: Coords, second: Coords): Coords {
    return {
      x: first.x - second.x,
      y: first.y - second.y,
    };
  }

  private _duration(
    from: number,
    to: number,
    factor?: number | boolean
  ): number {
    if (factor === 0) {
      return 0;
    }
    factor = factor || 250;
    return (
      Math.min(Math.max(Math.abs(to - from), 1), 6) * Math.abs(+factor || 250)
    );
  }

  private _closest(coordinate: number, direction: string): number {
    const pull = 30;
    const width = this._width();
    let coordinates: number[] = this.coordinates() as number[];
    let position = -1;
    if (this.carouselSettings.center) {
      coordinates = coordinates.map((item) => {
        if (item === 0) {
          item += 0.000001;
        }
        return item;
      });
    }
    for (let i = 0; i < coordinates.length; i++) {
      if (
        this._operators(coordinate, '<', coordinates[i]) &&
        this._operators(
          coordinate,
          '>',
          coordinates[i + 1] || coordinates[i] - width
        )
      ) {
        position = direction === 'left' ? i + 1 : i;
      } else if (
        direction === null &&
        coordinate > coordinates[i] - pull &&
        coordinate < coordinates[i] + pull
      ) {
        position = i;
      }
      if (position !== -1) {
        break;
      }
    }
    if (!this.carouselSettings.loop) {
      if (this._operators(coordinate, '>=', coordinates[this.minimum()])) {
        position = coordinate = this.minimum();
      } else if (
        this._operators(coordinate, '<=', coordinates[this.maximum()])
      ) {
        position = coordinate = this.maximum();
      }
    }
    return position;
  }

  /**
   * Gets observable of passing data needed for managing view.
   */
  public getViewSettings(): Observable<CarouselViewData> {
    return this._viewSettingsShipper$.asObservable();
  }

  /**
   * Gets observable of notification when the carousel got initializes.
   */
  public getInitializedCarousel(): Observable<string> {
    return this._initializedCarousel$.asObservable();
  }

  /**
   * Gets observable of notification when the carousel's settings have changed.
   */
  public getChangedSettingsCarousel(): Observable<any> {
    return this._changedSettingsCarousel$.asObservable();
  }

  /**
   * Setups the current settings.
   * @param carouselWidth Width of carousel.
   * @param items Array of carousel items.
   * @param options Options sets by user.
   */
  public setup(
    carouselWidth: number,
    slides: CarouselSlideDirective[],
    options: CarouselOptions
  ): void {
    this._setupCarouselWidth(carouselWidth);
    this._setupItems(slides);
    this._setupSlidesData();
    this._setupOptions(options);
    this.carouselSettings = { ...this._options };
    this._setOptionsForViewport();
    this._trigger('change', {
      property: { name: 'settings', value: this.carouselSettings },
    });
    this._invalidate(Pipe.settings);
    this._trigger('changed', {
      property: { name: 'settings', value: this.carouselSettings },
    });
  }

  /**
   * Initializes the carousel.
   * @param items Array of carousel items.
   */
  public initialize(items: CarouselSlideDirective[]): void {
    this._clones = [];
    this._reset(0);
    this._invalidate(Pipe.items);
    this._refresh();
    this._setOptionsForViewport();
    this.sendChanges();
    this._trigger('initialized');
  }

  /**
   * Sets the absolute position of the current item.
   * @param position The new absolute position or nothing to leave it unchanged.
   */
  public current(position?: number): number {
    if (position === undefined) {
      return this._current as number;
    }
    if (this._items.length === 0) {
      return 0;
    }
    position = this._normalize(position);
    if (this._current !== position) {
      this._trigger('change', {
        property: { name: 'position', value: position },
      });
      this._current = position;
      this._invalidate(Pipe.position);
      this._trigger('changed', {
        property: { name: 'position', value: this._current },
      });
    }
    return this._current;
  }

  /**
   * Gets the relative position of the current item.
   */
  public getRelativePosition(): number {
    return this._relative(this.current());
  }

  /**
   * Gets the coordinate of an item.
   * @param position The absolute position of the item within 'minimum()' and 'maximum()'.
   */
  public coordinates(position?: number): number | number[] {
    let multiplier = 1;
    let newPosition = (position as number) - 1;
    let coordinate: number | number[];
    let result: number[];
    if (position === undefined) {
      result = this._coordinates.map((item, index) => {
        return this.coordinates(index) as number;
      });
      return result;
    }
    if (this.carouselSettings.center) {
      coordinate = this._coordinates[position];
      coordinate +=
        ((this._width() - coordinate + (this._coordinates[newPosition] || 0)) /
          2) *
        multiplier;
    } else {
      coordinate = this._coordinates[newPosition] || 0;
    }
    coordinate = Math.ceil(coordinate);
    return coordinate;
  }

  /**
   * Get the minimum position for the current item.
   * @param relative Whether to return an absolute position or a relative position.
   */
  public minimum(relative: boolean = false): number {
    return relative ? 0 : this._clones.length / 2;
  }

  /**
   * Gets the maximum position for the current item.
   * @param relative Whether to return an absolute position or a relative position.
   */
  public maximum(relative: boolean = false): number {
    let maximum = this._coordinates.length;
    if (this.carouselSettings.loop) {
      maximum = this._clones.length / 2 + this._items.length - 1;
    } else if (this.carouselSettings.center) {
      maximum = this._items.length - 1;
    } else {
      let iterator = this._items.length;
      let reciprocalItemsWidth = this._slidesData[--iterator].width as number;
      let elementWidth = this._carouselWidth;
      while (iterator--) {
        reciprocalItemsWidth += +(this._slidesData[iterator].width as number);
        if (reciprocalItemsWidth > elementWidth) {
          break;
        }
      }
      maximum = iterator + 1;
      // } else { // need for auto width
      //   maximum = this._items.length - 0; // TODO: Replace 0 to this.settings.items.
    }
    if (relative) {
      maximum -= this._clones.length / 2;
    }
    return Math.max(maximum, 0);
  }

  /**
   * Sets the current animation speed.
   * @param speed The animation speed in milliseconds or nothing to leave it unchanged.
   */
  public speed(speed?: number): number {
    if (speed !== undefined) {
      this._speed = speed;
    }
    return this._speed as number;
  }

  public clones(position?: number): number[] {
    const odd = this._clones.length / 2;
    const even = odd + this._items.length;
    const map = (index: number) =>
      index % 2 === 0 ? even + index / 2 : odd - (index + 1) / 2;
    if (position === undefined) {
      return this._clones.map((v, i) => map(i));
    }
    return this._clones
      .map((v, i) => (v === position ? map(i) : 0))
      .filter((item) => item);
  }

  /**
   * Slides to the specified item.
   * @param position The position of the item.
   */
  public to(position: number): void {
    let current = this.current();
    let revert = 0;
    let distance = position - this._relative(current);
    let maximum = this.maximum();
    let delayForLoop = 0;
    const direction = +(distance > 0) - +(distance < 0);
    const itemsLength = this._items.length;
    const minimum = this.minimum();
    if (this.carouselSettings.loop) {
      if (Math.abs(distance) > itemsLength / 2) {
        distance += direction * -1 * itemsLength;
      }
      position = current + distance;
      revert =
        ((((position - minimum) % itemsLength) + itemsLength) % itemsLength) +
        minimum;
      if (
        revert !== position &&
        revert - distance <= maximum &&
        revert - distance > 0
      ) {
        current = revert - distance;
        position = revert;
        delayForLoop = 30;
        this._reset(current);
        this.sendChanges();
      }
    } else {
      position = Math.max(minimum, Math.min(maximum, position));
    }
    setTimeout(() => {
      this.speed(this._duration(current, position));
      this.current(position);
      this._update();
    }, delayForLoop);
  }

  public defineNewCoordsDrag(event: any, dragData: any): boolean | Coords {
    let minimum = this.coordinates(this.minimum());
    let maximum = this.coordinates(this.maximum());
    const delta = this._getDifference(dragData.pointer, this.pointer(event));
    const stage = this._getDifference(dragData.stage.start, delta);
    if (this.carouselSettings.loop) {
      minimum = this.coordinates(this.minimum()) as number;
      maximum = +this.coordinates(this.maximum() + 1) - minimum;
      stage.x =
        ((((stage.x - minimum) % maximum) + maximum) % maximum) + minimum;
    } else {
      const pull = this.carouselSettings.pullDrag ? (-1 * delta.x) / 5 : 0;
      stage.x = Math.max(
        Math.min(stage.x, (minimum as number) + pull),
        (maximum as number) + pull
      );
    }
    return stage;
  }

  /**
   * Prepares data for dragging carousel.
   * @param event The event arguments.
   */
  public prepareDragging(event: any): Coords {
    const transformArr: string[] = this._stageModel.transform
      .replace(/.*\(|\)| |[^,-\d]\w|\)/g, '')
      .split(',');
    const stage: Coords = {
      x: +transformArr[0],
      y: +transformArr[1],
    };
    this._invalidate(Pipe.position);
    if (event.type === 'mousedown') {
      this.domData.isGrab = true;
    }
    this.speed(0);
    return stage;
  }

  public finishDragging(
    event: any,
    dragObj: any,
    clickAttacher: () => void
  ): void {
    const directions = ['right', 'left'];
    const delta = this._getDifference(dragObj.pointer, this.pointer(event));
    const stage = dragObj.stage.current;
    const direction = directions[+(delta.x > +false)];
    let currentSlideId: number;
    let current: number;
    let newCurrent: number;
    if (delta.x !== 0) {
      this.speed(+250);
      currentSlideId = this._closest(
        stage.x,
        delta.x !== 0 ? direction : dragObj.direction
      );
      current = this.current();
      newCurrent = this.current(
        currentSlideId === -1 ? undefined : currentSlideId
      );
      if (current !== newCurrent) {
        this._invalidate(Pipe.position);
        this._update();
      }
      dragObj.direction = direction;
      if (Math.abs(delta.x) > 3 || new Date().getTime() - dragObj.time > 300) {
        clickAttacher();
      }
    }
  }

  /**
   * Gets unified pointer coordinates from event.
   * @param event The 'mousedown' event.
   */
  public pointer(event: any): Coords {
    const result = { x: null, y: null } as unknown as Coords;
    event = event.originalEvent || event || window.event;
    event =
      event.touches && event.touches.length
        ? event.touches[0]
        : event.changedTouches && event.changedTouches.length
        ? event.changedTouches[0]
        : event;
    if (event.pageX) {
      result.x = event.pageX;
      result.y = event.pageY;
    } else {
      result.x = event.clientX;
      result.y = event.clientY;
    }
    return result;
  }

  /**
   * Sends all data needed for View.
   */
  public sendChanges(): void {
    this._viewSettingsShipper$.next({
      stageModel: this._stageModel,
      slidesData: this._slidesData,
      domData: this.domData,
      navigationData: this.navigationData,
    });
  }
}
