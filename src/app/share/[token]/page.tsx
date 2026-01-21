import { cookies } from "next/headers";
import { InfiniteFeed } from "@/components/journal/infinite-feed";
import { Gatekeeper } from "@/components/share/gatekeeper";
import { getSharedEntries, getSharedFeed } from "@/app/share/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { X, Hash, AtSign } from "lucide-react";

export default async function SharedJournalPage(
    props: {
        params: Promise<{ token: string }>;
        searchParams: Promise<{ tag?: string }>;
    }
) {
    const params = await props.params;
    const token = params.token;
    const searchParams = await props.searchParams;
    const currentTag = searchParams.tag;

    // Check for Guest Session Cookie
    const cookieStore = await cookies();
    const guestName = cookieStore.get(`journal_guest_${token}`)?.value;

    if (!guestName) {
        return <Gatekeeper token={token} />;
    }

    // Fetch Data
    const data = await getSharedEntries(token, currentTag);

    if (!data) {
        return notFound();
    }

    const { entries, owner } = data;
    const ownerName = owner?.username || "Journal Owner";

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Read Only Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {owner?.avatar_url ? (
                        <img src={owner.avatar_url} className="w-8 h-8 rounded-full bg-gray-800 object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold text-xs">
                            {ownerName[0]?.toUpperCase() || "U"}
                        </div>
                    )}
                    <div>
                        <h1 className="text-sm font-bold">{ownerName}'s Braindump</h1>
                        <p className="text-xs text-gray-500">Viewing as {guestName}</p>
                    </div>

                    {currentTag && (
                        <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-sm font-medium ml-2">
                            <span>{currentTag}</span>
                            <Link href={`/share/${token}`} className="hover:text-white transition-colors">
                                <X className="h-3 w-3" />
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Link href={`/share/${token}/mentions`} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-green-400">
                        <AtSign className="h-6 w-6" />
                    </Link>
                    <Link href={`/share/${token}/tags`} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-blue-400">
                        <Hash className="h-6 w-6" />
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="pt-20 max-w-xl mx-auto pb-20 border-l border-r border-gray-800 min-h-screen">
                <InfiniteFeed
                    initialEntries={entries || []}
                    currentUserId={undefined}
                    loader={getSharedFeed.bind(null, token, currentTag)}
                    tagBaseUrl={`/share/${token}`}
                />
            </div>
        </div>
    );
}
