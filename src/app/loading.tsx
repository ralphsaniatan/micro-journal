
export default function Loading() {
    return (
        <div className="min-h-screen bg-black text-white animate-pulse">
            {/* Header Skeleton */}
            <div className="border-b border-gray-800 p-4 flex justify-between items-center bg-black/80 backdrop-blur-md fixed top-0 left-0 right-0 z-40 h-[69px]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-800" />
                    <div className="h-4 w-32 bg-gray-800 rounded" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800" />
                    <div className="w-8 h-8 rounded-full bg-gray-800" />
                    <div className="w-8 h-8 rounded-full bg-gray-800" />
                </div>
            </div>

            {/* Content Skeleton matches max-w-xl layout */}
            <div className="pt-20 max-w-xl mx-auto border-l border-r border-gray-800 min-h-screen">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border-b border-gray-800">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-800" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-24 bg-gray-800 rounded" />
                                    <div className="h-3 w-16 bg-gray-800/50 rounded" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-gray-800/50 rounded" />
                                    <div className="h-4 w-3/4 bg-gray-800/50 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
