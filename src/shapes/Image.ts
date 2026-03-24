import { Node, NodeProps } from '../core/Node';
import { Assets } from '../core/Assets';

/**
 * Filter functions to apply to image pixel data
 */
export type FilterFunction = (imageData: ImageData) => void;

export const Filters = {
  Grayscale: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
      data[i] = brightness;     // red
      data[i + 1] = brightness; // green
      data[i + 2] = brightness; // blue
    }
  },
  Invert: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];         // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }
  },
  Sepia: (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
      data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
      data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
    }
  },
  Brightness: (value: number) => (imageData: ImageData) => {
    // value between -255 and 255
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] += value;
      data[i + 1] += value;
      data[i + 2] += value;
    }
  }
};

/**
 * Properties for an Image node.
 */
export interface ImageProps extends NodeProps {
  image?: HTMLImageElement; // Pre-loaded image element
  src?: string; // URL string
  width?: number;
  height?: number;
  srcX?: number;
  srcY?: number;
  srcWidth?: number;
  srcHeight?: number;
  filters?: FilterFunction[]; // Custom pixel-level filters
}

/**
 * An image node that renders a bitmap image.
 * Supports loading from URL or using an existing HTMLImageElement.
 */
export class Image extends Node {
  declare props: ImageProps;
  private imageObj: HTMLImageElement | null = null;
  private filteredCanvas: HTMLCanvasElement | null = null;
  private isDirtyFilters: boolean = true;

  constructor(props: ImageProps = {}) {
    super(props);
    this.updateImage(props);
  }

  setProps(newProps: Partial<ImageProps>) {
    super.setProps(newProps);
    if (newProps.src || newProps.image) {
        this.updateImage(this.props);
    }
    if (newProps.filters !== undefined) {
        this.isDirtyFilters = true;
        this.requestRedraw();
    }
  }

  /**
   * Updates the internal image object based on props.
   * Uses AssetManager to load images.
   */
  private updateImage(props: ImageProps) {
    this.isDirtyFilters = true;
    if (props.image) {
      this.imageObj = props.image;
      this.requestRedraw();
    } else if (props.src) {
      // Check cache first
      const cached = Assets.getImage(props.src);
      if (cached) {
          this.imageObj = cached;
          this.requestRedraw();
      } else {
          // Load async
          Assets.loadImage(props.src).then(img => {
              // Check if src is still the same (user might have changed it while loading)
              if (this.props.src === props.src) {
                  this.imageObj = img;
                  this.requestRedraw();
              }
          }).catch(err => {
              console.error(`Failed to load image: ${props.src}`, err);
          });
      }
    }
  }

  private applyFilters() {
    if (!this.imageObj || !this.imageObj.complete || this.imageObj.naturalWidth === 0) return;
    
    if (!this.props.filters || this.props.filters.length === 0) {
      this.filteredCanvas = null;
      this.isDirtyFilters = false;
      return;
    }

    if (!this.filteredCanvas) {
      this.filteredCanvas = document.createElement('canvas');
    }

    const canvas = this.filteredCanvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = this.imageObj.width;
    canvas.height = this.imageObj.height;

    // Draw original image
    ctx.drawImage(this.imageObj, 0, 0);

    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Apply all filters sequentially
        this.props.filters.forEach(filter => filter(imageData));
        
        ctx.putImageData(imageData, 0, 0);
    } catch (e) {
        // May fail due to CORS if image is not loaded with crossOrigin="anonymous"
        console.warn('Canvas filter failed (likely CORS issue):', e);
        this.filteredCanvas = null; // fallback to original
    }

    this.isDirtyFilters = false;
  }

  getSelfBounds() {
    const { width, height } = this.props;
    let w = 0;
    let h = 0;
    
    if (width !== undefined && height !== undefined) {
        w = width;
        h = height;
    } else if (this.imageObj) {
        w = width || this.imageObj.width;
        h = height || this.imageObj.height;
    }
    
    return { x: 0, y: 0, width: w, height: h };
  }

  /**
   * Draws the image if it is loaded.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const { width, height, srcX, srcY, srcWidth, srcHeight } = this.props;
    
    if (this.imageObj && (this.imageObj.complete || (this.imageObj as any)._isMock)) {
      const w = width || this.imageObj.width;
      const h = height || this.imageObj.height;

      if (this.isDirtyFilters) {
        this.applyFilters();
      }

      const sourceToDraw = this.filteredCanvas || this.imageObj;
      
      if (srcX !== undefined && srcY !== undefined && srcWidth !== undefined && srcHeight !== undefined) {
          ctx.drawImage(sourceToDraw, srcX, srcY, srcWidth, srcHeight, 0, 0, w, h);
      } else {
          ctx.drawImage(sourceToDraw, 0, 0, w, h);
      }
    }
  }
}
