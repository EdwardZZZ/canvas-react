import React, { useRef, useEffect, useState, HTMLAttributes, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, useImperativeHandle } from 'react';
import { Container } from '../core/Container';
import { SceneContext, RenderContext, RenderLoop } from './CanvasContext';
import { InteractionEvent, Node, CanvasEvents } from '../core/Node';
import { DevTools } from './DevTools';

/**
 * Default implementation of the render loop.
 * Manages a set of callbacks to be executed on every frame.
 */
class DefaultRenderLoop implements RenderLoop {
  private callbacks: Set<(time: number, dt: number) => void>;
  private lastTime: number = 0;

  constructor() {
    this.callbacks = new Set();
  }

  add(callback: (time: number, dt: number) => void) {
    this.callbacks.add(callback);
  }

  remove(callback: (time: number, dt: number) => void) {
    this.callbacks.delete(callback);
  }

  run(time: number) {
    const dt = this.lastTime === 0 ? 0 : time - this.lastTime;
    this.lastTime = time;
    this.callbacks.forEach(cb => cb(time, dt));
  }
}

export interface CanvasProps extends HTMLAttributes<HTMLCanvasElement> {
  width?: number;
  height?: number;
  debug?: boolean; // Enable DevTools
  interactive?: boolean; // Enable pan & zoom interactions on the canvas
}

export interface CanvasRef {
  stage: Container;
  canvas: HTMLCanvasElement | null;
  toDataURL: (options?: any) => string;
}

/**
 * The root component of the React Canvas Engine.
 * Sets up the rendering context, scene graph root, and event listeners.
 */
const Canvas = React.forwardRef<CanvasRef, CanvasProps>(({ width = 500, height = 500, debug = false, interactive = false, children, ...rest }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Persistent stage instance across re-renders
  const [stage] = useState(() => new Container());
  const [renderLoop] = useState(() => new DefaultRenderLoop());
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<Node | null>(null);
  const lastHitNodeRef = useRef<Node | null>(null);

  // Interaction Manager state
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPosRef = useRef({ x: 0, y: 0 });
  
  // Track if a redraw is needed
  const isDirtyRef = useRef(true);

  useImperativeHandle(ref, () => ({
    stage,
    canvas: canvasRef.current,
    toDataURL: (options) => {
        if (canvasRef.current) {
            return canvasRef.current.toDataURL(options?.mimeType, options?.quality);
        }
        return '';
    }
  }), [stage]);

  useEffect(() => {
    // Override requestRedraw on stage to trigger our dirty flag
    stage.requestRedraw = () => {
        isDirtyRef.current = true;
    };
    // Initial draw
    isDirtyRef.current = true;
  }, [stage]);

  useEffect(() => {
    if (debug) {
      (window as any).__CANVAS_STAGE__ = stage;
      console.log('Canvas Stage exposed to window.__CANVAS_STAGE__');
    } else {
      delete (window as any).__CANVAS_STAGE__;
    }
    return () => {
      delete (window as any).__CANVAS_STAGE__;
    };
  }, [stage, debug]);

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

  /**
   * Dispatches an event starting from the target node and bubbling up.
   */
  const dispatchEvent = (
      node: Node, 
      originalEvent: ReactMouseEvent | ReactTouchEvent | React.WheelEvent | MouseEvent | TouchEvent | WheelEvent,
      eventName: keyof CanvasEvents,
      type: string,
      globalX: number,
      globalY: number
  ) => {
      let current: Node | null = node;
      let event: InteractionEvent | null = null;

      while (current) {
          if (!event) {
             event = createEvent(node, originalEvent, type, globalX, globalY);
          }
          event.currentTarget = current;

          const handler = current.events[eventName] as ((e: InteractionEvent) => void) | undefined;
          if (handler) {
              handler(event);
          }

          if (event.cancelBubble) {
              break;
          }
          current = current.parent;
      }
  }

  const getEventCoordinates = (e: ReactMouseEvent | ReactTouchEvent | React.WheelEvent) => {
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

    if (hitNode) {
       dispatchEvent(hitNode, e, 'onMouseDown', 'mousedown', coords.x, coords.y);
       
       if (hitNode.draggable) {
           setIsDragging(true);
           setDragNode(hitNode);
           
           if (hitNode.events.onDragStart) {
               const event = createEvent(hitNode, e, 'dragstart', coords.x, coords.y);
               hitNode.events.onDragStart(event);
           }
       }
    } else if (interactive) {
       // Start panning if no node is hit and interactive mode is enabled
       setIsPanning(true);
       lastPanPosRef.current = { x: coords.x, y: coords.y };
    }
    
    // Map touchstart to mousedown for compatibility
    if ('touches' in e) {
        if (rest.onTouchStart) rest.onTouchStart(e as ReactTouchEvent<HTMLCanvasElement>);
    } else {
        if (rest.onMouseDown) rest.onMouseDown(e as ReactMouseEvent<HTMLCanvasElement>);
    }
  };

  const handlePointerUp = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    if (isPanning) {
        setIsPanning(false);
    }
    const coords = getEventCoordinates(e);
    if (coords) {
       const hitNode = stage.hitTest(coords);
       if (hitNode) {
           dispatchEvent(hitNode, e, 'onMouseUp', 'mouseup', coords.x, coords.y);
       }
    }

    if (isDragging && dragNode) {
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

    if (hitNode) {
       dispatchEvent(hitNode, e, 'onClick', 'click', coords.x, coords.y);
    }
    
    if (rest.onClick) {
        rest.onClick(e);
    }
  };

  const handleDoubleClick = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const coords = getEventCoordinates(e);
    if (!coords) return;

    const hitNode = stage.hitTest(coords);

    if (hitNode) {
       dispatchEvent(hitNode, e, 'onDoubleClick', 'dblclick', coords.x, coords.y);
    }
    
    if (rest.onDoubleClick) {
        rest.onDoubleClick(e);
    }
  };

  const handlePointerMove = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    const coords = getEventCoordinates(e);
    if (!coords) return;

    const hitNode = stage.hitTest(coords);

    if (hitNode) {
        dispatchEvent(hitNode, e, 'onMouseMove', 'mousemove', coords.x, coords.y);
    }
    
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
    } else if (isPanning && interactive) {
        // Handle Panning
        const dx = coords.x - lastPanPosRef.current.x;
        const dy = coords.y - lastPanPosRef.current.y;
        
        stage.x += dx;
        stage.y += dy;
        
        lastPanPosRef.current = { x: coords.x, y: coords.y };
    }

    const lastHitNode = lastHitNodeRef.current;

    if (lastHitNode !== hitNode) {
        // Leave previous
        if (lastHitNode) {
             dispatchEvent(lastHitNode, e, 'onMouseLeave', 'mouseleave', coords.x, coords.y);
        }
        
        // Enter new
        if (hitNode) {
             dispatchEvent(hitNode, e, 'onMouseEnter', 'mouseenter', coords.x, coords.y);
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
      if (lastHitNode) {
          const coords = getEventCoordinates(e) || { x: 0, y: 0 }; // Coordinates might be outside
          dispatchEvent(lastHitNode, e, 'onMouseLeave', 'mouseleave', coords.x, coords.y);
      }
      lastHitNodeRef.current = null;

      if (rest.onMouseLeave) {
          rest.onMouseLeave(e);
      }
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
      const coords = getEventCoordinates(e);
      if (!coords) return;

      const hitNode = stage.hitTest(coords);

      if (hitNode) {
          dispatchEvent(hitNode, e, 'onWheel', 'wheel', coords.x, coords.y);
      } else if (interactive) {
          // Handle Zooming
          e.preventDefault(); // Prevent default scrolling
          const scaleBy = 1.05;
          const oldScale = stage.scaleX; // Assuming uniform scaling

          const pointerX = coords.x;
          const pointerY = coords.y;

          // Calculate mouse position relative to stage
          const mousePointTo = {
              x: (pointerX - stage.x) / oldScale,
              y: (pointerY - stage.y) / oldScale,
          };

          const newScale = e.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
          
          // Clamp scale to prevent zooming too far out or in
          const clampedScale = Math.max(0.1, Math.min(newScale, 10));

          stage.scaleX = clampedScale;
          stage.scaleY = clampedScale;

          // Adjust stage position to zoom towards pointer
          const newPos = {
              x: pointerX - mousePointTo.x * clampedScale,
              y: pointerY - mousePointTo.y * clampedScale,
          };

          stage.x = newPos.x;
          stage.y = newPos.y;
      }
      
      if (rest.onWheel) {
          rest.onWheel(e);
      }
  };

  return (
    <RenderContext.Provider value={renderLoop}>
      <SceneContext.Provider value={stage}>
        <div style={{ position: 'relative', width, height }}>
            <canvas 
              ref={canvasRef} 
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              onMouseDown={handlePointerDown}
              onMouseUp={handlePointerUp}
              onMouseMove={handlePointerMove}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
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
});

export default Canvas;
