import { Node, NodeProps } from '../core/Node';

/**
 * Properties for a Rectangle node.
 */
export interface RectProps extends NodeProps {
  width?: number;
  height?: number;
  cornerRadius?: number | number[];
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
    const { width = 100, height = 100, fill, stroke, lineWidth, lineDash, lineDashOffset, lineCap, lineJoin, cornerRadius } = this.props;
    
    ctx.beginPath();
    
    if (cornerRadius) {
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(0, 0, width, height, cornerRadius);
      } else {
        // Fallback or just rect
        ctx.rect(0, 0, width, height);
      }
    } else {
      ctx.rect(0, 0, width, height);
    }
    
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    
    if (stroke || lineWidth) {
      ctx.strokeStyle = stroke || 'black';
      ctx.lineWidth = lineWidth || 1;
      if (lineCap) ctx.lineCap = lineCap;
      if (lineJoin) ctx.lineJoin = lineJoin;
      if (lineDash) {
        ctx.setLineDash(lineDash);
        if (lineDashOffset !== undefined) ctx.lineDashOffset = lineDashOffset;
      }
      ctx.stroke();
    }
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
