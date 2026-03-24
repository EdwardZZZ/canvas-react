import { Tween } from './Tween';

export class Timeline {
    private tweens: Tween[] = [];
    private _currentTime: number = 0;
    private _duration: number = 0;
    private _isPlaying: boolean = false;
    private _loop: boolean = false;
    private _startTime: number = 0;
    
    constructor(options: { loop?: boolean } = {}) {
        this._loop = options.loop || false;
    }

    add(tween: Tween, offset: number = 0) {
        // Set the start delay of the tween relative to the timeline
        (tween as any)._timelineOffset = offset;
        
        this.tweens.push(tween);
        this._duration = Math.max(this._duration, offset + (tween as any).config.duration * 1000);
        return this;
    }

    play() {
        if (this._isPlaying) return;
        this._isPlaying = true;
        this._startTime = performance.now() - this._currentTime;
        this._tick(performance.now());
    }

    pause() {
        this._isPlaying = false;
    }

    seek(timeMs: number) {
        this._currentTime = Math.min(Math.max(0, timeMs), this._duration);
        this._updateTweens();
    }

    private _tick = (now: number) => {
        if (!this._isPlaying) return;

        this._currentTime = now - this._startTime;

        if (this._currentTime >= this._duration) {
            if (this._loop) {
                this._startTime = now;
                this._currentTime = 0;
            } else {
                this._currentTime = this._duration;
                this._isPlaying = false;
            }
        }

        this._updateTweens();

        if (this._isPlaying) {
            requestAnimationFrame(this._tick);
        }
    };

    private _updateTweens() {
        for (const tween of this.tweens) {
            const offset = (tween as any)._timelineOffset || 0;
            const tweenTime = Math.max(0, this._currentTime - offset);
            
            // Hacky way to update tween manually
            // A real implementation would decouple Tween from performance.now() and allow manual tick
            if (tweenTime >= 0) {
                 (tween as any)._updateFromTimeline(tweenTime);
            }
        }
    }
}