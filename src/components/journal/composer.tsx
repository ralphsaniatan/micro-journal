"use client";

import { Image as ImageIcon, X, Loader2, Plus, Pencil } from "lucide-react";
import { useState, useRef, useEffect, useTransition } from "react";
import { createEntry, getEntryById, updateEntry } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";
import imageCompression from "browser-image-compression";
import { useSearchParams, useRouter } from "next/navigation";
import { type Entry } from "@/types/entry";

export function EntryComposer() {
    const [content, setContent] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);

    // Media State
    const [mediaItems, setMediaItems] = useState<{ url: string, file?: File }[]>([]);

    // Edit Mode State
    const [editDate, setEditDate] = useState<string>("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [parentEntry, setParentEntry] = useState<Entry | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const replyToId = searchParams.get("reply_to");
    const editId = searchParams.get("edit");

    // User Profile state
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
                if (data) setUserAvatar(data.avatar_url);
            }
        };
        fetchProfile();
    }, []);

    // Resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [content]);

    // Cleanup
    useEffect(() => {
        return () => {
            mediaItems.forEach(item => {
                if (item.file) URL.revokeObjectURL(item.url);
            });
        };
    }, [mediaItems]);

    // Reply
    useEffect(() => {
        if (replyToId) {
            setIsExpanded(true);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    setIsFocused(true);
                }
            }, 100);
            getEntryById(replyToId).then(entry => {
                if (entry) setParentEntry(entry);
            });
        } else {
            setParentEntry(null);
        }
    }, [replyToId]);

    // Edit
    useEffect(() => {
        if (editId) {
            setIsExpanded(true);
            getEntryById(editId).then(entry => {
                if (entry) {
                    setContent(entry.content);
                    const date = new Date(entry.created_at);
                    const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                    setEditDate(localIso);

                    if (entry.media_urls) {
                        setMediaItems(entry.media_urls.map(url => ({ url })));
                    }
                }
            });
        }
    }, [editId]);

    // New Entry Date
    useEffect(() => {
        if (isExpanded && !replyToId && !editId && !editDate) {
            const now = new Date();
            const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            setEditDate(localIso);
        }
    }, [isExpanded, replyToId, editId, editDate]);

    const charCount = content.length;
    const isOverLimit = charCount > 240;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const newItems = newFiles.map(file => ({
                url: URL.createObjectURL(file),
                file
            }));
            setMediaItems(prev => [...prev, ...newItems]);
            setIsFocused(true);
        }
    };

    const removeMedia = (index: number) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImage = async (file: File): Promise<string> => {
        const supabase = createClient();
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        try {
            const compressedFile = await imageCompression(file, options);
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${fileName}`;
            const { error: uploadError } = await supabase.storage.from('journal_media').upload(filePath, compressedFile);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('journal_media').getPublicUrl(filePath);
            return publicUrl;
        } catch (error) {
            console.error("Upload failed:", error);
            throw error;
        }
    };

    const handleSubmit = () => {
        if ((content.length === 0 && mediaItems.length === 0 && !editId) || isOverLimit) return;

        startTransition(async () => {
            setIsUploading(true);
            try {
                // Upload files
                const finalUrls: string[] = [];
                for (const item of mediaItems) {
                    if (item.file) {
                        const url = await uploadImage(item.file);
                        finalUrls.push(url);
                    } else {
                        finalUrls.push(item.url);
                    }
                }

                if (editId) {
                    let isoDate = undefined;
                    if (editDate) {
                        isoDate = new Date(editDate).toISOString();
                    }
                    await updateEntry(editId, content, isoDate, finalUrls);
                    setIsExpanded(false);
                    router.replace("/");
                } else {
                    const formData = new FormData();
                    formData.append("content", content);
                    if (replyToId) formData.append("parent_id", replyToId);
                    if (finalUrls.length > 0) formData.append("media_urls", JSON.stringify(finalUrls));

                    await createEntry(formData);
                    setIsExpanded(false);
                    if (replyToId) router.replace("/");
                }

                setContent("");
                setMediaItems([]);
                setEditDate("");
                setIsFocused(false);

            } catch (error) {
                console.error("Submission failed", error);
            } finally {
                setIsUploading(false);
            }
        });
    };

    const handleCancel = () => {
        setIsExpanded(false);
        setContent("");
        setMediaItems([]);
        setEditDate("");
        if (replyToId || editId) router.replace("/");
    };

    const displayDate = editDate ? new Date(editDate).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'
    }) : "";

    if (!isExpanded && !replyToId && !editId) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-6 h-14 w-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-transform hover:scale-105 active:scale-95 z-50 text-white"
            >
                <Plus className="h-8 w-8" />
            </button>
        );
    }

    const title = editId ? 'Edit Entry' : (replyToId ? 'Reply' : 'New Entry');
    const submitLabel = editId ? 'Save' : (isPending || isUploading ? 'Posting' : 'Post');

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col sm:bg-black/50 sm:backdrop-blur-sm sm:items-center sm:justify-center p-0 sm:p-4">
            <div className="flex-1 w-full max-w-xl bg-black sm:border sm:border-gray-800 sm:rounded-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] border-b border-gray-800">
                    <button onClick={handleCancel} className="text-white hover:bg-white/10 p-2 rounded-full">
                        <X className="h-6 w-6" />
                    </button>
                    <span className="font-bold text-lg">{title}</span>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    {(editId || !replyToId) && (
                        <div className="flex items-center gap-2 mb-4 pl-[52px]">
                            <span className="text-gray-400 text-sm font-medium">{displayDate}</span>
                            <label className="p-1 hover:bg-white/10 rounded-full group cursor-pointer">
                                <Pencil className="h-3.5 w-3.5 text-gray-500 group-hover:text-white" />
                                <input
                                    type="datetime-local"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                    className="absolute opacity-0 pointer-events-none"
                                />
                            </label>
                        </div>
                    )}

                    {parentEntry && (
                        <div className="flex gap-3 mb-2 opacity-60">
                            <div className="flex flex-col items-center">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-gray-700 overflow-hidden border border-gray-700">
                                    {parentEntry.author?.avatar_url ? (
                                        <img src={parentEntry.author.avatar_url} alt="Ava" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-500 text-xs">?</div>
                                    )}
                                </div>
                                <div className="w-0.5 grow bg-gray-600 my-1" />
                            </div>
                            <div className="flex-1 pb-6 relative">
                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                                    <span className="font-bold text-white">{parentEntry.author?.username || 'Unknown'}</span>
                                    <span>· {new Date(parentEntry.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-white brightness-90">{parentEntry.content}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-gray-700 overflow-hidden border border-gray-700">
                                {userAvatar ? (
                                    <img src={userAvatar} alt="Me" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-500 text-xs">?</div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                placeholder={replyToId ? "Post your reply" : "What's on your mind?"}
                                className="w-full bg-transparent text-xl placeholder-gray-500 focus:outline-none resize-none min-h-[120px] text-white"
                                rows={4}
                                disabled={isPending}
                            />

                            {/* Multiple Image Previews */}
                            {mediaItems.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {mediaItems.map((item, idx) => (
                                        <div key={idx} className="relative shrink-0 w-32 h-32">
                                            <img src={item.url} alt="Preview" className="rounded-xl w-full h-full object-cover border border-gray-800" />
                                            <button
                                                onClick={() => removeMedia(idx)}
                                                className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 border-t border-gray-800 flex items-center justify-between">
                    <div className="flex gap-4 text-blue-400">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            title="Add media"
                            className="hover:bg-blue-400/10 p-2 rounded-full transition-colors"
                            disabled={isPending || isUploading}
                        >
                            <ImageIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className={`text-sm font-medium ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                        {charCount} / 240
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={(content.length === 0 && mediaItems.length === 0) || isOverLimit || isPending || isUploading}
                        className="bg-blue-500 text-white font-bold px-6 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                    >
                        {(isPending || isUploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                        {submitLabel}
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*"
                        multiple
                    />
                </div>
            </div>
        </div>
    );
}
