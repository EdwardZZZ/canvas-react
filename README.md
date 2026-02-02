# React Canvas Engine

A lightweight, high-performance Canvas rendering engine built with TypeScript and React. It provides a declarative API to build complex canvas scenes using standard React components.

[English](./README.md) | [简体中文](./README_zh-CN.md)

## Features

- **Declarative API**: Compose scenes using React components like `<Rect>`, `<Circle>`, `<Group>`.
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

## Usage

### Basic Shapes

The engine supports basic shapes like Rectangle, Circle, Text, Line, Path (SVG), and Image.

```tsx
import Canvas from './src/react/Canvas';
import { Rect, Circle, Text, Line, Image, Path } from './src/react/Shapes';

const App = () => (
  <Canvas width={800} height={600}>
    {/* Basic Rectangle */}
    <Rect x={10} y={10} width={100} height={50} fill="red" />
    
    {/* Circle */}
    <Circle x={200} y={100} radius={30} fill="blue" />
    
    {/* Text */}
    <Text text="Hello World" x={10} y={100} fontSize={24} fill="#333" />
    
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

The engine supports mouse and drag events on all shapes.

```tsx
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

### Animation

Use the `useFrame` hook to update component state on every frame.

```tsx
import { useState } from 'react';
import { useFrame } from './src/react/CanvasContext';
import { Rect } from './src/react/Shapes';

const RotatingBox = () => {
  const [rotation, setRotation] = useState(0);

  useFrame((time) => {
    // time is the elapsed time in milliseconds
    setRotation(time * 0.001);
  });

  return (
    <Rect 
      x={250} 
      y={250} 
      width={100} 
      height={100} 
      rotation={rotation} 
      fill="purple" 
    />
  );
};
```

## API Reference

### `<Canvas>`
The root container for the scene.
- `width`: number (default: 500)
- `height`: number (default: 500)
- `style`: CSSProperties
- `onClick`, `onMouseDown`, `onMouseUp`, `onMouseMove`, `onMouseLeave`: Global event handlers

### Common Props (All Shapes)
- `x`: number (default: 0)
- `y`: number (default: 0)
- `rotation`: number (radians, default: 0)
- `scaleX`: number (default: 1)
- `scaleY`: number (default: 1)
- `zIndex`: number (default: 0) - Higher values render on top
- `draggable`: boolean (default: false)
- `cursor`: string (default: 'default') - CSS cursor style on hover (e.g. 'pointer', 'grab')
- `filter`: string - CSS filter string (e.g. 'blur(5px)')
- `shadowColor`: string
- `shadowBlur`: number
- `shadowOffsetX`: number
- `shadowOffsetY`: number
- **Events**: `onClick`, `onMouseEnter`, `onMouseLeave`, `onDragStart`, `onDragMove`, `onDragEnd`

### Shape Specific Props

#### `<Rect>`
- `width`: number
- `height`: number
- `fill`: string (color)

#### `<Circle>`
- `radius`: number
- `fill`: string

#### `<Text>`
- `text`: string
- `fontSize`: number
- `fontFamily`: string
- `fill`: string
- `width`: number (max width for wrapping)
- `align`: 'left' | 'center' | 'right'
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
- `width`: number
- `height`: number

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
