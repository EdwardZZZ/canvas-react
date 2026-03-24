# Basic Example

This example demonstrates how to create a simple scene with a rectangle and a circle.

```tsx
import { Canvas, Rect, Circle } from 'canvas-react';

function BasicScene() {
  return (
    <Canvas width={400} height={400}>
      <Rect x={10} y={10} width={100} height={100} fill="red" />
      <Circle x={200} y={200} radius={50} fill="blue" />
    </Canvas>
  );
}
```
