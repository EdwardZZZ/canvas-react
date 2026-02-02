import { describe, it, expect, vi } from 'vitest';
import { Node } from './Node';
import { Container } from './Container';
import { Rect } from '../shapes/Rect';

describe('Engine Core', () => {
  const getMockCtx = () => ({
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  describe('Node', () => {
    it('initializes with default props', () => {
      const node = new Node();
      expect(node.x).toBe(0);
      expect(node.y).toBe(0);
      expect(node.rotation).toBe(0);
      expect(node.scaleX).toBe(1);
    });

    it('initializes with provided props', () => {
      const node = new Node({ x: 10, y: 20, rotation: 1.5 });
      expect(node.x).toBe(10);
      expect(node.y).toBe(20);
      expect(node.rotation).toBe(1.5);
    });

    it('updates props via setProps', () => {
      const node = new Node();
      node.setProps({ x: 50 });
      expect(node.x).toBe(50);
    });

    it('applies transforms during render', () => {
      const node = new Node({ x: 10, y: 20, rotation: 0.5, scaleX: 2, scaleY: 2 });
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        transform: vi.fn(),
        fillRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;
      
      node.render(ctx);

      expect(ctx.save).toHaveBeenCalled();
      // Since we updated render to use ctx.transform instead of individual translate/rotate/scale
      // we check for transform call.
      // Matrix for x=10, y=20, rot=0.5, scale=2,2
      expect(ctx.transform).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });
    it('calculates global bounds correctly', () => {
        const node = new Node({ x: 10, y: 10 });
        // Override getSelfBounds for test
        node.getSelfBounds = () => ({ x: 0, y: 0, width: 100, height: 100 });
        
        const bounds = node.getGlobalBounds();
        // x=10, y=10, w=100, h=100 -> global x=10, y=10, w=100, h=100
        expect(bounds).toEqual({ x: 10, y: 10, width: 100, height: 100 });
    });

    it('calculates global bounds with scaling', () => {
        const node = new Node({ x: 0, y: 0, scaleX: 2, scaleY: 2 });
        node.getSelfBounds = () => ({ x: 0, y: 0, width: 50, height: 50 });
        
        const bounds = node.getGlobalBounds();
        // w=50*2=100, h=50*2=100
        expect(bounds).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    });
  });

  describe('Container', () => {
    it('manages children', () => {
      const container = new Container();
      const child = new Node();
      
      container.add(child);
      expect(container.children).toContain(child);
      expect(child.parent).toBe(container);

      container.remove(child);
      expect(container.children).not.toContain(child);
      expect(child.parent).toBe(null);
    });

    it('renders children', () => {
      const container = new Container();
      const child = new Node();
      child.render = vi.fn();
      
      container.add(child);
      
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        transform: vi.fn(),
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      container.render(ctx);
      
      expect(child.render).toHaveBeenCalled();
    });

    it('propagates updates to children', () => {
      const container = new Container();
      const child = new Node();
      child.update = vi.fn();
      
      container.add(child);
      container.update(100);
      
      expect(child.update).toHaveBeenCalledWith(100);
    });
    it('calculates self bounds from children', () => {
        const container = new Container();
        const child1 = new Node({ x: 0, y: 0 });
        child1.getSelfBounds = () => ({ x: 0, y: 0, width: 10, height: 10 });
        
        const child2 = new Node({ x: 20, y: 20 });
        child2.getSelfBounds = () => ({ x: 0, y: 0, width: 10, height: 10 });
        
        container.add(child1);
        container.add(child2);
        
        const bounds = container.getSelfBounds();
        // Child1: 0,0,10,10. Child2: 20,20,10,10 -> 20+10=30
        // MinX=0, MinY=0, MaxX=30, MaxY=30
        expect(bounds).toEqual({ x: 0, y: 0, width: 30, height: 30 });
    });
  });

  describe('Rect', () => {
    it('draws a rectangle', () => {
      const rect = new Rect({ width: 100, height: 50, fill: 'red' });
      const ctx = getMockCtx();
      
      rect.draw(ctx);
      
      expect(ctx.fillStyle).toBe('red');
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 100, 50);
    });
  });
});
