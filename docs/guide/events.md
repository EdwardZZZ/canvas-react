# Interactive Events

Canvas React provides a powerful event system that allows you to handle user interactions like clicks, drags, and mouse movements directly on your shapes.

## Basic Events

You can attach event listeners to any shape or group using props. Each handler receives an `InteractionEvent` object.

| Prop | Description |
| :--- | :--- |
| `onClick` | Triggered when the user clicks on the shape. |
| `onDoubleClick` | Triggered when the user double-clicks on the shape. |
| `onMouseDown` | Triggered when the mouse button is pressed down (or touch starts). |
| `onMouseUp` | Triggered when the mouse button is released (or touch ends). |
| `onMouseMove` | Triggered when the mouse moves over the shape. |
| `onMouseEnter` | Triggered when the mouse enters the shape's bounds. |
| `onMouseLeave` | Triggered when the mouse leaves the shape's bounds. |
| `onWheel` | Triggered when the mouse wheel is rotated over the shape. |

### Example

```tsx
<Rect
  x={10}
  y={10}
  width={100}
  height={100}
  fill="red"
  onClick={(e) => {
    console.log('Rect clicked at', e.localX, e.localY);
  }}
/>
```

## Drag & Drop

To make a shape draggable, set the `draggable` prop to `true`. You can then listen to drag-specific events.

| Prop | Description |
| :--- | :--- |
| `onDragStart` | Triggered when the drag operation starts. |
| `onDragMove` | Triggered continuously as the shape is being dragged. |
| `onDragEnd` | Triggered when the drag operation completes. |

### Example

```tsx
<Circle
  radius={50}
  fill="blue"
  draggable={true}
  onDragStart={() => console.log('Dragging started')}
  onDragEnd={(e) => console.log('Dropped at', e.globalX, e.globalY)}
/>
```

## The `InteractionEvent` Object

Every event handler receives an object with the following properties:

- `target`: The `Node` that triggered the event.
- `currentTarget`: The `Node` currently handling the event.
- `type`: The event type (e.g., `'click'`).
- `globalX`, `globalY`: Coordinates relative to the top-left of the `<Canvas>`.
- `localX`, `localY`: Coordinates relative to the origin of the `target` node.
- `originalEvent`: The underlying browser `MouseEvent` or `TouchEvent`.
- `stopPropagation()`: A function to prevent the event from bubbling up to parent containers.

## Event Bubbling

Events in Canvas React bubble up the scene graph. If you click on a shape inside a `Group`, the event will first fire on the shape, then on the `Group`, and so on, up to the `Stage`.

Use `e.stopPropagation()` if you want to prevent parent containers from receiving the event.
