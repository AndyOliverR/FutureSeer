"use client";
import { useEffect, useRef, useState, RefObject } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
}

/**
 * Shared hook for IntersectionObserver that reuses observer instances
 * Optimizes performance by reducing memory overhead
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T | null>, boolean] {
  const elementRef = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create observer with options
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
          }
        });
      },
      {
        threshold: options.threshold ?? 0,
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? "0px",
      }
    );

    observerRef.current = observer;
    observer.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [options.threshold, options.root, options.rootMargin]);

  return [elementRef, isIntersecting];
}

/**
 * Hook for observing multiple elements with shared observer instance
 */
export function useIntersectionObserverMultiple<T extends HTMLElement = HTMLDivElement>(
  selector: string,
  options: UseIntersectionObserverOptions = {},
  onIntersect?: (index: number) => void
): [number[], () => void] {
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observeElements = () => {
    // Cleanup existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const elements = document.querySelectorAll<T>(selector);
    if (elements.length === 0) return;

    // Create shared observer instance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setVisibleIndices((prev) => (prev.includes(index) ? prev : [...prev, index]));
          }
        });
      },
      {
        threshold: options.threshold ?? 0,
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? "0px",
      }
    );

    observerRef.current = observer;
    elements.forEach((element) => observer.observe(element));
  };

  useEffect(() => {
    observeElements();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [selector, options.threshold, options.root, options.rootMargin]);

  return [visibleIndices, observeElements];
}
