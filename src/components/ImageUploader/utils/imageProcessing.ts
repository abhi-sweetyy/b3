import Konva from 'konva';

export function calculateDimensions(
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
) {
  let width = image.width;
  let height = image.height;
  const aspectRatio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width, height };
}

export function setupImageFilters(konvaImage: Konva.Image) {
  konvaImage.cache();
  konvaImage.filters([
    Konva.Filters.Brighten,
    Konva.Filters.Contrast,
    Konva.Filters.Blur
  ]);
  konvaImage.brightness(0);
  konvaImage.contrast(1);
  konvaImage.blurRadius(0);
}

export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

export function applyBlurToRegion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strength: number
) {
  if (typeof ctx.filter !== 'undefined') {
    ctx.filter = `blur(${strength}px)`;
  } else {
    // Fallback blur implementation for browsers that don't support ctx.filter
    const imageData = ctx.getImageData(x, y, width, height);
    const pixels = imageData.data;
    boxBlur(pixels, width, height, strength);
    ctx.putImageData(imageData, x, y);
  }
}

function boxBlur(pixels: Uint8ClampedArray, width: number, height: number, radius: number) {
  const size = radius * 2 + 1;
  const divisor = size * size;

  for (let i = 0; i < pixels.length; i += 4) {
    let r = 0, g = 0, b = 0, a = 0;
    let count = 0;

    // Sample surrounding pixels
    for (let ky = -radius; ky <= radius; ky++) {
      for (let kx = -radius; kx <= radius; kx++) {
        const idx = i + (ky * width + kx) * 4;
        if (idx >= 0 && idx < pixels.length) {
          r += pixels[idx];
          g += pixels[idx + 1];
          b += pixels[idx + 2];
          a += pixels[idx + 3];
          count++;
        }
      }
    }

    // Average the values
    pixels[i] = r / count;
    pixels[i + 1] = g / count;
    pixels[i + 2] = b / count;
    pixels[i + 3] = a / count;
  }
} 