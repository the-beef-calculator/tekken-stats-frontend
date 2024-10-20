import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const EWGFLoadingAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  const inputs = [
    '/tekken-inputs/f.png',
    '/tekken-inputs/n.png',
    '/tekken-inputs/d.png',
    '/tekken-inputs/df.png',
    '/tekken-inputs/2.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % (inputs.length + 1));
    }, 170);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const imageSize = Math.min(windowWidth / 16, 50);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center justify-center h-16 mb-2">
        {inputs.slice(0, currentStep).map((input, index) => (
          <Image
            key={index}
            src={input}
            alt={`Input ${index + 1}`}
            width={imageSize}
            height={imageSize}
            className="inline-block transition-all duration-300 ease-in-out mx-1"
          />
        ))}
      </div>
      <p className="text-md text-gray-300 mt-2">Loading...</p>
    </div>
  );
};

export default EWGFLoadingAnimation;