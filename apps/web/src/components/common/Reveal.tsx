"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils"; // Assuming utils is available here, otherwise I'll use a direct helper

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  className?: string;
  delay?: number;
}

export const Reveal = ({ children, width = "fit-content", className, delay = 0 }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // One-shot: reveal on first intersection and stop observing so the
        // header doesn't re-animate every time it scrolls in and out.
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ width }}
      className={cn(
        "transition-all duration-500 ease-out transform will-change-transform",
        isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4",
        className
      )}
    >
        <div style={{ transitionDelay: `${delay}ms` }} className="h-full w-full">
            {children}
        </div>
    </div>
  );
};
