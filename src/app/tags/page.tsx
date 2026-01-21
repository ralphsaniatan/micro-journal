import { getAllTags } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft, Hash } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
    const allTags = await getAllTags();
    const hashtags = allTags.filter(t => t.type === 'hashtag');

    return (
        <main className="flex min-h-screen justify-center bg-black text-white">
            <div className="w-full max-w-xl border-x border-gray-800 min-h-screen px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Hash className="h-5 w-5 text-blue-400" />
                        Topics
                    </h1>
                </header>

                <div className="space-y-2">
                    {hashtags.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">No hashtags used yet.</div>
                    ) : (
                        hashtags.map((item) => (
                            <Link
                                key={item.tag}
                                href={`/?tag=${encodeURIComponent(item.tag)}`}
                                className="block group"
                            >
                                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800 transition-colors">
                                    <span className="text-blue-400 font-bold text-lg group-hover:underline">
                                        {item.tag}
                                    </span>
                                    <span className="text-gray-500 bg-black px-3 py-1 rounded-full text-sm font-medium">
                                        {item.count} posts
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
