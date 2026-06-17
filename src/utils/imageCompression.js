const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'heif']);

export const isImageFile = (file) => {
  if (!file) {
    return false;
  }

  if (file.type?.startsWith('image/')) {
    return true;
  }

  const extension = (file.name || '').split('.').pop()?.toLowerCase();
  return IMAGE_EXTENSIONS.has(extension);
};

const loadImageFromBitmap = async (file) => {
  if (typeof createImageBitmap !== 'function') {
    return null;
  }

  try {
    const bitmap = await createImageBitmap(file);
    return {
      drawTarget: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      cleanup: () => bitmap.close?.(),
    };
  } catch {
    return null;
  }
};

const loadImageFromObjectUrl = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        drawTarget: image,
        width: image.width,
        height: image.height,
        cleanup: () => {},
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image from object URL'));
    };

    image.src = url;
  });

const loadImageFromDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        resolve({
          drawTarget: image,
          width: image.width,
          height: image.height,
          cleanup: () => {},
        });
      };

      image.onerror = () => reject(new Error('Failed to load image from data URL'));
      image.src = reader.result;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

const loadImageSource = async (file) => {
  const loaders = [loadImageFromBitmap, loadImageFromObjectUrl, loadImageFromDataUrl];
  let lastError = null;

  for (const loader of loaders) {
    try {
      const source = await loader(file);
      if (source?.width > 0 && source?.height > 0) {
        return source;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to load image for compression');
};

const canvasToJpegFile = (canvas, fileName, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to compress image'));
          return;
        }

        const safeName = (fileName || 'profile.jpg').replace(/\.[^.]+$/, '') + '.jpg';
        resolve(
          new File([blob], safeName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
        );
      },
      'image/jpeg',
      quality
    );
  });

const drawImageToCanvas = (source, maxWidth, maxHeight) => {
  const scale = Math.min(1, maxWidth / source.width, maxHeight / source.height);
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.drawImage(source.drawTarget, 0, 0, width, height);
  source.cleanup?.();

  return canvas;
};

/**
 * Compress a profile image before registration upload.
 * Keeps mobile uploads small enough to avoid network timeouts.
 */
export const compressImageFile = async (
  file,
  { maxWidth = 1024, maxHeight = 1024, quality = 0.78, maxSizeBytes = 500 * 1024 } = {}
) => {
  if (!file || !isImageFile(file)) {
    return file;
  }

  if (file.size <= 250 * 1024 && (file.type === 'image/jpeg' || file.name?.toLowerCase().endsWith('.jpg'))) {
    return file;
  }

  const source = await loadImageSource(file);
  const canvas = drawImageToCanvas(source, maxWidth, maxHeight);

  let currentQuality = quality;
  let compressedFile = await canvasToJpegFile(canvas, file.name || 'profile.jpg', currentQuality);

  while (compressedFile.size > maxSizeBytes && currentQuality > 0.45) {
    currentQuality -= 0.08;
    compressedFile = await canvasToJpegFile(canvas, file.name || 'profile.jpg', currentQuality);
  }

  return compressedFile;
};

export const compressDataUrl = async (dataUrl, options = {}) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], 'selfie.jpg', {
    type: blob.type?.startsWith('image/') ? blob.type : 'image/jpeg',
  });
  return compressImageFile(file, options);
};

/**
 * Compress image for upload; fall back to original file if compression fails on mobile browsers.
 */
export const prepareProfileImageForUpload = async (file, options = {}) => {
  const maxUploadBytes = 5 * 1024 * 1024;

  if (!file) {
    return null;
  }

  if (!isImageFile(file)) {
    throw new Error('Please upload a valid image file (JPG or PNG).');
  }

  if (file.size > maxUploadBytes) {
    throw new Error('Image size exceeds 5MB limit. Please choose a smaller photo.');
  }

  try {
    const compressed = await compressImageFile(file, options);
    return {
      file: compressed,
      strategy: 'compressed',
      originalSizeKb: Math.round(file.size / 1024),
      finalSizeKb: Math.round(compressed.size / 1024),
    };
  } catch (compressionError) {
    return {
      file,
      strategy: 'original_fallback',
      originalSizeKb: Math.round(file.size / 1024),
      finalSizeKb: Math.round(file.size / 1024),
      fallbackReason: compressionError?.message || 'compression_failed',
    };
  }
};

export const prepareDataUrlForUpload = async (dataUrl, options = {}) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], 'selfie.jpg', {
    type: blob.type?.startsWith('image/') ? blob.type : 'image/jpeg',
  });
  return prepareProfileImageForUpload(file, options);
};
