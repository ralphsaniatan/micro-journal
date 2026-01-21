"use client";

import { useState } from "react";
import { Lightbox } from "@/components/ui/lightbox";

interface ImageGridProps {
    images: string[];
}

export function ImageGrid({ images }: ImageGridProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [idx, setIdx] = useState(0);

    const openLightbox = (index: number) => {
        setIdx(index);
        setIsOpen(true);
    };

    if (!images || images.length === 0) return null;

    const count = images.length;
    let gridContent;

    if (count === 1) {
        gridContent = (
            <div
                className="w-full cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => openLightbox(0)}
            >
                <img src={images[0]} alt="Media" className="w-full max-h-[500px] object-cover" />
            </div>
        );
    } else if (count === 2) {
        gridContent = (
            <div className="grid grid-cols-2 gap-0.5 w-full aspect-[3/2]">
                {images.map((src, i) => (
                    <div key={i} className="relative h-full cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openLightbox(i)}>
                        <img src={src} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        );
    } else if (count === 3) {
        gridContent = (
            <div className="grid grid-cols-2 gap-0.5 w-full aspect-[3/2]">
                <div className="relative h-full cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openLightbox(0)}>
                    <img src={images[0]} className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-rows-2 gap-0.5 h-full">
                    <div className="relative h-full cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openLightbox(1)}>
                        <img src={images[1]} className="w-full h-full object-cover" />
                    </div>
                    <div className="relative h-full cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openLightbox(2)}>
                        <img src={images[2]} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        );
    } else {
        // 4 or more
        gridContent = (
            <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full aspect-[3/2]">
                {images.slice(0, 4).map((src, i) => (
                    <div key={i} className="relative h-full cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openLightbox(i)}>
                        <img src={src} className="w-full h-full object-cover" />
                        {i === 3 && count > 4 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-white font-bold text-xl">+{count - 4}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="mt-3 rounded-2xl overflow-hidden border border-gray-800 bg-black">
                {gridContent}
            </div>
            <Lightbox
                images={images}
                initialIndex={idx}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
