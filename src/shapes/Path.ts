import { Node, NodeProps } from '../core/Node';

/**
 * Properties for a Path node.
 */
export interface PathProps extends NodeProps {
  data: string; // SVG path data, e.g., "M10 10 H 90 V 90 H 10 L 10 10"
  fill?: string;
  stroke?: string;
  lineWidth?: number;
}

/**
 * A node that renders SVG path data.
 */
export class Path extends Node {
  declare props: PathProps;

  getSelfBounds() {
    // Calculating exact bounds for arbitrary SVG path is hard without browser API.
    // However, since we use Path2D, we don't have easy access to bounds.
    // A robust engine would parse the SVG path data manually to compute bounds.
    // For this lightweight engine, we might skip AABB check for Paths, or return a large box?
    // Or we rely on user providing width/height?
    
    // Better approach: Parse "M x y" etc commands minimally to get rough bounds.
    // This is complex. Let's return a "Infinite" or skip bounds check by returning null?
    // Node.getSelfBounds returns 0,0,0,0 by default which effectively makes hitTest fail 
    // if we strictly check AABB (and AABB size > 0).
    
    // Let's implement a very simple parser for M/L/H/V commands to guess bounds.
    // Or just return a "safe" box if user provides width/height props (even if not used for drawing).
    
    // Fallback: If we can't compute, we should return a box that covers everything or disable AABB check for this node.
    // To disable AABB check, we can make getGlobalBounds return a special value or just handle it in hitTest.
    
    // Hack for now: Return a huge box so AABB check passes, relying on isPointInPath.
    // This degrades performance to previous level for Paths, but keeps correctness.
    
    return { x: -10000, y: -10000, width: 20000, height: 20000 };
  }

  /**
   * Draws the SVG path.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const { data, fill, stroke, lineWidth = 1 } = this.props;
    
    const path = new Path2D(data);
    
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill(path);
    }
    
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke(path);
    }
  }

  /**
   * Checks if a point is inside the path.
   * Uses an offscreen context to leverage the native isPointInPath method.
   */
  isPointInShape(x: number, y: number): boolean {
    // This is tricky because we need a context to check if point is in path
    // We can use an offscreen canvas or reuse the path object if cached.
    // For now, we'll create a temporary canvas context to check.
    // Optimization: Cache Path2D object
    
    const { data } = this.props;
    const path = new Path2D(data);
    
    // We need a context to call isPointInPath
    // Since we are in Node class, we don't have direct access to a global context easily 
    // without passing it down or creating a temp one.
    // Creating a temp canvas for every hit test is expensive.
    // A better approach in a real engine is to cache a single shared hit-test canvas.
    
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
