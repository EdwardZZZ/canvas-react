# Getting Started

## Installation

```bash
npm install canvas-react
```

## Basic Usage

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