# Groups vs Layers

In Canvas React, both `Group` and `Layer` are containers for other nodes, but they serve very different purposes.

## Key Difference

- **`Layer` (Physical)**: Creates a separate HTML `<canvas>` element. Used for performance optimization.
- **`Group` (Logical)**: A virtual container within a layer. Used for organization and shared transformations.

## Comparison

| Feature | Group | Layer |
|---|---|---|
| **DOM Elements** | No new elements created. | Creates a new `<canvas>` tag. |
| **Rendering** | Drawn on the parent's canvas. | Drawn on its own canvas, then composited. |
| **Performance** | Minimal overhead. | High overhead (new canvas), but enables independent redrawing. |
| **Best For** | Grouping shapes, shared rotation/scale. | Separating static backgrounds from animations. |

## When to use `Group`

Use `Group` when you want to treat multiple shapes as a single entity.

```tsx
import { Group, Rect, Circle } from 'canvas-react';

function Character() {
  return (
    <Group x={100} y={100} rotation={45}>
      <Rect width={50} height={50} fill="red" />
      <Circle x={25} y={25} radius={10} fill="black" />
    </Group> character
  );
}
```

In this example, moving or rotating the group moves/rotates both the rectangle and the circle. It also creates a local coordinate system where `(0,0)` is the group's position.

## When to use `Layer`

Use `Layer` when you have content that changes at different frequencies.

```tsx
import { Canvas, Layer, Rect } from 'canvas-react';

function App() {
  return (
    <Canvas width={800} height={600}>
      {/* Layer 1: Static background (rendered once) */}
      <Layer>
        <Rect width={800} height={600} fill="#f0f0f0" />
        <ComplexBackgroundShapes />
      </Layer>

      {/* Layer 2: Interactive elements (rendered at 60fps) */}
      <Layer>
        <MovingCharacter />
      </Layer>
    </Canvas>
  );
}
```

By splitting these into layers, the engine only redraws the specific `<canvas>` element that changed. The static background layer remains untouched in the browser's GPU, providing a significant performance boost.
