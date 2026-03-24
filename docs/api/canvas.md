# `Canvas`

The root component of the Canvas React engine.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number` | `500` | Width of the canvas in pixels. |
| `height` | `number` | `500` | Height of the canvas in pixels. |
| `debug` | `boolean` | `false` | Enable DevTools panel for debugging. |
| `interactive` | `boolean` | `false` | Enable pan and zoom interactions on the stage. |

## Usage

```tsx
import { Canvas, Rect } from 'canvas-react';
import { useRef } from 'react';

function App() {
  const canvasRef = useRef(null);

  const handleCapture = async () => {
    if (canvasRef.current) {
      const dataUrl = await canvasRef.current.toDataURL();
      console.log(dataUrl);
    }
  };

  return (
    <>
      <button onClick={handleCapture}>Capture</button>
      <Canvas ref={canvasRef} width={800} height={600} interactive debug>
        <Rect width={100} height={100} fill="red" draggable />
      </Canvas>
    </>
  );
}
```

## Methods (via Ref)

- `toDataURL(options)`: Export the scene as an image.
- `toSVG()`: Export the scene as an SVG string.
- `toJSON()`: Export the entire scene graph as a JSON object.
- `stage`: Access the underlying `Container` instance.
- `canvas`: Access the underlying HTML canvas element.

## NodeFactory

Use `NodeFactory` to reconstruct a scene from a JSON object.

```tsx
import { NodeFactory } from 'canvas-react';

const scene = NodeFactory.create(json);
```
