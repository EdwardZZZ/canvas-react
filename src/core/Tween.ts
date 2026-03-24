import { Node } from './Node';

export interface TweenConfig {
  node: Node;
  duration?: number; // In seconds
  easing?: (t: number) => number;
  onUpdate?: () => void;
  onFinish?: () => void;
  [key: string]: any; // properties to animate
}

export class Tween {
  private config: TweenConfig;
  private startTime: number = 0;
  private isRunning: boolean = false;
  private startProps: Record<string, number> = {};
  private deltaProps: Record<string, number> = {};
  private animationFrameId: number = 0;

  constructor(config: TweenConfig) {
    this.config = {
      duration: 1,
      easing: (t) => t, // Linear by default
      ...config
    };
  }

  play() {
    if (this.isRunning) return;
    this._prepareForTimeline();
    this.startTime = performance.now();
    this.isRunning = true;

    const tick = (time: number) => {
      if (!this.isRunning) return;

      const elapsed = (time - this.startTime) / 1000;
      let progress = elapsed / this.config.duration!;

      if (progress >= 1) {
        progress = 1;
        this.isRunning = false;
      }

      const easedProgress = this.config.easing!(progress);

      const newProps: any = {};
      for (const key in this.deltaProps) {
        const newValue = this.startProps[key] + this.deltaProps[key] * easedProgress;
        newProps[key] = newValue;
      }

      this.config.node.setProps(newProps);

      if (this.config.onUpdate) {
        this.config.onUpdate();
      }

      if (this.isRunning) {
        this.animationFrameId = requestAnimationFrame(tick);
      } else {
        if (this.config.onFinish) {
          this.config.onFinish();
        }
      }
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  /**
   * Internal method to prepare properties for animation
   */
  _prepareForTimeline() {
    this.startProps = {};
    this.deltaProps = {};

    const { node, ...propsToAnimate } = this.config;

    for (const key in propsToAnimate) {
      // Filter out non-animatable properties
      if (key === 'duration' || key === 'easing' || key === 'onUpdate' || key === 'onFinish') continue;

      const startValue = (node as any)[key] !== undefined ? (node as any)[key] : node.props[key];
      if (typeof startValue === 'number') {
        this.startProps[key] = startValue;
        this.deltaProps[key] = propsToAnimate[key] - startValue;
      }
    }
  }

  /**
   * Internal method used by Timeline to scrub the tween
   */
  _updateFromTimeline(timeMs: number) {
      if (!this.config.node) return;
      
      // Ensure props are prepared
      this._prepareForTimeline();

      const elapsed = timeMs / 1000;
      const progress = Math.min(1, elapsed / this.config.duration!);
      const easedProgress = this.config.easing!(progress);

      const currentProps: any = {};
      for (const key in this.deltaProps) {
        const startValue = this.startProps[key];
        const delta = this.deltaProps[key];
        currentProps[key] = startValue + delta * easedProgress;
      }

      this.config.node.setProps(currentProps);

      if (this.config.onUpdate) {
        this.config.onUpdate();
      }
  }

  pause() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  destroy() {
    this.pause();
  }
}
