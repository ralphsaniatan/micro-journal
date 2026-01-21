import { getEntryDates } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { Heatmap } from "@/components/journal/heatmap";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
    const dates = await getEntryDates();

    const totalEntries = dates.length;
    // Calculate streaks or other stats here if needed later

    return (
        <main className="flex min-h-screen justify-center bg-black text-white">
            <div className="w-full max-w-xl border-x border-gray-800 min-h-screen px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        Consistency
                    </h1>
                </header>

                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-gray-900/20 border border-gray-800 rounded-2xl p-6">
                        <div className="mb-6 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{totalEntries}</span>
                            <span className="text-gray-500">total entries in the last year</span>
                        </div>

                        <Heatmap dates={dates} />
                    </div>

                    <div className="text-center text-gray-500 text-sm">
                        Keep writing to fill your grid!
                    </div>
                </div>
            </div>
        </main>
    );
}
