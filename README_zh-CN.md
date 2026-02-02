# React Canvas Engine

一个基于 TypeScript 和 React 构建的轻量级、高性能 Canvas 渲染引擎。它提供了一套声明式的 API，使用标准的 React 组件来构建复杂的 Canvas 场景。

[English](./README.md) | [简体中文](./README_zh-CN.md)

## 特性

- **声明式 API**: 使用 `<Rect>`, `<Circle>`, `<Group>` 等 React 组件来组合场景。
- **场景图**: 内置分层对象管理（父子关系）。
- **交互支持**: 支持点击、悬停和拖拽事件（`onClick`, `onMouseEnter`, `onDragStart` 等）。
- **智能渲染**: 支持 Z-Index 排序、分组裁剪（Clipping），以及使用 `requestAnimationFrame` 优化的渲染循环。
- **高 DPI 支持**: 自动处理 Retina/高密度显示屏。
- **TypeScript**: 使用 TypeScript 编写，提供完整的类型定义。
- **动画 Hooks**: 提供 `useFrame` hook 用于实现平滑的逐帧动画。

## 安装

1. 克隆仓库。
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 使用方法

### 基础图形

引擎支持矩形、圆形、文本、线条、Path (SVG) 和图片等基础图形。

```tsx
import Canvas from './src/react/Canvas';
import { Rect, Circle, Text, Line, Image, Path } from './src/react/Shapes';

const App = () => (
  <Canvas width={800} height={600}>
    {/* 基础矩形 */}
    <Rect x={10} y={10} width={100} height={50} fill="red" />
    
    {/* 圆形 */}
    <Circle x={200} y={100} radius={30} fill="blue" />
    
    {/* 文本 */}
    <Text text="你好世界" x={10} y={100} fontSize={24} fill="#333" />
    
    {/* SVG 路径 */}
    <Path 
      data="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z" 
      fill="pink" 
      stroke="red" 
    />
  </Canvas>
);
```

### 交互与事件

引擎支持所有图形的鼠标和拖拽事件。

```tsx
<Rect 
  x={100} 
  y={100} 
  width={50} 
  height={50} 
  fill="orange"
  onClick={(e) => console.log('点击!', e)}
  onMouseEnter={() => console.log('鼠标移入')}
  onMouseLeave={() => console.log('鼠标移出')}
  draggable={true}
  onDragStart={() => console.log('拖拽开始')}
  onDragMove={(e) => console.log('拖拽中...', e)}
  onDragEnd={() => console.log('拖拽结束')}
/>
```

### 分组、裁剪与层级 (Z-Index)

使用 `<Group>` 来组织图形。你还可以使用 `clip` 属性将渲染限制在分组的边界框内，或使用 `zIndex` 控制渲染顺序。

```tsx
import { Group, Rect } from './src/react/Shapes';

const Scene = () => (
  <Group x={400} y={300} clip={true} clipWidth={200} clipHeight={200}>
    {/* 背景 (z-index 0) */}
    <Rect width={200} height={200} fill="#eee" zIndex={0} />
    
    {/* 前景 (z-index 10) - 将渲染在最上方 */}
    <Rect x={50} y={50} width={100} height={100} fill="red" zIndex={10} />
  </Group>
);
```

### 动画

使用 `useFrame` hook 在每一帧更新组件状态。

```tsx
import { useState } from 'react';
import { useFrame } from './src/react/CanvasContext';
import { Rect } from './src/react/Shapes';

const RotatingBox = () => {
  const [rotation, setRotation] = useState(0);

  useFrame((time) => {
    // time 是经过的时间（毫秒）
    setRotation(time * 0.001);
  });

  return (
    <Rect 
      x={250} 
      y={250} 
      width={100} 
      height={100} 
      rotation={rotation} 
      fill="purple" 
    />
  );
};
```

## API 参考

### `<Canvas>`
场景的根容器。
- `width`: number (默认: 500)
- `height`: number (默认: 500)
- `style`: CSSProperties
- `onClick`, `onMouseDown`, `onMouseUp`, `onMouseMove`, `onMouseLeave`: 全局事件处理器

### 通用属性 (所有图形)
- `x`: number (默认: 0)
- `y`: number (默认: 0)
- `rotation`: number (弧度, 默认: 0)
- `scaleX`: number (默认: 1)
- `scaleY`: number (默认: 1)
- `zIndex`: number (默认: 0) - 值越大渲染层级越高
- `draggable`: boolean (默认: false)
- `cursor`: string (默认: 'default') - 悬停时的 CSS 光标样式 (如 'pointer', 'grab')
- `filter`: string - CSS 滤镜字符串 (如 'blur(5px)')
- `shadowColor`: string
- `shadowBlur`: number
- `shadowOffsetX`: number
- `shadowOffsetY`: number
- **事件**: `onClick`, `onMouseEnter`, `onMouseLeave`, `onDragStart`, `onDragMove`, `onDragEnd`

### 图形特定属性

#### `<Rect>`
- `width`: number
- `height`: number
- `fill`: string (颜色)

#### `<Circle>`
- `radius`: number
- `fill`: string

#### `<Text>`
- `text`: string
- `fontSize`: number
- `fontFamily`: string
- `fill`: string
- `width`: number (最大宽度，用于自动换行)
- `align`: 'left' | 'center' | 'right'
- `lineHeight`: number

#### `<Path>`
- `data`: string (SVG 路径数据)
- `fill`: string
- `stroke`: string
- `lineWidth`: number

#### `<Line>`
- `points`: number[] (坐标数组 `[x1, y1, x2, y2, ...]`)
- `stroke`: string (颜色)
- `lineWidth`: number
- `lineCap`: 'butt' | 'round' | 'square'
- `lineJoin`: 'bevel' | 'round' | 'miter'
- `closed`: boolean (是否闭合路径)

#### `<Image>`
- `src`: string (图片 URL)
- `width`: number
- `height`: number

#### `<Group>`
- `clip`: boolean (开启裁剪)
- `clipX`, `clipY`, `clipWidth`, `clipHeight`: 裁剪矩形定义

#### `<Transformer>`
- `target`: Node (要依附的节点)
- `borderStroke`: string (边框颜色)
- `handleFill`: string (手柄颜色)
- `keepRatio`: boolean (保持宽高比)

## 新特性

### 资源管理 (Asset Management)
内置 `AssetManager` 负责高效加载、缓存和去重图片资源。`<Image>` 组件会自动利用此系统。

### 滤镜与阴影 (Filters & Shadows)
支持对任意节点应用实时视觉特效。

```tsx
<Image 
  src="photo.png" 
  filter="blur(5px) grayscale(50%)" 
/>

<Rect 
  fill="white" 
  shadowColor="black" 
  shadowBlur={10} 
/>
```

### 光标管理 (Cursor Management)
根据交互状态自动更新光标。
- 悬停在可拖拽对象上显示 `grab`。
- 拖拽时显示 `grabbing`。
- Transformer 手柄会显示正确的调整光标（支持旋转）。
- 支持通过 `cursor` 属性自定义光标。

### 多行文本 (Multiline Text)
支持基于宽度的自动换行和对齐。

```tsx
<Text 
  text="这是一段很长的文本，会自动换行显示。" 
  width={200} 
  align="center" 
/>
```

### 变换控制器 (Transformer)
用于交互式缩放和旋转节点的 UI 组件。

```tsx
<Transformer target={selectedNode} />
```

### 触摸支持 (Touch Support)
全面支持移动设备的触摸交互（拖拽、点击）。

### 性能优化
- **视锥体剔除 (Frustum Culling)**: 自动跳过视口外的对象渲染。
- **智能脏矩形**: 优化的渲染循环。

## 项目结构

```
src/
├── core/             # 引擎核心 (场景图, 节点, 容器, 矩阵, 事件系统)
├── shapes/           # 图形实现 (Rect, Circle, Path 等)
├── react/            # React 绑定 (Canvas, Shapes, Context)
└── types/            # 类型定义
examples/             # 演示应用
```

## 测试

使用 Vitest 运行测试套件：

```bash
npm test
```
