import { Node, NodeProps } from '../core/Node';

/**
 * Properties for a Circle node.
 */
export interface CircleProps extends NodeProps {
  radius?: number;
  fill?: string;
}

/**
 * A circular shape node.
 */
export class Circle extends Node {
  declare props: CircleProps;

  /**
   * Draws the circle on the canvas.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const { radius = 50, fill = 'black' } = this.props;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.closePath();
  }

  getSelfBounds() {
    const { radius = 50 } = this.props;
    // Circle is drawn at 0,0 center, so bounds are -r to r
    return { 
        x: -radius, 
        y: -radius, 
        width: radius * 2, 
        height: radius * 2 
    };
  }

  /**
   * Checks if a point is inside the circle using the distance formula.
   * x^2 + y^2 &lt;= r^2
   */
  isPointInShape(x: number, y: number): boolean {
    const { radius = 50 } = this.props;
    return x * x + y * y <= radius * radius;
  }
}
