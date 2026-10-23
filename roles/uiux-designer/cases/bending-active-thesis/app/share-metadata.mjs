// Page-only social declarations: root/error metadata must not inherit a case preview.
// Existing WebP sources are reused without a derivative or a promised platform crop.
export function withShareMetadata(metadata, image) {
  const {title, description, alternates} = metadata;
  const images = image ? [{url: image.src, width: image.width, height: image.height, type: 'image/webp', alt: image.alt}] : undefined;
  return {
    ...metadata,
    openGraph: {
      type: 'website', title, description, url: alternates.canonical,
      ...(images ? {images} : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary', title, description,
      ...(image ? {images: [{url: image.src, alt: image.alt}]} : {}),
    },
  };
}
