# Exporting

Canvas React provides built-in methods to export your canvas scene to different formats. These methods are available on any `Node` instance (including `Canvas`, `Layer`, and `Group`).

## SVG Export

The `toSVG()` method returns a string containing the SVG representation of your scene. This is useful for:
- Saving high-quality vector images.
*   Integrating with other design tools.
- Rendering on the server where Canvas is not available.

### Usage

```tsx
import { useRef } from 'react';
import { Canvas, Rect, Circle } from 'canvas-react';

function MyExporter() {
  const canvasRef = useRef(null);

  const handleExport = () => {
    if (canvasRef.current) {
        // toSVG() returns a full <svg> string
        const svgString = canvasRef.current.toSVG();
        console.log(svgString);
        
        // You can then trigger a download or display it
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'scene.svg';
        link.click();
    }
  };

  return (
    <>
      <button onClick={handleExport}>Export to SVG</button>
      <Canvas ref={canvasRef} width={500} height={500}>
        <Rect x={10} y={10} width={100} height={100} fill="red" />
        <Circle x={200} y={200} radius={50} fill="blue" />
      </Canvas>
    </>
  );
}
```

## Image Export (DataURL)

The `toDataURL()` method returns a base64-encoded string representing the scene as a PNG or JPEG.

### Options

```tsx
const dataUrl = node.toDataURL({
  mimeType: 'image/png', // default 'image/png'
  quality: 0.9,          // 0 to 1, default 1
  pixelRatio: 2,         // Export at high resolution (retina)
  x: 0,                  // Optional sub-region to export
  y: 0,
  width: 200,
  height: 200
});
```
