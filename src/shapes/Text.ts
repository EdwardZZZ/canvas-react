import { Node, NodeProps } from '../core/Node';

/**
 * Properties for a Text node.
 */
export interface TextProps extends NodeProps {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  width?: number; // Max width for wrapping
  lineHeight?: number; // Line height multiplier (default 1.2)
  align?: 'left' | 'center' | 'right';
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
      if (!maxWidth) return [text];

      const words = text.split(' ');
      const lines: string[] = [];
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
        fill = 'black',
        width,
        lineHeight = 1.2,
        align = 'left'
    } = this.props;

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fill;
    ctx.textBaseline = 'top'; 

    const lines = this.getLines(ctx, text, width);
    const lh = fontSize * lineHeight;

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
        
        ctx.fillText(line, x, index * lh);
    });
  }

  getSelfBounds() {
    const { 
        text = '', 
        fontSize = 16, 
        fontFamily = 'Arial',
        width,
        lineHeight = 1.2
    } = this.props;
    
    if (!Text.measureContext) {
      const canvas = document.createElement('canvas');
      Text.measureContext = canvas.getContext('2d');
    }

    if (Text.measureContext) {
      Text.measureContext.font = `${fontSize}px ${fontFamily}`;
      
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

      return {
          x: 0,
          y: 0, 
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
