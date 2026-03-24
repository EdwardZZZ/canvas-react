# Animations

Canvas React provides a declarative way to animate elements using `Tween` and `Timeline` classes.

## The Tween Class

A `Tween` represents an animation from a node's current property values to a target set of values over a specified duration.

### Basic Tween

```tsx
import { useEffect, useRef } from 'react';
import { Rect, Tween } from 'canvas-react';

function MyAnimatedRect() {
  const rectRef = useRef(null);

  useEffect(() => {
    if (rectRef.current) {
      const tween = new Tween({
        node: rectRef.current,
        x: 400,
        y: 400,
        width: 200,
        duration: 1.5, // 1.5 seconds
        easing: (t) => t * t, // Ease-in
        onFinish: () => console.log('Animation done!')
      });

      tween.play();
      
      return () => tween.stop();
    }
  }, []);

  return <Rect ref={rectRef} x={10} y={10} width={100} height={100} fill="red" />;
}
```

## The Timeline Class

A `Timeline` is a powerful tool for sequencing multiple `Tween` animations together. It allows you to:
- Sequence multiple animations.
*   Play multiple animations at different start offsets.
- Loop complex animation sequences.
- Seek (scrub) through an animation.

### Example

```tsx
import { useEffect, useRef } from 'react';
import { Canvas, Rect, Circle, Timeline, Tween } from 'canvas-react';

function MyComplexAnimation() {
  const rectRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    if (rectRef.current && circleRef.current) {
        const timeline = new Timeline({ loop: true });

        // Add tweens with absolute start times (in ms)
        timeline.add(
            new Tween({ node: rectRef.current, x: 400, duration: 1 }),
            0 // Start at 0ms
        );

        timeline.add(
            new Tween({ node: circleRef.current, opacity: 0, duration: 0.5 }),
            500 // Start at 500ms
        );

        timeline.play();
        
        return () => timeline.pause();
    }
  }, []);

  return (
    <Canvas width={600} height={600}>
      <Rect ref={rectRef} x={50} y={50} width={100} height={100} fill="green" />
      <Circle ref={circleRef} x={300} y={300} radius={50} fill="blue" />
    </Canvas>
  );
}
```

### Timeline Controls

```tsx
timeline.play();
timeline.pause();
timeline.seek(2000); // Jump to 2 seconds into the animation
```
