# Shapes

Canvas React provides several built-in shape components.

## Common Props

All shapes inherit from `Node` and share these common props:
- `x`, `y`: Position relative to parent.
- `scaleX`, `scaleY`: Scale factor.
- `rotation`: Rotation in degrees.
- `opacity`: Opacity (0-1).
- `visible`: Visibility toggle.
- `fill`: Fill color or gradient.
- `stroke`: Stroke color.
- `lineWidth`: Stroke width.
- `cursor`: CSS cursor on hover.
- `fillLinearGradient`: Linear gradient object `{ x0, y0, x1, y1, colorStops: [{ offset, color }] }`.
- `fillRadialGradient`: Radial gradient object `{ x0, y0, r0, x1, y1, r1, colorStops: [{ offset, color }] }`.

### Gradient Example
```tsx
<Rect
  width={100}
  height={100}
  fillLinearGradient={{
    x0: 0, y0: 0, x1: 100, y1: 100,
    colorStops: [
      { offset: 0, color: 'red' },
      { offset: 1, color: 'blue' }
    ]
  }}
/>
```

## `Rect`
A rectangular shape.
```tsx
<Rect x={10} y={10} width={100} height={50} fill="green" cornerRadius={5} />
```
- `width`, `height`: Dimensions.
- `cornerRadius`: Radius for rounded corners.

## `Circle`
A circular shape.
```tsx
<Circle x={100} y={100} radius={50} fill="orange" />
```
- `radius`: Radius of the circle.

## `Ellipse`
An elliptical shape.
```tsx
<Ellipse x={100} y={100} radiusX={50} radiusY={30} fill="purple" />
```
- `radiusX`, `radiusY`: Radii on both axes.

## `Line`
A line segment or multi-segment path.
```tsx
<Line points={[0, 0, 100, 0, 100, 100]} stroke="black" lineWidth={2} closed />
```
- `points`: Array of numbers `[x1, y1, x2, y2, ...]`.
- `closed`: Whether to close the path.

## `Path`
A shape defined by SVG path data.
```tsx
<Path data="M 10 10 L 100 10 L 100 100 Z" fill="cyan" stroke="blue" />
```
- `data`: SVG path string (e.g., `"M 0 0 L 100 100"`).

## `Text`
A text shape.
```tsx
<Text 
  text="Hello World" 
  fontSize={24} 
  width={200} 
  wordWrap={true} 
  align="center" 
  fill="black" 
/>
```
- `text`: String to display.
- `fontSize`, `fontFamily`: Font styling.
- `width`: Max width for wrapping.
- `wordWrap`: Enable/disable word wrap.
- `lineHeight`: Multiplier (default 1.2).
- `align`, `verticalAlign`: Text alignment.

## `RichText`
A shape that renders text with multiple styles in a single block.

```tsx
<RichText
  x={50} y={50}
  width={300}
  segments={[
    { text: 'Hello ', fill: 'red', fontWeight: 'bold' },
    { text: 'World', fill: 'blue', textDecoration: 'underline' }
  ]}
/>
```

- `segments`: Array of `{ text, fill, fontSize, fontFamily, fontWeight, fontStyle, textDecoration }`.
- `width`: Max width for wrapping.
- `lineHeight`: Multiplier.
- `align`: Text alignment.

## `Transformer`
A specialized UI component for transforming other nodes.

```tsx
const [selected, setSelected] = useState([]);

return (
  <Canvas>
    <Rect name="shape1" draggable x={10} y={10} width={50} height={50} fill="red" />
    <Transformer targets={selected} />
  </Canvas>
)
```

- `targets`: Array of nodes to transform.
- `keepRatio`: Whether to maintain aspect ratio during scaling.
- `enabledAnchors`: Array of enabled handle names (e.g., `['top-left', 'bottom-right']`).
- `borderStroke`: Color of the selection box.
- `handleFill`: Color of the control handles.

## `Star`
A star shape.
```tsx
<Star x={100} y={100} numPoints={5} innerRadius={20} outerRadius={50} fill="yellow" />
```
- `numPoints`: Number of points.
- `innerRadius`: Radius of inner points.
- `outerRadius`: Radius of outer points.

## `RegularPolygon`
A regular polygon.
```tsx
<RegularPolygon x={100} y={100} sides={6} radius={50} fill="lightgrey" />
```
- `sides`: Number of sides.
- `radius`: Radius of the polygon.
