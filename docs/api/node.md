# Node

The base class for every object in the scene graph.

## Methods

### `getSelfBounds()`
Returns the local bounding box of the node.
```ts
const bounds = node.getSelfBounds();
console.log(bounds); // { x: 0, y: 0, width: 100, height: 100 }
```

### `getGlobalBounds()`
Returns the bounding box in stage coordinates.
```ts
const globalBounds = node.getGlobalBounds();
```

### `setProps(props)`
Updates the node's properties.
```ts
node.setProps({ x: 100, fill: 'red' });
```

### `getTransform()`
Returns the transformation matrix of the node.
```ts
const matrix = node.getTransform();
```

### `hitTest(point)`
Checks if a point is within the node's bounds.
```ts
const hit = node.hitTest({ x: 10, y: 10 });
```

### `cache(options)`
Rasterizes the node into a bitmap for performance.
```ts
node.cache();
```

### `clearCache()`
Clears the bitmap cache.
```ts
node.clearCache();
```

### `toJSON()`
Exports the node to a JSON object.
```ts
const json = node.toJSON();
console.log(JSON.stringify(json));
```

### `find(selector)`
Find a child node by ID (`#id`) or Name (`.name`). (Only for `Container`)
```ts
const myNode = container.find('#my-id');
const firstEnemy = container.find('.enemy');
```

### `findAll(selector)`
Find all child nodes by Name (`.name`). (Only for `Container`)
```ts
const allEnemies = container.findAll('.enemy');
```

### `toDataURL(options)`
Exports the node to an image.
```ts
const dataUrl = await node.toDataURL();
```

### `toSVG()`
Exports the node to an SVG string.
```ts
const svg = node.toSVG();
```

### `destroy()`
Removes the node and cleans up its resources.
```ts
node.destroy();
```

## Lifecycle

- `draw(ctx)`: Draws the node to a 2D canvas context.
- `update(time)`: Updates the node state for animation.
- `render(ctx, viewport)`: Performs high-level rendering and culling.
