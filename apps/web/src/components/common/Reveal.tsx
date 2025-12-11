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
        // Bidirectional: Update state based on isIntersecting
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 } // Slightly higher threshold to avoid flickering at edges
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
        if (ref.current) {
            observer.disconnect();
        }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ width }}
      className={cn(
        "transition-all duration-1000 ease-out transform will-change-transform",
        isVisible 
            ? "opacity-100 translate-y-0 scale-100 blur-0" 
            : "opacity-0 translate-y-12 scale-95 blur-sm",
        className
      )}
    >
        <div style={{ transitionDelay: `${delay}ms` }} className="h-full w-full">
            {children}
        </div>
    </div>
  );
};
