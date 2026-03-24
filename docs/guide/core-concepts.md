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
