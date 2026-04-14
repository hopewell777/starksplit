"use client";

import { useState } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export const AnimatedText = ({ text, className = "" }: AnimatedTextProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [animatedText, setAnimatedText] = useState(text);

  // Generate random alphabet characters
  const getRandomChar = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    // Animate each character to random then back to original
    const chars = text.split('');
    const promises = chars.map((char, index) =>
      new Promise(resolve => {
        setTimeout(() => {
          // Set to random char
          setAnimatedText(prev => {
            const arr = prev.split('');
            arr[index] = getRandomChar();
            return arr.join('');
          });

          // Then back to original after a short delay
          setTimeout(() => {
            setAnimatedText(prev => {
              const arr = prev.split('');
              arr[index] = char;
              return arr.join('');
            });
            resolve(true);
          }, 100 + Math.random() * 200); // Random delay for each char
        }, index * 50); // Stagger start time
      })
    );

    Promise.all(promises).then(() => {
      // Reset to original text after animation completes
      setTimeout(() => {
        setAnimatedText(text);
      }, 500);
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Ensure we return to original text
    setAnimatedText(text);
  };

  return (
    <span
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {animatedText}
    </span>
  );
};