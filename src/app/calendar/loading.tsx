
import { ArrowLeft, Calendar } from "lucide-react";

export default function Loading() {
    return (
        <main className="flex min-h-screen justify-center bg-black text-white animate-pulse">
            <div className="w-full max-w-xl border-x border-gray-800 min-h-screen p-4">
                {/* Header */}
                <header className="flex items-center gap-4 mb-8">
                    <div className="p-2 rounded-full bg-white/10 h-10 w-10" />
                    <div className="h-6 w-32 bg-gray-800 rounded" />
                </header>

                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Stats Box */}
                    <div className="bg-gray-900/20 border border-gray-800 rounded-2xl p-6">
                        <div className="mb-6 flex items-baseline gap-2">
                            <div className="h-8 w-12 bg-gray-800 rounded" />
                            <div className="h-4 w-48 bg-gray-800/50 rounded" />
                        </div>

                        {/* Heatmap Grid Skeleton */}
                        <div className="grid grid-cols-12 gap-1 md:gap-2">
                            {/* Approx 52 weeks / columns? No, usually 7 rows x N cols.
                                 Let's just simulate a block of squares */}
                            {Array.from({ length: 120 }).map((_, i) => (
                                <div key={i} className="aspect-square bg-gray-800/30 rounded-sm" />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="h-4 w-40 bg-gray-800/50 rounded" />
                    </div>
                </div>
            </div>
        </main>
    );
}
