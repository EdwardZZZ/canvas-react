import * as React from 'react';
import { NodeProps } from '../core/Node';
import { RectProps } from '../shapes/Rect';
import { CircleProps } from '../shapes/Circle';
import { EllipseProps } from '../shapes/Ellipse';
import { RegularPolygonProps } from '../shapes/RegularPolygon';
import { StarProps } from '../shapes/Star';
import { ArcProps } from '../shapes/Arc';
import { TextProps } from '../shapes/Text';
import { ImageProps } from '../shapes/Image';
import { LineProps } from '../shapes/Line';
import { PathProps } from '../shapes/Path';
import { TransformerProps } from '../shapes/Transformer';

// Re-export string literal components for react-reconciler

export const Rect = 'Rect' as any as React.FC<RectProps & React.RefAttributes<any>>;
export const Circle = 'Circle' as any as React.FC<CircleProps & React.RefAttributes<any>>;
export const Ellipse = 'Ellipse' as any as React.FC<EllipseProps & React.RefAttributes<any>>;
export const RegularPolygon = 'RegularPolygon' as any as React.FC<RegularPolygonProps & React.RefAttributes<any>>;
export const Star = 'Star' as any as React.FC<StarProps & React.RefAttributes<any>>;
export const Arc = 'Arc' as any as React.FC<ArcProps & React.RefAttributes<any>>;
export const Text = 'Text' as any as React.FC<TextProps & React.RefAttributes<any>>;
export const Image = 'Image' as any as React.FC<ImageProps & React.RefAttributes<any>>;
export const Line = 'Line' as any as React.FC<LineProps & React.RefAttributes<any>>;
export const Path = 'Path' as any as React.FC<PathProps & React.RefAttributes<any>>;
export const Transformer = 'Transformer' as any as React.FC<TransformerProps & React.RefAttributes<any>>;

export interface GroupProps extends NodeProps, React.PropsWithChildren {
  clip?: boolean;
  clipX?: number;
  clipY?: number;
  clipWidth?: number;
  clipHeight?: number;
}

export const Group = 'Group' as any as React.FC<GroupProps & React.RefAttributes<any>>;

export interface LayerProps extends NodeProps, React.PropsWithChildren {
  width?: number;
  height?: number;
}

// For Layer, if we keep it as a string literal, the custom canvas creation logic will be lost.
// But for this task "抛弃目前返回 null 的高阶组件包壳方案，引入官方的 react-reconciler",
// we will let the Reconciler manage it as a Container.
// In a full implementation, Layer might be a specialized Node in core.
export const Layer = 'Layer' as any as React.FC<LayerProps & React.RefAttributes<any>>;
