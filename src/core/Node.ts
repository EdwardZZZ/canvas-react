import { Matrix2D, Point } from './Matrix';

/**
 * Represents an interaction event (click, mouseover, etc.).
 */
export interface InteractionEvent {
  target: Node;
  currentTarget: Node;
  type: string;
  globalX: number;
  globalY: number;
  localX: number;
  localY: number;
  originalEvent: MouseEvent | TouchEvent;
  cancelBubble: boolean;
  stopPropagation: () => void;
}

/**
 * Event handlers supported by nodes.
 */
export interface CanvasEvents {
  onClick?: (e: InteractionEvent) => void;
  onMouseEnter?: (e: InteractionEvent) => void;
  onMouseLeave?: (e: InteractionEvent) => void;
  onDragStart?: (e: InteractionEvent) => void;
  onDragMove?: (e: InteractionEvent) => void;
  onDragEnd?: (e: InteractionEvent) => void;
}

/**
 * Base properties for all nodes.
 */
export interface NodeProps extends CanvasEvents {
  x?: number;
  y?: number;
  rotation?: number; // In radians
  scaleX?: number;
  scaleY?: number;
  zIndex?: number; // Rendering order
  draggable?: boolean;
  cursor?: string; // CSS cursor style (e.g. 'pointer', 'grab')
  
  // Filters and Effects
  filter?: string; // CSS filter string (e.g. 'blur(5px)')
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  [key: string]: any;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Base class for all scene graph nodes.
 * Handles transformation, event dispatching, and rendering lifecycle.
 */
export class Node {
  private _x: number;
  private _y: number;
  private _rotation: number;
  private _scaleX: number;
  private _scaleY: number;
  private _zIndex: number;
  private _cursor: string;
  
  draggable: boolean;
  parent: Node | null;
  props: NodeProps;
  events: CanvasEvents = {};

  constructor(props: NodeProps = {}) {
    this._x = props.x || 0;
    this._y = props.y || 0;
    this._rotation = props.rotation || 0;
    this._scaleX = props.scaleX !== undefined ? props.scaleX : 1;
    this._scaleY = props.scaleY !== undefined ? props.scaleY : 1;
    this._zIndex = props.zIndex || 0;
    this._cursor = props.cursor || 'default';
    
    this.draggable = props.draggable || false;
    this.parent = null;
    this.props = props;
    this.updateEvents(props);
  }

  // Getters and Setters with dirty checking
  
  get x() { return this._x; }
  set x(val: number) {
      if (this._x !== val) {
          this._x = val;
          this.requestRedraw();
      }
  }

  get y() { return this._y; }
  set y(val: number) {
      if (this._y !== val) {
          this._y = val;
          this.requestRedraw();
      }
  }

  get rotation() { return this._rotation; }
  set rotation(val: number) {
      if (this._rotation !== val) {
          this._rotation = val;
          this.requestRedraw();
      }
  }

  get scaleX() { return this._scaleX; }
  set scaleX(val: number) {
      if (this._scaleX !== val) {
          this._scaleX = val;
          this.requestRedraw();
      }
  }

  get scaleY() { return this._scaleY; }
  set scaleY(val: number) {
      if (this._scaleY !== val) {
          this._scaleY = val;
          this.requestRedraw();
      }
  }

  get zIndex() { return this._zIndex; }
  set zIndex(val: number) {
      if (this._zIndex !== val) {
          this._zIndex = val;
          this.requestRedraw();
          // Trigger parent sort
          if (this.parent && (this.parent as any).sortChildren) {
             (this.parent as any).sortChildren();
          }
      }
  }

  get cursor() { return this._cursor; }
  set cursor(val: string) {
      this._cursor = val;
      // No redraw needed for cursor change usually, as it's handled by canvas mouse move
  }

  /**
   * Requests a redraw of the scene.
   * Bubbles up to the root container.
   */
  requestRedraw() {
      if (this.parent) {
          this.parent.requestRedraw();
      }
  }

  /**
   * Updates the node's properties.
   * Triggers re-sorting of parent if zIndex changes.
   */
  setProps(newProps: Partial<NodeProps>) {
    Object.assign(this, newProps);
    this.props = { ...this.props, ...newProps };
    
    // Explicitly handle zIndex sort if it changed via setProps
    // (Although the setter above handles it, Object.assign might bypass setter if targeting fields directly, 
    // but here 'this' refers to the instance, so setters ARE called if defined on prototype)
    
    // Note: Object.assign(this, newProps) invokes setters!
    // So requestRedraw is called automatically.
    
    this.updateEvents(this.props);
    this.requestRedraw(); // Ensure redraw even for non-transform props (fill, etc.)
  }

  private updateEvents(props: NodeProps) {
    this.events.onClick = props.onClick;
    this.events.onMouseEnter = props.onMouseEnter;
    this.events.onMouseLeave = props.onMouseLeave;
    this.events.onDragStart = props.onDragStart;
    this.events.onDragMove = props.onDragMove;
    this.events.onDragEnd = props.onDragEnd;
  }

  /**
   * Called every frame to update animation state.
   * @param _deltaTime Time elapsed since last frame.
   */
  update(_deltaTime: number) {
    // Hook for animation updates
  }

  /**
   * Renders the node and applies transformations.
   * @param ctx Canvas 2D context.
   * @param viewport Optional viewport rect for frustum culling.
   */
  render(ctx: CanvasRenderingContext2D, viewport?: Rect) {
    // Frustum Culling
    if (viewport) {
        const bounds = this.getGlobalBounds();
        // If node has size (not invisible) and is outside viewport, skip
        if (bounds.width > 0 && bounds.height > 0) {
            const isOutside = 
                bounds.x > viewport.x + viewport.width ||
                bounds.x + bounds.width < viewport.x ||
                bounds.y > viewport.y + viewport.height ||
                bounds.y + bounds.height < viewport.y;
            
            if (isOutside) {
                return;
            }
        }
    }

    ctx.save();
    
    // Apply filters and shadows before transform? 
    // Usually shadow is applied to the shape drawn.
    // filter is context-wide for subsequent drawing.
    
    if (this.props.filter) {
        ctx.filter = this.props.filter;
    }
    
    if (this.props.shadowColor) {
        ctx.shadowColor = this.props.shadowColor;
        ctx.shadowBlur = this.props.shadowBlur || 0;
        ctx.shadowOffsetX = this.props.shadowOffsetX || 0;
        ctx.shadowOffsetY = this.props.shadowOffsetY || 0;
    }

    const matrix = this.getTransform();
    // Use matrix for transformation
    ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    
    this.draw(ctx, viewport);
    
    ctx.restore();
  }

  /**
   * Abstract method to draw the specific shape.
   * Must be implemented by subclasses.
   */
  draw(_ctx: CanvasRenderingContext2D, _viewport?: Rect) {
    // To be implemented by subclasses
  }

  /**
   * Returns the local transformation matrix.
   */
  getTransform(): Matrix2D {
    const matrix = new Matrix2D();
    matrix.translate(this.x, this.y);
    matrix.rotate(this.rotation);
    matrix.scale(this.scaleX, this.scaleY);
    return matrix;
  }

  /**
   * Returns the global transformation matrix (relative to the canvas root).
   */
  getGlobalTransform(): Matrix2D {
    let matrix = this.getTransform();
    let parent = this.parent;
    while (parent) {
      const parentMatrix = parent.getTransform();
      matrix = parentMatrix.multiply(matrix);
      parent = parent.parent;
    }
    return matrix;
  }

  /**
   * Returns the bounding box of the node in its own local coordinate system.
   * Must be implemented by subclasses.
   */
  getSelfBounds(): Rect {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  /**
   * Returns the bounding box of the node in the global coordinate system.
   * This is an Axis-Aligned Bounding Box (AABB).
   */
  getGlobalBounds(): Rect {
    const selfBounds = this.getSelfBounds();
    const globalTransform = this.getGlobalTransform();
    
    // Transform all 4 corners
    const p1 = globalTransform.transformPoint({ x: selfBounds.x, y: selfBounds.y });
    const p2 = globalTransform.transformPoint({ x: selfBounds.x + selfBounds.width, y: selfBounds.y });
    const p3 = globalTransform.transformPoint({ x: selfBounds.x, y: selfBounds.y + selfBounds.height });
    const p4 = globalTransform.transformPoint({ x: selfBounds.x + selfBounds.width, y: selfBounds.y + selfBounds.height });
    
    const xs = [p1.x, p2.x, p3.x, p4.x];
    const ys = [p1.y, p2.y, p3.y, p4.y];
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Checks if the global point intersects with this node.
   * @param globalPoint Point in global coordinates.
   * @returns The hit node or null.
   */
  hitTest(globalPoint: Point): Node | null {
    // 0. Quick AABB check
    // If the node has zero size, we might skip this check (e.g. containers often return 0 bounds if we don't aggregate children)
    // But implemented correctly, Container should return union of children bounds.
    // For now, let's just use it for leaf nodes or nodes that implement proper bounds.
    
    const globalBounds = this.getGlobalBounds();
    if (globalBounds.width > 0 && globalBounds.height > 0) {
        if (
            globalPoint.x < globalBounds.x || 
            globalPoint.x > globalBounds.x + globalBounds.width || 
            globalPoint.y < globalBounds.y || 
            globalPoint.y > globalBounds.y + globalBounds.height
        ) {
            return null;
        }
    }

    // 1. Convert global point to local coordinate system
    const globalTransform = this.getGlobalTransform();
    const inverseMatrix = globalTransform.invert();
    const localPoint = inverseMatrix.transformPoint(globalPoint);

    // 2. Check if point is inside shape
    if (this.isPointInShape(localPoint.x, localPoint.y)) {
      return this;
    }

    return null;
  }

  /**
   * Checks if a local point is inside the shape.
   * Must be implemented by subclasses for hit testing.
   */
  isPointInShape(_x: number, _y: number): boolean {
    return false; // Default implementation
  }
}
