export type ImageCompressionOptions = {
  /** Long edge maximum in pixels (e.g. 1600). */
  maxDimension: number;
  /** 0..1 JPEG quality (e.g. 0.82). */
  quality: number;
  /** Output mime type. Prefer JPEG for broad compatibility. */
  mimeType: "image/jpeg" | "image/webp";
};

const DEFAULTS: ImageCompressionOptions = {
  maxDimension: 1600,
  quality: 0.82,
  mimeType: "image/jpeg",
};

function safeFileName(baseName: string, ext: string) {
  const withoutExt = baseName.replace(/\.[^/.]+$/, "");
  return `${withoutExt || "upload"}.${ext}`;
}

async function decodeToCanvas(file: File): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  const canvas = document.createElement("canvas");

  if (typeof createImageBitmap === "function") {
    const bmp = await createImageBitmap(file);
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(bmp, 0, 0);
    bmp.close?.();
    return { canvas, width: canvas.width, height: canvas.height };
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image decode failed"));
      el.src = url;
    });
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(img, 0, 0);
    return { canvas, width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downscale(canvas: HTMLCanvasElement, maxDimension: number) {
  const srcW = canvas.width;
  const srcH = canvas.height;
  const longEdge = Math.max(srcW, srcH);
  if (!longEdge || longEdge <= maxDimension) return canvas;

  const scale = maxDimension / longEdge;
  const dstW = Math.max(1, Math.round(srcW * scale));
  const dstH = Math.max(1, Math.round(srcH * scale));

  const out = document.createElement("canvas");
  out.width = dstW;
  out.height = dstH;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(canvas, 0, 0, dstW, dstH);
  return out;
}

async function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Image encode failed"))),
      mimeType,
      quality,
    );
  });
}

/**
 * Best-effort compression for mobile camera photos to improve upload reliability.
 * If compression fails, returns the original file.
 */
export async function compressImageFile(
  file: File,
  options: Partial<ImageCompressionOptions> = {},
): Promise<{ file: File; didCompress: boolean; originalBytes: number; finalBytes: number }> {
  const originalBytes = file.size;
  if (!file.type.startsWith("image/")) {
    return { file, didCompress: false, originalBytes, finalBytes: originalBytes };
  }

  const opts: ImageCompressionOptions = { ...DEFAULTS, ...options };

  try {
    const { canvas } = await decodeToCanvas(file);
    const scaled = downscale(canvas, opts.maxDimension);
    const blob = await canvasToBlob(scaled, opts.mimeType, opts.quality);

    const ext = opts.mimeType === "image/webp" ? "webp" : "jpg";
    const outFile = new File([blob], safeFileName(file.name, ext), { type: opts.mimeType, lastModified: Date.now() });

    // If we somehow got bigger, keep original.
    if (outFile.size >= originalBytes) {
      return { file, didCompress: false, originalBytes, finalBytes: originalBytes };
    }
    return { file: outFile, didCompress: true, originalBytes, finalBytes: outFile.size };
  } catch {
    return { file, didCompress: false, originalBytes, finalBytes: originalBytes };
  }
}

