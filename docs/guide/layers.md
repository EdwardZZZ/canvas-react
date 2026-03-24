# Layers & Performance

Canvas React provides several ways to optimize rendering performance, with the **Layer** system being the most powerful.

## The Layer Component

A `Layer` is a special component that renders its children into a separate HTML canvas element. These canvases are layered on top of each other using absolute positioning.

### Why use Layers?

In a traditional single-canvas setup, every change (like moving a single circle) requires clearing and redrawing the *entire* scene. With layers, you can isolate parts of your scene.

- **Static Backgrounds**: Put your grid or complex background in one layer. It only renders once.
*   **Active Elements**: Put frequently moving elements (like a cursor or selected shape) in a separate layer.
- **HUD/UI**: Keep your UI elements in a top layer.

### Example

```tsx
import { Canvas, Layer, Rect, Circle } from 'canvas-react';

function MyScene() {
  return (
    <Canvas width={800} height={600}>
      {/* This layer only redraws when its children change */}
      <Layer>
        <Rect width={800} height={600} fill="#f0f0f0" />
        <StaticBackgroundContent />
      </Layer>

      {/* This layer can redraw at 60fps without affecting the background layer */}
      <Layer>
        <MovingCharacter />
      </Layer>
    </Canvas>
  );
}
```

## Smart Redrawing

The engine automatically tracks "dirty" states. Redrawing only happens when:
1.  A node's properties change.
2.  An animation (Tween or Timeline) is running.
3.  A child is added or removed.

## Culling

The engine implements basic frustum culling. If a node's global bounds are completely outside the canvas viewport, the `draw` call is skipped entirely. This is especially effective for large maps or scenes where only a portion is visible at a time.
