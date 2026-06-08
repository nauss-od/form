export function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return Promise.resolve(file);
  const targetSize = 1 * 1024 * 1024;
  if (file.size < targetSize) return Promise.resolve(file);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        const maxDim = 900;
        if (width > maxDim) {
          height = Math.round((height / width) * maxDim);
          width = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);
        function tryCompress(q: number) {
          canvas.toBlob((blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size < targetSize || q <= 0.25) {
              const name = file.name.replace(/\.[^.]+$/i, '.jpg');
              resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
            } else {
              tryCompress(q - 0.15);
            }
          }, 'image/jpeg', q);
        }
        tryCompress(0.7);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
