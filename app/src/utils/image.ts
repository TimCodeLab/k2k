// Feature 4: Low-Bandwidth Compression Engine.
// Resize + re-encode an image on the client (HTML Canvas) BEFORE upload.
export async function compressImage(file: File, maxDim?: number, quality = 0.7): Promise<Blob> {
  // For web mobile applications, adapt the max dimension based on viewport width
  const deviceMaxDim = maxDim ?? (typeof window !== 'undefined' && window.innerWidth < 768 ? 640 : 1024);
  
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  let { width, height } = img;
  if (width > height && width > deviceMaxDim) { height = Math.round((height * deviceMaxDim) / width); width = deviceMaxDim; }
  else if (height > deviceMaxDim) { width = Math.round((width * deviceMaxDim) / height); height = deviceMaxDim; }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), 'image/jpeg', quality),
  );
}
