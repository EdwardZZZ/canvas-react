# Core Concepts

Canvas React is built on a few core principles that make canvas rendering declarative and performant.

## Scene Graph

Every canvas scene is represented by a hierarchical structure of nodes.

- **Stage**: The root container for the entire scene.
- **Node**: The base class for every element in the scene.
- **Container**: A special node that can have children.
- **Shape**: A node that knows how to draw itself.

## Rendering Loop

The rendering engine uses a specialized loop that optimizes for:
- **Redraw on Demand**: Redrawing only when necessary (property changes, animations).
- **Batching**: Grouping multiple updates into a single redraw.
- **High DPI Support**: Automatically handling device pixel ratio for sharp rendering on all displays.

## Coordinate System

- **(0, 0)**: The top-left corner of the canvas.
- **Transformation Matrix**: Each node has a transformation matrix (2D) that defines its position, scale, and rotation.
- **Global vs. Local**: Properties like `x`, `y` are local to the parent. Global coordinates are calculated top-down.

## Event System

Events are handled using a custom hit-testing engine.

- **Hit Testing**: When you click or move the mouse, the engine performs a top-down search to find the front-most node under the pointer.
- **Synthesized Events**: Events like `onClick`, `onMouseEnter`, `onMouseLeave` are synthesized from native canvas events.
- **Bubbling**: Events bubble up from the hit node through its ancestors to the stage.

## Node Query System

Just like the DOM, you can find nodes within a `Container` using selectors:

- **ID Selector**: Use `#id` to find a single node with that unique ID.
- **Class Selector**: Use `.name` to find all nodes with a specific name.

```tsx
const enemy = stage.find('.enemy'); // Find first node with name='enemy'
const target = stage.find('#target'); // Find node with id='target'
const allEnemies = stage.findAll('.enemy'); // Find all enemies
```

## Serialization

You can easily save and restore your scene graph using JSON.

- **`toJSON()`**: Available on any node. It serializes the node and its children into a plain JSON object.
- **`NodeFactory.create(json)`**: A utility to recreate a full node tree from JSON.

This is perfect for undo/redo systems, saving work to a database, or sending scenes over a network.

### Example

```tsx
import { NodeFactory, Rect, Group } from 'canvas-react';

const group = new Group({ x: 100 });
group.add(new Rect({ width: 50, height: 50, fill: 'red' }));

// 1. Serialize to JSON
const json = group.toJSON();
console.log(json); 
/*
{
  type: 'Group',
  props: { x: 100 },
  children: [
    { type: 'Rect', props: { width: 50, height: 50, fill: 'red' } }
  ]
}
*/

// 2. Recreate from JSON
const restoredGroup = NodeFactory.create(json);
```
