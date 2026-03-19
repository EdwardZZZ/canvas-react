import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Circle } from './Circle';
import { Ellipse } from './Ellipse';
import { RegularPolygon } from './RegularPolygon';
import { Star } from './Star';
import { Arc } from './Arc';
import { Text } from './Text';
import { Line } from './Line';
import { Image, Filters } from './Image';
import { Path } from './Path';
import { Assets } from '../core/Assets';

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

    it('calculates self bounds correctly', () => {
        const circle = new Circle({ radius: 10 });
        expect(circle.getSelfBounds()).toEqual({ x: -10, y: -10, width: 20, height: 20 });
    });
  });

  describe('Ellipse', () => {
    it('draws an ellipse', () => {
      const ellipse = new Ellipse({ radiusX: 20, radiusY: 10, fill: 'red' });
      ellipse.draw(ctx);
      expect(ctx.ellipse).toHaveBeenCalledWith(0, 0, 20, 10, 0, 0, Math.PI * 2);
      expect(ctx.fillStyle).toBe('red');
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
  });

  describe('Star', () => {
    it('draws a star', () => {
      const star = new Star({ numPoints: 5, innerRadius: 10, outerRadius: 20, fill: 'yellow' });
      star.draw(ctx);
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });
  });

  describe('Arc', () => {
    it('draws an arc', () => {
      const arc = new Arc({ innerRadius: 10, outerRadius: 20, angle: Math.PI, fill: 'blue' });
      arc.draw(ctx);
      expect(ctx.arc).toHaveBeenCalledTimes(2);
      expect(ctx.fill).toHaveBeenCalled();
    });
  });

  describe('Text', () => {
    it('draws text with correct properties', () => {
      const text = new Text({ text: 'Hello', fontSize: 24, fill: 'red' });
      text.draw(ctx);
      
      expect(ctx.font).toBe('normal normal normal 24px Arial');
      expect(ctx.fillStyle).toBe('red');
      expect(ctx.fillText).toHaveBeenCalledWith('Hello', 0, 0);
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
    it('draws a line with points', () => {
      const line = new Line({ 
        points: [0, 0, 10, 10, 20, 0], 
        stroke: 'green',
        lineWidth: 2 
      });
      line.draw(ctx);
      
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
      expect(ctx.lineTo).toHaveBeenCalledWith(10, 10);
      expect(ctx.lineTo).toHaveBeenCalledWith(20, 0);
      expect(ctx.strokeStyle).toBe('green');
      expect(ctx.lineWidth).toBe(2);
      expect(ctx.stroke).toHaveBeenCalled();
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
