# `Layer`

A specialized component that renders its children into a separate HTML canvas element for performance optimization.

## Props

Inherits all props from `Group`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number` | `inherit` | Width of the layer canvas. |
| `height` | `number` | `inherit` | Height of the layer canvas. |

## Usage

Use `Layer` to separate static content from frequently changing content (like animations or user interactions).
