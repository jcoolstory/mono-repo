import { SpriteBitmap } from "./shapes";

export interface Animate {
  timer: number;
  callback: Function;
  data: any;
  start();
  stop();
}

export class MoveAnimate implements Animate {
  timer = 0;
  private duration: number = 0;
  public callback;
  data: any;

  start() {
    const _this = this;
    this.timer = setInterval(function () {
      _this.callback(_this.data);
    }, 1000 / 60);
  }

  stop() {
    clearInterval(this.timer);
  }
}

export class Action implements Animate {
  timer: number;
  callback: Function;
  data: any;
  duration: number = 500;
  repeat: boolean = true;
  count: number = 0;
  frame: number = -1;

  constructor(data: any, dur: number, repeat = true) {
    this.data = data;
    this.duration = dur;
    this.repeat = repeat;
  }

  start() {
    const _this = this;
    let count = 0;

    let framerate = this.duration / this.frame;
    if (this.duration == -1) framerate = 1000 / 60;

    this.timer = setInterval(function () {
      if (!_this.callback) return;

      const isStop = _this.callback(_this, _this.data, count);
      if (isStop) _this.stop();
      count++;
      if (!_this.repeat && count == _this.frame) {
        _this.stop();
      }
    }, framerate);
  }
  stop() {
    clearInterval(this.timer);
  }
}

export class SpriteAction extends Action {
  constructor(data: SpriteBitmap, dur: number, repeat = true) {
    super(data, dur, repeat);
    this.frame = data.rects.length;
    this.callback = this.step;
  }
  public step(obj: Action, dst: SpriteBitmap, count: number) {
    dst.nextStep();
  }
}
