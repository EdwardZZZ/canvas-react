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

## `Rect`
A rectangular shape.
- `width`, `height`: Dimensions.
- `cornerRadius`: Radius for rounded corners.

## `Circle`
A circular shape.
- `radius`: Radius of the circle.

## `Ellipse`
An elliptical shape.
- `radiusX`, `radiusY`: Radii on both axes.

## `Line`
A line segment or multi-segment path.
- `points`: Array of numbers `[x1, y1, x2, y2, ...]`.
- `closed`: Whether to close the path.

## `Path`
A shape defined by SVG path data.
- `data`: SVG path string (e.g., `"M 0 0 L 100 100"`).

## `Star`
A star shape.
- `numPoints`: Number of points.
- `innerRadius`: Radius of inner points.
- `outerRadius`: Radius of outer points.

## `RegularPolygon`
A regular polygon.
- `sides`: Number of sides.
- `radius`: Radius of the polygon.
