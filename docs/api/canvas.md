# `Canvas`

The root component of the Canvas React engine.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number` | `500` | Width of the canvas in pixels. |
| `height` | `number` | `500` | Height of the canvas in pixels. |
| `debug` | `boolean` | `false` | Enable DevTools panel for debugging. |
| `interactive` | `boolean` | `false` | Enable pan and zoom interactions on the stage. |

## Methods (via Ref)

- `toDataURL(options)`: Export the scene as an image.
- `toSVG()`: Export the scene as an SVG string.
- `stage`: Access the underlying `Container` instance.
- `canvas`: Access the underlying HTML canvas element.
