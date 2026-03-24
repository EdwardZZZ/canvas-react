# Getting Started

Canvas React is a powerful, declarative 2D graphics engine for React. It combines the ease of use of React components with the performance of the HTML5 Canvas API.

## Installation

```bash
npm install canvas-react
```

## Basic Usage

The simplest way to use Canvas React is to place shape components inside a `Canvas` container.

```tsx
import { Canvas, Rect, Circle } from 'canvas-react';

function App() {
  return (
    <Canvas width={800} height={600}>
      <Rect x={10} y={10} width={100} height={100} fill="red" />
      <Circle x={200} y={200} radius={50} fill="blue" />
    </Canvas>
  );
}
```

## Handling Interactions

You can easily handle pointer events on any shape using props like `onClick`, `onMouseEnter`, and `onMouseLeave`.

```tsx
import { Canvas, Rect } from 'canvas-react';
import { useState } from 'react';

function InteractiveRect() {
  const [color, setColor] = useState('red');

  return (
    <Canvas width={400} height={400}>
      <Rect 
        x={50} y={50} 
        width={100} height={100} 
        fill={color}
        onClick={() => setColor(color === 'red' ? 'blue' : 'red')}
        onMouseEnter={() => (document.body.style.cursor = 'pointer')}
        onMouseLeave={() => (document.body.style.cursor = 'default')}
      />
    </Canvas>
  );
}
```

## Drag and Drop

To make a node draggable, simply set the `draggable` prop to `true`.

```tsx
<Rect 
  x={50} y={50} 
  width={100} height={100} 
  fill="green" 
  draggable={true} 
  onDragMove={(e) => console.log('New position:', e.x, e.y)}
/>
```
