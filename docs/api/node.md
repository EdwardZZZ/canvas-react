# Node

The base class for every object in the scene graph.

## Methods

- `getSelfBounds()`: Returns the local bounding box of the node.
- `getGlobalBounds()`: Returns the bounding box in stage coordinates.
- `setProps(props)`: Updates the node's properties.
- `getTransform()`: Returns the transformation matrix of the node.
- `hitTest(point)`: Checks if a point is within the node's bounds.
- `toDataURL(options)`: Exports the node to an image.
- `toSVG()`: Exports the node to an SVG string.
- `destroy()`: Removes the node and cleans up its resources.

## Lifecycle

- `draw(ctx)`: Draws the node to a 2D canvas context.
- `update(time)`: Updates the node state for animation.
- `render(ctx, viewport)`: Performs high-level rendering and culling.
