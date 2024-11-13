import { Rect } from "../draw";

class ResourceManager {
  public width: number = 1;
  public height: number = 1;
  public worldRect: Rect;
  public OnFinishedLoad: Function;
  public Images: string[] = [];
  private count: number = 0;
  private loadedCount: number = 0;
  public load() {
    this.count = this.Images.length;
    this.Images.forEach((el) => {
      this.imageLoad(el);
    });
  }

  private checkFinished() {
    if (this.count == this.loadedCount) {
      if (this.OnFinishedLoad) {
        this.OnFinishedLoad();
      }
    }
  }

  private imageLoad(url: string) {
    const _this = this;
    const img = new Image();
    img.src = url;
    img.onload = function () {
      Resource[url] = img;
      _this.loadedCount++;
      _this.checkFinished();
    };
  }
}

export const Resource = new ResourceManager();
