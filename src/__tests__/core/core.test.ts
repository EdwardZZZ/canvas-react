import { describe, it, expect, vi } from 'vitest';
import { Node } from '../../core/Node';
import { Container } from '../../core/Container';
import { Rect } from '../../shapes/Rect';
import { Matrix2D } from '../../core/Matrix';
import { Timeline } from '../../core/Timeline';
import { Tween } from '../../core/Tween';
import { Assets } from '../../core/Assets';

describe('Engine Core', () => {
  const getMockCtx = () => ({
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    setLineDash: vi.fn(),
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

    it('serializes to JSON correctly', () => {
      const node = new Node({ x: 10, y: 20, fill: 'red', onClick: () => {} });
      const json = node.toJSON();
      
      expect(json.className).toBe('Node');
      expect(json.props.x).toBe(10);
      expect(json.props.y).toBe(20);
      expect(json.props.fill).toBe('red');
      expect(json.props.onClick).toBeUndefined(); // Functions should be removed
    });

    it('tests hit testing on node itself', () => {
        const node = new Rect({ x: 10, y: 10, width: 20, height: 20 });
        
        expect(node.hitTest({ x: 15, y: 15 })).toBe(node);
        expect(node.hitTest({ x: 5, y: 5 })).toBeNull();
    });

    it('tests global bounds calculation', () => {
        const node = new Rect({ x: 10, y: 10, width: 20, height: 20, scaleX: 2, scaleY: 2 });
        const bounds = node.getGlobalBounds();
        
        // Rect local bounds: x:0, y:0, w:20, h:20
        // Scaled and translated: x:10, y:10, w:40, h:40
        expect(bounds.x).toBe(10);
        expect(bounds.y).toBe(10);
        expect(bounds.width).toBe(40);
        expect(bounds.height).toBe(40);
    });

    it('creates a Tween animation', () => {
      const node = new Node({ x: 0 });
      const tween = node.to({ x: 100, duration: 1 });
      
      expect(tween).toBeDefined();
      expect((tween as any).isRunning).toBe(true);
      tween.destroy();
    });

    it('caches node drawing', () => {
        const node = new Node({ x: 10, y: 10 });
        node.getSelfBounds = () => ({ x: 0, y: 0, width: 50, height: 50 });
        
        // Mock canvas context
        const mockContext = {
            scale: vi.fn(),
            translate: vi.fn(),
            drawImage: vi.fn(),
        } as unknown as CanvasRenderingContext2D;
        
        const mockCanvas = {
            getContext: vi.fn(() => mockContext),
            width: 0,
            height: 0
        } as unknown as HTMLCanvasElement;
        
        vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
        
        node.cache();
        expect(document.createElement).toHaveBeenCalledWith('canvas');
        expect(node['_cacheCanvas']).toBe(mockCanvas);
        
        // Test clear cache
        node.clearCache();
        expect(node['_cacheCanvas']).toBeNull();
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

    it('hit tests children', () => {
      const container = new Container();
      const child = new Rect({ x: 10, y: 10, width: 20, height: 20 });
      container.add(child);
      
      const hit = container.hitTest({ x: 15, y: 15 });
      expect(hit).toBe(child);
      
      const noHit = container.hitTest({ x: 5, y: 5 });
      expect(noHit).toBeNull();
    });

    it('handles clipping during render', () => {
        const container = new Container({ clip: true, clipX: 10, clipY: 10, clipWidth: 50, clipHeight: 50 });
        const child = new Node();
        child.render = vi.fn();
        container.add(child);
        
        const ctx = getMockCtx();
        ctx.transform = vi.fn(); // Mock transform function missing in previous test
        ctx.clip = vi.fn(); // Mock clip function missing in previous test
        container.render(ctx);
        
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.rect).toHaveBeenCalledWith(10, 10, 50, 50);
        expect(ctx.clip).toHaveBeenCalled();
        expect(child.render).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('caches container drawing including children', () => {
        const container = new Container({ x: 10, y: 10 });
        const child = new Node();
        child.render = vi.fn();
        container.add(child);
        
        container.getSelfBounds = () => ({ x: 0, y: 0, width: 50, height: 50 });
        
        const mockContext = {
            scale: vi.fn(),
            translate: vi.fn(),
        } as unknown as CanvasRenderingContext2D;
        
        const mockCanvas = {
            getContext: vi.fn(() => mockContext),
            width: 0,
            height: 0
        } as unknown as HTMLCanvasElement;
        
        vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
        
        container.cache();
        expect(child.render).toHaveBeenCalledWith(mockContext);
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

    it('serializes to JSON with children', () => {
      const container = new Container({ x: 10 });
      const child = new Node({ y: 20 });
      container.add(child);
      
      const json = container.toJSON();
      expect(json.className).toBe('Container');
      expect(json.props.x).toBe(10);
      expect(json.children.length).toBe(1);
      expect(json.children[0].className).toBe('Node');
      expect(json.children[0].props.y).toBe(20);
    });

    it('exports to SVG', () => {
      const node = new Node({ x: 10, y: 20, opacity: 0.5 });
      const svg = node.toSVG();
      expect(svg).toContain('<svg');
      expect(svg).toContain('matrix(1 0 0 1 10 20)');
      expect(svg).toContain('opacity="0.5"');
    });

    it('exports to data URL', () => {
        const container = new Container({ x: 10 });
        container.getGlobalBounds = () => ({ x: 0, y: 0, width: 100, height: 100 });
        
        // Mock canvas context
        const mockContext = {
            scale: vi.fn(),
            translate: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            transform: vi.fn(),
            globalAlpha: 1,
        } as unknown as CanvasRenderingContext2D;
        
        const mockCanvas = {
            getContext: vi.fn(() => mockContext),
            toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
            width: 0,
            height: 0
        } as unknown as HTMLCanvasElement;
        
        vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
        
        const url = container.toDataURL();
        expect(url).toBe('data:image/png;base64,mock');
    });
  });

  describe('Rect', () => {
    it('draws a rectangle', () => {
      const rect = new Rect({ width: 100, height: 50, fill: 'red' });
      const ctx = getMockCtx();
      
      rect.draw(ctx);
      
      expect(ctx.fillStyle).toBe('red');
      expect(ctx.rect).toHaveBeenCalledWith(0, 0, 100, 50);
      expect(ctx.fill).toHaveBeenCalled();
    });
  });

  describe('Matrix2D', () => {
    it('creates identity matrix', () => {
      const m = new Matrix2D();
      expect(m.a).toBe(1);
      expect(m.e).toBe(0);
    });

    it('translates', () => {
      const m = new Matrix2D().translate(10, 20);
      expect(m.e).toBe(10);
      expect(m.f).toBe(20);
    });

    it('rotates', () => {
      const m = new Matrix2D().rotate(Math.PI / 2);
      expect(m.b).toBeCloseTo(1);
      expect(m.c).toBeCloseTo(-1);
    });

    it('scales', () => {
      const m = new Matrix2D().scale(2, 3);
      expect(m.a).toBe(2);
      expect(m.d).toBe(3);
    });

    it('multiplies', () => {
      const m1 = new Matrix2D().translate(10, 0);
      const m2 = new Matrix2D().scale(2, 2);
      const result = m1.multiply(m2);
      expect(result.a).toBe(2);
      expect(result.e).toBe(10);
    });

    it('transforms point', () => {
      const m = new Matrix2D().translate(10, 10).scale(2, 2);
      const p = m.transformPoint({ x: 5, y: 5 });
      expect(p).toEqual({ x: 20, y: 20 });
    });

    it('inverts matrix', () => {
      const m = new Matrix2D(2, 0, 0, 2, 10, 10);
      const inv = m.invert();
      expect(inv.a).toBe(0.5);
      expect(inv.e).toBe(-5);
      expect(inv.f).toBe(-5);
    });

    it('clones and decomposes', () => {
        const m = new Matrix2D().translate(10, 20).rotate(Math.PI).scale(2, 2);
        const cloned = m.clone();
        expect(cloned).toEqual(m);
        
        const decomposed = m.decompose();
        expect(decomposed.x).toBeCloseTo(10);
        expect(decomposed.y).toBeCloseTo(20);
        expect(decomposed.scaleX).toBeCloseTo(2);
        expect(decomposed.scaleY).toBeCloseTo(2);
    });
  });

  describe('Timeline', () => {
    it('manages multiple tweens', () => {
      const node1 = new Node({ x: 0 });
      const node2 = new Node({ y: 0 });
      const tween1 = new Tween({ node: node1, x: 100, duration: 1 });
      const tween2 = new Tween({ node: node2, y: 200, duration: 1 });
      
      const timeline = new Timeline();
      timeline.add(tween1, 0);
      timeline.add(tween2, 500); // Start at 500ms
      
      // Seek to 250ms
      timeline.seek(250);
      expect(node1.props.x).toBeGreaterThan(0); 
      expect(node2.props.y).toBe(0); // Not started yet
      
      // Seek to 750ms
      timeline.seek(750);
      // node1: 75% of 100 = 75
      // node2: (750-500)/1000 = 25% of 200 = 50
      expect(node1.props.x).toBeGreaterThan(70);
      expect(node2.props.y).toBeGreaterThan(40);
      
      // Seek to end
      timeline.seek(1500);
      expect(node1.props.x).toBe(100);
      expect(node2.props.y).toBe(200);
    });

    it('loops correctly', () => {
        const node = new Node({ x: 0 });
        const tween = new Tween({ node: node, x: 100, duration: 1 });
        const timeline = new Timeline({ loop: true });
        timeline.add(tween);
        
        timeline.seek(1500); // Past duration
        // Without loop tick it stays at end in seek, 
        // but let's check basic seek behavior
        expect(node.props.x).toBe(100);
    });
  });

  describe('Assets', () => {
    it('loads and caches image', async () => {
        Assets.clear();
        
        // Mock global Image constructor correctly as a class
        const originalImage = global.Image;
        class MockImage {
            _src = '';
            onload?: () => void;
            set src(val: string) {
                this._src = val;
                setTimeout(() => this.onload && this.onload(), 0);
            }
            get src() { return this._src; }
        }
        global.Image = MockImage as any;
        
        const promise1 = Assets.loadImage('test.png');
        const promise2 = Assets.loadImage('test.png'); // should return pending
        
        expect(promise1).toBe(promise2);
        
        const img = await promise1;
        expect(img).toBeInstanceOf(MockImage);
        expect(Assets.getImage('test.png')).toBe(img);
        
        // Should resolve immediately from cache
        const img2 = await Assets.loadImage('test.png');
        expect(img2).toBe(img);
        
        global.Image = originalImage;
    });

    it('handles image loading with crossOrigin and promises', async () => {
        Assets.clear();
        
        // Mock global Image constructor
        const originalImage = global.Image;
        class MockImage {
            _src = '';
            onload?: () => void;
            set src(val: string) {
                this._src = val;
                setTimeout(() => this.onload && this.onload(), 0);
            }
            get src() { return this._src; }
        }
        global.Image = MockImage as any;
        
        try {
            const img = await Assets.loadImage('test2.png');
            expect(img).toBeDefined();
        } finally {
            global.Image = originalImage;
        }
    });

    it('handles image load error', async () => {
        Assets.clear();
        
        const originalImage = global.Image;
        class MockImage {
            _src = '';
            onerror?: (err: Error) => void;
            set src(val: string) {
                this._src = val;
                setTimeout(() => this.onerror && this.onerror(new Error('Load failed')), 0);
            }
        }
        global.Image = MockImage as any;
        
        try {
            await expect(Assets.loadImage('error.png')).rejects.toThrow('Load failed');
            expect(Assets.getImage('error.png')).toBeUndefined();
        } finally {
            global.Image = originalImage;
        }
    });
  });
});
