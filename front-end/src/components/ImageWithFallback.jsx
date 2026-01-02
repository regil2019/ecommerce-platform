// src/components/ImageWithFallback.jsx
import React, { useState } from 'react';

export default function ImageWithFallback({ src, alt, fallbackSrc = '/images/placeholder.jpg', ...props }) {
  const [imgSrc, setImgSrc] = useState(src);
  
  return (
    <img 
      src={imgSrc} 
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
}