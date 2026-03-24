import { Node, NodeProps } from '../core/Node';

export interface ArcProps extends NodeProps {
  innerRadius?: number;
  outerRadius?: number;
  angle?: number; // In radians
  clockwise?: boolean;
}

export class Arc extends Node {
  declare props: ArcProps;

  draw(ctx: CanvasRenderingContext2D) {
    const { innerRadius = 0, outerRadius = 50, angle = Math.PI, clockwise = false, stroke, lineWidth, lineDash, lineDashOffset, lineCap, lineJoin } = this.props;

    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, angle, !clockwise);
    ctx.arc(0, 0, innerRadius, angle, 0, clockwise);
    ctx.closePath();
    
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
  }

  getSelfBounds() {
    const { outerRadius = 50 } = this.props;
    // Rough bounding box
    return { 
        x: -outerRadius, 
        y: -outerRadius, 
        width: outerRadius * 2, 
        height: outerRadius * 2 
    };
  }
}
