import { Node, NodeProps } from '../core/Node';

export interface StarProps extends NodeProps {
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export class Star extends Node {
  declare props: StarProps;

  draw(ctx: CanvasRenderingContext2D) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { numPoints = 5, innerRadius = 20, outerRadius = 50, stroke, lineWidth, lineDash, lineDashOffset, lineCap, lineJoin } = this.props;
    if (numPoints < 3) return;

    ctx.beginPath();
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / numPoints - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
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
    return { 
        x: -outerRadius, 
        y: -outerRadius, 
        width: outerRadius * 2, 
        height: outerRadius * 2 
    };
  }
}
