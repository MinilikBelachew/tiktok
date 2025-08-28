import React, { useState, useEffect } from 'react';

interface TikTokBannerProps {
  className?: string;
}

const TikTokBanner: React.FC<TikTokBannerProps> = ({ className = '' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<boolean[]>([]);

  // Use your actual local images here (adjust filenames as needed)
  const bannerImages = [
    '/banner/tiktok-1.jpg',
    '/banner/tiktok-2.jpg',
    '/banner/tiktok-3.jpg',
    '/logo/pk-logo.jpg',
  ];

  useEffect(() => {
    setImageErrors(new Array(bannerImages.length).fill(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  return (
    <div className={`relative overflow-hidden w-full h-64 ${className}`}>
      {/* Container for the images with the sliding transition */}
      <div 
        className="relative w-full h-full whitespace-nowrap transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
      >
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className="inline-block w-full h-full"
          >
            <img
              src={image}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover"
              onError={() => handleImageError(index)}
              style={{ display: imageErrors[index] ? 'none' : 'block' }}
            />
          </div>
        ))}
      </div>
      {/* Carousel Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {bannerImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentImageIndex 
                ? 'bg-white' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentImageIndex(prev =>
          prev === 0 ? bannerImages.length - 1 : prev - 1
        )}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentImageIndex(prev =>
          prev === bannerImages.length - 1 ? 0 : prev + 1
        )}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default TikTokBanner;