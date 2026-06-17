const loadImageFromFile = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    image.src = url;
  });

const canvasToJpegFile = (canvas, fileName, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to compress image'));
          return;
        }

        resolve(
          new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
        );
      },
      'image/jpeg',
      quality
    );
  });

/**
 * Compress a profile image before registration upload.
 * Keeps mobile uploads small enough to avoid network timeouts.
 */
export const compressImageFile = async (
  file,
  { maxWidth = 1280, maxHeight = 1280, quality = 0.82, maxSizeBytes = 800 * 1024 } = {}
) => {
  if (!file || !file.type?.startsWith('image/')) {
    return file;
  }

  // Always compress larger uploads; mobile camera photos are often 2-8MB.
  if (file.size <= 400 * 1024 && file.type === 'image/jpeg') {
    return file;
  }

  const image = await loadImageFromFile(file);
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, width, height);

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
  const file = new File([blob], 'selfie.jpg', { type: blob.type || 'image/jpeg' });
  return compressImageFile(file, options);
};
