import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Rect } from '../../shapes/Rect';
import { Circle } from '../../shapes/Circle';
import { Ellipse } from '../../shapes/Ellipse';
import { RegularPolygon } from '../../shapes/RegularPolygon';
import { Star } from '../../shapes/Star';
import { Arc } from '../../shapes/Arc';
import { Text } from '../../shapes/Text';
import { Line } from '../../shapes/Line';
import { Image, Filters } from '../../shapes/Image';
import { Path } from '../../shapes/Path';
import { Assets } from '../../core/Assets';

describe('Shapes Core', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = {
      beginPath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      closePath: vi.fn(),
      fillText: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      drawImage: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn(),
      measureText: vi.fn(() => ({ width: 50 })),
      save: vi.fn(),
      restore: vi.fn(),
      transform: vi.fn(),
      clip: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    
    // Mock Assets.loadImage
    // We need to spy on the singleton method
    vi.spyOn(Assets, 'loadImage').mockImplementation((url) => {
        const img = { src: url } as HTMLImageElement;
        return Promise.resolve(img);
    });
    
    vi.spyOn(Assets, 'getImage').mockImplementation((_url) => {
        return undefined; // simulate cache miss
    });
  });
  
  // ... rest of describe blocks ...
  
  describe('Rect', () => {
    it('renders with props', () => {
      const rect = new Rect({ width: 100, height: 50, cornerRadius: 10 });
      rect.draw(ctx);
      expect(ctx.roundRect).toHaveBeenCalledWith(0, 0, 100, 50, 10);
    });

    it('calculates bounds correctly', () => {
        const shape = new Rect({ width: 100, height: 50 });
        const bounds = shape.getSelfBounds();
        expect(bounds).toEqual({ x: 0, y: 0, width: 100, height: 50 });
    });

    it('exports to SVG', () => {
        const rect = new Rect({ width: 100, height: 50, fill: 'red', cornerRadius: 5 });
        const svg = rect.toSVG();
        expect(svg).toContain('<rect');
        expect(svg).toContain('width="100"');
        expect(svg).toContain('height="50"');
        expect(svg).toContain('fill="red"');
        expect(svg).toContain('rx="5"');
    });
  });

  describe('Circle', () => {
    it('draws a circle with correct properties', () => {
      const circle = new Circle({ radius: 20, fill: 'blue' });
      circle.draw(ctx);
      
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalledWith(0, 0, 20, 0, Math.PI * 2);
      expect(ctx.fillStyle).toBe('blue');
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
    });

    it('calculates bounds correctly', () => {
        const shape = new Circle({ radius: 20 });
        const bounds = shape.getSelfBounds();
        expect(bounds).toEqual({ x: -20, y: -20, width: 40, height: 40 });
    });
  });

  describe('Ellipse', () => {
    it('draws an ellipse', () => {
      const ellipse = new Ellipse({ radiusX: 20, radiusY: 10, fill: 'red' });
      ellipse.draw(ctx);
      expect(ctx.ellipse).toHaveBeenCalledWith(0, 0, 20, 10, 0, 0, Math.PI * 2);
      expect(ctx.fillStyle).toBe('red');
    });

    it('calculates bounds correctly', () => {
        const shape = new Ellipse({ radiusX: 40, radiusY: 20 });
        const bounds = shape.getSelfBounds();
        expect(bounds).toEqual({ x: -40, y: -20, width: 80, height: 40 });
    });
  });

  describe('RegularPolygon', () => {
    it('draws a polygon', () => {
      const poly = new RegularPolygon({ sides: 6, radius: 20, fill: 'green' });
      poly.draw(ctx);
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('calculates bounds correctly', () => {
        const shape = new RegularPolygon({ sides: 6, radius: 30 });
        const bounds = shape.getSelfBounds();
        expect(bounds).toEqual({ x: -30, y: -30, width: 60, height: 60 });
    });
  });

  describe('Star', () => {
    it('draws a star', () => {
      const star = new Star({ numPoints: 5, innerRadius: 10, outerRadius: 20, fill: 'yellow' });
      star.draw(ctx);
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('calculates bounds correctly', () => {
        const shape = new Star({ numPoints: 5, innerRadius: 15, outerRadius: 30 });
        const bounds = shape.getSelfBounds();
        expect(bounds).toEqual({ x: -30, y: -30, width: 60, height: 60 });
    });
  });

  describe('Arc', () => {
    it('draws an arc', () => {
      const arc = new Arc({ innerRadius: 10, outerRadius: 20, angle: Math.PI, fill: 'blue' });
      arc.draw(ctx);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalledTimes(2);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('calculates bounds correctly', () => {
        const shape = new Arc({ innerRadius: 10, outerRadius: 30, angle: Math.PI });
        const bounds = shape.getSelfBounds();
        expect(bounds).toEqual({ x: -30, y: -30, width: 60, height: 60 });
    });
  });

  describe('Text', () => {
    it('draws text with correct properties', () => {
      const text = new Text({ text: 'Hello', x: 10, y: 20, fontSize: 24, fill: 'blue' });
      text.draw(ctx);
      
      expect(ctx.font).toBe('normal normal normal 24px Arial');
      expect(ctx.fillStyle).toBe('blue');
      expect(ctx.fillText).toHaveBeenCalledWith('Hello', 0, 0);
    });

    it('handles multiline text', () => {
        const text = new Text({ text: 'Line1\nLine2', lineHeight: 1.5, fontSize: 20 });
        text.draw(ctx);
        // Line1 at y=0, Line2 at y=30 (20 * 1.5)
        expect(ctx.fillText).toHaveBeenCalledWith('Line1', 0, 0);
        expect(ctx.fillText).toHaveBeenCalledWith('Line2', 0, 30);
    });
    
    it('calculates bounds correctly', () => {
        // Mock measureContext for this test
        const originalContext = (Text as any).measureContext;
        (Text as any).measureContext = {
            measureText: vi.fn(() => ({ width: 50 }))
        } as any;

        const shape = new Text({ text: 'Test', fontSize: 16, lineHeight: 1 });
        const bounds = shape.getSelfBounds();
        expect(bounds).toEqual({ x: 0, y: 0, width: 50, height: 16 });

        // Restore context
        (Text as any).measureContext = originalContext;
    });

    it('wraps text when width is set', () => {
        const text = new Text({ 
            text: 'Hello World This Is A Test', 
            fontSize: 10,
            width: 50
        });
        
        // Mock measureText
        // 5px per char
        // "Hello" = 25
        // "World" = 25
        // "This" = 20
        // "Is" = 10
        // "A" = 5
        // "Test" = 20
        
        const measureText = vi.fn((str: string) => ({ width: str.length * 5 })); 
        ctx.measureText = measureText as any;
        
        text.draw(ctx);
        
        // Actually, let's just assert that it is called multiple times, meaning wrapping happened.
        // Exact count depends on space splitting logic which might be slightly off in my manual trace.
        // But > 1 means wrapping occurred.
        expect(ctx.fillText).toHaveBeenCalledTimes(4); 
    });
    
    it('aligns text correctly', () => {
        const text = new Text({
            text: 'Hello',
            width: 100,
            align: 'center',
            fontSize: 10
        });
        
        // Mock measureText
        ctx.measureText = vi.fn(() => ({ width: 50 })) as any; // "Hello" is 50px wide
        
        text.draw(ctx);
        
        // Width 100, Text 50. Center = (100-50)/2 = 25
        expect(ctx.fillText).toHaveBeenCalledWith('Hello', 25, 0);
    });
  });

  describe('Line', () => {
    it('draws a line with correct properties', () => {
      const line = new Line({ points: [0, 0, 10, 10, 20, 0], stroke: 'green', lineWidth: 2, closed: true });
      line.draw(ctx);
      
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
      expect(ctx.lineTo).toHaveBeenCalledWith(10, 10);
      expect(ctx.lineTo).toHaveBeenCalledWith(20, 0);
      expect(ctx.closePath).toHaveBeenCalled();
      expect(ctx.strokeStyle).toBe('green');
      expect(ctx.lineWidth).toBe(2);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('calculates bounds from points', () => {
        const shape = new Line({ points: [10, 20, 30, 40, 5, 50], lineWidth: 1 }); // Ensure lineWidth is 1 for exact bounds
        const bounds = shape.getSelfBounds();
        // minX: 5, maxX: 30, minY: 20, maxY: 50. Padding is lineWidth/2 = 0.5
        // Actual bounds should be x: 4.5, y: 19.5, width: 26, height: 31
        expect(bounds).toEqual({ x: 4.5, y: 19.5, width: 26, height: 31 });
    });
    
    it('handles empty points for bounds', () => {
        const shape = new Line({ points: [] });
        expect(shape.getSelfBounds()).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('closes the path if closed prop is true', () => {
      const line = new Line({ points: [0, 0, 10, 0, 10, 10], closed: true });
      line.draw(ctx);
      expect(ctx.closePath).toHaveBeenCalled();
    });

    it('calculates self bounds correctly', () => {
        const line = new Line({ points: [0, 0, 10, 10], lineWidth: 2 });
        // Min 0,0 Max 10,10. HalfWidth 1. 
        // x: -1, y: -1, w: 10+2=12, h: 10+2=12
        expect(line.getSelfBounds()).toEqual({ x: -1, y: -1, width: 12, height: 12 });
    });
  });

  describe('Path', () => {
      it('draws SVG path', () => {
          // Mock Path2D constructor
          const MockPath2D = vi.fn();
          vi.stubGlobal('Path2D', MockPath2D);
          
          const path = new Path({ data: 'M 0 0 L 10 10', fill: 'red' });
          path.draw(ctx);
          
          expect(MockPath2D).toHaveBeenCalledWith('M 0 0 L 10 10');
          expect(ctx.fillStyle).toBe('red');
          expect(ctx.fill).toHaveBeenCalled();
          
          vi.unstubAllGlobals();
      });

    it('calculates bounds from data', () => {
        const path = new Path({ data: 'M 10 10 L 20 20 L 5 15 Z' });
        const bounds = path.getSelfBounds();
        // minX: 5, maxX: 20, minY: 10, maxY: 20
        expect(bounds).toEqual({ x: 5, y: 10, width: 15, height: 10 });
        
        const pathFallback = new Path();
        expect(pathFallback.getSelfBounds()).toEqual({ x: -10000, y: -10000, width: 20000, height: 20000 });
    });
  });

  describe('Image', () => {
    it('handles image loading from src', async () => {
      // Mock Assets.getImage to return cached immediately if we want sync?
      // No, Image uses .then().
      // Let's just mock AssetManager completely
      
      const mockImg = { src: 'test.png', complete: true, naturalWidth: 100 } as HTMLImageElement;
      vi.spyOn(Assets, 'getImage').mockReturnValue(null as any);
      vi.spyOn(Assets, 'loadImage').mockResolvedValue(mockImg);
      
      const img = new Image({ src: 'test.png' });
      
      // Wait for next tick/microtask
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // @ts-expect-error - accessing private property for test
      expect(img.imageObj).toBeDefined();
      // @ts-expect-error - testing private prop
      expect(img.imageObj.src).toContain('test.png');
    });

    it('draws image when loaded', () => {
      const mockImgElement = {
        complete: true,
        naturalWidth: 100,
        width: 100,
        height: 100
      } as HTMLImageElement;

      const imgShape = new Image({ image: mockImgElement, width: 50, height: 50 });
      imgShape.draw(ctx);

      expect(ctx.drawImage).toHaveBeenCalledWith(mockImgElement, 0, 0, 50, 50);
    });
    
    it('calculates bounds from props or image', () => {
        const mockImgElement = { width: 100, height: 80 } as HTMLImageElement;
        
        const img1 = new Image({ image: mockImgElement });
        expect(img1.getSelfBounds()).toEqual({ x: 0, y: 0, width: 100, height: 80 });
        
        const img2 = new Image({ width: 50, height: 40 });
        expect(img2.getSelfBounds()).toEqual({ x: 0, y: 0, width: 50, height: 40 });
    });

    it('applies image filters', () => {
        const mockImgElement = {
            complete: true,
            naturalWidth: 100,
            width: 100,
            height: 100
        } as HTMLImageElement;

        const imgShape = new Image({ 
            image: mockImgElement, 
            filters: [Filters.Grayscale] 
        });

        // Mock canvas creation for filters
        const mockContext = {
            drawImage: vi.fn(),
            getImageData: vi.fn(() => ({
                data: new Uint8ClampedArray([255, 100, 50, 255])
            })),
            putImageData: vi.fn()
        };
        
        const mockCanvas = {
            getContext: vi.fn(() => mockContext),
            width: 100,
            height: 100
        } as unknown as HTMLCanvasElement;
        
        vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);

        imgShape.draw(ctx);

        // Filter should be applied and drawn
        expect(mockContext.getImageData).toHaveBeenCalled();
        expect(mockContext.putImageData).toHaveBeenCalled();
        expect(ctx.drawImage).toHaveBeenCalledWith(mockCanvas, 0, 0, 100, 100);
    });
  });
});
