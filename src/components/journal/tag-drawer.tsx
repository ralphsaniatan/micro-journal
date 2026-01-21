"use client";

import { X, Hash, User, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";

interface TagStats {
    tag: string;
    count: number;
    type: 'hashtag' | 'mention';
}

export function TagDrawer({ tags }: { tags: TagStats[] }) {
    const [isOpen, setIsOpen] = useState(false);

    const hashtags = tags.filter(t => t.type === 'hashtag');
    const mentions = tags.filter(t => t.type === 'mention');

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Browse Tags"
            >
                <Menu className="h-6 w-6 text-gray-400" />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={clsx(
                "fixed inset-y-0 right-0 w-80 bg-black border-l border-gray-800 z-50 transform transition-transform duration-300 ease-in-out p-6 overflow-y-auto",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold">Explore</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-full"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Mentions Section */}
                {mentions.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            People
                        </h3>
                        <div className="space-y-2">
                            {mentions.map((item) => (
                                <Link
                                    key={item.tag}
                                    href={`/?tag=${encodeURIComponent(item.tag)}`}
                                    onClick={() => setIsOpen(false)}
                                    className="block group"
                                >
                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <span className="text-green-400 font-medium group-hover:underline">
                                            {item.tag}
                                        </span>
                                        <span className="text-gray-600 text-xs bg-gray-900 px-2 py-1 rounded-full">
                                            {item.count}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hashtags Section */}
                {hashtags.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            Topics
                        </h3>
                        <div className="space-y-2">
                            {hashtags.map((item) => (
                                <Link
                                    key={item.tag}
                                    href={`/?tag=${encodeURIComponent(item.tag)}`}
                                    onClick={() => setIsOpen(false)}
                                    className="block group"
                                >
                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <span className="text-blue-400 font-medium group-hover:underline">
                                            {item.tag}
                                        </span>
                                        <span className="text-gray-600 text-xs bg-gray-900 px-2 py-1 rounded-full">
                                            {item.count}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {tags.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        No tags or mentions yet.
                        <br />
                        Write a post with #topic or @name!
                    </div>
                )}
            </div>
        </>
    );
}
