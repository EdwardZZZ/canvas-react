import React, { useEffect, useRef, PropsWithChildren } from 'react';
import { useCanvasParent, SceneContext } from './CanvasContext';
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
