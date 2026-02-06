import React from "react";

export function FeedSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-800">
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-gray-800 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 bg-gray-800 rounded" />
                <div className="h-3 w-16 bg-gray-800 rounded opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-800 rounded" />
                <div className="h-4 w-1/2 bg-gray-800 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
