import { Node, NodeProps } from '../core/Node';

/**
 * Properties for a Path node.
 */
export interface PathProps extends NodeProps {
  data: string; // SVG path data, e.g., "M10 10 H 90 V 90 H 10 L 10 10"
}

/**
 * A node that renders SVG path data.
 */
export class Path extends Node {
  declare props: PathProps;
  
  private _path2D: Path2D | null = null;
  private _lastData: string | null = null;

  private getPath2D(): Path2D {
    if (this.props.data !== this._lastData || !this._path2D) {
      this._path2D = new Path2D(this.props.data);
      this._lastData = this.props.data;
    }
    return this._path2D;
  }

  getSelfBounds() {
    // A simplified bounding box calculation for paths.
    // For a robust implementation, you need a full SVG path parser to compute exact bounds.
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    if (this.props.data) {
        const commands = this.props.data.match(/[a-zA-Z][^a-zA-Z]*/g);
        if (commands) {
            for (const cmd of commands) {
                const yMatch = cmd.match(/[\d.-]+/g);
                if (yMatch) {
                    for (let i = 0; i < yMatch.length; i += 2) {
                        const x = parseFloat(yMatch[i]);
                        const y = parseFloat(yMatch[i+1]);
                        if (!isNaN(x) && !isNaN(y)) {
                            minX = Math.min(minX, x);
                            minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x);
                            maxY = Math.max(maxY, y);
                        }
                    }
                }
            }
        }
    }

    if (minX !== Infinity) {
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    return { x: -10000, y: -10000, width: 20000, height: 20000 };
  }

  /**
   * Draws the SVG path.
   */
  draw(ctx: CanvasRenderingContext2D) {
     
    const { fill, stroke, lineWidth, lineDash, lineDashOffset, lineCap, lineJoin } = this.props;
    
    const path = this.getPath2D();
    
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill(path);
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
      ctx.stroke(path);
    }
  }

  /**
   * Checks if a point is inside the path.
   * Uses an offscreen context to leverage the native isPointInPath method.
   */
  isPointInShape(x: number, y: number): boolean {
    const path = this.getPath2D();
    
    if (!Path.hitTestContext) {
        const canvas = document.createElement('canvas');
        Path.hitTestContext = canvas.getContext('2d');
    }
    
    if (Path.hitTestContext) {
        return Path.hitTestContext.isPointInPath(path, x, y);
    }
    
    return false;
  }

  private static hitTestContext: CanvasRenderingContext2D | null = null;
}
