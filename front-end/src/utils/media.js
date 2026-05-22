export function optimizeCloudinaryImage(url, { width = 300, height = 300, crop = 'fill' } = {}) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  if (/\/upload\/[^/]*f_auto/.test(url)) {
    return url;
  }

  const transformation = [`f_auto`, `q_auto`, `c_${crop}`];
  if (width) transformation.push(`w_${width}`);
  if (height) transformation.push(`h_${height}`);

  return url.replace('/upload/', `/upload/${transformation.join(',')}/`);
}
