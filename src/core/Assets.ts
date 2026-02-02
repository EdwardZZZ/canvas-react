/**
 * Simple Asset Manager for caching and loading images.
 */
export class AssetManager {
    private static instance: AssetManager;
    private cache: Map<string, HTMLImageElement> = new Map();
    private pending: Map<string, Promise<HTMLImageElement>> = new Map();

    private constructor() {}

    static getInstance(): AssetManager {
        if (!AssetManager.instance) {
            AssetManager.instance = new AssetManager();
        }
        return AssetManager.instance;
    }

    /**
     * Loads an image from URL. Returns a promise that resolves with the image.
     * If image is already loaded, resolves immediately.
     */
    loadImage(url: string): Promise<HTMLImageElement> {
        if (this.cache.has(url)) {
            return Promise.resolve(this.cache.get(url)!);
        }

        if (this.pending.has(url)) {
            return this.pending.get(url)!;
        }

        const promise = new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                this.cache.set(url, img);
                this.pending.delete(url);
                resolve(img);
            };
            img.onerror = (e) => {
                this.pending.delete(url);
                reject(e);
            };
            img.src = url;
        });

        this.pending.set(url, promise);
        return promise;
    }

    /**
     * Synchronously get image if it's loaded.
     */
    getImage(url: string): HTMLImageElement | undefined {
        return this.cache.get(url);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.pending.clear();
    }
}

export const Assets = AssetManager.getInstance();
