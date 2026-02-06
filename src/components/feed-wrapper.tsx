import { InfiniteFeed } from "@/components/journal/infinite-feed";
import { type Entry } from "@/types/entry";
import { getEntries } from "@/app/actions";
import { type UserResponse } from "@supabase/supabase-js";
import Link from "next/link";

interface FeedWrapperProps {
  entriesPromise: Promise<Entry[]>;
  userPromise: Promise<UserResponse>;
  tag?: string;
}

export default async function FeedWrapper({ entriesPromise, userPromise, tag }: FeedWrapperProps) {
  const [entries, { data: { user } }] = await Promise.all([entriesPromise, userPromise]);

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10 mt-10">
        <p>No entries found.</p>
        {tag ? (
          <Link href="/" className="text-blue-400 hover:underline mt-2 inline-block">Clear Filter</Link>
        ) : (
          <p>Write something using the button below!</p>
        )}
      </div>
    );
  }

  // Use a key to force remount when the tag changes or the first entry changes (e.g. new post)
  // This avoids needing useEffect to sync state in InfiniteFeed
  const feedKey = `${tag || 'home'}-${entries[0]?.id}`;

  return (
    <InfiniteFeed
      key={feedKey}
      initialEntries={entries}
      currentUserId={user?.id}
      loader={getEntries.bind(null, tag)}
    />
  );
}
