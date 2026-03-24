# `Group`

A component used to group multiple shapes together and apply transformations collectively.

> **Tip**: Not sure whether to use `Group` or `Layer`? Check out the [Groups vs Layers](/guide/groups-vs-layers) guide.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `x` | `number` | `0` | X coordinate relative to parent. |
| `y` | `number` | `0` | Y coordinate relative to parent. |
| `scaleX` | `number` | `1` | Scale factor on X-axis. |
| `scaleY` | `number` | `1` | Scale factor on Y-axis. |
| `rotation` | `number` | `0` | Rotation in degrees. |
| `opacity` | `number` | `1` | Opacity from 0 to 1. |
| `visible` | `boolean` | `true` | Whether the group and its children are visible. |
| `clip` | `boolean` | `false` | Whether to clip children to a rectangular region. |
| `clipX` | `number` | `0` | Clipping region X coordinate. |
| `clipY` | `number` | `0` | Clipping region Y coordinate. |
| `clipWidth` | `number` | `100` | Clipping region width. |
| `clipHeight` | `number` | `100` | Clipping region height. |

## Usage

```tsx
import { Group, Rect, Circle } from 'canvas-react';

function Character() {
  return (
    <Group x={100} y={100} rotation={45}>
      <Rect width={50} height={50} fill="red" />
      <Circle x={25} y={25} radius={10} fill="black" />
    </Group>
  );
}
```

### Clipping

```tsx
<Group 
  clip={true} 
  clipX={0} clipY={0} 
  clipWidth={50} clipHeight={50}
>
  <Circle radius={100} fill="blue" />
</Group>
```
