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

引擎支持矩形、圆形、椭圆、多边形、星形、扇形、文本、线条、Path (SVG) 和图片等丰富的基础图形。所有图形均支持 `fill` (填充) 和 `stroke` (描边) 属性。

```tsx
import Canvas from './src/react/Canvas';
import { Rect, Circle, Ellipse, RegularPolygon, Star, Arc, Text, Line, Image, Path } from './src/react/Shapes';

const App = () => (
  <Canvas width={800} height={600}>
    {/* 基础矩形 (支持圆角和虚线边框) */}
    <Rect x={10} y={10} width={100} height={50} fill="red" stroke="black" lineWidth={2} cornerRadius={10} lineDash={[5, 5]} />
    
    {/* 圆形 */}
    <Circle x={200} y={100} radius={30} fill="blue" />
    
    {/* 椭圆 */}
    <Ellipse x={300} y={100} radiusX={40} radiusY={20} fill="green" />

    {/* 正多边形 */}
    <RegularPolygon x={400} y={100} sides={6} radius={30} fill="purple" />

    {/* 星形 */}
    <Star x={500} y={100} numPoints={5} innerRadius={15} outerRadius={30} fill="yellow" stroke="orange" />

    {/* 扇形 / 圆弧 */}
    <Arc x={600} y={100} innerRadius={10} outerRadius={30} angle={Math.PI} fill="cyan" />

    {/* 文本 (支持换行和垂直对齐) */}
    <Text text="你好世界\n第二行" x={10} y={100} fontSize={24} fill="#333" verticalAlign="middle" />
    
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

引擎支持所有图形的鼠标和拖拽事件。你也可以在 `<Canvas>` 上开启 `interactive={true}` 允许全局的滚轮缩放和拖拽平移画布。

```tsx
<Canvas width={800} height={600} interactive={true}>
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
</Canvas>
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

### 动画 (Tweening)

除了基础的 `useFrame`，引擎现在内置了补间动画 (Tweening) 系统。你可以直接对任何场景节点使用声明式动画。

```tsx
import { useEffect, useRef } from 'react';
import { Rect } from './src/react/Shapes';
import { Node } from './src/core/Node';

const AnimatedBox = () => {
  const nodeRef = useRef<Node>(null);

  useEffect(() => {
    if (nodeRef.current) {
      // 在 1 秒内平滑过渡到指定属性
      nodeRef.current.to({
        x: 300,
        rotation: Math.PI,
        opacity: 0.5,
        duration: 1,
        easing: (t) => t * (2 - t) // 可选的缓动函数
      });
    }
  }, []);

  return <Rect ref={nodeRef} width={100} height={100} fill="purple" />;
};
```

### 状态导出与序列化

引擎支持将画布或任意节点导出为图片或 JSON。

```tsx
// 导出为图片 (DataURL)
const dataUrl = canvasRef.current.toDataURL({ mimeType: 'image/png', quality: 1, pixelRatio: 2 });

// 序列化场景图
const json = nodeRef.current.toJSON();
```

## API 参考

### `<Canvas>`
场景的根容器。
- `width`: number (默认: 500)
- `height`: number (默认: 500)
- `style`: CSSProperties
- `interactive`: boolean (默认: false) - 开启后支持鼠标拖拽画布平移和滚轮缩放
- `onClick`, `onDoubleClick`, `onMouseDown`, `onMouseUp`, `onMouseMove`, `onMouseLeave`, `onWheel`: 全局事件处理器
- **方法**: `toDataURL(options)` 导出画布图片

### 通用属性 (所有图形)
- `x`: number (默认: 0)
- `y`: number (默认: 0)
- `rotation`: number (弧度, 默认: 0)
- `scaleX`: number (默认: 1)
- `scaleY`: number (默认: 1)
- `opacity`: number (全局透明度)
- `globalCompositeOperation`: string (混合模式)
- `zIndex`: number (默认: 0) - 值越大渲染层级越高
- `draggable`: boolean (默认: false)
- `cursor`: string (默认: 'default') - 悬停时的 CSS 光标样式
- **描边与填充**: `fill`, `stroke`, `lineWidth`, `lineDash`, `lineDashOffset`, `lineCap`, `lineJoin`
- **滤镜与阴影**: `filter`, `shadowColor`, `shadowBlur`, `shadowOffsetX`, `shadowOffsetY`
- **事件**: `onClick`, `onDoubleClick`, `onMouseDown`, `onMouseUp`, `onMouseMove`, `onMouseEnter`, `onMouseLeave`, `onWheel`, `onDragStart`, `onDragMove`, `onDragEnd`
- **节点方法**: `cache()`, `clearCache()`, `toJSON()`, `toDataURL()`, `to(config)`

### 图形特定属性

#### `<Rect>`
- `width`: number
- `height`: number
- `cornerRadius`: number | number[] (圆角)

#### `<Circle>`
- `radius`: number

#### `<Ellipse>`
- `radiusX`: number
- `radiusY`: number

#### `<RegularPolygon>`
- `sides`: number (边数)
- `radius`: number

#### `<Star>`
- `numPoints`: number (角数)
- `innerRadius`: number
- `outerRadius`: number

#### `<Arc>`
- `innerRadius`: number
- `outerRadius`: number
- `angle`: number (弧度)

#### `<Text>`
- `text`: string
- `fontSize`: number
- `fontFamily`: string
- `fontStyle`, `fontWeight`, `fontVariant`: 字体样式
- `width`: number (最大宽度，用于自动换行)
- `align`: 'left' | 'center' | 'right'
- `verticalAlign`: 'top' | 'middle' | 'bottom'
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
- `image`: HTMLImageElement (预加载的图片对象)
- `width`: number
- `height`: number
- `filters`: FilterFunction[] (像素级滤镜，内置 `Filters.Grayscale`, `Filters.Invert`, `Filters.Sepia`, `Filters.Brightness`)

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
