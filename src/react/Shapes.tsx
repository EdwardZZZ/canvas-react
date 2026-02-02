import { useEffect, useRef, PropsWithChildren, FC } from 'react';
import { useCanvasParent, SceneContext } from './CanvasContext';
import { Container } from '../core/Container';
import { Rect as EngineRect, RectProps } from '../shapes/Rect';
import { Circle as EngineCircle, CircleProps } from '../shapes/Circle';
import { Text as EngineText, TextProps } from '../shapes/Text';
import { Image as EngineImage, ImageProps } from '../shapes/Image';
import { Line as EngineLine, LineProps } from '../shapes/Line';
import { Path as EnginePath, PathProps } from '../shapes/Path';
import { Transformer as EngineTransformer, TransformerProps } from '../shapes/Transformer';
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
const createShapeComponent = <T extends Node, P extends NodeProps>(EngineClass: Constructor<T>) => {
  return (props: P) => {
    const parent = useCanvasParent();
    const nodeRef = useRef<T | null>(null);

    // Initialize node
    if (!nodeRef.current) {
      nodeRef.current = new EngineClass(props);
    }

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
      nodeRef.current?.setProps(props as any);
    }, [props]);

    return null;
  };
};

export const Rect = createShapeComponent<EngineRect, RectProps>(EngineRect);
export const Circle = createShapeComponent<EngineCircle, CircleProps>(EngineCircle);
export const Text = createShapeComponent<EngineText, TextProps>(EngineText);
export const Image = createShapeComponent<EngineImage, ImageProps>(EngineImage);
export const Line = createShapeComponent<EngineLine, LineProps>(EngineLine);
export const Path = createShapeComponent<EnginePath, PathProps>(EnginePath);
export const Transformer = createShapeComponent<EngineTransformer, TransformerProps>(EngineTransformer);

export interface GroupProps extends NodeProps, PropsWithChildren<{}> {
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
export const Group: FC<GroupProps> = ({ children, ...props }) => {
  const parent = useCanvasParent();
  const nodeRef = useRef<Container | null>(null);

  if (!nodeRef.current) {
    nodeRef.current = new Container(props);
  }

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
};
