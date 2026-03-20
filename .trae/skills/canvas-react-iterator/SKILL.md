---
name: "canvas-react-iterator"
description: "用于在 canvas-react 库中进行新特性迭代、Bug 修复和重构。当用户需要给本项目（Canvas 渲染引擎及 React 封装）添加功能或修改代码时调用此 Skill。"
---

# Canvas-React Iterator (项目迭代规范)

这个 Skill 专门用于指导 `canvas-react` 项目的代码开发和迭代。当需要为引擎添加新图形、优化渲染逻辑、或者更新 React 绑定时，请严格遵循以下工程规范。

## 项目架构准则

本项目分为三个核心层，请根据功能将代码放置在正确的位置：

1. **Core 层 (`src/core/`)**: 引擎基石。包含纯 TypeScript 实现的场景图（`Node`, `Container`）、数学计算（`Matrix`）、动画（`Tween`）和资产管理（`Assets`）。不应该包含任何 React 依赖。
2. **Shapes 层 (`src/shapes/`)**: 具体图形实现（`Rect`, `Circle`, `Path` 等）。继承自 Core 层的 `Node` 或 `Container`，实现具体的 `draw()` 方法。同样不能包含 React 依赖。
3. **React 层 (`src/react/`)**: 粘合层。负责将底层的类实例化为 React 组件，处理生命周期、Props 同步以及 Context。

## 开发与迭代工作流

当接受到一个开发任务时，请遵循以下步骤：

### 1. 代码修改规范
- **类型安全**: 所有新增代码必须有完善的 TypeScript 类型定义。不要使用 `any`，除非万不得已。
- **导出收敛**: 新增的类或组件，必须在对应目录的 `index.ts` 中导出，并通过根目录的 `src/index.ts` 对外暴露。
- **Lint 规范**: 编写完代码后，必须运行 `npm run lint`。如果出现任何 ESLint 或 TypeScript 错误，必须修复它们。不要滥用 `// @ts-expect-error`，除非是针对测试文件中的私有属性模拟。

### 2. 测试驱动 (TDD / Unit Tests)
- **单测位置**: 所有的测试文件都存放在 `src/__tests__/` 目录下，并按照源码目录结构（`core/`, `react/`, `shapes/`）分类存放。
- **单测覆盖**:
  - 对于新图形，必须测试其 `draw` 调用是否正确，以及 `getSelfBounds` 包围盒计算是否准确。
  - 对于 React 组件，使用 `@testing-library/react` 测试渲染、Props 传递和交互。
- **运行测试**: 每次代码修改后，必须运行 `npm run test`。
- **检查覆盖率**: 运行 `npm run test:coverage`。如果新功能的覆盖率不足，必须补充测试用例，确保整体覆盖率不会因为新代码而下降。

### 3. 构建与验证
- 所有的修改完成后，必须运行 `npm run build`，确保 TypeScript 编译 (`tsc`) 和 Vite 打包过程没有错误。
- 如果是涉及到视觉表现的修改，建议修改或添加 `examples/` 目录下的示例代码，并在本地启动预览验证效果。

## 常用命令

- `npm run dev`：启动开发服务器（用于预览 examples）。
- `npm run build`：执行类型检查并打包库。
- `npm run lint`：运行 ESLint 检查代码规范。
- `npm run test`：运行所有单元测试。
- `npm run test:coverage`：运行单测并生成覆盖率报告。

---

**请记住**：作为一个基础图形库，性能、准确的边界计算和健壮的类型系统是最重要的。任何改动都不能破坏现有的测试用例。