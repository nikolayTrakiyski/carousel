"use client";
import { useState, useRef, useId, useEffect } from "react";

interface SlideData {
  title: string;
  button?: string;
  src: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  totalSlides: number;
  offsetPercent: number;
  activeIndex: number;
  onSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, totalSlides, offsetPercent, activeIndex, onSlideClick }: SlideProps) => {
  const slideRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;
      const x = xRef.current;
      const y = yRef.current;
      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const { src, title } = slide;
  
  // Calculate position based on index, active index and drag offset
  const position = index - activeIndex - offsetPercent;
  
  // Only render slides that are in view or about to come into view
  if (position < -1.5 || position > 1.5) return null;
  
  // Calculate scale and opacity based on position
  const getScale = () => {
    const absPosition = Math.abs(position);
    if (absPosition <= 0.5) return 1; // Center
    if (absPosition <= 1.5) return 0.9; // Side
    return 0.8; // Further away
  };
  
  const getOpacity = () => {
    const absPosition = Math.abs(position);
    if (absPosition <= 0.5) return 1; // Center
    if (absPosition <= 1.5) return 0.7; // Side
    return 0.5; // Further away
  };
  
  // Calculate rotation
  const getRotation = () => {
    if (position > 0) return `rotate(2deg)`;
    if (position < 0) return `rotate(-2deg)`;
    return `rotate(0deg)`;
  };
  
  // Calculate horizontal position
  const getTranslateX = () => {
    // Base position
    const basePosition = position * 100;
    
    // Add extra margin to separate cards
    const margin = position === 0 ? 0 : Math.sign(position) * 20;
    
    return `${basePosition + margin}%`;
  };
  
  const getZIndex = () => {
    return 10 - Math.abs(position) * 5;
  };
  
  const handleClick = (e: React.MouseEvent) => {
    // Prevent default behavior to avoid any click-based navigation
    e.stopPropagation();
    e.preventDefault();
    // Don't navigate on click
  };
  
  return (
    <div
      ref={slideRef}
      className="absolute top-1/2 -translate-y-1/2 left-1/2 transition-all duration-300 ease-out cursor-pointer"
      style={{
        transform: `translateX(${getTranslateX()}) ${getRotation()} translateX(-50%)`,
        scale: getScale(),
        opacity: getOpacity(),
        zIndex: getZIndex(),
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div 
        className="relative w-[200px] h-[270px] rounded-xl overflow-hidden shadow-lg flex flex-col"
        style={{
          transform: position === 0 
            ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)" 
            : "none",
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
          background: "white",
          transition: "all 0.3s ease"
        }}
      >
        <div className="flex-1 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            alt={title}
            src={src}
            onLoad={imageLoaded}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};

interface CarouselProps {
  slides: SlideData[];
}

export function Carousel({ slides }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [offsetPercent, setOffsetPercent] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragStartTimeRef = useRef<number>(0);
  const dragStartedRef = useRef<boolean>(false);
  const dragThreshold = 10; // Minimum pixels to move before initiating drag
  
  const handleSlideClick = (index: number) => {
    // Do nothing when slides are clicked - we only want swipe navigation
  };
  
  const handleDragStart = (clientX: number) => {
    setStartX(clientX);
    setCurrentX(clientX);
    dragStartTimeRef.current = Date.now();
    // Don't set isDragging immediately - wait to see if they actually move
    dragStartedRef.current = false;
  };
  
  const handleDragMove = (clientX: number) => {
    setCurrentX(clientX);
    
    // Check if this is an actual drag or just a slight movement during a click
    if (!dragStartedRef.current) {
      if (Math.abs(clientX - startX) > dragThreshold) {
        dragStartedRef.current = true;
        setIsDragging(true);
      } else {
        return; // Not enough movement to count as a drag yet
      }
    }
    
    if (!isDragging || !carouselRef.current) return;
    
    const containerWidth = carouselRef.current.offsetWidth;
    const dragDistance = clientX - startX;
    // Reverse the drag direction to match natural scrolling
    const dragPercent = -dragDistance / containerWidth;
    
    // Limit drag at the edges
    if ((activeIndex === 0 && dragPercent > 0) || 
        (activeIndex === slides.length - 1 && dragPercent < 0)) {
      // Apply resistance at the edges - allow some movement but with more resistance
      setOffsetPercent(dragPercent * 0.2); 
    } else {
      setOffsetPercent(dragPercent);
    }
    
    setDragOffset(dragDistance);
  };
  
  const handleDragEnd = () => {
    if (!dragStartedRef.current) {
      // This was a click, not a drag
      setIsDragging(false);
      dragStartedRef.current = false;
      return;
    }
    
    if (!isDragging) return;
    
    // Calculate which slide to snap to based on drag distance
    let newIndex = activeIndex;
    
    // Calculate velocity for flick detection
    const endTime = Date.now();
    const timeDelta = endTime - dragStartTimeRef.current;
    const velocity = Math.abs(currentX - startX) / timeDelta;
    const isFlick = velocity > 0.5; // Threshold for considering it a "flick" gesture
    
    // If flicked quickly or dragged more than 15% of container width, change slide
    if (isFlick || Math.abs(offsetPercent) > 0.15) {
      // Reverse direction to match natural scrolling
      newIndex = offsetPercent < 0 
        ? Math.max(activeIndex - 1, 0)
        : Math.min(activeIndex + 1, slides.length - 1);
    }
    
    // Animate back to position
    setActiveIndex(newIndex);
    setOffsetPercent(0);
    setDragOffset(0);
    setIsDragging(false);
    dragStartedRef.current = false;
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag on right-click
    if (e.button !== 0) return;
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
    if (isDragging) {
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const id = useId();

  return (
    <div
      className="relative w-[600px] h-[300px] mx-auto touch-none select-none"
      style={{ touchAction: 'none' }}
      aria-labelledby={`carousel-heading-${id}`}
      ref={carouselRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full h-full relative flex items-center justify-center">
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            totalSlides={slides.length}
            offsetPercent={offsetPercent}
            activeIndex={activeIndex}
            onSlideClick={handleSlideClick}
          />
        ))}
      </div>
    </div>
  );
}
