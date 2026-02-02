import { useRef, useEffect, useState, HTMLAttributes, FC, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { Container } from '../core/Container';
import { SceneContext, RenderContext, RenderLoop } from './CanvasContext';
import { InteractionEvent, Node } from '../core/Node';
import { DevTools } from './DevTools';

/**
 * Default implementation of the render loop.
 * Manages a set of callbacks to be executed on every frame.
 */
class DefaultRenderLoop implements RenderLoop {
  private callbacks: Set<(time: number) => void>;

  constructor() {
    this.callbacks = new Set();
  }

  add(callback: (time: number) => void) {
    this.callbacks.add(callback);
  }

  remove(callback: (time: number) => void) {
    this.callbacks.delete(callback);
  }

  run(time: number) {
    this.callbacks.forEach(cb => cb(time));
  }
}

export interface CanvasProps extends HTMLAttributes<HTMLCanvasElement> {
  width?: number;
  height?: number;
  debug?: boolean; // Enable DevTools
}

/**
 * The root component of the React Canvas Engine.
 * Sets up the rendering context, scene graph root, and event listeners.
 */
const Canvas: FC<CanvasProps> = ({ width = 500, height = 500, debug = false, children, ...rest }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Persistent stage instance across re-renders
  const [stage] = useState(() => new Container());
  const [renderLoop] = useState(() => new DefaultRenderLoop());
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<Node | null>(null);
  const lastHitNodeRef = useRef<Node | null>(null);
  
  // Track if a redraw is needed
  const isDirtyRef = useRef(true);

  useEffect(() => {
    // Override requestRedraw on stage to trigger our dirty flag
    stage.requestRedraw = () => {
        isDirtyRef.current = true;
    };
    // Initial draw
    isDirtyRef.current = true;
  }, [stage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrameId: number;

    // Handle High DPI displays
    const ratio = window.devicePixelRatio || 1;
    
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    context.scale(ratio, ratio);
    
    // Force redraw on resize
    isDirtyRef.current = true;

    const render = (time: number) => {
      // Run user callbacks (animations)
      // Animations will likely update node props, which triggers requestRedraw(), setting isDirtyRef to true
      renderLoop.run(time);

      if (isDirtyRef.current) {
          context.clearRect(0, 0, width, height);
          
          // Update animations (if we add time-based updates to nodes)
          stage.update(time);
          
          // Render the scene graph
          // We define a viewport based on canvas size for culling
          const viewport = { x: 0, y: 0, width, height };
          stage.render(context, viewport);
          
          isDirtyRef.current = false;
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    render(0);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, stage, renderLoop]);

  /**
   * Helper to create a normalized interaction event.
   */
  const createEvent = (
    node: Node, 
    originalEvent: ReactMouseEvent | ReactTouchEvent | MouseEvent | TouchEvent,
    type: string,
    globalX: number,
    globalY: number
  ): InteractionEvent => {
     const globalTransform = node.getGlobalTransform();
     const inverseMatrix = globalTransform.invert();
     const localPoint = inverseMatrix.transformPoint({ x: globalX, y: globalY });
  
     const event: InteractionEvent = {
       target: node,
       currentTarget: node,
       type,
       globalX,
       globalY,
       localX: localPoint.x,
       localY: localPoint.y,
       originalEvent: originalEvent as any,
       cancelBubble: false,
       stopPropagation: () => { event.cancelBubble = true; }
     };
     return event;
  }

  const getEventCoordinates = (e: ReactMouseEvent | ReactTouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    let clientX, clientY;


    if ('touches' in e) {
        // Touch Event
        if (e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            return null;
        }
    } else {
        // Mouse Event
        clientX = e.clientX;
        clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  const handlePointerDown = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    // e.preventDefault(); // Prevents scrolling on touch
    
    const coords = getEventCoordinates(e);
    if (!coords) return;

    const hitNode = stage.hitTest(coords);

    if (hitNode && hitNode.draggable) {
       setIsDragging(true);
       setDragNode(hitNode);
       
       if (hitNode.events.onDragStart) {
           const event = createEvent(hitNode, e, 'dragstart', coords.x, coords.y);
           hitNode.events.onDragStart(event);
       }
    }
    
    // Map touchstart to mousedown for compatibility
    if ('touches' in e) {
        if (rest.onTouchStart) rest.onTouchStart(e as ReactTouchEvent<HTMLCanvasElement>);
    } else {
        if (rest.onMouseDown) rest.onMouseDown(e as ReactMouseEvent<HTMLCanvasElement>);
    }
  };

  const handlePointerUp = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    if (isDragging && dragNode) {
       const coords = getEventCoordinates(e);
       // Note: touchend has no touches, only changedTouches. getEventCoordinates handles this.
       
       if (coords && dragNode.events.onDragEnd) {
           const event = createEvent(dragNode, e, 'dragend', coords.x, coords.y);
           dragNode.events.onDragEnd(event);
       }
       setIsDragging(false);
       setDragNode(null);
    }

    if ('touches' in e) {
        if (rest.onTouchEnd) rest.onTouchEnd(e as ReactTouchEvent<HTMLCanvasElement>);
    } else {
        if (rest.onMouseUp) rest.onMouseUp(e as ReactMouseEvent<HTMLCanvasElement>);
    }
  };

  const handleClick = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const coords = getEventCoordinates(e);
    if (!coords) return;

    const hitNode = stage.hitTest(coords);

    if (hitNode && hitNode.events.onClick) {
       const event = createEvent(hitNode, e, 'click', coords.x, coords.y);
       hitNode.events.onClick(event);
    }
    
    if (rest.onClick) {
        rest.onClick(e);
    }
  };

  const handlePointerMove = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    const coords = getEventCoordinates(e);
    if (!coords) return;

    // Handle Dragging
    if (isDragging && dragNode) {
        // Prevent scrolling when dragging
        if ('touches' in e && e.cancelable) {
            e.preventDefault(); 
        }

        if (dragNode.events.onDragMove) {
            const event = createEvent(dragNode, e, 'dragmove', coords.x, coords.y);
            dragNode.events.onDragMove(event);
        }
    }

    // Hover logic (Mouse only usually, but some stylus behave like mouse)
    // For touch, we don't usually have "hover", but we might want to track enter/leave if dragging?
    // Current hover logic is fine for mouse. For touch, move is usually drag.
    
    const hitNode = stage.hitTest(coords);
    const lastHitNode = lastHitNodeRef.current;

    if (lastHitNode !== hitNode) {
        // Leave previous
        if (lastHitNode && lastHitNode.events.onMouseLeave) {
             const event = createEvent(lastHitNode, e, 'mouseleave', coords.x, coords.y);
             lastHitNode.events.onMouseLeave(event);
        }
        
        // Enter new
        if (hitNode && hitNode.events.onMouseEnter) {
             const event = createEvent(hitNode, e, 'mouseenter', coords.x, coords.y);
             hitNode.events.onMouseEnter(event);
        }
        
        lastHitNodeRef.current = hitNode;
    }

    if ('touches' in e) {
        if (rest.onTouchMove) rest.onTouchMove(e as ReactTouchEvent<HTMLCanvasElement>);
    } else {
        if (rest.onMouseMove) rest.onMouseMove(e as ReactMouseEvent<HTMLCanvasElement>);
    }

    // Cursor Management
    if (canvasRef.current) {
        if (isDragging) {
            // Keep cursor grabbing during drag
            canvasRef.current.style.cursor = 'grabbing';
        } else {
            // Check hit node cursor
            if (hitNode && hitNode.cursor && hitNode.cursor !== 'default') {
                canvasRef.current.style.cursor = hitNode.cursor;
            } else if (hitNode && hitNode.draggable) {
                // Default draggable cursor
                canvasRef.current.style.cursor = 'grab';
            } else {
                canvasRef.current.style.cursor = 'default';
            }
        }
    }
  };

  const handleMouseLeave = (e: ReactMouseEvent<HTMLCanvasElement>) => {
      // If mouse leaves the canvas, we should also trigger mouseleave on the currently hovered node
      const lastHitNode = lastHitNodeRef.current;
      if (lastHitNode && lastHitNode.events.onMouseLeave) {
          const coords = getEventCoordinates(e) || { x: 0, y: 0 }; // Coordinates might be outside
          const event = createEvent(lastHitNode, e, 'mouseleave', coords.x, coords.y);
          lastHitNode.events.onMouseLeave(event);
      }
      lastHitNodeRef.current = null;

      if (rest.onMouseLeave) {
          rest.onMouseLeave(e);
      }
  }

  return (
    <RenderContext.Provider value={renderLoop}>
      <SceneContext.Provider value={stage}>
        <div style={{ position: 'relative', width, height }}>
            <canvas 
              ref={canvasRef} 
              onClick={handleClick}
              onMouseDown={handlePointerDown}
              onMouseUp={handlePointerUp}
              onMouseMove={handlePointerMove}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              onTouchCancel={handlePointerUp}
              {...rest} 
            />
            {debug && <DevTools />}
        </div>
        {children}
      </SceneContext.Provider>
    </RenderContext.Provider>
  );
};

export default Canvas;
