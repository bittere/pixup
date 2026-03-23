export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Invalid file type'));
        return;
    }
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function upscale(
  sourceImage: HTMLImageElement,
  scale: number,
  inputCanvas: HTMLCanvasElement,
  outputCanvas: HTMLCanvasElement
): { width: number; height: number } {
  const sw = sourceImage.width;
  const sh = sourceImage.height;
  const dw = sw * scale;
  const dh = sh * scale;

  // Read pixels from input
  const srcCtx = inputCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Could not get 2D context from input canvas');
  const srcData = srcCtx.getImageData(0, 0, sw, sh);

  // Draw to output with nearest-neighbor (no smoothing)
  outputCanvas.width = dw;
  outputCanvas.height = dh;
  const dstCtx = outputCanvas.getContext('2d');
  if (!dstCtx) throw new Error('Could not get 2D context from output canvas');
  dstCtx.imageSmoothingEnabled = false;

  // Use a temp canvas then scale
  const tmp = document.createElement('canvas');
  tmp.width = sw;
  tmp.height = sh;
  const tmpCtx = tmp.getContext('2d');
  if (!tmpCtx) throw new Error('Could not get 2D context from temp canvas');
  tmpCtx.putImageData(srcData, 0, 0);

  dstCtx.drawImage(tmp, 0, 0, sw, sh, 0, 0, dw, dh);
  return { width: dw, height: dh };
}
