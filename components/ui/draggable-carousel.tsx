"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import Image from "next/image";

interface SlideData {
  title: string;
  button?: string;
  src: string;
}

interface DraggableCarouselProps {
  slides: SlideData[];
}

// Arrow Button components
const PrevButton = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
  <button
    className="embla__button embla__button--prev"
    onClick={onClick}
    disabled={disabled}
    aria-label="Previous slide"
    style={{
      position: 'absolute',
      left: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 20,
      backgroundColor: 'white',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: 'none',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1
    }}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

const NextButton = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
  <button
    className="embla__button embla__button--next"
    onClick={onClick}
    disabled={disabled}
    aria-label="Next slide"
    style={{
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 20,
      backgroundColor: 'white',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: 'none',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1
    }}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

export function DraggableCarousel({ slides }: DraggableCarouselProps) {
  // Basic carousel configuration that works properly
  const options: EmblaOptionsType = {
    loop: false,
    align: "center",
    containScroll: "trimSnaps", // Changed to trimSnaps for better positioning
    dragFree: true,
    skipSnaps: false,
    startIndex: 1,
  };
  
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [slidePositions, setSlidePositions] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(1);
  
  // Calculate slide positions relative to center
  const calculateSlidePositions = useCallback(() => {
    if (!emblaApi) return [];
    
    const scrollProgress = emblaApi.scrollProgress();
    const scrollSnapList = emblaApi.scrollSnapList();
    
    return slides.map((_, index) => {
      const snapPosition = scrollSnapList[index] || 0;
      const distance = snapPosition - scrollProgress;
      return -distance; // Negative to match UI expectations
    });
  }, [emblaApi, slides]);
  
  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
    setSlidePositions(calculateSlidePositions());
  }, [emblaApi, calculateSlidePositions]);
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  // Initialize the carousel
  useEffect(() => {
    if (!emblaApi) return;
    
    const initCarousel = () => {
      emblaApi.scrollTo(1);
      setSelectedIndex(1);
      onScroll();
    };
    
    // Add event listeners
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
    emblaApi.on("settle", onScroll);
    
    // Initialize with a short delay to ensure proper rendering
    const timer = setTimeout(initCarousel, 100);
    
    return () => {
      clearTimeout(timer);
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onScroll);
      emblaApi.off("settle", onScroll);
    };
  }, [emblaApi, onScroll, calculateSlidePositions]);
  
  return (
    <div className="relative w-full mx-auto" style={{ maxWidth: "700px", height: "500px" }}>
      <div className="overflow-hidden h-full w-full py-8" ref={emblaRef}>
        <div className="flex h-full items-center" style={{ transform: "translateX(0)" }}>
          {slides.map((slide, i) => (
            <Slide 
              key={i}
              slide={slide} 
              index={i} 
              position={slidePositions[i] || 0}
            />
          ))}
        </div>
      </div>
      
      <PrevButton onClick={scrollPrev} disabled={prevBtnDisabled} />
      <NextButton onClick={scrollNext} disabled={nextBtnDisabled} />
      
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-black font-medium">
          Slide {selectedIndex + 1} of {slides.length}
        </p>
      </div>
    </div>
  );
}

interface SlideProps {
  slide: SlideData;
  index: number;
  position: number;
}

const Slide = ({ slide, index, position }: SlideProps) => {
  const slideRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>(0);
  const rotateXRef = useRef(0);
  const rotateYRef = useRef(0);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;
      const x = xRef.current;
      const y = yRef.current;
      
      // Convert mouse position to rotation angles
      const rotateX = y * 0.05;
      const rotateY = x * -0.05;
      
      rotateXRef.current = rotateX;
      rotateYRef.current = rotateY;
      
      slideRef.current.style.setProperty("--rotateX", `${rotateX}deg`);
      slideRef.current.style.setProperty("--rotateY", `${rotateY}deg`);
      
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
    if (Math.abs(position) > 0.5) return;
    
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

  const { src, title } = slide;
  
  // Determine if the card is inside the container (center area)
  const isInContainer = Math.abs(position) <= 0.5;
  
  // More subtle rotation based on position
  const getRotation = () => {
    // Reduced rotation from 4 to 2.5 degrees for more subtlety
    // Negative position → positive rotation (right), positive position → negative rotation (left)
    const absPosition = Math.abs(position);
    
    if (absPosition < 0.1) {
      // Very close to center - gradually reduce rotation to 0
      return -(absPosition / 0.1) * 2.5 * Math.sign(position);
    } else {
      // Away from center - more subtle rotation
      return -2.5 * Math.sign(position);
    }
  };
  
  // Keep the smooth scale transitions
  const getScale = () => {
    // Linear scale transition based on position
    // Center (position = 0) -> scale = 1.0
    // As position increases, scale decreases linearly to 0.8
    const minScale = 0.8;
    const maxScale = 1.0;
    const scaleRange = maxScale - minScale;
    
    // Linear interpolation with position
    // Position 0 -> scale 1.0
    // Position ±0.5 or greater -> scale 0.8
    const absPosition = Math.abs(position);
    if (absPosition >= 0.5) {
      return minScale; // Minimum scale for cards far from center
    } else {
      // Smooth linear transition for cards approaching center
      return maxScale - (absPosition / 0.5) * scaleRange;
    }
  };
  
  // Get opacity based on distance from center - smoother
  const getOpacity = () => {
    const absPosition = Math.abs(position);
    if (absPosition <= 0.5) return 1;
    if (absPosition <= 1.5) return 0.9; // Less opacity drop
    return 0.8; // Higher minimum opacity
  };
  
  return (
    <div
      ref={slideRef}
      className="flex-none mx-1"
      style={{
        width: "220px",
        height: "400px",
        position: "relative",
        transform: `translateX(0) rotate(${getRotation()}deg)`,
        scale: getScale().toString(),
        opacity: getOpacity(),
        zIndex: 10 - Math.abs(position) * 5,
        transition: "transform 0.1s linear, scale 0.1s linear", // Fast, linear transitions
        willChange: "transform, scale",
        transformOrigin: "center center",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="w-full h-[300px] rounded-xl overflow-hidden shadow-lg flex flex-col"
        style={{
          transform: isInContainer
            ? `rotateX(var(--rotateX, 0deg)) rotateY(var(--rotateY, 0deg))` 
            : "none",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          background: "white",
          transformStyle: "preserve-3d",
          transition: "transform 0.2s ease-out",
        }}
      >
        {/* Card number indicator */}
        <div className="absolute top-2 right-2 z-10 bg-black bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
          {index + 1}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <Image
            className="w-full h-full object-cover"
            alt={title}
            src={src}
            width={220}
            height={400}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
} 