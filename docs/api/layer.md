# `Layer`

A specialized component that renders its children into a separate HTML canvas element for performance optimization.

> **Tip**: To understand when to use a `Layer` versus a `Group`, see the [Groups vs Layers](/guide/groups-vs-layers) comparison.

## Props

Inherits all props from `Group`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number` | `inherit` | Width of the layer canvas. |
| `height` | `number` | `inherit` | Height of the layer canvas. |

## Usage

Use `Layer` to separate static content from frequently changing content (like animations or user interactions).

```tsx
import { Canvas, Layer, Rect, Circle } from 'canvas-react';

function MyScene() {
  return (
    <Canvas width={800} height={600}>
      {/* This layer will only redraw when static content changes */}
      <Layer>
        <Rect width={800} height={600} fill="#f0f0f0" />
        <Circle x={100} y={100} radius={50} fill="blue" />
      </Layer>

      {/* This layer can redraw frequently for animations */}
      <Layer>
        <MovingCharacter />
      </Layer>
    </Canvas>
  );
}
```
