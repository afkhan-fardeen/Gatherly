const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const MAX_SIZE_MB = 1;
const QUALITY_STEP = 0.1;

/** Compress an image file before upload. Resizes if too large and reduces quality to stay under max size. */
export async function compressImage(file: File): Promise<File> {
  // GIF: skip compression to preserve animation
  if (file.type === "image/gif") {
    return file;
  }

  let quality = 0.85;
  let blob = await compressToBlob(file, quality);

  while (blob.size > MAX_SIZE_MB * 1024 * 1024 && quality > 0.2) {
    quality -= QUALITY_STEP;
    blob = await compressToBlob(file, quality);
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

async function compressToBlob(file: File, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}
