import { Node, NodeProps } from '../core/Node';

/**
 * Properties for a Text node.
 */
export interface TextProps extends NodeProps {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string;
  width?: number; // Max width for wrapping
  lineHeight?: number; // Line height multiplier (default 1.2)
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

/**
 * A text node for rendering strings.
 */
export class Text extends Node {
  declare props: TextProps;

  /**
   * Helper to wrap text into lines based on width.
   */
  private getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth?: number): string[] {
      if (!maxWidth) return text.split('\n');

      const linesToWrap = text.split('\n');
      const lines: string[] = [];

      for (const lineToWrap of linesToWrap) {
          const words = lineToWrap.split(' ');
          let currentLine = words[0];

          for (let i = 1; i < words.length; i++) {
              const word = words[i];
              const width = ctx.measureText(currentLine + " " + word).width;
              if (width < maxWidth) {
                  currentLine += " " + word;
              } else {
                  lines.push(currentLine);
                  currentLine = word;
              }
          }
          lines.push(currentLine);
      }
      return lines;
  }

  /**
   * Draws the text string.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const { 
        text = '', 
        fontSize = 16, 
        fontFamily = 'Arial', 
        fontStyle = 'normal',
        fontVariant = 'normal',
        fontWeight = 'normal',
        fill,
        stroke,
        lineWidth,
        lineDash,
        lineDashOffset,
        lineCap,
        lineJoin,
        width,
        lineHeight = 1.2,
        align = 'left',
        verticalAlign = 'top'
    } = this.props;

    ctx.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top'; // Handled via manual offset if needed

    const lines = this.getLines(ctx, text, width);
    const lh = fontSize * lineHeight;
    
    let startY = 0;
    const totalHeight = lines.length * lh;
    
    if (verticalAlign === 'middle') {
      startY = -totalHeight / 2;
    } else if (verticalAlign === 'bottom') {
      startY = -totalHeight;
    }

    lines.forEach((line, index) => {
        let x = 0;
        if (width && align !== 'left') {
            const lineWidth = ctx.measureText(line).width;
            if (align === 'center') {
                x = (width - lineWidth) / 2;
            } else if (align === 'right') {
                x = width - lineWidth;
            }
        }
        
        if (fill || (!fill && !stroke)) {
            ctx.fillStyle = fill || 'black';
            ctx.fillText(line, x, startY + index * lh);
        }
        
        if (stroke || lineWidth) {
            ctx.strokeStyle = stroke || 'black';
            ctx.lineWidth = lineWidth || 1;
            if (lineCap) ctx.lineCap = lineCap;
            if (lineJoin) ctx.lineJoin = lineJoin;
            if (lineDash) {
              ctx.setLineDash(lineDash);
              if (lineDashOffset !== undefined) ctx.lineDashOffset = lineDashOffset;
            }
            ctx.strokeText(line, x, startY + index * lh);
        }
    });
  }

  getSelfBounds() {
    const { 
        text = '', 
        fontSize = 16, 
        fontFamily = 'Arial',
        fontStyle = 'normal',
        fontVariant = 'normal',
        fontWeight = 'normal',
        width,
        lineHeight = 1.2,
        verticalAlign = 'top'
    } = this.props;
    
    if (!Text.measureContext) {
      const canvas = document.createElement('canvas');
      Text.measureContext = canvas.getContext('2d');
    }

    if (Text.measureContext) {
      Text.measureContext.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`;
      
      const lines = this.getLines(Text.measureContext, text, width);
      
      let maxWidth = 0;
      if (width) {
          maxWidth = width;
      } else {
          // Calculate max width of all lines
          lines.forEach(line => {
              const w = Text.measureContext!.measureText(line).width;
              if (w > maxWidth) maxWidth = w;
          });
      }

      const totalHeight = lines.length * (fontSize * lineHeight);
      
      let startY = 0;
      if (verticalAlign === 'middle') {
        startY = -totalHeight / 2;
      } else if (verticalAlign === 'bottom') {
        startY = -totalHeight;
      }

      return {
          x: 0,
          y: startY, 
          width: maxWidth,
          height: totalHeight
      };
    }
    
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  /**
   * Checks if a point is inside the text bounding box.
   */
  isPointInShape(x: number, y: number): boolean {
      const bounds = this.getSelfBounds();
      return x >= bounds.x && x <= bounds.x + bounds.width &&
             y >= bounds.y && y <= bounds.y + bounds.height;
  }

  private static measureContext: CanvasRenderingContext2D | null = null;
}
