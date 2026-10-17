/**
 * Universal Image Loader for Datta Sable Dashboards Showcase Image.
 * Works seamlessly in Browser (Vite dev/production via fetch) and Node.js (via fs).
 */

let cachedImageBuffer: Uint8Array | null = null;

export async function getDattaSableImageBuffer(): Promise<Uint8Array | null> {
  if (cachedImageBuffer) {
    return cachedImageBuffer;
  }

  // 1. Browser Environment
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/dattasable.com.png');
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        cachedImageBuffer = new Uint8Array(arrayBuf);
        return cachedImageBuffer;
      }
    } catch (e) {
      console.warn('Browser fetch for /dattasable.com.png failed:', e);
    }
  }

  // 2. Node.js Environment (Test scripts & SSR)
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const fsModuleName = 'fs';
      const pathModuleName = 'path';
      const fs = await import(/* @vite-ignore */ fsModuleName);
      const path = await import(/* @vite-ignore */ pathModuleName);
      const candidatePaths = [
        path.resolve(process.cwd(), 'public/dattasable.com.png'),
        path.resolve('public/dattasable.com.png'),
        path.resolve(process.cwd(), 'dist/dattasable.com.png'),
      ];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          cachedImageBuffer = new Uint8Array(buf);
          return cachedImageBuffer;
        }
      }
    } catch (e) {
      console.warn('Node.js fs read for public/dattasable.com.png failed:', e);
    }
  }

  return null;
}
