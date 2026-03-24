import { Node, NodeProps } from '../core/Node';

export interface RegularPolygonProps extends NodeProps {
  sides?: number;
  radius?: number;
}

export class RegularPolygon extends Node {
  declare props: RegularPolygonProps;

  draw(ctx: CanvasRenderingContext2D) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sides = 5, radius = 50, fill, stroke, lineWidth, lineDash, lineDashOffset, lineCap, lineJoin } = this.props;
    if (sides < 3) return;

    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      // Starting from top center
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
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
    const { radius = 50 } = this.props;
    return { 
        x: -radius, 
        y: -radius, 
        width: radius * 2, 
        height: radius * 2 
    };
  }
}
