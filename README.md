# React Canvas Engine

A lightweight, high-performance Canvas rendering engine built with TypeScript and React. It provides a declarative API to build complex canvas scenes using standard React components.

[English](./README.md) | [简体中文](./README_zh-CN.md)

## Features

- **Declarative API**: Compose scenes using React components like `<Rect>`, `<Circle>`, `<Group>`.
- **React Reconciler**: Custom React renderer that maps Fiber tree directly to Canvas Scene Graph, bypassing DOM diffing for maximum performance.
- **Scene Graph**: Built-in hierarchical object management (parent-child relationships).
- **Interactive**: Support for click, hover, and drag events (`onClick`, `onMouseEnter`, `onDragStart`, etc.).
- **Smart Rendering**: Z-Index sorting, Group clipping, and optimized rendering loop using `requestAnimationFrame`.
- **High DPI Support**: Automatically handles retina/high-density displays.
- **TypeScript**: Written in TypeScript with full type definitions.
- **Animation Hooks**: `useFrame` hook for smooth, frame-by-frame animations.

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Built-in Shapes

`canvas-react` provides a set of common shapes out of the box. All shapes support standard props like `x`, `y`, `fill`, `stroke`, `lineWidth`, `opacity`, `rotation`, `scaleX`, `scaleY`, and event handlers like `onClick`.

| Shape | Key Props | Description |
| :--- | :--- | :--- |
| **`<Rect />`** | `width`, `height`, `cornerRadius` | A rectangle with optional rounded corners. |
| **`<Circle />`** | `radius` | A simple circle. |
| **`<Ellipse />`** | `radiusX`, `radiusY` | An ellipse defined by two radii. |
| **`<Line />`** | `points`, `closed` | A series of connected points. Set `closed` for a polygon. |
| **`<Path />`** | `data` | Renders SVG path data (e.g., `M 10 10 L 90 90`). |
| **`<Text />`** | `text`, `fontSize`, `fontFamily`, `align`, `width`, `wordWrap` | Multiline text with alignment and wrapping support. |
| **`<Image />`** | `image`, `width`, `height` | Renders an `HTMLImageElement`. |
| **`<Arc />`** | `innerRadius`, `outerRadius`, `angle`, `clockwise` | A wedge or arc segment. |
| **`<RegularPolygon />`** | `sides`, `radius` | A polygon with equal sides (triangle, hexagon, etc.). |
| **`<Star />`** | `numPoints`, `innerRadius`, `outerRadius` | A star shape with customizable points and radii. |
| **`<Group />`** | `clip`, `clipWidth`, `clipHeight` | A container for grouping other shapes. Supports clipping. |
| **`<Transformer />`** | `nodes` | A special UI component for rotating/scaling other nodes. |

## Usage

### Basic Shapes

The engine supports a rich set of basic shapes including Rectangle, Circle, Ellipse, RegularPolygon, Star, Arc, Text, Line, Path (SVG), and Image. All shapes support `fill` and `stroke` properties.

```tsx
import Canvas from './src/react/Canvas';
import { Rect, Circle, Ellipse, RegularPolygon, Star, Arc, Text, Line, Image, Path } from './src/react/Shapes';

const App = () => (
  <Canvas width={800} height={600}>
    {/* Basic Rectangle (supports rounded corners and dashed strokes) */}
    <Rect x={10} y={10} width={100} height={50} fill="red" stroke="black" lineWidth={2} cornerRadius={10} lineDash={[5, 5]} />
    
    {/* Circle */}
    <Circle x={200} y={100} radius={30} fill="blue" />
    
    {/* Ellipse */}
    <Ellipse x={300} y={100} radiusX={40} radiusY={20} fill="green" />

    {/* Regular Polygon */}
    <RegularPolygon x={400} y={100} sides={6} radius={30} fill="purple" />

    {/* Star */}
    <Star x={500} y={100} numPoints={5} innerRadius={15} outerRadius={30} fill="yellow" stroke="orange" />

    {/* Arc / Sector */}
    <Arc x={600} y={100} innerRadius={10} outerRadius={30} angle={Math.PI} fill="cyan" />

    {/* Text (supports multiline and vertical alignment) */}
    <Text text="Hello World\nLine 2" x={10} y={100} fontSize={24} fill="#333" verticalAlign="middle" />
    
    {/* SVG Path */}
    <Path 
      data="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z" 
      fill="pink" 
      stroke="red" 
    />
  </Canvas>
);
```

### Interactions & Events

The engine supports mouse and drag events on all shapes. You can also enable global canvas panning and zooming by setting `interactive={true}` on the `<Canvas>`.

```tsx
<Canvas width={800} height={600} interactive={true}>
  <Rect 
    x={100} 
    y={100} 
    width={50} 
    height={50} 
    fill="orange"
    onClick={(e) => console.log('Clicked!', e)}
    onMouseEnter={() => console.log('Hover enter')}
    onMouseLeave={() => console.log('Hover leave')}
    draggable={true}
    onDragStart={() => console.log('Drag started')}
    onDragMove={(e) => console.log('Dragging...', e)}
    onDragEnd={() => console.log('Drag ended')}
  />
</Canvas>
```

### Debugging & DevTools

To make debugging complex canvas scenes easier, the engine provides multi-layered debugging support. Simply enable `debug={true}` on the `<Canvas>`:

1. **React DevTools Integration**: When debugging is enabled, you can inspect the live coordinates and properties of all shape nodes (e.g., `Rect`, `Circle`) directly within the Chrome React DevTools "Components" panel.
2. **Global Variable Exposure**: The engine exposes the root scene graph instance to `window.__CANVAS_STAGE__`. You can print and manipulate it directly in the Chrome Console (e.g., `__CANVAS_STAGE__.children`).
3. **Built-in Visual Panel**: An in-app developer tools panel will be rendered in the bottom right corner, displaying the current FPS, node tree, and bounding box highlighters.

```tsx
<Canvas width={800} height={600} debug={true}>
  {/* ... */}
</Canvas>
```

### Grouping, Clipping & Z-Index

Use `<Group>` to organize shapes. You can also use `clip` to restrict rendering to the group's bounding box, and `zIndex` to control rendering order.

```tsx
import { Group, Rect } from './src/react/Shapes';

const Scene = () => (
  <Group x={400} y={300} clip={true} clipWidth={200} clipHeight={200}>
    {/* Background (z-index 0) */}
    <Rect width={200} height={200} fill="#eee" zIndex={0} />
    
    {/* Foreground (z-index 10) - will be rendered on top */}
    <Rect x={50} y={50} width={100} height={100} fill="red" zIndex={10} />
  </Group>
);
```

### Animation (Tweening)

Besides the `useFrame` hook, the engine now has a built-in tweening system for declarative animations on any node.

```tsx
import { useEffect, useRef } from 'react';
import { Rect } from './src/react/Shapes';
import { Node } from './src/core/Node';

const AnimatedBox = () => {
  const nodeRef = useRef<Node>(null);

  useEffect(() => {
    if (nodeRef.current) {
      // Smoothly transition to the specified properties over 1 second
      nodeRef.current.to({
        x: 300,
        rotation: Math.PI,
        opacity: 0.5,
        duration: 1,
        easing: (t) => t * (2 - t) // Optional easing function
      });
    }
  }, []);

  return <Rect ref={nodeRef} width={100} height={100} fill="purple" />;
};
```

### Export & Serialization

The engine supports exporting the canvas or any node to an image or JSON.

```tsx
// Export as Image (DataURL)
const dataUrl = canvasRef.current.toDataURL({ mimeType: 'image/png', quality: 1, pixelRatio: 2 });

// Serialize Scene Graph
const json = nodeRef.current.toJSON();
```

## API Reference

### `<Canvas>`
The root container for the scene.
- `width`: number (default: 500)
- `height`: number (default: 500)
- `style`: CSSProperties
- `interactive`: boolean (default: false) - Enable pan & zoom interactions on the canvas
- `onClick`, `onDoubleClick`, `onMouseDown`, `onMouseUp`, `onMouseMove`, `onMouseLeave`, `onWheel`: Global event handlers
- **Methods**: `toDataURL(options)` Export canvas image

### Common Props (All Shapes)
- `x`: number (default: 0)
- `y`: number (default: 0)
- `rotation`: number (radians, default: 0)
- `scaleX`: number (default: 1)
- `scaleY`: number (default: 1)
- `opacity`: number (global alpha)
- `globalCompositeOperation`: string (blend mode)
- `zIndex`: number (default: 0) - Higher values render on top
- `draggable`: boolean (default: false)
- `cursor`: string (default: 'default') - CSS cursor style on hover
- **Stroke & Fill**: `fill`, `stroke`, `lineWidth`, `lineDash`, `lineDashOffset`, `lineCap`, `lineJoin`
- **Filters & Shadows**: `filter`, `shadowColor`, `shadowBlur`, `shadowOffsetX`, `shadowOffsetY`
- **Events**: `onClick`, `onDoubleClick`, `onMouseDown`, `onMouseUp`, `onMouseMove`, `onMouseEnter`, `onMouseLeave`, `onWheel`, `onDragStart`, `onDragMove`, `onDragEnd`
- **Node Methods**: `cache()`, `clearCache()`, `toJSON()`, `toDataURL()`, `to(config)`

### Shape Specific Props

#### `<Rect>`
- `width`: number
- `height`: number
- `cornerRadius`: number | number[] (rounded corners)

#### `<Circle>`
- `radius`: number

#### `<Ellipse>`
- `radiusX`: number
- `radiusY`: number

#### `<RegularPolygon>`
- `sides`: number (number of sides)
- `radius`: number

#### `<Star>`
- `numPoints`: number (number of points)
- `innerRadius`: number
- `outerRadius`: number

#### `<Arc>`
- `innerRadius`: number
- `outerRadius`: number
- `angle`: number (radians)

#### `<Text>`
- `text`: string
- `fontSize`: number
- `fontFamily`: string
- `fontStyle`, `fontWeight`, `fontVariant`: Font styling
- `width`: number (max width for wrapping)
- `align`: 'left' | 'center' | 'right'
- `verticalAlign`: 'top' | 'middle' | 'bottom'
- `lineHeight`: number

#### `<Path>`
- `data`: string (SVG Path Data)
- `fill`: string
- `stroke`: string
- `lineWidth`: number

#### `<Line>`
- `points`: number[] (Array of coordinates `[x1, y1, x2, y2, ...]`)
- `stroke`: string (color)
- `lineWidth`: number
- `lineCap`: 'butt' | 'round' | 'square'
- `lineJoin`: 'bevel' | 'round' | 'miter'
- `closed`: boolean (close the path)

#### `<Image>`
- `src`: string (image URL)
- `image`: HTMLImageElement (pre-loaded image element)
- `width`: number
- `height`: number
- `filters`: FilterFunction[] (Pixel-level filters, built-ins: `Filters.Grayscale`, `Filters.Invert`, `Filters.Sepia`, `Filters.Brightness`)

#### `<Group>`
- `clip`: boolean (enable clipping)
- `clipX`, `clipY`, `clipWidth`, `clipHeight`: Clipping rectangle definition

#### `<Transformer>`
- `target`: Node (the node to attach to)
- `borderStroke`: string (color of the border)
- `handleFill`: string (color of the handles)
- `keepRatio`: boolean (maintain aspect ratio)

## New Features

### Asset Management
Built-in `AssetManager` handles efficient loading, caching, and deduplication of image resources. `<Image>` components automatically leverage this system.

### Filters & Shadows
Support for real-time visual effects on any node.

```tsx
<Image 
  src="photo.png" 
  filter="blur(5px) grayscale(50%)" 
/>

<Rect 
  fill="white" 
  shadowColor="black" 
  shadowBlur={10} 
/>
```

### Cursor Management
Automatic cursor updates based on interaction state.
- Hovering over draggable objects shows `grab` cursor.
- Dragging shows `grabbing` cursor.
- Transformer handles show appropriate resize cursors (rotatable).
- Custom cursors via `cursor` prop.

### Multiline Text
Support for automatic text wrapping and alignment.

```tsx
<Text 
  text="This is a long text that wraps automatically." 
  width={200} 
  align="center" 
/>
```

### Transformer
A UI component for interactive scaling and rotation of nodes.

```tsx
<Transformer target={selectedNode} />
```

### Touch Support
Full support for touch interactions (drag, click) on mobile devices.

### Performance
- **Frustum Culling**: Automatically skips rendering of objects outside the viewport.
- **Smart Dirty Rect**: Optimized rendering loop.

## Project Structure

```
src/
├── core/             # Engine Core (Scene Graph, Node, Container, Matrix, Event System)
├── shapes/           # Shape Implementations (Rect, Circle, Path, etc.)
├── react/            # React Bindings (Canvas, Shapes, Context)
└── types/            # Type Definitions
examples/             # Demo Application
```

## Testing

Run the test suite using Vitest:

```bash
npm test
```
