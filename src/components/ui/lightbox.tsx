"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface LightboxProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export function Lightbox({ images, initialIndex, isOpen, onClose }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    const next = useCallback(() => setCurrentIndex((prev) => (prev + 1) % images.length), [images.length]);
    const prev = useCallback(() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length), [images.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose, next, prev]);

    if (!isOpen) return null;

    if (typeof document === "undefined") return null;

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        if (Math.abs(diff) > 50) { // Threshold 50px
            if (diff > 0) next(); // Swipe Left -> Next
            else prev();          // Swipe Right -> Prev
        }
        setTouchStart(null);
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200 select-none pb-safe"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <button
                onClick={onClose}
                className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50 md:top-8 md:right-8"
            >
                <X className="h-8 w-8" />
            </button>

            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-2 md:left-8 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
                    >
                        <ChevronLeft className="h-8 w-8 md:h-12 md:w-12" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute right-2 md:right-8 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
                    >
                        <ChevronRight className="h-8 w-8 md:h-12 md:w-12" />
                    </button>
                </>
            )}

            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
                <img
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className="max-h-full max-w-full object-contain shadow-2xl rounded-sm transition-transform duration-200"
                    onClick={(e) => e.stopPropagation()}
                    draggable={false}
                />
            </div>

            {images.length > 1 && (
                <div className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`}
                        />
                    ))}
                </div>
            )}
        </div>,
        document.body
    );
}
