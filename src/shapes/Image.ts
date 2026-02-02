import { Node, NodeProps } from '../core/Node';
import { Assets } from '../core/Assets';

/**
 * Properties for an Image node.
 */
export interface ImageProps extends NodeProps {
  image?: HTMLImageElement; // Pre-loaded image element
  src?: string; // URL string
  width?: number;
  height?: number;
}

/**
 * An image node that renders a bitmap image.
 * Supports loading from URL or using an existing HTMLImageElement.
 */
export class Image extends Node {
  declare props: ImageProps;
  private imageObj: HTMLImageElement | null = null;

  constructor(props: ImageProps = {}) {
    super(props);
    this.updateImage(props);
  }

  setProps(newProps: Partial<ImageProps>) {
    super.setProps(newProps);
    if (newProps.src || newProps.image) {
        this.updateImage(this.props);
    }
  }

  /**
   * Updates the internal image object based on props.
   * Uses AssetManager to load images.
   */
  private updateImage(props: ImageProps) {
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
    const { width, height } = this.props;
    
    if (this.imageObj && this.imageObj.complete && this.imageObj.naturalWidth > 0) {
      const w = width || this.imageObj.width;
      const h = height || this.imageObj.height;
      ctx.drawImage(this.imageObj, 0, 0, w, h);
    }
  }
}
