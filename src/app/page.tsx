import { EntryComposer } from "@/components/journal/composer";
import { getEntries } from "./actions";
import { Suspense } from "react";
import { Settings, X, Hash, AtSign, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import FeedWrapper from "@/components/feed-wrapper";
import { FeedSkeleton } from "@/components/feed-skeleton";

export const dynamic = "force-dynamic";

export default async function Home(props: { searchParams: Promise<{ tag?: string }> }) {
  const searchParams = await props.searchParams;
  const currentTag = searchParams.tag;

  // Start fetching in parallel
  const entriesPromise = getEntries(currentTag);
  const userPromise = createClient().then(c => c.auth.getUser());

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Image src="/icon.png" alt="Icon" width={24} height={24} className="w-6 h-6 rounded-full" />
          <h1 className="text-base sm:text-xl font-bold">Rap's Braindump</h1>
          {currentTag && (
            <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-sm font-medium">
              <span>{currentTag}</span>
              <Link href="/" className="hover:text-white transition-colors">
                <X className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <Link href="/calendar" className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-orange-400">
            <Calendar className="h-5 w-5" />
          </Link>
          <Link href="/mentions" className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-green-400">
            <AtSign className="h-5 w-5" />
          </Link>
          <Link href="/tags" className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-blue-400">
            <Hash className="h-5 w-5" />
          </Link>
          <Link href="/settings" className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <div className="pt-20 max-w-xl mx-auto border-l border-r border-gray-800 min-h-screen">
        <div className="space-y-6">
          <Suspense fallback={<FeedSkeleton />}>
            <FeedWrapper entriesPromise={entriesPromise} userPromise={userPromise} tag={currentTag} />
          </Suspense>
        </div>
      </div>

      <EntryComposer />
    </main>
  );
}
