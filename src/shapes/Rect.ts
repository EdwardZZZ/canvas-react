import { Node, NodeProps } from '../core/Node';

/**
 * Properties for a Rectangle node.
 */
export interface RectProps extends NodeProps {
  width?: number;
  height?: number;
  fill?: string;
}

/**
 * A rectangle shape node.
 */
export class Rect extends Node {
  declare props: RectProps;

  /**
   * Draws the rectangle.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const { width = 100, height = 100, fill = 'black' } = this.props;
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, width, height);
  }

  getSelfBounds() {
    const { width = 100, height = 100 } = this.props;
    return { x: 0, y: 0, width, height };
  }

  /**
   * Checks if a point is inside the rectangle.
   */
  isPointInShape(x: number, y: number): boolean {
    const { width = 100, height = 100 } = this.props;
    return x >= 0 && x <= width && y >= 0 && y <= height;
  }
}
