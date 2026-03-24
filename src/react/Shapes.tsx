import React, { useEffect, useRef, useState, PropsWithChildren } from 'react';
import { useCanvasParent, SceneContext, RenderContext, LayerContext } from './CanvasContext';
import { Container } from '../core/Container';
import { Rect as EngineRect } from '../shapes/Rect';
import { Circle as EngineCircle } from '../shapes/Circle';
import { Ellipse as EngineEllipse } from '../shapes/Ellipse';
import { RegularPolygon as EngineRegularPolygon } from '../shapes/RegularPolygon';
import { Star as EngineStar } from '../shapes/Star';
import { Arc as EngineArc } from '../shapes/Arc';
import { Text as EngineText } from '../shapes/Text';
import { Image as EngineImage } from '../shapes/Image';
import { Line as EngineLine } from '../shapes/Line';
import { Path as EnginePath } from '../shapes/Path';
import { Transformer as EngineTransformer } from '../shapes/Transformer';
import { Node, NodeProps } from '../core/Node';

type Constructor<T> = new (props: any) => T;

/**
 * Higher-order function to create React components for engine shapes.
 * Handles lifecycle management:
 * 1. Creates the engine node instance.
 * 2. Adds it to the parent container on mount.
 * 3. Removes it from the parent container on unmount.
 * 4. Updates properties when props change.
 */
const createShapeComponent = <T extends Node>(EngineClass: Constructor<T>, name: string) => {
  const Component = React.forwardRef<T, any>((props, ref) => {
    const parent = useCanvasParent();
    const nodeRef = useRef<T | null>(null);

    // Initialize node
    if (!nodeRef.current) {
      nodeRef.current = new EngineClass(props);
    }

    // Expose ref to parent
    React.useImperativeHandle(ref, () => nodeRef.current as T);

    // Provide values to React DevTools
    React.useDebugValue(nodeRef.current ? {
        x: nodeRef.current.props.x,
        y: nodeRef.current.props.y,
        className: name,
        ...nodeRef.current.props
    } : 'Initializing...');

    // Handle lifecycle: add/remove from parent
    useEffect(() => {
      const node = nodeRef.current;
      if (!node) return;
      
      parent.add(node);
      
      return () => {
        parent.remove(node);
      };
    }, [parent]);

    // Handle props updates
    useEffect(() => {
      nodeRef.current?.setProps(props);
    }, [props]);

    return null;
  });

  Component.displayName = name;
  return Component;
};

export const Rect = createShapeComponent<EngineRect>(EngineRect, 'Rect');
export const Circle = createShapeComponent<EngineCircle>(EngineCircle, 'Circle');
export const Ellipse = createShapeComponent<EngineEllipse>(EngineEllipse, 'Ellipse');
export const RegularPolygon = createShapeComponent<EngineRegularPolygon>(EngineRegularPolygon, 'RegularPolygon');
export const Star = createShapeComponent<EngineStar>(EngineStar, 'Star');
export const Arc = createShapeComponent<EngineArc>(EngineArc, 'Arc');
export const Text = createShapeComponent<EngineText>(EngineText, 'Text');
export const Image = createShapeComponent<EngineImage>(EngineImage, 'Image');
export const Line = createShapeComponent<EngineLine>(EngineLine, 'Line');
export const Path = createShapeComponent<EnginePath>(EnginePath, 'Path');
export const Transformer = createShapeComponent<EngineTransformer>(EngineTransformer, 'Transformer');

export interface GroupProps extends NodeProps, PropsWithChildren {
  clip?: boolean;
  clipX?: number;
  clipY?: number;
  clipWidth?: number;
  clipHeight?: number;
}

/**
 * Group component.
 * Acts as a container for other shapes.
 * Provides a new SceneContext for its children, making them children of this group in the scene graph.
 */
export const Group = React.forwardRef<Container, GroupProps>(({ children, ...props }, ref) => {
  const parent = useCanvasParent();
  const nodeRef = useRef<Container | null>(null);

  if (!nodeRef.current) {
    nodeRef.current = new Container(props);
  }

  React.useImperativeHandle(ref, () => nodeRef.current as Container);

  React.useDebugValue(nodeRef.current ? {
    x: nodeRef.current.props.x,
    y: nodeRef.current.props.y,
    childrenCount: nodeRef.current.children.length,
    ...nodeRef.current.props
  } : 'Initializing...');

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    parent.add(node);
    return () => {
      parent.remove(node);
    };
  }, [parent]);

  useEffect(() => {
    nodeRef.current?.setProps(props);
  }, [props]);

  return (
    <SceneContext.Provider value={nodeRef.current}>
      {children}
    </SceneContext.Provider>
  );
});

Group.displayName = 'Group';

export interface LayerProps extends NodeProps, PropsWithChildren {
    width?: number;
    height?: number;
}

export const Layer = React.forwardRef<Container, LayerProps>(({ children, width: _width, height: _height, ...props }, ref) => {
    const parent = useCanvasParent();
    const renderLoop = React.useContext(RenderContext);
    const nodeRef = useRef<Container | null>(null);
    const layerIdRef = useRef(`layer_${Math.random().toString(36).substring(2, 9)}`);
    const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
    
    if (!nodeRef.current) {
        nodeRef.current = new Container(props);
    }
    
    React.useImperativeHandle(ref, () => nodeRef.current as Container);
    
    // Manage Canvas Element creation and registration
    useEffect(() => {
        const currentId = layerIdRef.current;
        // We create a canvas element dynamically and append it to the main container
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none'; // Events should be handled by main canvas
        canvas.style.backgroundColor = 'transparent';
        
        // We don't need parent.getStage anymore because LayerPortal handles insertion via LayerContext
        
        setCanvasEl(canvas);
        
        if (renderLoop) {
            renderLoop.registerLayer(currentId, canvas);
        }
        
        return () => {
            if (renderLoop) {
                renderLoop.unregisterLayer(currentId);
            }
        };
    }, [renderLoop]);
    
    // Set layer context
    useEffect(() => {
        if (canvasEl && nodeRef.current) {
            const ctx = canvasEl.getContext('2d');
            if (ctx) {
                // Attach the context to the container so it draws here instead of main canvas
                (nodeRef.current as any)._layerCtx = ctx;
            }
        }
    }, [canvasEl]);
    
    // Handle scene graph lifecycle
    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;
        parent.add(node);
        return () => parent.remove(node);
    }, [parent]);
    
    useEffect(() => {
        nodeRef.current?.setProps(props);
    }, [props]);
    
    return (
        <SceneContext.Provider value={nodeRef.current}>
            {canvasEl && <LayerPortal canvas={canvasEl} />}
            {children}
        </SceneContext.Provider>
    );
});

// A helper to inject the layer canvas into the DOM near the main canvas
const LayerPortal: React.FC<{ canvas: HTMLCanvasElement }> = ({ canvas }) => {
    const layerContext = React.useContext(LayerContext);
    
    useEffect(() => {
        if (layerContext && layerContext.parentElement) {
            layerContext.parentElement.appendChild(canvas);
            
            // Sync dimensions
            const syncSize = () => {
                canvas.width = layerContext.width;
                canvas.height = layerContext.height;
                canvas.style.width = layerContext.style.width;
                canvas.style.height = layerContext.style.height;
                
                // Copy transform (scale for high DPI)
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const ratio = window.devicePixelRatio || 1;
                    ctx.resetTransform();
                    ctx.scale(ratio, ratio);
                }
            };
            
            syncSize();
            
            return () => {
                if (canvas.parentElement) {
                    canvas.parentElement.removeChild(canvas);
                }
            };
        }
    }, [canvas, layerContext]);
    
    return null;
};

Layer.displayName = 'Layer';
