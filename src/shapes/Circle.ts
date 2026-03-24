import { Node, NodeProps } from '../core/Node';

/**
 * Properties for a Circle node.
 */
export interface CircleProps extends NodeProps {
  radius?: number;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { radius = 50, fill, stroke, lineWidth, lineDash, lineDashOffset, lineCap, lineJoin } = this.props;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    
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

  protected _generateSVGTags(): string {
     
    const { radius = 50, fill, stroke, lineWidth } = this.props;
    let attrs = `cx="0" cy="0" r="${radius}" `;
    if (fill) attrs += `fill="${fill}" `;
    if (stroke) attrs += `stroke="${stroke}" `;
    if (lineWidth) attrs += `stroke-width="${lineWidth}" `;
    
    return `<circle ${attrs} transform="${this._getSVGTransform()}" ${this._getSVGStyle()} />`;
  }
}
