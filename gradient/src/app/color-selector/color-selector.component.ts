import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { InputService } from '../input.service';
import { RgbToStringPipe } from '../rgb-to-string.pipe';

export interface RGB {
  r: number;
  g: number;
  b: number;
}
interface HSV {
  h: number;
  s: number;
  v: number;
}

@Component({
  selector: 'app-color-selector',
  templateUrl: './color-selector.component.html',
  styleUrls: ['./color-selector.component.scss'],
})
export class ColorSelectorComponent implements OnInit, AfterViewInit {
  @Input() color!: RGB;
  @Output() colorChange = new EventEmitter<RGB>();

  colorBox!: HTMLDivElement;
  @ViewChild('colorBox') set colorBoxRef(ref: ElementRef<HTMLDivElement>) {
    this.colorBox = ref.nativeElement;
  }

  colorHex!: HTMLSpanElement;
  @ViewChild('colorHex') set colorHexRef(ref: ElementRef<HTMLSpanElement>) {
    this.colorHex = ref.nativeElement;
  }

  handle!: HTMLDivElement;
  @ViewChild('colorHex') set handleRef(ref: ElementRef<HTMLDivElement>) {
    this.handle = ref.nativeElement;
  }

  gradientContainer!: HTMLDivElement;
  @ViewChild('gradientContainer') set gradientContainerRef(
    ref: ElementRef<HTMLDivElement>
  ) {
    this.gradientContainer = ref.nativeElement;
  }

  hueSlider!: HTMLInputElement;
  @ViewChild('hueSlider') set hueSliderRef(ref: ElementRef<HTMLInputElement>) {
    this.hueSlider = ref.nativeElement;
  }

  gradientContainerContext!: HTMLDivElement;
  gradientContainerImageData!: ImageData;
  gradientContainerRect!: DOMRectReadOnly;

  gradient0Style = { opacity: 0, mixBlendMode: 'normal', zIndex: 0 };
  gradient120Style = { opacity: 0, mixBlendMode: 'normal', zIndex: 0 };
  gradient240Style = { opacity: 0, mixBlendMode: 'normal', zIndex: 0 };

  isClicked = false;

  constructor(
    private inputService: InputService,
    private rgbToStringPipe: RgbToStringPipe
  ) {}

  getSurroundingContentSpacing(element: Element): {
    top: number;
    left: number;
    bottom: number;
    right: number;
  } {
    return {
      top:
        Number(window.getComputedStyle(element).paddingTop.slice(0, -2)) +
        Number(window.getComputedStyle(element).borderTopWidth.slice(0, -2)),
      left:
        Number(window.getComputedStyle(element).paddingLeft.slice(0, -2)) +
        Number(window.getComputedStyle(element).borderLeftWidth.slice(0, -2)),
      bottom:
        Number(window.getComputedStyle(element).paddingBottom.slice(0, -2)) +
        Number(window.getComputedStyle(element).borderBottomWidth.slice(0, -2)),
      right:
        Number(window.getComputedStyle(element).paddingRight.slice(0, -2)) +
        Number(window.getComputedStyle(element).borderRightWidth.slice(0, -2)),
    };
  }
  getContentRect(element: Element, rect: DOMRectReadOnly): DOMRectReadOnly {
    const surroundingSpace = this.getSurroundingContentSpacing(element);

    const x = rect.x + surroundingSpace.left;
    const y = rect.y + surroundingSpace.top;

    const width =
      Number(window.getComputedStyle(element).width.slice(0, -2)) -
      surroundingSpace.left -
      surroundingSpace.right;
    const height =
      Number(window.getComputedStyle(element).height.slice(0, -2)) -
      surroundingSpace.top -
      surroundingSpace.bottom;

    return new DOMRectReadOnly(x, y, width, height);
  }

  ngOnInit(): void {
    this.inputService.onMouseMoveSubject.subscribe((e) =>
      this.onGlobalMouseMove(e)
    );
    this.inputService.onMouseUpSubject.subscribe(
      (e) => (this.isClicked = false)
    );
    this.inputService.onResize.subscribe(() => {
      this.gradientContainerRect = this.getContentRect(
        this.gradientContainer,
        this.gradientContainer.getBoundingClientRect()
      );
    });
    this.inputService.onScroll.subscribe(() => {
      this.gradientContainerRect = this.getContentRect(
        this.gradientContainer,
        this.gradientContainer.getBoundingClientRect()
      );
    });
    this.createGradient();

  }

  ngAfterViewInit(): void {
    this.gradientContainerRect = this.getContentRect(
      this.gradientContainer,
      this.gradientContainer.getBoundingClientRect()
    );
    this.calcColor();
  }

  onColorBoxMouseDown(event: MouseEvent) {
    this.isClicked = true;
    let gradientContainerMousePos = {
      left:
        event.x -
        this.gradientContainerRect.left +
        this.getSurroundingContentSpacing(this.gradientContainer).left,
      top:
        event.y -
        this.gradientContainerRect.top +
        this.getSurroundingContentSpacing(this.gradientContainer).top,
    };
    this.setHandlePos = gradientContainerMousePos;    
  }

  handlePos = { left: 0, top: 0 };
  set setHandlePos(pos: { left: number; top: number }) {
    this.handlePos = {
      left: Math.max(
        this.getSurroundingContentSpacing(this.gradientContainer).left,
        Math.min(
          pos.left,
          this.gradientContainerRect.width +
            this.getSurroundingContentSpacing(this.gradientContainer).left
        )
      ),
      top: Math.max(
        this.getSurroundingContentSpacing(this.gradientContainer).top,
        Math.min(
          pos.top,
          this.gradientContainerRect.height +
            this.getSurroundingContentSpacing(this.gradientContainer).top
        )
      ),
    };
    this.calcColor();
  }

  onHueSliderInput() {
    this.createGradient();
    this.calcColor();
  }

  private onGlobalMouseMove(event: MouseEvent) {
    if (this.isClicked) {
      let gradientContainerMousePos = {
        left:
          event.x -
          this.gradientContainerRect.left +
          this.getSurroundingContentSpacing(this.gradientContainer).left,
        top:
          event.y -
          this.gradientContainerRect.top +
          this.getSurroundingContentSpacing(this.gradientContainer).top,
      };
      console.log(this.gradientContainerRect.width);

      this.setHandlePos = gradientContainerMousePos;
    }
  }

  private calcColor() {
    this.color = this.HSVtoRGB({
      h: Number(this.hueSlider.value),
      s: this.handlePos.left / 150,
      v: 1 - this.handlePos.top / 150,
    });

    this.colorChange.emit(this.color);
    this.colorBox.style.backgroundColor = this.rgbToStringPipe.transform(
      this.color
    );
  }

  public createGradient() {
    const h = Number(this.hueSlider?.value) ??  0;
    if (h <= 60) {
      this.gradient0Style.zIndex = 1;
      this.gradient0Style.opacity = 1;
      this.gradient0Style.mixBlendMode = 'normal';
      this.gradient120Style.zIndex = 2;
      this.gradient120Style.opacity = h / 60;
      this.gradient120Style.mixBlendMode = 'lighten';
      this.gradient240Style.opacity = 0;
    } else if (h <= 120) {
      this.gradient0Style.zIndex = 2;
      this.gradient0Style.opacity = (120 - h) / 60;
      this.gradient0Style.mixBlendMode = 'lighten';
      this.gradient120Style.zIndex = 1;
      this.gradient120Style.opacity = 1;
      this.gradient120Style.mixBlendMode = 'normal';
      this.gradient240Style.opacity = 0;
    } else if (h <= 180) {
      this.gradient0Style.opacity = 0;
      this.gradient120Style.zIndex = 1;
      this.gradient120Style.opacity = 1;
      this.gradient120Style.mixBlendMode = 'normal';
      this.gradient240Style.zIndex = 2;
      this.gradient240Style.opacity = (h - 120) / 60;
      this.gradient240Style.mixBlendMode = 'lighten';
    } else if (h <= 240) {
      this.gradient0Style.opacity = 0;
      this.gradient120Style.zIndex = 2;
      this.gradient120Style.opacity = (240 - h) / 60;
      this.gradient120Style.mixBlendMode = 'lighten';
      this.gradient240Style.zIndex = 1;
      this.gradient240Style.opacity = 1;
      this.gradient240Style.mixBlendMode = 'normal';
    } else if (h <= 300) {
      this.gradient0Style.zIndex = 2;
      this.gradient0Style.opacity = (h - 240) / 60;
      this.gradient0Style.mixBlendMode = 'lighten';
      this.gradient120Style.opacity = 0;
      this.gradient240Style.zIndex = 1;
      this.gradient240Style.opacity = 1;
      this.gradient240Style.mixBlendMode = 'normal';
    } else {
      this.gradient0Style.zIndex = 1;
      this.gradient0Style.opacity = 1;
      this.gradient0Style.mixBlendMode = 'normal';
      this.gradient120Style.opacity = 0;
      this.gradient240Style.zIndex = 2;
      this.gradient240Style.opacity = (360 - h) / 60;
      this.gradient240Style.mixBlendMode = 'lighten';
    }
  }

  HSVtoRGB(hsv: HSV): RGB {
    hsv.h = Math.max(0, Math.min(hsv.h, 360));
    hsv.s = Math.max(0, Math.min(hsv.s, 1));
    hsv.v = Math.max(0, Math.min(hsv.v, 1));

    let c = hsv.v * hsv.s;
    let x = c * (1 - Math.abs(((hsv.h / 60) % 2) - 1));
    let m = hsv.v - c;

    let normalizedRGB: RGB =
      hsv.h < 60
        ? { r: c, g: x, b: 0 }
        : hsv.h < 120
        ? { r: x, g: c, b: 0 }
        : hsv.h < 180
        ? { r: 0, g: c, b: x }
        : hsv.h < 240
        ? { r: 0, g: x, b: c }
        : hsv.h < 300
        ? { r: x, g: 0, b: c }
        : { r: c, g: 0, b: x };

    return {
      r: Math.round((normalizedRGB.r + m) * 255),
      g: Math.round((normalizedRGB.g + m) * 255),
      b: Math.round((normalizedRGB.b + m) * 255),
    };
  }
}
