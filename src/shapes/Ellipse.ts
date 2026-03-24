import { Node, NodeProps } from '../core/Node';

export interface EllipseProps extends NodeProps {
  radiusX?: number;
  radiusY?: number;
}

export class Ellipse extends Node {
  declare props: EllipseProps;

  draw(ctx: CanvasRenderingContext2D) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { radiusX = 50, radiusY = 30, fill, stroke, lineWidth, lineDash, lineDashOffset, lineCap, lineJoin } = this.props;
    ctx.beginPath();
    ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    
    const _fillStyle = this._getFillStyle(ctx);
    if (_fillStyle) {
      ctx.fillStyle = _fillStyle;
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
    
    ctx.closePath();
  }

  getSelfBounds() {
    const { radiusX = 50, radiusY = 30 } = this.props;
    return { 
        x: -radiusX, 
        y: -radiusY, 
        width: radiusX * 2, 
        height: radiusY * 2 
    };
  }

  isPointInShape(x: number, y: number): boolean {
    const { radiusX = 50, radiusY = 30 } = this.props;
    if (radiusX === 0 || radiusY === 0) return false;
    // (x^2 / rx^2) + (y^2 / ry^2) <= 1
    return (x * x) / (radiusX * radiusX) + (y * y) / (radiusY * radiusY) <= 1;
  }
}
