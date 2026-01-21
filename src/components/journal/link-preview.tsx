"use client";

import { useState, useEffect } from "react";
import { fetchUrlMetadata } from "@/app/actions";
import { X, ExternalLink } from "lucide-react";

interface LinkMetadata {
    title?: string | null;
    description?: string | null;
    image?: string | null;
    url: string;
}

export function LinkPreview({ url }: { url: string }) {
    const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetchUrlMetadata(url).then(data => {
            if (mounted && data) setMetadata(data);
            if (mounted) setLoading(false);
        });
        return () => { mounted = false; };
    }, [url]);

    if (!showPreview || loading || !metadata) return null;

    return (
        <div className="relative group mt-2 mb-2 rounded-xl overflow-hidden border border-gray-800 bg-gray-900/40 hover:bg-gray-900/60 transition-colors max-w-md">
            <button
                onClick={(e) => { e.preventDefault(); setShowPreview(false); }}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <X className="h-3 w-3" />
            </button>

            <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                {metadata.image && (
                    <div className="h-32 w-full bg-gray-900 overflow-hidden">
                        <img src={metadata.image} alt={metadata.title || "Link preview"} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-200 line-clamp-1">{metadata.title || url}</h3>
                    {metadata.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">{metadata.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500 uppercase tracking-wider">
                        <ExternalLink className="h-2 w-2" />
                        {new URL(url).hostname}
                    </div>
                </div>
            </a>
        </div>
    );
}
