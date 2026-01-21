import { InfiniteFeed } from "@/components/journal/infinite-feed";
import { EntryComposer } from "@/components/journal/composer";
import { getEntries } from "./actions";
import { Suspense } from "react";
import { Settings, X, Hash, AtSign, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home(props: { searchParams: Promise<{ tag?: string }> }) {
  const searchParams = await props.searchParams;
  const currentTag = searchParams.tag;
  const entries = await getEntries(currentTag);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/icon.png" alt="Icon" className="w-8 h-8 rounded-full" />
          <h1 className="text-xl font-bold">Rap's Braindump</h1>
          {currentTag && (
            <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-sm font-medium">
              <span>{currentTag}</span>
              <Link href="/" className="hover:text-white transition-colors">
                <X className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Link href="/calendar" className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-orange-400">
            <Calendar className="h-6 w-6" />
          </Link>
          <Link href="/mentions" className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-green-400">
            <AtSign className="h-6 w-6" />
          </Link>
          <Link href="/tags" className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-blue-400">
            <Hash className="h-6 w-6" />
          </Link>
          <Link href="/settings" className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <Settings className="h-6 w-6" />
          </Link>
        </div>
      </header>

      <div className="pt-20 max-w-xl mx-auto border-l border-r border-gray-800 min-h-screen">
        <div className="space-y-6">
          {entries && entries.length > 0 ? (
            <InfiniteFeed
              initialEntries={entries}
              currentUserId={user?.id}
              loader={getEntries.bind(null, currentTag)}
            />
          ) : (
            <div className="text-center text-gray-500 py-10 mt-10">
              <p>No entries found.</p>
              {currentTag ? (
                <Link href="/" className="text-blue-400 hover:underline mt-2 inline-block">Clear Filter</Link>
              ) : (
                <p>Write something using the button below!</p>
              )}
            </div>
          )}
        </div>
      </div>

      <EntryComposer />
    </main>
  );
}
