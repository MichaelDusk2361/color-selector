import { HostListener, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InputService {
  public isClicked = false;
  public onMouseMoveSubject = new Subject<MouseEvent>();
  public onMouseUpSubject = new Subject<MouseEvent>();
  public onResize = new Subject();
  public onScroll = new Subject();

  constructor() {
    document.addEventListener('mousemove', (e) => { this.onMouseMoveSubject.next(e); });
    document.addEventListener('mouseup', (e) => { this.onMouseUpSubject.next(e); });
    window.addEventListener('resize', () => { this.onResize.next(); })
    document.addEventListener('scroll', () => { this.onScroll.next(); })
  }
}
