/**
 * Represents a point in 2D space.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a 2D affine transformation matrix.
 * Used for translation, rotation, and scaling of nodes.
 * 
 * Matrix structure:
 * | a c e |
 * | b d f |
 * | 0 0 1 |
 */
export class Matrix2D {
  a: number = 1; // Scale X
  b: number = 0; // Skew Y
  c: number = 0; // Skew X
  d: number = 1; // Scale Y
  e: number = 0; // Translate X
  f: number = 0; // Translate Y

  constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
    this.set(a, b, c, d, e, f);
  }

  /**
   * Sets the matrix values.
   */
  set(a: number, b: number, c: number, d: number, e: number, f: number) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this;
  }

  /**
   * Resets the matrix to the identity matrix.
   */
  identity() {
    return this.set(1, 0, 0, 1, 0, 0);
  }

  /**
   * Multiplies this matrix by another matrix.
   * Result = This * Matrix
   */
  multiply(matrix: Matrix2D) {
    const a = this.a * matrix.a + this.c * matrix.b;
    const b = this.b * matrix.a + this.d * matrix.b;
    const c = this.a * matrix.c + this.c * matrix.d;
    const d = this.b * matrix.c + this.d * matrix.d;
    const e = this.a * matrix.e + this.c * matrix.f + this.e;
    const f = this.b * matrix.e + this.d * matrix.f + this.f;
    return this.set(a, b, c, d, e, f);
  }

  /**
   * Applies a translation to the matrix.
   */
  translate(x: number, y: number) {
    return this.multiply(new Matrix2D(1, 0, 0, 1, x, y));
  }

  /**
   * Applies a rotation to the matrix.
   * @param angle Rotation angle in radians.
   */
  rotate(angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return this.multiply(new Matrix2D(cos, sin, -sin, cos, 0, 0));
  }

  /**
   * Applies scaling to the matrix.
   */
  scale(x: number, y: number) {
    return this.multiply(new Matrix2D(x, 0, 0, y, 0, 0));
  }

  /**
   * Calculates and returns the inverse of this matrix.
   * Useful for coordinate conversion (Global -> Local).
   */
  invert(): Matrix2D {
    const det = this.a * this.d - this.b * this.c;
    if (det === 0) {
      return new Matrix2D();
    }
    const invDet = 1 / det;
    return new Matrix2D(
      this.d * invDet,
      -this.b * invDet,
      -this.c * invDet,
      this.a * invDet,
      (this.c * this.f - this.d * this.e) * invDet,
      (this.b * this.e - this.a * this.f) * invDet
    );
  }

  /**
   * Transforms a point using this matrix.
   */
  transformPoint(point: Point): Point {
    return {
      x: this.a * point.x + this.c * point.y + this.e,
      y: this.b * point.x + this.d * point.y + this.f,
    };
  }
  
  /**
   * Creates a copy of this matrix.
   */
  clone() {
      return new Matrix2D(this.a, this.b, this.c, this.d, this.e, this.f);
  }

  /**
   * Decomposes the matrix into translation, rotation, scale, and skew.
   */
  decompose() {
      const a = this.a;
      const b = this.b;
      const c = this.c;
      const d = this.d;

      const skewX = -Math.atan2(-c, d);
      const skewY = Math.atan2(b, a);

      const delta = Math.abs(skewX + skewY);

      let rotation = 0;
      let scaleX = 0;
      let scaleY = 0;

      if (delta < 0.00001 || Math.abs(Math.PI * 2 - delta) < 0.00001) {
          rotation = skewY;
          if (a < 0 && d >= 0) {
              rotation += rotation <= 0 ? Math.PI : -Math.PI;
          }
          scaleX = Math.sqrt(a * a + b * b);
          scaleY = Math.sqrt(c * c + d * d);
      } else {
          scaleX = a;
          scaleY = d;
      }

      return {
          x: this.e,
          y: this.f,
          scaleX,
          scaleY,
          rotation,
          skewX,
          skewY
      };
  }
}
