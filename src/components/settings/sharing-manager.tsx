"use client";

import { useState, useTransition } from "react";
import { createShareLink, revokeShareLink } from "@/app/settings/actions";
import { Copy, Trash2, Link as LinkIcon, Users, Eye, Check } from "lucide-react";

interface SharedLink {
    id: string;
    label: string;
    token: string;
    created_at: string;
    view_count: number;
}

export function SharingManager({ initialLinks }: { initialLinks: SharedLink[] }) {
    const [links, setLinks] = useState(initialLinks);
    const [label, setLabel] = useState("");
    const [isPending, startTransition] = useTransition();
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCreate = () => {
        if (!label.trim()) return;
        startTransition(async () => {
            const newLink = await createShareLink(label);
            setLinks([newLink, ...links]);
            setLabel("");
        });
    };

    const confirmRevoke = () => {
        if (!revokingId) return;
        startTransition(async () => {
            await revokeShareLink(revokingId);
            setLinks(links.filter(l => l.id !== revokingId));
            setRevokingId(null);
        });
    };

    const copyLink = (id: string, token: string) => {
        const url = `${window.location.origin}/share/${token}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 relative">

            {/* Confirmation Modal */}
            {revokingId && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-4">
                        <div className="p-3 bg-red-500/10 rounded-full text-red-500 mb-2">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-white text-lg font-bold">Revoke this link?</p>
                            <p className="text-gray-400 text-sm mt-1">This will immediately block access for any guests using this link.</p>
                        </div>
                        <div className="flex gap-3 w-full pt-2">
                            <button
                                onClick={() => setRevokingId(null)}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRevoke}
                                disabled={isPending}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {isPending ? "Revoking..." : "Revoke"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-blue-400" />
                    Private Sharing
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    Create unique links for friends to view your journal without an account.
                </p>
            </div>

            {/* Create Form */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Label (e.g. For Alice)"
                    className="flex-1 bg-black border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <button
                    onClick={handleCreate}
                    disabled={isPending || !label.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
                >
                    {isPending ? "Creating..." : "Create Link"}
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {links.length === 0 && (
                    <p className="text-center text-gray-600 text-sm py-4">No active shared links.</p>
                )}

                {links.map((link) => (
                    <div key={link.id} className="flex items-center justify-between bg-black/50 p-3 rounded border border-gray-800/50">
                        <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-white truncate">{link.label}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                                    <Eye className="h-3 w-3" />
                                    {link.view_count}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Created {new Date(link.created_at).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => copyLink(link.id, link.token)}
                                className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                                title="Copy Link"
                            >
                                {copiedId === link.id ? (
                                    <Check className="h-4 w-4 text-green-400" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                            <button
                                onClick={() => setRevokingId(link.id)}
                                className="p-2 hover:bg-red-900/20 rounded text-gray-400 hover:text-red-400 transition-colors"
                                title="Revoke Access"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
