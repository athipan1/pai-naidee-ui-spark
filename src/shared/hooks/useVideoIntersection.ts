import { useEffect, useRef, useState } from "react";

interface UseVideoIntersectionProps {
  threshold?: number;
  rootMargin?: string;
}

export const useVideoIntersection = ({
  threshold = 0.5,
  rootMargin = "0px",
}: UseVideoIntersectionProps = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting) {
          video.play().catch(console.error);
        } else {
          video.pause();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, [threshold, rootMargin]);

  return { ref, isIntersecting };
};
