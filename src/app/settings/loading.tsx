
import { ArrowLeft } from "lucide-react";

export default function Loading() {
    return (
        <main className="flex min-h-screen justify-center animate-pulse">
            <div className="w-full max-w-xl border-x border-gray-800 min-h-screen bg-black text-white">
                {/* Header */}
                <header className="sticky top-0 z-10 border-b border-gray-800 bg-black/80 backdrop-blur-md px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] flex items-center gap-4">
                    <div className="p-2 rounded-full bg-white/10 h-9 w-9" />
                    <div className="h-6 w-24 bg-gray-800 rounded" />
                </header>

                <div className="p-6 space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-24 w-24 rounded-full bg-gray-800 border-2 border-gray-700" />
                        <div className="h-4 w-24 bg-gray-800 rounded" />
                    </div>

                    {/* Form Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="h-4 w-20 bg-gray-800 rounded" />
                            <div className="w-full h-12 bg-gray-900 border border-gray-800 rounded-lg" />
                        </div>
                        <div className="w-full h-12 bg-gray-800 rounded-full" />
                    </div>

                    <div className="h-px bg-gray-800 my-8" />

                    {/* Sharing Section */}
                    <div className="space-y-4">
                        <div className="h-6 w-32 bg-gray-800 rounded" />
                        <div className="space-y-2">
                            <div className="w-full h-24 bg-gray-900 border border-gray-800 rounded-xl" />
                            <div className="w-full h-24 bg-gray-900 border border-gray-800 rounded-xl" />
                        </div>
                    </div>

                    <div className="h-px bg-gray-800 my-8" />

                    {/* Logout */}
                    <div className="w-full h-12 bg-gray-900 rounded-lg" />
                </div>
            </div>
        </main>
    );
}
