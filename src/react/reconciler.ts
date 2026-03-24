import * as Reconciler from 'react-reconciler';
import { Node } from '../core/Node';
import { Container } from '../core/Container';
import { Rect } from '../shapes/Rect';
import { Circle } from '../shapes/Circle';
import { Ellipse } from '../shapes/Ellipse';
import { RegularPolygon } from '../shapes/RegularPolygon';
import { Star } from '../shapes/Star';
import { Arc } from '../shapes/Arc';
import { Text } from '../shapes/Text';
import { Image } from '../shapes/Image';
import { Line } from '../shapes/Line';
import { Path } from '../shapes/Path';
import { Transformer } from '../shapes/Transformer';

export type Type = string;
export type Props = Record<string, any>;
export type Instance = Node;
export type TextInstance = never;
export type SuspenseInstance = never;
export type HydratableInstance = never;
export type FormInstance = never;
export type PublicInstance = Node;
export type HostContext = Record<string, any>;
export type ChildSet = never;
export type TimeoutHandle = ReturnType<typeof setTimeout>;
export type NoTimeout = -1;
export type TransitionStatus = never;

const NO_CONTEXT: HostContext = {};

const createInstance = (type: Type, props: Props, _rootContainerInstance: Container, _hostContext: HostContext, _internalInstanceHandle: Reconciler.OpaqueHandle): Instance => {
  let instance: Node;

  switch (type) {
    case 'Rect':
      instance = new Rect(props);
      break;
    case 'Circle':
      instance = new Circle(props);
      break;
    case 'Ellipse':
      instance = new Ellipse(props);
      break;
    case 'RegularPolygon':
      instance = new RegularPolygon(props);
      break;
    case 'Star':
      instance = new Star(props);
      break;
    case 'Arc':
      instance = new Arc(props);
      break;
    case 'Text':
      instance = new Text(props);
      break;
    case 'Image':
      instance = new Image(props);
      break;
    case 'Line':
      instance = new Line(props);
      break;
    case 'Path':
      instance = new Path(props);
      break;
    case 'Transformer':
      instance = new Transformer(props);
      break;
    case 'Group':
    case 'Layer':
      instance = new Container(props);
      break;
    default:
      throw new Error(`Invalid type ${type} created`);
  }

  return instance;
};

const hostConfig: any = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: false,

  createInstance,

  createTextInstance(_text: string, _rootContainerInstance: Container, _hostContext: HostContext, _internalInstanceHandle: Reconciler.OpaqueHandle): TextInstance {
    throw new Error('Text nodes are not supported in Canvas React. Use the <Text /> component.');
  },

  appendInitialChild(parentInstance: Instance, child: Instance | TextInstance): void {
    if (parentInstance instanceof Container) {
      parentInstance.add(child as Node);
    }
  },

  finalizeInitialChildren(_instance: Instance, _type: Type, _props: Props, _rootContainerInstance: Container, _hostContext: HostContext): boolean {
    return false;
  },

  shouldSetTextContent(_type: Type, _props: Props): boolean {
    return false;
  },

  getRootHostContext(_rootContainerInstance: Container): HostContext {
    return NO_CONTEXT;
  },

  getChildHostContext(_parentHostContext: HostContext, _type: Type, _rootContainerInstance: Container): HostContext {
    return NO_CONTEXT;
  },

  getPublicInstance(instance: Instance): PublicInstance {
    return instance;
  },

  prepareForCommit(_containerInfo: Container): Record<string, any> | null {
    return null;
  },

  resetAfterCommit(containerInfo: Container): void {
    containerInfo.requestRedraw();
  },

  preparePortalMount(_containerInfo: Container): void {
    // noop
  },

  appendChild(parentInstance: Instance, child: Instance | TextInstance): void {
    if (parentInstance instanceof Container) {
      parentInstance.add(child as Node);
    }
  },

  appendChildToContainer(container: Container, child: Instance | TextInstance): void {
    container.add(child as Node);
  },

  insertBefore(parentInstance: Instance, child: Instance | TextInstance, beforeChild: Instance | TextInstance): void {
    if (parentInstance instanceof Container) {
      const index = parentInstance.children.indexOf(beforeChild as Node);
      if (index !== -1) {
        parentInstance.children.splice(index, 0, child as Node);
        (child as Node).parent = parentInstance;
        parentInstance.requestRedraw();
      } else {
        parentInstance.add(child as Node);
      }
    }
  },

  insertInContainerBefore(container: Container, child: Instance | TextInstance, beforeChild: Instance | TextInstance): void {
    const index = container.children.indexOf(beforeChild as Node);
    if (index !== -1) {
      container.children.splice(index, 0, child as Node);
      (child as Node).parent = container;
      container.requestRedraw();
    } else {
      container.add(child as Node);
    }
  },

  removeChild(parentInstance: Instance, child: Instance | TextInstance): void {
    if (parentInstance instanceof Container) {
      parentInstance.remove(child as Node);
    }
  },

  removeChildFromContainer(container: Container, child: Instance | TextInstance): void {
    container.remove(child as Node);
  },

  resetTextContent(_instance: Instance): void {
    // noop
  },

  commitTextUpdate(_textInstance: TextInstance, _oldText: string, _newText: string): void {
    // noop
  },

  commitMount(_instance: Instance, _type: Type, _newProps: Props, _internalInstanceHandle: Reconciler.OpaqueHandle): void {
    // noop
  },

  commitUpdate(instance: Instance, _type: Type, _oldProps: Props, newProps: Props, _internalInstanceHandle: Reconciler.OpaqueHandle): void {
    instance.setProps(newProps);
  },

  hideInstance(instance: Instance): void {
    instance.setProps({ visible: false });
  },

  hideTextInstance(_textInstance: TextInstance): void {
    // noop
  },

  unhideInstance(instance: Instance, props: Props): void {
    instance.setProps({ visible: props.visible !== false });
  },

  unhideTextInstance(_textInstance: TextInstance, _text: string): void {
    // noop
  },

  clearContainer(container: Container): void {
    container.children.forEach(child => {
      child.parent = null;
    });
    container.children = [];
    container.requestRedraw();
  },

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,

  getInstanceFromNode() {
    return null;
  },

  beforeActiveInstanceBlur() {},
  afterActiveInstanceBlur() {},
  prepareScopeUpdate() {},
  getInstanceFromScope() {
    return null;
  },
  detachDeletedInstance() {},

  getCurrentUpdatePriority() {
    return 0;
  },
  resolveUpdatePriority() {
    return 0;
  },
  setCurrentUpdatePriority() {},
  
  requestPostPaintCallback() {},
  maySuspendCommit() { return false; },
  preloadInstance() { return true; },
  startSuspendingCommit() {},
  suspendInstance() {},
  waitForCommitToBeReady() { return null; },
  NotPendingTransition: null,
  HostTransitionContext: null,
  trackSchedulerEvent() {},
  resolveEventTimeStamp: () => performance.now(),
  resolveEventType: () => null,
  now: () => performance.now(),
  scheduleMicrotask: typeof queueMicrotask !== 'undefined' ? queueMicrotask : setTimeout,
};

const ReconcilerInst = (Reconciler as any).default || Reconciler;

export const canvasReconciler = ReconcilerInst(hostConfig);
