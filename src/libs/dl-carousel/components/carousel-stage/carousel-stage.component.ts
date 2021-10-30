import {
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import {
  CarouselDraggableModel,
  CarouselSlideModel,
  CarouselStageModel,
} from '../../models';
import { CarouselService, Coords } from '../../services';

interface Drag {
  time: number | null;
  target: any;
  pointer: any;
  stage: {
    start: Coords;
    current: Coords;
  };
  direction: null;
  active: boolean;
  moving: boolean;
}

@Component({
  selector: 'dl-carousel-stage',
  templateUrl: './carousel-stage.component.html',
  styleUrls: ['./carousel-stage.component.scss'],
})
export class CarouselStageComponent implements OnInit, OnDestroy {
  private readonly _minMovementLength = 3;

  private _oneDragMove$ = new Subject<any>();
  private _subscription = new Subscription();

  private _drag: Drag;

  @Input()
  public stageModel: CarouselStageModel;

  @Input()
  public slidesData: CarouselSlideModel[];

  @Input()
  public draggable: CarouselDraggableModel;

  private _listenerMouseMove: () => void;
  private _listenerTouchMove: () => void;
  private _listenerOneMouseMove: () => void;
  private _listenerOneTouchMove: () => void;
  private _listenerMouseUp: () => void;
  private _listenerTouchEnd: () => void;

  @HostListener('mousedown', ['$event'])
  private onMouseDown(event: any): void {
    if (this.draggable.isMouseDraggable) {
      this._onDragStart(event);
    }
  }

  @HostListener('touchstart', ['$event'])
  private onTouchStart(event: any): void {
    if (this.draggable.isTouchDraggable) {
      this._onDragStart(event);
    }
  }

  @HostListener('touchcancel', ['$event'])
  private onTouchCancel(event: any): void {
    this._onDragEnd(event);
  }

  @HostListener('dragstart')
  private onDragStart() {
    if (this.draggable.isMouseDraggable) {
      return false;
    }
    return true;
  }

  @HostListener('selectstart')
  private onSelectStart() {
    if (this.draggable.isMouseDraggable) {
      return false;
    }
    return true;
  }

  constructor(
    private zone: NgZone,
    private el: ElementRef,
    private renderer: Renderer2,
    private _carouselService: CarouselService
  ) {
    this._setupDefaultDragValues();
  }

  private _isEventNotFromLeftButton(event: any): boolean {
    return event.button === 2;
  }

  private _isNeedSkipMovement(delta: Coords): boolean {
    return (
      (Math.abs(delta.x) < this._minMovementLength &&
        Math.abs(delta.y) < this._minMovementLength) ||
      (Math.abs(delta.x) < this._minMovementLength &&
        Math.abs(delta.x) < Math.abs(delta.y))
    );
  }

  private _bindOneMouseTouchMove = (event: any) => {
    this._oneMouseTouchMove(event);
  };

  private _bindOnDragMove = (event: any) => {
    this._onDragMove(event);
  };

  private bindOnDragEnd = (event: any) => {
    this._onDragEnd(event);
  };

  private _setupDefaultDragValues(): void {
    this._drag = {
      time: null,
      target: null,
      pointer: null,
      stage: {
        start: new Coords(),
        current: new Coords(),
      },
      direction: null,
      active: false,
      moving: false,
    };
  }

  private _getPointer(event: any): any {
    return this._carouselService.pointer(event);
  }

  private _animateMove(coordinate: number, speed: number = 0): void {
    this.renderer.setStyle(
      this.el.nativeElement.children[0],
      'transform',
      `translate3d(${coordinate}px,0px,0px)`
    );
    this.renderer.setStyle(
      this.el.nativeElement.children[0],
      'transition',
      `${speed}s`
    );
  }

  private _getDifference(first: Coords, second: Coords): Coords {
    return {
      x: first.x - second.x,
      y: first.y - second.y,
    };
  }

  private _prepareDragging(event: any): Coords {
    return this._carouselService.prepareDragging(event);
  }

  private _finishDragging(event: any): void {
    this._carouselService.finishDragging(event, this._drag, () => {});
  }

  private _defineNewCoordsDrag(event: any, dragData: any): boolean | Coords {
    return this._carouselService.defineNewCoordsDrag(event, dragData);
  }

  private _setupDragByEvent(event: any): void {
    const stage = this._prepareDragging(event);
    this._drag.time = new Date().getTime();
    this._drag.target = event.target;
    this._drag.stage.start = stage;
    this._drag.stage.current = stage;
    this._drag.pointer = this._getPointer(event);
  }

  private _oneMouseTouchMove(event: any): void {
    const delta = this._getDifference(
      this._drag.pointer,
      this._getPointer(event)
    );
    if (this._isNeedSkipMovement(delta)) {
      return;
    }
    this._listenerOneMouseMove();
    this._listenerOneTouchMove();
    this._drag.moving = true;
    this._listenerMouseMove = this.renderer.listen(
      document,
      'mousemove',
      this._bindOnDragMove
    );
    this._listenerTouchMove = this.renderer.listen(
      document,
      'touchmove',
      this._bindOnDragMove
    );
    event.preventDefault();
    this._oneDragMove$.next(event);
  }

  private _onDragStart(event: any): void {
    if (this._isEventNotFromLeftButton(event)) {
      return;
    }
    this._setupDragByEvent(event);
    this._listenerMouseUp = this.renderer.listen(
      document,
      'mouseup',
      this.bindOnDragEnd
    );
    this._listenerTouchEnd = this.renderer.listen(
      document,
      'touchend',
      this.bindOnDragEnd
    );
    this.zone.runOutsideAngular(() => {
      this._listenerOneMouseMove = this.renderer.listen(
        document,
        'mousemove',
        this._bindOneMouseTouchMove
      );
      this._listenerOneTouchMove = this.renderer.listen(
        document,
        'touchmove',
        this._bindOneMouseTouchMove
      );
    });
  }

  private _onDragMove(event: any): void {
    let stage: Coords;
    const stageOrExit = this._defineNewCoordsDrag(event, this._drag);
    if (stageOrExit === false) {
      return;
    }
    stage = stageOrExit as Coords;
    event.preventDefault();
    this._drag.stage.current = stage;
    this._animateMove(stage.x - this._drag.stage.start.x);
  }

  private _onDragEnd(event: any): void {
    this._carouselService.domData.isGrab = false;
    this._listenerOneMouseMove();
    this._listenerOneTouchMove();
    if (this._drag.moving) {
      this._animateMove(0, this._carouselService.speed(+250) / 1000);
      this._finishDragging(event);
      this._listenerMouseMove();
      this._listenerTouchMove();
    }
    this._setupDefaultDragValues();
    this._listenerMouseUp();
    this._listenerTouchEnd();
  }

  private _sendChanges(): void {
    this._carouselService.sendChanges();
  }

  public ngOnInit(): void {
    this._subscription.add(
      this._oneDragMove$.pipe(first()).subscribe(() => {
        this._sendChanges();
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
