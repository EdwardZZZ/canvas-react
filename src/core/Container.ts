import { Node, NodeProps, Rect } from './Node';
import { Point } from './Matrix';

/**
 * Properties for a Container (Group) node.
 * Includes clipping capabilities.
 */
export interface ContainerProps extends NodeProps {
  clip?: boolean;
  clipX?: number;
  clipY?: number;
  clipWidth?: number;
  clipHeight?: number;
}

/**
 * A node that can contain other nodes.
 * Used for grouping and hierarchical transformations.
 */
export class Container extends Node {
  children: Node[];
  declare props: ContainerProps;

  constructor(props?: ContainerProps) {
    super(props);
    this.children = [];
  }

  /**
   * Adds a child node to the container.
   * Automatically sorts children by z-index.
   */
  add(node: Node) {
    node.parent = this;
    this.children.push(node);
    this.sortChildren();
    this.requestRedraw();
  }

  /**
   * Removes a child node from the container.
   */
  remove(node: Node) {
    const index = this.children.indexOf(node);
    if (index !== -1) {
      this.children.splice(index, 1);
      node.parent = null;
      this.requestRedraw();
    }
  }

  getSelfBounds(): Rect {
    // Union of all children global bounds, transformed back to local space?
    // Actually getSelfBounds implies bounds in *local* space (before this node's transform).
    // So we need to take children's bounds (which are in *this* node's coordinate system if we consider child.x/y)
    // Child.getBounds() would be in child's parent space (this node space) IF we implemented it that way.
    // But currently Node.getGlobalBounds returns global AABB.
    
    // Let's implement a helper: getBoundsInParent().
    // For now, let's just aggregate children AABBs relative to this container.
    
    if (this.children.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    this.children.forEach(child => {
        // Child bounds in local space (before child transform)
        const childBounds = child.getSelfBounds();
        
        // Transform to parent (this container) space
        const matrix = child.getTransform();
        
        const p1 = matrix.transformPoint({ x: childBounds.x, y: childBounds.y });
        const p2 = matrix.transformPoint({ x: childBounds.x + childBounds.width, y: childBounds.y });
        const p3 = matrix.transformPoint({ x: childBounds.x, y: childBounds.y + childBounds.height });
        const p4 = matrix.transformPoint({ x: childBounds.x + childBounds.width, y: childBounds.y + childBounds.height });
        
        const xs = [p1.x, p2.x, p3.x, p4.x];
        const ys = [p1.y, p2.y, p3.y, p4.y];
        
        minX = Math.min(minX, ...xs);
        maxX = Math.max(maxX, ...xs);
        minY = Math.min(minY, ...ys);
        maxY = Math.max(maxY, ...ys);
    });

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
  }

  /**
   * Sorts children based on their zIndex property.
   * Lower zIndex is rendered first (background).
   */
  sortChildren() {
    this.children.sort((a, b) => a.zIndex - b.zIndex);
  }

  setProps(newProps: Partial<ContainerProps>) {
    super.setProps(newProps);
  }

  /**
   * Renders all children.
   * Handles clipping if enabled in props.
   */
  draw(ctx: CanvasRenderingContext2D, viewport?: Rect) {
    if (this.props.clip) {
        ctx.beginPath();
        const { clipX = 0, clipY = 0, clipWidth = 100, clipHeight = 100 } = this.props;
        ctx.rect(clipX, clipY, clipWidth, clipHeight);
        ctx.clip();
    }
    this.children.forEach(child => child.render(ctx, viewport));
  }

  update(deltaTime: number) {
    this.children.forEach(child => child.update(deltaTime));
  }

  /**
   * Performs hit testing on children.
   * Checks children in reverse render order (top-most first).
   * Respects clipping boundaries.
   */
  hitTest(globalPoint: Point): Node | null {
    if (this.props.clip) {
        // If clipping is enabled, we first check if the point is within the clipping rect
        // The clipping rect is defined in local coordinates.
        // So we need to convert global point to local point for this container.
        
        const globalTransform = this.getGlobalTransform();
        const inverseMatrix = globalTransform.invert();
        const localPoint = inverseMatrix.transformPoint(globalPoint);
        
        const { clipX = 0, clipY = 0, clipWidth = 100, clipHeight = 100 } = this.props;
        
        if (
            localPoint.x < clipX || 
            localPoint.x > clipX + clipWidth || 
            localPoint.y < clipY || 
            localPoint.y > clipY + clipHeight
        ) {
            return null; // Point is outside the clipping area
        }
    }

    // Iterate in reverse order (top to bottom)
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i];
      const hitNode = child.hitTest(globalPoint);
      if (hitNode) {
        return hitNode;
      }
    }
    return null;
  }
}
