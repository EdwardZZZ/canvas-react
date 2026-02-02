import { Node, NodeProps } from '../core/Node';

/**
 * Properties for a Line node.
 */
export interface LineProps extends NodeProps {
  points: number[]; // [x1, y1, x2, y2, ...]
  stroke?: string;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  closed?: boolean;
}

/**
 * A line or polygon node.
 * Connects a series of points with straight lines.
 */
export class Line extends Node {
  declare props: LineProps;

  getSelfBounds() {
    const { points = [], lineWidth = 1 } = this.props;
    if (points.length < 2) return { x: 0, y: 0, width: 0, height: 0 };

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < points.length; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    
    const halfWidth = lineWidth / 2;
    return {
        x: minX - halfWidth,
        y: minY - halfWidth,
        width: maxX - minX + lineWidth,
        height: maxY - minY + lineWidth
    };
  }

  /**
   * Draws the line segments.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const { 
      points = [], 
      stroke = 'black', 
      lineWidth = 1,
      lineCap = 'butt',
      lineJoin = 'miter',
      closed = false
    } = this.props;

    if (points.length < 4) return;

    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);

    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo(points[i], points[i + 1]);
    }

    if (closed) {
      ctx.closePath();
    }

    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;
    ctx.stroke();
  }
}
