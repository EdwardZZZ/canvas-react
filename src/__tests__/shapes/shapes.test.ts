import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
      font: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      lineCap: '',
      lineJoin: '',
      globalAlpha: 1,
      shadowColor: '',
      shadowBlur: 0,
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 50 })),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      transform: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      clearRect: vi.fn(),
      setLineDash: vi.fn(),
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

    it('handles stroke and fill', () => {
      const rect = new Rect({ width: 100, height: 50, fill: 'red', stroke: 'blue' });
      rect.draw(ctx);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('renders with stroke settings', () => {
        const rect = new Rect({ 
            width: 100, height: 50, 
            stroke: 'black', 
            lineWidth: 5, 
            lineCap: 'round',
            lineJoin: 'bevel',
            lineDash: [5, 5]
        });
        ctx.setLineDash = vi.fn();
        rect.draw(ctx);
        expect(ctx.lineWidth).toBe(5);
        expect(ctx.lineCap).toBe('round');
        expect(ctx.lineJoin).toBe('bevel');
        expect(ctx.setLineDash).toHaveBeenCalledWith([5, 5]);
    });

    it('supports linear gradient fill', () => {
        const mockGradient = {
            addColorStop: vi.fn()
        };
        ctx.createLinearGradient = vi.fn(() => mockGradient as any);

        const rect = new Rect({ 
            width: 100, height: 50, 
            fillLinearGradient: {
                x0: 0, y0: 0, x1: 100, y1: 100,
                colorStops: [
                    { offset: 0, color: 'red' },
                    { offset: 1, color: 'blue' }
                ]
            } 
        });
        rect.draw(ctx);
        
        expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 100, 100);
        expect(mockGradient.addColorStop).toHaveBeenCalledTimes(2);
        expect(ctx.fillStyle).toBe(mockGradient);
    });

    it('supports radial gradient fill', () => {
        const mockGradient = {
            addColorStop: vi.fn()
        };
        ctx.createRadialGradient = vi.fn(() => mockGradient as any);

        const circle = new Circle({ 
            radius: 50,
            fillRadialGradient: {
                x0: 0, y0: 0, r0: 0, x1: 0, y1: 0, r1: 50,
                colorStops: [
                    { offset: 0, color: 'white' },
                    { offset: 1, color: 'black' }
                ]
            } 
        });
        circle.draw(ctx);
        
        expect(ctx.createRadialGradient).toHaveBeenCalledWith(0, 0, 0, 0, 0, 50);
        expect(mockGradient.addColorStop).toHaveBeenCalledTimes(2);
        expect(ctx.fillStyle).toBe(mockGradient);
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
    it('renders with props', () => {
      const circle = new Circle({ radius: 50 });
      circle.draw(ctx);
      expect(ctx.arc).toHaveBeenCalledWith(0, 0, 50, 0, Math.PI * 2);
    });

    it('handles stroke and fill', () => {
      const circle = new Circle({ radius: 50, fill: 'red', stroke: 'blue' });
      circle.draw(ctx);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('calculates self bounds correctly', () => {
      const circle = new Circle({ radius: 50 });
      const bounds = circle.getSelfBounds();
      expect(bounds).toEqual({ x: -50, y: -50, width: 100, height: 100 });
    });

    it('handles zero radius', () => {
        const circle = new Circle({ radius: 0 });
        const bounds = circle.getSelfBounds();
        expect(bounds.width).toBe(0);
        expect(bounds.height).toBe(0);
        circle.draw(ctx);
        expect(ctx.arc).toHaveBeenCalled();
    });

    it('handles shadow and opacity', () => {
        const circle = new Circle({ radius: 50, shadowColor: 'black', shadowBlur: 10, opacity: 0.5 });
        ctx.globalAlpha = 1; // Initial value
        // render calls draw
        circle.render(ctx);
        expect(ctx.shadowColor).toBe('black');
        expect(ctx.shadowBlur).toBe(10);
        expect(ctx.globalAlpha).toBe(0.5);
    });
  });

  describe('Arc', () => {
    it('renders with props', () => {
      const arc = new Arc({ radius: 50, innerRadius: 30, angle: 90 });
      arc.draw(ctx);
      // It should call arc twice (outer and inner) and closePath
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
    });

    it('handles stroke and fill', () => {
      const arc = new Arc({ radius: 50, fill: 'red', stroke: 'blue', lineWidth: 2 });
      arc.draw(ctx);
      expect(ctx.fillStyle).toBe('red');
      expect(ctx.strokeStyle).toBe('blue');
      expect(ctx.lineWidth).toBe(2);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('renders with start/end angles', () => {
        const arc = new Arc({ radius: 50, angle: 90, rotation: 45 * Math.PI / 180 });
        arc.draw(ctx);
        expect(ctx.arc).toHaveBeenCalled();
    });

    it('calculates self bounds correctly', () => {
      const arc = new Arc({ radius: 50 });
      const bounds = arc.getSelfBounds();
      expect(bounds).toEqual({ x: -50, y: -50, width: 100, height: 100 });
    });
  });

  describe('Ellipse', () => {
    it('renders with props', () => {
      const ellipse = new Ellipse({ radiusX: 50, radiusY: 30 });
      ellipse.draw(ctx);
      expect(ctx.ellipse).toHaveBeenCalledWith(0, 0, 50, 30, 0, 0, Math.PI * 2);
    });

    it('handles stroke and fill', () => {
      const ellipse = new Ellipse({ radiusX: 50, radiusY: 30, fill: 'red', stroke: 'blue' });
      ellipse.draw(ctx);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('renders with rotation', () => {
        const ellipse = new Ellipse({ radiusX: 50, radiusY: 30, rotation: 1 });
        ellipse.draw(ctx);
        // rotation prop on Node is usually in degrees in props but handled in radians?
        // Let's check Ellipse.ts implementation.
        expect(ctx.ellipse).toHaveBeenCalled();
    });

    it('calculates self bounds correctly', () => {
      const ellipse = new Ellipse({ radiusX: 50, radiusY: 30 });
      const bounds = ellipse.getSelfBounds();
      expect(bounds).toEqual({ x: -50, y: -30, width: 100, height: 60 });
    });
  });

  describe('Star', () => {
    it('renders with props', () => {
      const star = new Star({ numPoints: 5, innerRadius: 20, outerRadius: 50 });
      star.draw(ctx);
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
    });

    it('handles stroke and fill', () => {
      const star = new Star({ outerRadius: 50, fill: 'yellow', stroke: 'black' });
      star.draw(ctx);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('handles custom number of points', () => {
        const star = new Star({ numPoints: 10, outerRadius: 50, innerRadius: 20 });
        star.draw(ctx);
        // Each point adds 2 lines (outer to inner, inner to next outer)
        // 10 points = 20 lineTo calls. But sometimes it uses moveTo for first.
        expect(ctx.lineTo).toHaveBeenCalled();
    });

    it('calculates self bounds correctly', () => {
      const star = new Star({ outerRadius: 50 });
      const bounds = star.getSelfBounds();
      expect(bounds).toEqual({ x: -50, y: -50, width: 100, height: 100 });
    });
  });

  describe('RegularPolygon', () => {
    it('renders with props', () => {
      const poly = new RegularPolygon({ sides: 6, radius: 50 });
      poly.draw(ctx);
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
    });

    it('handles stroke and fill', () => {
      const poly = new RegularPolygon({ radius: 50, fill: 'green', stroke: 'white' });
      poly.draw(ctx);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('handles custom number of sides', () => {
        const poly = new RegularPolygon({ sides: 8, radius: 50 });
        poly.draw(ctx);
        expect(ctx.lineTo).toHaveBeenCalled();
    });

    it('calculates self bounds correctly', () => {
      const poly = new RegularPolygon({ radius: 50 });
      const bounds = poly.getSelfBounds();
      expect(bounds).toEqual({ x: -50, y: -50, width: 100, height: 100 });
    });
  });

  describe('Text', () => {
    beforeEach(() => {
        // Mock Text.measureContext
        const mockCtx = {
            font: '',
            measureText: vi.fn((str: string) => ({ width: str.length * 10 })),
        };
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('draws text with correct properties', () => {
      const text = new Text({ text: 'Hello', fontSize: 20, fill: 'black' });
      text.draw(ctx);
      expect(ctx.font).toContain('20px');
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('renders with stroke and lineWidth', () => {
        const text = new Text({ text: 'Stroke', stroke: 'red', lineWidth: 2 });
        text.draw(ctx);
        expect(ctx.strokeText).toHaveBeenCalled();
        expect(ctx.lineWidth).toBe(2);
    });

    it('renders with lineDash', () => {
        const text = new Text({ text: 'Dash', stroke: 'blue', lineDash: [5, 2] });
        ctx.setLineDash = vi.fn();
        text.draw(ctx);
        expect(ctx.setLineDash).toHaveBeenCalledWith([5, 2]);
    });

    it('handles font weight and style', () => {
        const text = new Text({ text: 'Bold', fontWeight: 'bold', fontStyle: 'italic' });
        text.draw(ctx);
        expect(ctx.font).toContain('bold');
        expect(ctx.font).toContain('italic');
    });

    it('handles multiline text', () => {
      const text = new Text({ text: 'Line 1\nLine 2' });
      text.draw(ctx);
      expect(ctx.fillText).toHaveBeenCalledTimes(2);
    });

    it('aligns text correctly', () => {
        const textCenter = new Text({ text: 'Center', width: 100, align: 'center' });
        textCenter.draw(ctx);
        // If width=100 and align=center, x should be (100 - textWidth)/2
        expect(ctx.fillText).toHaveBeenCalled();
        
        const textRight = new Text({ text: 'Right', width: 100, align: 'right' });
        textRight.draw(ctx);
        expect(ctx.fillText).toHaveBeenCalled();
    });

    it('handles vertical alignment', () => {
        const textMiddle = new Text({ text: 'Middle', verticalAlign: 'middle', fontSize: 10 });
        const bounds = textMiddle.getSelfBounds();
        expect(bounds.y).toBe(-6); // - (10 * 1.2 / 2)
        
        const textBottom = new Text({ text: 'Bottom', verticalAlign: 'bottom', fontSize: 10 });
        const boundsBottom = textBottom.getSelfBounds();
        expect(boundsBottom.y).toBe(-12); // - (10 * 1.2)
    });

    it('calculates bounds correctly', () => {
      const text = new Text({ text: 'Hello', fontSize: 16 });
      const bounds = text.getSelfBounds();
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.height).toBeGreaterThan(0);
    });

    it('wraps text when width is set', () => {
        const text = new Text({ 
            text: 'Hello World This Is A Test', 
            fontSize: 10,
            width: 50
        });
        
        // Mock measureText
        const measureText = vi.fn((str: string) => ({ width: str.length * 5 })); 
        ctx.measureText = measureText as any;
        
        text.draw(ctx);
        
        expect(ctx.fillText).toHaveBeenCalledTimes(3); 
    });

    it('handles width and alignment in getSelfBounds', () => {
        const text = new Text({ text: 'Aligned', width: 200, align: 'right' });
        const bounds = text.getSelfBounds();
        expect(bounds.width).toBe(200);
    });

    it('measures width without wordWrap', () => {
        const text = new Text({ text: 'LongText', width: 50, wordWrap: false });
        const bounds = text.getSelfBounds();
        expect(bounds.width).toBe(80);
    });

    it('handles align center and right in draw', () => {
        const text = new Text({ text: 'Test', width: 100, align: 'center' });
        text.draw(ctx);
        expect(ctx.fillText).toHaveBeenCalled();
        
        const textRight = new Text({ text: 'Test', width: 100, align: 'right' });
        textRight.draw(ctx);
        expect(ctx.fillText).toHaveBeenCalled();
    });

    it('handles fill and stroke correctly in draw', () => {
        const text = new Text({ text: 'Test', fill: 'red', stroke: 'blue', lineWidth: 2 });
        text.draw(ctx);
        expect(ctx.fillStyle).toBe('red');
        expect(ctx.strokeStyle).toBe('blue');
        expect(ctx.lineWidth).toBe(2);
        expect(ctx.fillText).toHaveBeenCalled();
        expect(ctx.strokeText).toHaveBeenCalled();
    });

    it('does not wrap text if wordWrap is false', () => {
        const text = new Text({ 
            text: 'Hello World This Is A Test', 
            fontSize: 10,
            width: 50,
            wordWrap: false
        });
        
        // Mock measureText
        const measureText = vi.fn((str: string) => ({ width: str.length * 5 })); 
        ctx.measureText = measureText as any;
        
        text.draw(ctx);
        
        expect(ctx.fillText).toHaveBeenCalledTimes(1); 
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
    beforeEach(() => {
        // Mock Path2D constructor
        (global as any).Path2D = class {};
    });

    it('draws SVG path', () => {
      const path = new Path({ data: 'M 0 0 L 100 100', fill: 'red' });
      path.draw(ctx);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('handles stroke and fill', () => {
      const path = new Path({ data: 'M 0 0 L 100 100', fill: 'red', stroke: 'blue' });
      path.draw(ctx);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('calculates bounds from data', () => {
      const path = new Path({ data: 'M 0 0 L 100 100' });
      const bounds = path.getSelfBounds();
      expect(bounds).toEqual({ x: 0, y: 0, width: 100, height: 100 });
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

    it('handles cropping (srcRect)', () => {
        const mockImg = { complete: true, naturalWidth: 100, _isMock: true } as any;
        const img = new Image({ 
            image: mockImg, 
            width: 100, height: 100,
            srcX: 10, srcY: 10, srcWidth: 50, srcHeight: 50
        });
        img.draw(ctx);
        expect(ctx.drawImage).toHaveBeenCalledWith(mockImg, 10, 10, 50, 50, 0, 0, 100, 100);
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
