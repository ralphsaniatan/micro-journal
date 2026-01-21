"use client";

import { useState, useTransition } from "react";
import { recordView } from "@/app/share/actions";
import { useRouter } from "next/navigation";

export function Gatekeeper({ token }: { token: string }) {
    const [name, setName] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        startTransition(async () => {
            try {
                await recordView(token, name);
                router.refresh(); // Refresh to trigger server check for cookie
            } catch (err) {
                alert("Something went wrong. The link might be invalid.");
            }
        });
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 text-center">
                <div>
                    <div className="mx-auto h-20 w-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-400"
                        >
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Private Journal</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        You've been invited to view this Braindump.
                        <br />Please enter your name to continue.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name (e.g. Alice)"
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending || !name.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        {isPending ? "Unlocking..." : "View Journal"}
                    </button>
                </form>
            </div>
        </div>
    );
}
