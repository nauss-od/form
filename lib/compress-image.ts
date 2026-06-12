// هدف: الملف النهائي < 1.5MB لضمان أن الطلب كاملاً (ملفان + نص) يبقى تحت 4.5MB حد Vercel
const TARGET_SIZE = 1.5 * 1024 * 1024;
const MAX_DIM = 1600;

export function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return Promise.resolve(file);
  if (file.size <= TARGET_SIZE) return Promise.resolve(file);

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        // تصغير الأبعاد إذا كانت كبيرة جداً
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width >= height) {
            height = Math.round((height / width) * MAX_DIM);
            width = MAX_DIM;
          } else {
            width = Math.round((width / height) * MAX_DIM);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);

        function tryCompress(q: number, dim: number) {
          canvas.toBlob((blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size <= TARGET_SIZE) {
              const name = file.name.replace(/\.[^.]+$/i, '.jpg');
              resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
              return;
            }
            if (q <= 0.3) {
              // آخر محاولة: تصغير الأبعاد إلى النصف
              if (dim > 400) {
                const newDim = Math.round(dim * 0.6);
                const c2 = document.createElement('canvas');
                const ratio = newDim / Math.max(img.naturalWidth, img.naturalHeight);
                c2.width = Math.round(img.naturalWidth * ratio);
                c2.height = Math.round(img.naturalHeight * ratio);
                const ctx2 = c2.getContext('2d');
                if (ctx2) {
                  ctx2.drawImage(img, 0, 0, c2.width, c2.height);
                  c2.toBlob((b) => {
                    const name = file.name.replace(/\.[^.]+$/i, '.jpg');
                    resolve(new File([b || blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
                  }, 'image/jpeg', 0.5);
                  return;
                }
              }
              const name = file.name.replace(/\.[^.]+$/i, '.jpg');
              resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
              return;
            }
            tryCompress(q - 0.1, dim);
          }, 'image/jpeg', q);
        }

        tryCompress(0.82, Math.max(width, height));
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
