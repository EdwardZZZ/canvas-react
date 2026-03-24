# Timeline

A class for orchestrating multiple `Tween` animations together.

## Methods

- `add(tween, offset)`: Adds a tween at a specific time offset (in milliseconds).
- `play()`: Starts or resumes the timeline.
- `pause()`: Pauses the timeline.
- `seek(timeMs)`: Jumps to a specific time point.
- `playFrom(timeMs)`: Starts the timeline from a specific time point.

## Example

```tsx
const timeline = new Timeline({ loop: true });

timeline.add(new Tween({ node, x: 100, duration: 1 }), 0);
timeline.add(new Tween({ node: circle, opacity: 0, duration: 0.5 }), 500);

timeline.play();
```
