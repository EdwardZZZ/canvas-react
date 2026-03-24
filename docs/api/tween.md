# Tween

A class for animating node properties from a start value to an end value.

## Methods

- `play()`: Starts the animation.
- `pause()`: Pauses the animation.
- `stop()`: Stops the animation and cancels the requestAnimationFrame.
- `destroy()`: Cleans up the animation.

## Easing Functions

Common easing functions:
- `(t) => t` (Linear)
- `(t) => t * t` (Ease-In)
- `(t) => t * (2 - t)` (Ease-Out)
- `(t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t` (Ease-In-Out)

## Example

```tsx
const tween = new Tween({
  node,
  x: 400,
  y: 400,
  duration: 1,
  easing: (t) => t, // Linear by default
  onUpdate: () => console.log('Animating...'),
  onFinish: () => console.log('Done!')
});

tween.play();
```
