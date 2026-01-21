"use client";

import { Reply, MoreHorizontal, Trash2, Edit2, AlertCircle } from "lucide-react";
import { type Entry } from "@/types/entry";
import { clsx } from "clsx";
import Link from "next/link";
import { useState, useTransition } from "react";
import { LinkPreview } from "./link-preview";
import { deleteEntry } from "@/app/actions";
import { ImageGrid } from "./image-grid";

interface EntryCardProps {
    entry: Entry;
    hasParent?: boolean;
    hasReply?: boolean;
    threadIndex?: number;
    totalCount?: number;
    currentUserId?: string;
    tagBaseUrl?: string;
}

export function EntryCard({ entry, hasParent, hasReply, threadIndex, totalCount, currentUserId, tagBaseUrl = "/" }: EntryCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();

    const isOwner = currentUserId === entry.user_id;

    const formattedDate = new Date(entry.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deleteEntry(entry.id);
                setShowDeleteConfirm(false);
                setIsMenuOpen(false);
            } catch (e) {
                alert("Failed to delete. Ensure you ran the database migration.");
            }
        });
    };

    // Helper to render content with clickable tags, mentions, and links
    const renderContent = (text: string) => {
        const parts = text.split(/((?:https?:\/\/[^\s]+)|(?:[#@][\w]+))/g);

        return parts.map((part, index) => {
            if (part.startsWith("http")) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline decoration-blue-500/30 hover:text-blue-300 break-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            if (part.startsWith("#")) {
                return (
                    <Link
                        key={index}
                        href={`${tagBaseUrl}?tag=${encodeURIComponent(part)}`}
                        className="text-blue-400 hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </Link>
                );
            }
            if (part.startsWith("@")) {
                return (
                    <Link
                        key={index}
                        href={`${tagBaseUrl}?tag=${encodeURIComponent(part)}`}
                        className="text-green-400 hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </Link>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    const urls = entry.content.match(/https?:\/\/[^\s]+/g) || [];
    const uniqueUrls = Array.from(new Set(urls));

    return (
        <div className="p-4 hover:bg-white/5 transition-colors relative group/card">

            {/* Delete Confirmation Overlay */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4">
                        <div className="p-3 bg-red-500/10 rounded-full text-red-500 mb-2">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-white text-lg font-bold">Delete this entry?</p>
                            <p className="text-gray-400 text-sm mt-1">This action cannot be undone and will remove all replies.</p>
                        </div>
                        <div className="flex gap-3 w-full pt-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isPending}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0 relative">
                    {hasParent && (
                        <div className="absolute top-[-17px] h-[38px] left-1/2 -translate-x-1/2 w-0.5 bg-gray-800" />
                    )}
                    {hasReply && (
                        <div className="absolute top-[20px] bottom-[-17px] left-1/2 -translate-x-1/2 w-0.5 bg-gray-800" />
                    )}
                    <div className={clsx(
                        "h-10 w-10 rounded-full overflow-hidden bg-gray-800 relative z-10",
                        (hasParent || hasReply) && "ring-4 ring-black"
                    )}>
                        {entry.author?.avatar_url ? (
                            <img src={entry.author.avatar_url} alt="Ava" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold bg-gray-900">?</div>
                        )}
                    </div>
                </div>

                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between relative">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white hover:underline cursor-pointer">
                                {entry.author?.username || "Unknown"}
                            </span>
                            {totalCount && totalCount > 1 && (
                                <span className="text-blue-400 text-xs bg-blue-400/10 px-1.5 py-0.5 rounded-full">
                                    {threadIndex}/{totalCount}
                                </span>
                            )}
                            <span className="text-gray-500 text-sm">· {formattedDate}</span>
                        </div>

                        {/* More Menu */}
                        <div className="relative">
                            {isOwner && (
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="text-gray-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            )}

                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                    <div className="absolute right-0 top-6 w-32 bg-black border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                                        <Link
                                            href={`/?edit=${entry.id}`}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 text-left transition-colors"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(true);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/10 text-left transition-colors"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="text-gray-200 whitespace-pre-wrap text-[15px] leading-relaxed">
                        {renderContent(entry.content)}
                    </div>

                    {/* Link Previews */}
                    {uniqueUrls.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {uniqueUrls.map(url => (
                                <LinkPreview key={url} url={url} />
                            ))}
                        </div>
                    )}

                    {entry.media_urls && entry.media_urls.length > 0 && (
                        <ImageGrid images={entry.media_urls} />
                    )}

                    {currentUserId && !hasReply && (
                        <div className="flex items-center justify-between pt-3 text-gray-500 max-w-md">
                            <Link href={`/?reply_to=${entry.id}`} className="group flex items-center gap-2 hover:text-blue-400 transition-colors">
                                <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                                    <Reply className="h-4 w-4" />
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
